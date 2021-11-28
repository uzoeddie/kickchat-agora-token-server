const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index.ejs', { root: './views' });
});

router.get('/terms-of-service', (req, res) => {
    res.render('terms', { root: './views' });
});

router.get('/privacy-policy', (req, res) => {
    res.render('privacy', { root: './views' });
});

module.exports = router;