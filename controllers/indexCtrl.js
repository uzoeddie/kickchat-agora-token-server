const express = require("express");
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

module.exports = router;