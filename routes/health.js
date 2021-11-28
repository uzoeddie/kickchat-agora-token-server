const express = require('express');
const router = express.Router();

router.get('/health', (req, res, next) => {
    try {
        return res.json({message: 'The server is healthy'});
    } catch (error) {
        next({error: 'The server is unhealthy.'});
    }
});

module.exports = router;