const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/userCtrl');

router.post('/delete-admin-user', userCtrl.deleteAdminUser);
router.post('/send_phone_number_otp', userCtrl.sendPhoneNumberOtp);
router.post('/check_user', userCtrl.checkIfUserExist);
router.post('/verify_phone_otp', userCtrl.verifyOTP);
router.post('/create_user_with_phone_number', userCtrl.createUserWithNumber);

// TODO: Once the new version is released, remove these
router.post('/send_phone_otp', userCtrl.sendPhoneNumberOtpOld);
router.post('/verify_nigerian_otp', userCtrl.verifyOTP);

// to be removed
// router.post('/verify_phone_otp', userCtrl.verifyOTPAndCreateUser);

module.exports = router;