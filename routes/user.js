const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/userCtrl');

router.post('/delete-admin-user', userCtrl.deleteAdminUser);
router.post('/send_phone_otp', userCtrl.sendPhoneNumberOtp);
router.post('/verify_phone_otp', userCtrl.verifyOTPAndCreateUser);

module.exports = router;