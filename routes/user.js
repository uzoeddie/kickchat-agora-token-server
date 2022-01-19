const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/userCtrl');

router.post('/delete-admin-user', userCtrl.deleteAdminUser);

module.exports = router;