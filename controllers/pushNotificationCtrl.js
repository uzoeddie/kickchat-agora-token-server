const admin = require('firebase-admin');

module.exports = {
    async sendPollNotification(req, res) {
        try {
            const { pollId, question } = req.body;
            const payload = {
                notification: {
                    title: translate('kickchatPoll', 'en', ''),
                    body: `${question}`,
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                },
                data: {'type': 'polls', 'pollId': pollId},
            };
            await admin.messaging().sendToTopic('polls', payload);
            return res.json({message: 'Notification sent'});

        } catch (error) {
            return res.json(error);
        }
    },

    async sendPollResultNotification(req, res) {
        try {
            const { pollId, question } = req.body;
            const payload = {
                notification: {
                    title: translate('kickchatPollResult', 'en', ''),
                    body: `${question}`,
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                },
                data: {'type': 'polls', 'pollId': pollId},
            };
            await admin.messaging().sendToTopic('polls', payload);
            return res.json({message: 'Notification sent'});

        } catch (error) {
            console.log(error);
            return res.json(error);
        }
    },

    async sendPostNotificationToFollowers(req, res) {
        try {
            const { username, topic, postId, locale } = req.body;
            const payload = {
                notification: {
                    title: 'KickChat',
                    body: translate('userAddedPost', locale, `${username}`),
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                },
                data: {'type': 'followersPost', 'postId': postId},
            };
            await admin.messaging().sendToTopic(topic, payload);
            return res.json({message: 'Notification sent'});

        } catch (error) {
            return res.json(error);
        }
    },

    async sendPostReactionNotification(req, res) {
        try {
            const { topic, title, body, payload } = req.body;
            const notificationPayload = {
                notification: {
                    title,
                    body,
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                },
                data: JSON.parse(payload),
            };
            await admin.messaging().sendToTopic(topic, notificationPayload);
            return res.json({message: 'Notification sent'});

        } catch (error) {
            return res.json(error);
        }
    },

    async sendLiveAudioNotificationTags(req, res) {
        try {
            const { topic, roomId, locale } = req.body;
            for(let topicName of JSON.parse(topic)) {
                const payload = {
                    notification: {
                        title: 'KickChat',
                        body: translate('liveAudioDiscussion', locale, `${topicName['interest']}`),
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    data: {'type': 'liveAudioRoom', 'roomId': roomId},
                };
                await admin.messaging().sendToTopic(topicName['topic'], payload);
            }
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    },

    async sendUpcomingAudioNotificationTags(req, res) {
        try {
            const { topic, roomId, locale } = req.body;
            for(let topicName of JSON.parse(topic)) {
                const payload = {
                    notification: {
                        title: 'KickChat',
                        body: translate('discussionRelatedToYourInterest', locale, `${topicName['interest']}`),
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    data: {'type': 'upcomingRoom', 'roomId': roomId},
                };
                await admin.messaging().sendToTopic(topicName['topic'], payload);
            }
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    }
}

function translate(phrase, locale, ph) {
    return __({ phrase, locale }, ph);
}