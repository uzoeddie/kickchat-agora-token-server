const express = require('express');
const router = express.Router();

const linkPreviewCtrl = require('../controllers/linkPreviewCtrl');

router.post('/get-link-preview', linkPreviewCtrl.getLinkPreview);
router.post('/get-color-palette', linkPreviewCtrl.getImagePalette);

module.exports = router;