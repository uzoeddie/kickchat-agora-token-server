const fetch = require("node-fetch");

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

const TIKTOK_REDIRECT_URI = "https://kickchatapp.com/auth/tiktok/callback";

module.exports = {
  /**
   * Universal Link fallback.
   *
   * Normally iOS intercepts this URL and opens KickChat.
   * This HTML is displayed only when the app cannot be opened.
   */
  tikTokRedirect(req, res) {
    return res.status(200).send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>Open KickChat</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 40px 20px;
          }

          a {
            display: inline-block;
            padding: 14px 24px;
            background: #2196f3;
            color: white;
            text-decoration: none;
            border-radius: 8px;
          }
        </style>
      </head>

      <body>
        <h1>Continue in KickChat</h1>
        <p>Tap the button below to return to the app.</p>

        <a href="${TIKTOK_REDIRECT_URI}">
          Open KickChat
        </a>
      </body>
    </html>
  `);
  },

  async tikTokAuthentication(req, res) {
    try {
      const { code, code_verifier } = req.body;

      if (!code || !code_verifier) {
        return res.status(400).json({
          error: "code and code_verifier are required",
        });
      }

      if (!CLIENT_KEY || !CLIENT_SECRET) {
        console.error("TikTok credentials are not configured");

        return res.status(500).json({
          error: "TikTok authentication is not configured",
        });
      }

      const tokenResponse = await fetch(
        "https://open.tiktokapis.com/v2/oauth/token/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cache-Control": "no-cache",
          },
          body: new URLSearchParams({
            client_key: CLIENT_KEY,
            client_secret: CLIENT_SECRET,
            code: decodeURIComponent(code),
            grant_type: "authorization_code",
            redirect_uri: TIKTOK_REDIRECT_URI,
            code_verifier,
          }),
        },
      );

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        console.error("TikTok token exchange failed:", tokenData);

        return res.status(401).json({
          error: "TikTok token exchange failed",
          detail: tokenData,
        });
      }

      const {
        access_token,
        refresh_token,
        open_id,
        expires_in,
        refresh_expires_in,
        scope,
      } = tokenData;

      const profileResponse = await fetch(
        "https://open.tiktokapis.com/v2/user/info/" +
          "?fields=open_id,display_name,avatar_url",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok || profileData.error?.code !== "ok") {
        console.error("TikTok profile request failed:", profileData);

        return res.status(401).json({
          error: "Unable to retrieve TikTok profile",
          detail: profileData,
        });
      }

      const profile = profileData.data?.user;

      if (!profile?.open_id) {
        return res.status(401).json({
          error: "TikTok did not return a valid user profile",
        });
      }

      /*
       * Next:
       * 1. Search your database for profile.open_id.
       * 2. Create a KickChat user if one does not exist.
       * 3. Generate your Firebase custom token or your own JWT.
       * 4. Store refresh_token securely if you need future TikTok access.
       */

      return res.status(200).json({
        user: {
          tiktok_open_id: profile.open_id,
          display_name: profile.display_name ?? null,
          avatar_url: profile.avatar_url ?? null,
        },

        // Temporary during development.
        // Do not normally expose TikTok refresh tokens to the mobile app.
        tiktok: {
          scope,
          expires_in,
          refresh_expires_in,
        },
      });
    } catch (error) {
      console.error("TikTok authentication error:", error);

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  },
};
