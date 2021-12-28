const express = require('express');
const router = express.Router();

const pushNotificationCtrl = require('../controllers/pushNotificationCtrl');

router.post('/send_poll_notification', pushNotificationCtrl.sendPollNotification);
router.post('/send-post-notification-to-followers', pushNotificationCtrl.sendPostNotificationToFollowers);
router.post('/send-upcoming-audio-notification-to-tags', pushNotificationCtrl.sendUpcomingAudioNotificationTags);

module.exports = router;