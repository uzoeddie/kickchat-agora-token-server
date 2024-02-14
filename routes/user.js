const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/userCtrl');

router.post('/delete-admin-user', userCtrl.deleteAdminUser);
// to be removed
router.post('/send_phone_otp', userCtrl.sendPhoneNumberOtp);
// to be removed
router.post('/verify_phone_otp', userCtrl.verifyOTPAndCreateUser);
router.post('/check_user', userCtrl.checkIfUserExist);
router.post('/verify_nigerian_otp', userCtrl.verifyNigerianOTP);
router.post('/create_user_with_phone_number', userCtrl.createUserWithNumber);

module.exports = router;