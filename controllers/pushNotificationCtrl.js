const admin = require('firebase-admin');

const localeList = ['en', 'es', 'de', 'it', 'pt', 'fr'];

module.exports = {
    async sendAppUpdateNotification(req, res) {
        try {
            const payload = {
                notification: {
                    title: 'KickChat',
                    body: 'New version available. Update now.',
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5"
                    }
                },
                data: {
                    'type': 'appUpdate',
                    title: 'KickChat',
                    body: 'New version available. Update now.',
                },
                topic: 'global'
            };
            await admin.messaging().send(payload);
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    },

    async sendMatchLineUpNotification(req, res) {
        try {
            const { fixtureId, teams } = req.body;
            const payload = {
                notification: {
                    title: 'Match Lineup',
                    body: `${teams}`,
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5",
                    },
                },
                data: {
                    'type': 'matchLineup', 
                    teams, 
                    fixtureId: `${fixtureId}`,
                    title: 'Match Lineup',
                    body: `${teams}`,
                },
                topic: 'global'
            };
            await admin.messaging().send(payload);
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    },

    async sendPushNotification(req, res) {
        try {
            const { token, title, body, payload } = req.body;
            const parsedPayload = JSON.parse(payload);
            parsedPayload['title'] = title;
            parsedPayload['body'] = body;
            const payloadBody = {
                notification: {
                    title,
                    body,
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5"
                    }
                },
                data: parsedPayload,
                token
            };
            await admin.messaging().send(payloadBody);
            return res.json({message: 'Notification sent'});
        } catch (error) {
            console.log(error);
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
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5"
                    }
                },
                data: {
                    'type': 'polls', 
                    'pollId': pollId,
                    title: translate('kickchatPoll', 'en', ''),
                    body: `${question}`,
                },
                topic: 'polls'
            };
            await admin.messaging().send(payload);
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
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5"
                    }
                },
                data: {
                    'type': 'polls', 
                    'pollId': pollId,
                    title: translate('kickchatPollResult', 'en', ''),
                    body: `${question}`,
                },
                topic: 'polls'
            };
            await admin.messaging().send(payload);
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
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5"
                    }
                },
                data: {
                    'type': 'followersPost', 
                    'postId': postId,
                    title: 'KickChat',
                    body: translate('userAddedPost', newLocale, `${username}`),
                },
                topic
            };
            await admin.messaging().send(payload);
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
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5"
                    }
                },
                data: {
                    'type': 'followersPost', 
                    'postId': postId,
                    title: 'Watch match highlights',
                    body: translate(`${title}`, 'en', ''),
                },
                topic
            };
            await admin.messaging().send(payload);
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
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5"
                    }
                },
                data: {
                    'type': 'lineupPost', 
                    'userId': userId,
                    title: 'KickChat',
                    body: translate('userAddedLineup', newLocale, `${username}`),
                },
                topic
            };
            await admin.messaging().send(payload);
            return res.json({message: 'Lineup notification sent'});
        } catch (error) {
            return res.json(error);
        }
    },

    async sendPostReactionNotification(req, res) {
        try {
            const { topic, title, body, payload } = req.body;
            const parsedPayload = JSON.parse(payload);
            parsedPayload['title'] = title;
            parsedPayload['body'] = body;
            const notificationPayload = {
                notification: {
                    title,
                    body,
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5"
                    }
                },
                data: parsedPayload,
                topic
            };
            await admin.messaging().send(notificationPayload);
            return res.json({message: 'Notification sent'});

        } catch (error) {
            return res.json(error);
        }
    },

    async sendLiveAudioNotificationTags(req, res) {
        try {
            const { roomId, topic, locale } = req.body;
            const parsedTopics = JSON.parse(topic);
            let condition = '';
            const lastIndex = parsedTopics.length - 1;
            for(const [index, value] of parsedTopics.entries()) {
                condition += `'${value.topic}' ${index !== lastIndex ? 'in topics || ' : 'in topics'}`
            }          
            const payload = {
                notification: {
                    title: 'KickChat',
                    body: translate('liveAudioDiscussion', locale, ''),
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5"
                    }
                },
                data: {
                    'type': 'liveAudioRoom', 
                    'roomId': roomId,
                    title: 'KickChat',
                    body: translate('liveAudioDiscussion', locale, ''),
                },
                condition: condition.trim(),
            };
            await admin.messaging().send(payload);
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    },

    async sendUpcomingAudioNotificationTags(req, res) {
        try {
            const { roomId, topic, locale } = req.body;  
            const parsedTopics = JSON.parse(topic);
            let condition = '';
            const lastIndex = parsedTopics.length - 1;
            for(const [index, value] of parsedTopics.entries()) {
                condition += `'${value.topic}' ${index !== lastIndex ? 'in topics || ' : 'in topics'}`
            }          
            const payload = {
                notification: {
                    title: 'KickChat',
                    body: translate('discussionRelatedToYourInterest', locale, ''),
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5"
                    }
                },
                data: {
                    'type': 'upcomingRoom', 
                    'roomId': roomId,
                    title: 'KickChat',
                    body: translate('discussionRelatedToYourInterest', locale, ''),
                },
                condition: condition.trim(),
            };
            await admin.messaging().send(payload);
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
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5"
                    }
                },
                data: {
                    'type': 'teamGroup', 
                    'groupId': groupId, 
                    'team': team,
                    title: 'KickChat',
                    body: translateWithParams('teamGroupMessage', newLocale, `${group}`, `${team}`),
                },
                topic
            };
            await admin.messaging().send(payload);
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