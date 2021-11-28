const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile('index.html', { root: './api/views' });
});

router.get('/terms-of-service', (req, res) => {
    res.sendFile('terms.html', { root: './api/views' });
});

router.get('/privacy-policy', (req, res) => {
    res.sendFile('privacy.html', { root: './api/views' });
});

module.exports = router;