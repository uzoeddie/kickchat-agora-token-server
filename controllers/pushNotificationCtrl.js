const admin = require('firebase-admin');

module.exports = {
    async sendPollNotification(req, res) {
        try {
            const { pollId, question } = req.body;
            const payload = {
                notification: {
                    title: 'KickChat poll. Vote now.',
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
            const { username, topic, postId } = req.body;
            const payload = {
                notification: {
                    title: 'KickChat',
                    body: `${username} added a new post.`,
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

    async sendUpcomingAudioNotificationTags(req, res) {
        try {
            const { topic, roomId } = req.body;
            const topics = topic.split(',');
            for(let topicName in topics) {
                const payload = {
                    notification: {
                        title: 'KickChat',
                        body: `A discussion related to your interest ${topicName} has started. You can join the discussion.`,
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    data: {'type': 'upcomingRoom', 'roomId': roomId},
                };
                await admin.messaging().sendToTopic(topicName, payload);
            }
            return res.json({message: 'Notification sent'});
        } catch (error) {
            return res.json(error);
        }
    }
}