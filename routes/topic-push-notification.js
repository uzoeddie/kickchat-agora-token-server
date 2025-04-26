const express = require('express');
const router = express.Router();

const pushNotificationCtrl = require('../controllers/pushNotificationCtrl');

router.post('/send_app_update_notification', pushNotificationCtrl.sendAppUpdateNotification);
router.post('/send_match_lineup_notification', pushNotificationCtrl.sendMatchLineUpNotification);
router.post('/send_player_rating_notification', pushNotificationCtrl.sendPlayerRatingNotification);
router.post('/send_push_notification', pushNotificationCtrl.sendPushNotification);
router.post('/send_poll_notification', pushNotificationCtrl.sendPollNotification);
router.post('/send_poll_result_notification', pushNotificationCtrl.sendPollResultNotification);
router.post('/send-post-notification-to-followers', pushNotificationCtrl.sendPostNotificationToFollowers);
router.post('/send-video-added-notification', pushNotificationCtrl.sendVideoAddedNotification);
router.post('/send-lineup-notification-to-followers', pushNotificationCtrl.sendLineupNotificationToFollowers);
router.post('/send-upcoming-audio-notification-to-tags', pushNotificationCtrl.sendUpcomingAudioNotificationTags);
router.post('/send-live-audio-notification-to-tags', pushNotificationCtrl.sendLiveAudioNotificationTags);
router.post('/send-post-react-notification', pushNotificationCtrl.sendPostReactionNotification);
router.post('/send_news_notification', pushNotificationCtrl.sendNewsNotification);
// router.post('/send-team-group-notification', pushNotificationCtrl.sendTeamGroupNotification);

module.exports = router;