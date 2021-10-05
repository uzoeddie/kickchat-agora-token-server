require('dotenv').config();

const express = require('express');
const emailValidator = require('deep-email-validator');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const PORT = 8080;
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

const app = express();

const nocache = (req, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
};

const generateAccessToken = (req, resp) => {
    resp.header('Acess-Control-Allow-Origin', '*');

    const channelName = req.query.channelName;
    if (!channelName) {
        return resp.status(500).json({ error: 'channel is required' });
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
    return resp.json({ token: token });
};


app.get('/access_token', nocache, generateAccessToken);
app.get('/validate_email', nocache, async (req, res) => {
    const response = await emailValidator.validate(req.query.email);
    return res.json(response);
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
