const express = require("express");
const router = express.Router();

const tiktokCtrl = require("../controllers/tiktokCtrl");

// Universal Link registered in TikTok Developer Portal
router.get("/auth/tiktok/callback", tiktokCtrl.tikTokRedirect);

router.post("/auth/tiktok", tiktokCtrl.tikTokAuthentication);

module.exports = router;
