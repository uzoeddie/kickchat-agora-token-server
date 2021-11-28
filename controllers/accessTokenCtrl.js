const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

module.exports = {
    async generateAccessToken(req, res) {
        const channelName = req.query.channelName;
        if (!channelName) {
            return res.status(500).json({ error: 'channel is required' });
        }

        let uid = req.query.uid;
        if (!uid || uid == '') {
            uid = 0;
        }

        let role = RtcRole.SUBSCRIBER;
        if (req.query.role == 'publisher') {
            role = RtcRole.PUBLISHER;
        }

        let expireTime = req.query.expireTime;
        if (!expireTime || expireTime == '') {
            expireTime = 7200; // 2 hours
        } else {
            expireTime = parseInt(expireTime, 10);
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const privilegeExpireTime = currentTime + expireTime;
        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            uid,
            role,
            privilegeExpireTime,
        );
        return res.json({ token: token });
    },
}