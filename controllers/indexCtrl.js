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

module.exports = router;