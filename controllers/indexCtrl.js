const express = require("express");
const assetsLinks = require('../.well-known/assetLinks.json');
const appleAppSite = require('../.well-known/apple-app-site-association.json');
const router = express.Router();
const { indexNonce } = require('../nounce');

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