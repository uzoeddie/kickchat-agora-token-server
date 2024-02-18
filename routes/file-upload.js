const express = require('express');
const router = express.Router();

const fileCtrl = require('../controllers/fileUploadCtrl');

router.post('/convert_social_profile_url', fileCtrl.convertSocialProfileUrlToImageAndUpload);
router.post('/create_user_avatar', fileCtrl.createUserAvatar);

module.exports = router;