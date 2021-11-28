const express = require('express');
const router = express.Router();

const accessTokenCtrl = require('../controllers/accessTokenCtrl');

router.get('/access_token', accessTokenCtrl.generateAccessToken);

module.exports = router;