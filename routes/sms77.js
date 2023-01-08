const express = require('express');
const router = express.Router();

const smsCtrl = require('../controllers/sms77Ctrl');

router.post('/send-sms', smsCtrl.sendSMS);

module.exports = router;