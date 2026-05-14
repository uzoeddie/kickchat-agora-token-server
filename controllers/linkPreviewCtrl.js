const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const { Vibrant } = require('node-vibrant/node');

module.exports = {
  async getLinkPreview(req, res) {
    try {
      const text = req.body?.text ?? '';
      const list = linkList(text);
      if (list.length === 0) return res.json({ imageUrl: '', message: 'No links found in the text.' });

      const firstLink = list[0].startsWith('http') ? list[0] : `https://${list[0]}`;

      const imageUrl = await fetchPreviewImage(firstLink);
      const palette = await getPalette(imageUrl);
      res.json({ imageUrl, color: palette, message: 'Link preview fetched successfully.' });
    } catch {
      return res.json({ imageUrl: '', color: '', message: 'Error fetching link preview.' });
    }
  },

  async getImagePalette(req, res) {
    const { source, type } = req.body;
    const base64Data = source.replace(/^data:image\/\w+;base64,/, '');
    const url = type === 'string' ? source : Buffer.from(base64Data, 'base64');
    const color = await getPalette(url);
    if (color) {
        console.log('Extracted palette:', color);
        res.json({ color, message: 'Image palette extracted successfully.' });
    } else {
        res.json({ color: '', message: 'Error extracting image palette.' });
    }
  }
};

async function getPalette(source) {
    try {
        const palette = await Vibrant.from(source).getPalette();
        const color = palette?.LightVibrant?.hex || '';
        return color;
    } catch (error) {
        return '';
    } finally {
        // Clean up object URL to prevent memory leaks
        if (typeof source !== 'string') {
            URL.revokeObjectURL(source);
        }
    }
}

async function fetchPreviewImage(link) {
  // Pretend to be a browser — some sites serve different markup to bots
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  const response = await axios.get(link, {
    headers,
    timeout: 8000,
    maxRedirects: 5,
    validateStatus: () => true,
  });

  if (typeof response.data !== 'string') return '';

  const $ = cheerio.load(response.data);
  const finalUrl = response.request?.res?.responseUrl || link;

  // Resolve relative URLs against the final (post-redirect) URL
  const resolve = (u) => {
    if (!u) return '';
    try {
      return new URL(u, finalUrl).href;
    } catch {
      return '';
    }
  };

  // Priority order, same as WhatsApp/Facebook
  const candidates = [
    $('meta[property="og:image"]').attr('content'),
    $('meta[name="og:image"]').attr('content'),
    $('meta[property="og:image:url"]').attr('content'),
    $('meta[name="twitter:image"]').attr('content'),
    $('meta[name="twitter:image:src"]').attr('content'),
    $('link[rel="apple-touch-icon"]').attr('href'),
    $('link[rel="apple-touch-icon-precomposed"]').attr('href'),
    $('link[rel="icon"]').attr('href'),
    $('link[rel="shortcut icon"]').attr('href'),
  ];

  // First non-empty candidate
  for (const candidate of candidates) {
    const resolved = resolve(candidate);
    if (resolved && (await isImage(resolved))) return resolved;
  }

  // Fallback: first sizable <img> on the page
  const firstImg = $('img')
    .map((_, el) => $(el).attr('src'))
    .get()
    .find((src) => src && !src.startsWith('data:'));
  const resolvedImg = resolve(firstImg);
  if (resolvedImg && (await isImage(resolvedImg))) return resolvedImg;

  // Last resort: /favicon.ico
  const faviconFallback = resolve('/favicon.ico');
  if (faviconFallback && (await isImage(faviconFallback))) return faviconFallback;

  return '';
}

async function isImage(url) {
  try {
    const head = await axios.head(url, {
      timeout: 5000,
      validateStatus: () => true,
    });
    const contentType = String(head.headers['content-type'] ?? '');
    return contentType.startsWith('image/');
  } catch {
    return false;
  }
}

function linkList(text) {
  const exp = /(?:(?:https?|ftp):\/\/)?[\w/\-?=%.]+\.[\w/\-?=%.]+/g;
  return text.match(exp) ?? [];
}