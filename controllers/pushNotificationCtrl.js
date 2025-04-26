const admin = require('firebase-admin');
const helperMethods = require('./helper');
const { Timestamp } = require('firebase-admin/firestore');

const localeList = ['en', 'es', 'de', 'it', 'pt', 'fr'];
const PUSH_NOTIFICATION = 'push_notifications';

module.exports = {
    async sendAppUpdateNotification(req, res) {
        try {
            const pushId = helperMethods.getRandomString(28);
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
                    'pushId': pushId,
                    title: 'KickChat',
                    body: 'New version available. Update now.',
                },
                topic: 'global'
            };
            await admin.messaging().send(payload);
            await savePushNotification('App update notification', pushId, 'appUpdate', 0, {
                'type': 'appUpdate',
                'pushId': pushId,
                title: 'KickChat',
                body: 'New version available. Update now.',
            });
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    },

    async sendMatchLineUpNotification(req, res) {
        try {
            const pushId = helperMethods.getRandomString(28);
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
                    'pushId': pushId,
                    teams, 
                    fixtureId: `${fixtureId}`,
                    title: 'Match Lineup',
                    body: `${teams}`,
                },
                topic: 'global'
            };
            await admin.messaging().send(payload);
            await savePushNotification(
                'Match lineup notification', 
                pushId, 
                'matchLineup', 
                0,
                {
                    'type': 'matchLineup', 
                    'pushId': pushId,
                    teams, 
                    fixtureId: `${fixtureId}`,
                    title: 'Match Lineup',
                    body: `${teams}`,
                }
            );
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    },

    async sendPlayerRatingNotification(req, res) {
        try {
            const { id, teams } = req.body;
            const payload = {
                notification: {
                    title: 'Vote for Best Player',
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
                    'type': 'addPlayerRatings', 
                    matchId: id,
                    teams, 
                    title: 'Vote for Best Player',
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
            return res.json(error);
        }
    },

    async sendPollNotification(req, res) {
        try {
            const pushId = helperMethods.getRandomString(28);
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
                    'pushId': pushId,
                    title: translate('kickchatPoll', 'en', ''),
                    body: `${question}`,
                },
                topic: 'polls'
            };
            await admin.messaging().send(payload);
            await savePushNotification('Poll notification', pushId, 'polls', 0, {
                'type': 'polls', 
                'pollId': pollId,
                'pushId': pushId,
                title: translate('kickchatPoll', 'en', ''),
                body: `${question}`,
            });
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
            const pushId = helperMethods.getRandomString(28);
            const { title, topic, postId, body } = req.body;
            const payload = {
                notification: {
                    title,
                    body: translate(`${body}`, 'en', ''),
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
                    'pushId': pushId,
                    'notificationType': 'videoHighlights',
                    title,
                    body: translate(`${body}`, 'en', ''),
                },
                topic
            };
            await admin.messaging().send(payload);
            await savePushNotification(`${title}`, pushId, 'videoHighlights', 0, {
                'type': 'videoHighlights', 
                'postId': postId,
                'pushId': pushId,
                title,
                body: translate(`${body}`, 'en', ''),
            });
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
            const pushId = helperMethods.getRandomString(28);
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
                    'pushId': pushId,
                    title: 'KickChat',
                    body: translate('liveAudioDiscussion', locale, ''),
                },
                condition: condition.trim(),
            };
            await admin.messaging().send(payload);
            await savePushNotification('Create live audio room', pushId, 'liveAudioRoom', 0, {
                'type': 'liveAudioRoom', 
                'roomId': roomId,
                'pushId': pushId,
                title: 'KickChat',
                body: translate('liveAudioDiscussion', 'en', ''),
            });
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

    async sendNewsNotification(req, res) {
        try {
            const pushId = helperMethods.getRandomString(28);
            const { title, newsLink, img, time, shortDesc, website } = req.body;
            const payload = {
                notification: {
                    title: 'KickChat',
                    body: title,
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
                    'type': 'newsLink', 
                    'pushId': pushId,
                    newsLink,
                    title: 'KickChat',
                    img,
                    time,
                    website,
                    shortDesc,
                    body: title,
                },
                topic: 'global'
            };
            await admin.messaging().send(payload);
            await savePushNotification(
                'News notification', 
                pushId, 
                'newsLink', 
                0,
                {
                    'type': 'newsLink', 
                    'pushId': pushId,
                    newsLink,
                    title: 'KickChat',
                    img,
                    body: title,
                }
            );
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    },
    
    // this is not used at the moment
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

async function savePushNotification(title, pushId, type, usersOpenCount, data) {
    try {
        await admin.firestore().collection(PUSH_NOTIFICATION).doc(pushId).set({
            title,
            pushId,
            type,
            usersOpenCount,
            data,
            createdAt: Timestamp.now()
        });
    } catch (error) {
        return null;
    }
}