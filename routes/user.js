const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/userCtrl');

router.post('/delete-admin-user', userCtrl.deleteAdminUser);
// Note: the code used to send an otp to a phone number is done inside the flutter app.
// The verification of the otp is done here
router.post('/verify_otp', userCtrl.createUserWithPhoneNumber);

module.exports = router;