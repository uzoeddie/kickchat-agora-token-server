const express = require('express');
const router = express.Router();

const adminCtrl = require('../controllers/referralCtrl');

router.post('/update_referral_count', adminCtrl.updateReferralCount);

module.exports = router;