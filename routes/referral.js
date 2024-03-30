const express = require('express');
const router = express.Router();

const referralCtrl = require('../controllers/referralCtrl');

router.get('/read_branch_deep_link/:deepLink', referralCtrl.readBranchDeepLink);
router.post('/create_branch_deep_link', referralCtrl.createBranchDeepLink);
router.post('/update_referral_count', referralCtrl.updateReferralCount);

module.exports = router;