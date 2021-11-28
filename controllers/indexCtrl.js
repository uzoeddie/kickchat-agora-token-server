const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/terms-of-service', (req, res) => {
    res.sendFile('terms.html', { root: './views' });
});

router.get('/privacy-policy', (req, res) => {
    res.sendFile('privacy.html', { root: './views' });
});

module.exports = router;