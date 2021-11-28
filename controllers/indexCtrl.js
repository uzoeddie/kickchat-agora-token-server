const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.render('/var/task/views/index');
});

router.get('/terms-of-service', (req, res) => {
    res.render('/var/task/views/terms');
});

router.get('/privacy-policy', (req, res) => {
    res.render('/var/task/views/privacy');
});

module.exports = router;