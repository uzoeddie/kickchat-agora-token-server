const express = require('express');
const router = express.Router();

const aiCtrl = require('../controllers/aiCtrl');
const footballFactsCtrl = require('../controllers/footballFactsCtrl');

router.post('/search-football-facts', aiCtrl.searchSoccerFacts);
router.post('/add-football-facts', footballFactsCtrl.addFootballFacts);

module.exports = router;