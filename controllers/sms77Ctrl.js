const axios = require('axios');

const API_URL = 'https://gateway.sms77.io/api/sms';

module.exports = {
    async sendSMS(req, res) {
        try {
            const { to, message } = req.body;
            let recipient = to.replace(/ /g,'');
            await axios({
                method: 'POST',
                url: 'https://gateway.seven.io/api/sms',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.SEVEN_IO_KEY
                },
                data: {
                    'from': 'KickChat',
                    'to': recipient,
                    "text": message
                }
            });

            return res.json({message: 'SMS sent'});
        } catch (error) {
            return res.json(error);
        }
    }
};