const express = require("express");
const router = express.Router();

const contactCtrl = require("../controllers/contactCtrl");

router.post("/contact", contactCtrl.sendBlessingPortfolioContactEmail);

module.exports = router;
