const express = require('express');
const router = express.Router();

const newsCtrl = require('../controllers/newsCtrl');

router.get('/', newsCtrl.news);
router.get('/onefootball', newsCtrl.onefootballNews);
router.get('/espn', newsCtrl.espnNews);
router.get('/goal', newsCtrl.goalNews);
router.get('/fourfourtwo', newsCtrl.fourfourTwoNews);
router.get('/livescores', newsCtrl.livescoresNews);

module.exports = router;