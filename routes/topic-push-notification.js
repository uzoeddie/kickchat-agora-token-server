const express = require('express');
const router = express.Router();

const pushNotificationCtrl = require('../controllers/pushNotificationCtrl');

router.post('/send_poll_notification', pushNotificationCtrl.sendPollNotification);
router.post('/send_post_notification_to_followers', pushNotificationCtrl.sendPostNotificationToFollowers);

module.exports = router;