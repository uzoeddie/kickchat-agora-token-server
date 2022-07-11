const express = require('express');
const router = express.Router();

const pushNotificationCtrl = require('../controllers/pushNotificationCtrl');

router.post('/send_poll_notification', pushNotificationCtrl.sendPollNotification);
router.post('/send_poll_result_notification', pushNotificationCtrl.sendPollResultNotification);
router.post('/send-post-notification-to-followers', pushNotificationCtrl.sendPostNotificationToFollowers);
router.post('/send-upcoming-audio-notification-to-tags', pushNotificationCtrl.sendUpcomingAudioNotificationTags);
router.post('/send-live-audio-notification-to-tags', pushNotificationCtrl.sendLiveAudioNotificationTags);
router.post('/send-post-react-notification', pushNotificationCtrl.sendPostReactionNotification);

module.exports = router;