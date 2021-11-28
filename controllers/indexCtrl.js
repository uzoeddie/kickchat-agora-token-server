const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index.ejs', { root: './var/task/views' });
});

router.get('/terms-of-service', (req, res) => {
    res.render('terms.ejs', { root: './var/task/views' });
});

router.get('/privacy-policy', (req, res) => {
    res.render('privacy.ejs', { root: './var/task/views' });
});

module.exports = router;