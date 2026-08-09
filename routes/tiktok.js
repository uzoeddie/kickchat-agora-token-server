const express = require("express");
const router = express.Router();

const tiktokCtrl = require("../controllers/tiktokCtrl");

// Mobile & Web
router.get("/auth/tiktok/callback", tiktokCtrl.tikTokRedirect);
// Web
router.get("/auth/tiktok/web", tiktokCtrl.tikTokWebAuthorization);

// Mobile & Web
router.post("/check_user_by_tiktok", tiktokCtrl.checkIfTikTokUserExists);
router.post("/create_user_with_tiktok", tiktokCtrl.createUserWithTikTok);
// Mobile
router.post("/auth/tiktok", tiktokCtrl.tikTokAuthentication);

module.exports = router;
