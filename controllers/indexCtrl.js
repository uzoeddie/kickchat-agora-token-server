const express = require("express");
const assetsLinks = require('../.well-known/assetLinks.json');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/terms-of-service', (req, res) => {
    res.render('terms');
});

router.get('/privacy-policy', (req, res) => {
    res.render('privacy');
});

router.get('/contact', (req, res) => {
    res.render('contact');
});

router.get('/.well-known/assetlinks.json', (req, res) => {
    res.send(assetsLinks);
});

module.exports = router;