const admin = require('firebase-admin');

const localeList = ['en', 'es', 'de', 'it', 'pt', 'fr'];

module.exports = {
    async sendPushNotification(req, res) {
        try {
            const { token, title, body, payload, receiverId } = req.body;
            const payloadBody = {
                notification: {
                    title,
                    body,
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                },
                data: JSON.parse(payload),
            };
            if (receiverId) {
                const userDocument = await admin.firestore().collection('users').doc(receiverId).get();
                const user = userDocument.data();
                if (user !== null && userDocument.exists) {
                    await admin.messaging().sendToDevice(user.fcmToken, payloadBody);
                } else {
                    await admin.messaging().sendToDevice(token, payloadBody);
                }
                
            } else {
                await admin.messaging().sendToDevice(token, payloadBody);
            }
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    },

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
            return res.json(error);
        }
    },

    async sendPostNotificationToFollowers(req, res) {
        try {
            const { username, topic, postId, locale } = req.body;
            let newLocale = 'en';
            const hasLocale = localeList.includes(locale);
            if (hasLocale) {
                newLocale = locale;
            }
            const payload = {
                notification: {
                    title: 'KickChat',
                    body: translate('userAddedPost', newLocale, `${username}`),
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

    async sendVideoAddedNotification(req, res) {
        try {
            const { title, topic, postId } = req.body;
            const payload = {
                notification: {
                    title: 'Watch match highlights',
                    body: translate(`${title}`, 'en', ''),
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

    async sendLineupNotificationToFollowers(req, res) {
        try {
            const { username, topic, userId, locale } = req.body;
            let newLocale = 'en';
            const hasLocale = localeList.includes(locale);
            if (hasLocale) {
                newLocale = locale;
            }
            const payload = {
                notification: {
                    title: 'KickChat',
                    body: translate('userAddedLineup', newLocale, `${username}`),
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                },
                data: {'type': 'lineupPost', 'userId': userId},
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
            const { roomId } = req.body;
            const payload = {
                notification: {
                    title: 'KickChat',
                    body: translate('liveAudioDiscussion', 'en', ''),
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                },
                data: {'type': 'liveAudioRoom', 'roomId': roomId},
            };
            await admin.messaging().sendToTopic('global', payload);
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    },

    async sendUpcomingAudioNotificationTags(req, res) {
        try {
            const { roomId } = req.body;            
            const payload = {
                notification: {
                    title: 'KickChat',
                    body: translate('discussionRelatedToYourInterest', 'en', ''),
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                },
                data: {'type': 'upcomingRoom', 'roomId': roomId},
            };
            await admin.messaging().sendToTopic(topicName['topic'], payload);
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    },

    async sendTeamGroupNotification(req, res) {
        try {
            const { topic, group, team, groupId, locale } = req.body;
            let newLocale = 'en';
            const hasLocale = localeList.includes(locale);
            if (hasLocale) {
                newLocale = locale;
            }
            const payload = {
                notification: {
                    title: 'KickChat',
                    body: translateWithParams('teamGroupMessage', newLocale, `${group}`, `${team}`),
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                },
                data: {'type': 'teamGroup', 'groupId': groupId, 'team': team},
            };
            await admin.messaging().sendToTopic(topic, payload);
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    },
}

function translate(phrase, locale, ph) {
    return __({ phrase, locale }, ph);
}

function translateWithParams(phrase, locale, param1, param2) {
    return __({ phrase, locale }, param1, param2);
}