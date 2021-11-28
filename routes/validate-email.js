const express = require('express');
const router = express.Router();

const validateEmailCtrl = require('../controllers/validateEmailCtrl');

router.get('/validate_email', validateEmailCtrl.validateEmail);

module.exports = router;