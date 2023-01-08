const axios = require('axios');

const API_URL = 'https://gateway.sms77.io/api/sms';

module.exports = {
    async sendSMS(req, res) {
        try {
            const { to, message } = req.body;
            let recipient = to.replace(/ /g,'');
            const params = {
                p: process.env.SMS77_API_KEY,
                to: recipient,
                text: message,
                from: 'KickChat',
                return_msg_id: 1
            };
            await axios(requestOptions(params));

            return res.json({message: 'SMS sent'});
        } catch (error) {
            return res.json(error);
        }
    }
};

function requestOptions(params) {
    return {
        method: 'GET',
        url: API_URL,
        params,
    };
}