const express = require("express");
const assetsLinks = require('../.well-known/assetLinks.json');
const appleAppSite = require('../.well-known/apple-app-site-association.json');
const router = express.Router();
const { indexNonce } = require('../nounce');

const transparentPixel = Buffer.from([
0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00,
0x00, 0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
0x44, 0x01, 0x00, 0x3B
]);

router.get('/', (req, res) => {
    res.render('index', { nounce: indexNonce });
});

router.get('/terms-of-service', (req, res) => {
    res.render('terms', { nounce: indexNonce });
});

router.get('/privacy-policy', (req, res) => {
    res.render('privacy', { nounce: indexNonce });
});

router.get('/contact', (req, res) => {
    res.render('contact', { nounce: indexNonce });
});

// router.get('/.well-known/assetlinks.json', (req, res) => {
//     assetsLinks[0].target.package_name = process.env.PACKAGE_NAME;
//     assetsLinks[0].target.sha256_cert_fingerprints = JSON.parse(process.env.SHA256);
//     res.send(assetsLinks);
// });

router.get('/.well-known/apple-app-site-association', (req, res) => {
    res.send(appleAppSite);
});

router.get('/track', (req, res) => {
  const emailId = req.query.id;
  const userAgent = req.get('User-Agent');
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`Email opened: ${emailId} at ${timestamp} from ${ip}`);
  console.log(`User Agent: ${userAgent}`);
  
  // Store the open event (in production, use a database)
  // For now, we'll just serve the pixel and log the event
  
  // Send the tracking pixel
  res.set({
    'Content-Type': 'image/gif',
    'Content-Length': transparentPixel.length,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Origin': '*'
  });
  
  res.send(transparentPixel);
});

// Webhook endpoint for email opens (alternative approach)
router.post('/webhook/opened', express.json(), (req, res) => {
  const { emailId, timestamp, userAgent } = req.body;
  
  console.log(`Webhook: Email ${emailId} opened at ${timestamp}`);
  
  // Here you could:
  // 1. Store in database
  // 2. Send push notification to extension
  // 3. Update real-time dashboard
  
  res.json({ success: true, received: true });
});

router.get('/health/track', (req, res) => {
    res.send('Testing track router is deployed (updated)...');
});

module.exports = router;