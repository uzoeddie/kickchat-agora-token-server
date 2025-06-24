const express = require('express');
const router = express.Router();

const aiCtrl = require('../controllers/aiCtrl');

router.post('/search-football-facts', aiCtrl.searchSoccerFacts);

module.exports = router;