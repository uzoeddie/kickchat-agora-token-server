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
                    body: `${username} a new post.`,
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                },
                data: {'type': 'followersPost', 'postId': postId},
            };
            await admin.messaging().sendToTopic(topic, payload);
            return res.json({message: 'Notification sent'});

        } catch (error) {
            return res.json(error);
        }
    }
}