const fetch = require("node-fetch");
const admin = require("firebase-admin");
const auth = require("firebase-admin/auth");

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const WEB_APP_URL = process.env.WEB_APP_URL;

const REDIRECT_URI = `https://kickchat-server-production.vercel.app/auth/tiktok/web/callback`;

module.exports = {
  async checkIfTikTokUserExists(req, res) {
    try {
      let token = null;
      const { tiktok_open_id } = req.body;
      const user = await getUserDocumentByTikTokId(tiktok_open_id);
      if (user) {
        const authAdmin = auth.getAuth();
        token = await authAdmin.createCustomToken(user.id);
      }
      return res
        .status(200)
        .json({ message: "User exist", newUser: user === null, user, token });
    } catch (error) {
      return res.json({
        message: "User does not exist",
        newUser: true,
        user: null,
        token: null,
      });
    }
  },

  tikTokRedirect(req, res) {
    const {
      code,
      state,
      error,
      error_description: errorDescription,
    } = req.query;

    const callbackParams = new URLSearchParams();

    if (code) {
      callbackParams.set("code", code);
    }

    if (state) {
      callbackParams.set("state", state);
    }

    if (error) {
      callbackParams.set("error", error);
    }

    if (errorDescription) {
      callbackParams.set("error_description", errorDescription);
    }

    const appCallbackUrl = `kickchat://auth/tiktok/callback?${callbackParams.toString()}`;

    const safeCallbackUrl = appCallbackUrl
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

    return res.status(200).send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <title>Return to KickChat</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: #f1f2f6;
            color: #242a37;
            font-family: Arial, sans-serif;
          }

          .card {
            width: 100%;
            max-width: 420px;
            padding: 32px 24px;
            background: #ffffff;
            border-radius: 18px;
            text-align: center;
            box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
          }

          p {
            color: #616775;
            line-height: 1.5;
          }

          .button {
            display: block;
            margin-top: 24px;
            padding: 15px 20px;
            border-radius: 10px;
            background: #2196f3;
            color: #ffffff;
            text-decoration: none;
            font-weight: 700;
          }
        </style>
      </head>

      <body>
        <main class="card">
          <h1>Return to KickChat</h1>

          ${
            error
              ? `
                <p>
                  TikTok login could not be completed.
                  Return to KickChat to try again.
                </p>
              `
              : `
                <p>
                  TikTok login was successful.
                  Continue in the KickChat app.
                </p>
              `
          }

          <a class="button" href="${safeCallbackUrl}">
            Open KickChat
          </a>
        </main>

        <script>
          const appCallbackUrl = ${JSON.stringify(appCallbackUrl)};

          // Attempt to open KickChat automatically.
          window.setTimeout(() => {
            window.location.href = appCallbackUrl;
          }, 300);
        </script>
      </body>
    </html>
  `);
  },

  async tikTokWebAuthorization(req, res) {
    try {
      const state = generateState();

      res.cookie("tiktok_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 60 * 1000,
      });

      const params = new URLSearchParams({
        client_key: CLIENT_KEY,
        scope: "user.info.basic",
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        state,
      });

      const url = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;

      // return res.status(200).json({ message: "Authorization successful", url });
      return res.redirect(url);
    } catch (error) {
      return res.status(500).json({
        message: "Authorization failed",
        url: null,
      });
    }
  },

  async tikTokWebCallback(req, res) {
    try {
      const {
        code,
        state,
        error,
        error_description: errorDescription,
      } = req.query;

      const storedState = req.cookies?.tiktok_oauth_state;

      if (error) {
        console.error("TikTok OAuth error:", {
          error,
          errorDescription,
        });

        return res.redirect(
          `${WEB_APP_URL}/auth/login?tiktok_error=${encodeURIComponent(error)}`,
        );
      }

      if (!code) {
        return res.redirect(
          `${WEB_APP_URL}/auth/login?tiktok_error=missing_code`,
        );
      }

      if (!state || !storedState || state !== storedState) {
        return res.redirect(
          `${WEB_APP_URL}/auth/login?tiktok_error=invalid_state`,
        );
      }

      res.clearCookie("tiktok_oauth_state");

      // const redirectUri = `${BACKEND_URL}/auth/tiktok/web/callback`;

      // Exchange authorization code
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
            code,
            grant_type: "authorization_code",
            redirect_uri: REDIRECT_URI,
          }),
        },
      );

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        console.error("TikTok token error:", tokenData);

        return res.redirect(
          `${process.env.WEB_APP_URL}/auth/login?tiktok_error=token_exchange`,
        );
      }

      // Retrieve TikTok profile
      const profileResponse = await fetch(
        "https://open.tiktokapis.com/v2/user/info/" +
          "?fields=open_id,display_name,avatar_url",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        },
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok || profileData.error?.code !== "ok") {
        console.error("TikTok profile error:", profileData);

        return res.redirect(`${WEB_APP_URL}/auth/login?tiktok_error=profile`);
      }

      const profile = profileData.data?.user;

      if (!profile?.open_id) {
        return res.redirect(
          `${WEB_APP_URL}/auth/login?tiktok_error=invalid_profile`,
        );
      }

      // return res.status(200).json({
      //   user: {
      //     tiktok_open_id: profile.open_id,
      //     display_name: profile.display_name ?? null,
      //     avatar_url: profile.avatar_url ?? null,
      //   },
      //   tiktok: {
      //     scope: tokenData.scope,
      //     expires_in: tokenData.expires_in,
      //     refresh_expires_in: tokenData.refresh_expires_in,
      //   },
      // });
      const callbackParams = new URLSearchParams();
      callbackParams.set("tiktok_open_id", profile.open_id);
      callbackParams.set("display_name", profile.display_name ?? null);
      callbackParams.set("avatar_url", profile.avatar_url ?? null);
      return res.redirect(
        `${WEB_APP_URL}/auth/tiktok/callback?exchange=${encodeURIComponent(callbackParams)}`,
      );
    } catch (error) {
      console.error("TikTok callback error:", error);

      return res.redirect(`${WEB_APP_URL}/auth/login?tiktok_error=unknown`);
    }
  },

  async tikTokAuthentication(req, res) {
    try {
      const { code, code_verifier, redirect_uri } = req.body;

      if (!code || !code_verifier || !redirect_uri) {
        return res.status(400).json({
          error: "redirect_uri, code and code_verifier are required",
        });
      }

      if (!CLIENT_KEY || !CLIENT_SECRET) {
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
            code,
            grant_type: "authorization_code",
            redirect_uri,
            code_verifier,
          }),
        },
      );

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        return res.status(401).json({
          error: "TikTok token exchange failed",
          detail: tokenData,
        });
      }

      const profileResponse = await fetch(
        "https://open.tiktokapis.com/v2/user/info/" +
          "?fields=open_id,display_name,avatar_url",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        },
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok || profileData.error?.code !== "ok") {
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

      return res.status(200).json({
        user: {
          tiktok_open_id: profile.open_id,
          display_name: profile.display_name ?? null,
          avatar_url: profile.avatar_url ?? null,
        },
        tiktok: {
          scope: tokenData.scope,
          expires_in: tokenData.expires_in,
          refresh_expires_in: tokenData.refresh_expires_in,
        },
      });
    } catch (error) {
      return res.status(500).json({
        user: null,
      });
    }
  },

  async createUserWithTikTok(req, res) {
    try {
      const { tiktokId } = req.body;
      const authAdmin = auth.getAuth();
      const data = await authAdmin.createUser({
        tiktokId,
        disabled: false,
        metadata: {
          creationTime: new Date().toUTCString(),
          lastSignInTime: new Date().toUTCString(),
        },
      });
      const token = await authAdmin.createCustomToken(data.uid, {
        provider: "tiktok",
      });
      return res
        .status(200)
        .json({ message: "TikTok User created", token, userId: data.uid });
    } catch (error) {
      return res.status(400).json({
        message: "TikTok User not created",
        token: null,
        userId: null,
      });
    }
  },
};

async function getUserDocumentByTikTokId(tiktokId) {
  try {
    const snapshot = await admin
      .firestore()
      .collection("users")
      .where("tiktokId", "==", tiktokId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    return null;
  }
}

function generateCodeVerifier(length = 64) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(
    randomValues,
    (byte) => charset[byte % charset.length],
  ).join("");
}

function generateState() {
  return generateCodeVerifier(24);
}
