const express = require("express");
const router = express.Router();

const tiktokCtrl = require("../controllers/tiktokCtrl");

router.get("/auth/tiktok/callback", tiktokCtrl.tikTokRedirect);
router.get("/auth/tiktok/web", tiktokCtrl.tikTokWebAuthorization);
router.get("/auth/tiktok/web/callback", tiktokCtrl.tikTokWebCallback);

router.post("/check_user_by_tiktok", tiktokCtrl.checkIfTikTokUserExists);
router.post("/create_user_with_tiktok", tiktokCtrl.createUserWithTikTok);
router.post("/auth/tiktok", tiktokCtrl.tikTokAuthentication);

module.exports = router;
