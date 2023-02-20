const axios = require('axios');

module.exports = {
    async validateEmail(req, res) {
        try {
            const domain = req.query.email.split('@')[1];
            // const lookup = await axios(requestOptions(domain));
            // let response = {};
            let response = {
                valid: true,
                validators: {
                    regex: { valid: true },
                    typo: { valid: true },
                    disposable: { valid: true },
                    mx: { valid: true },
                    smtp: { valid: true }
                }
            }
            // if (lookup.data !== null && lookup.data.valid && !lookup.data.disposable && !lookup.data.block) {
            //     response = {
            //         valid: true,
            //         validators: {
            //             regex: { valid: true },
            //             typo: { valid: true },
            //             disposable: { valid: true },
            //             mx: { valid: true },
            //             smtp: { valid: true }
            //         }
            //     }
            // } else {
            //     response = {
            //         valid: false,
            //         validators: {
            //             regex: { valid: false },
            //             typo: { valid: false },
            //             disposable: { valid: false },
            //             mx: { valid: false },
            //             smtp: { valid: false }
            //         }
            //     }
            // }
            return res.json(response);
        } catch (error) {
            console.log(error);
        }
    },
}

function requestOptions(domain) {
    return {
        method: 'GET',
        url: 'https://mailcheck.p.rapidapi.com/',
        params: { domain },
        headers: {
          'X-RapidAPI-Host': 'mailcheck.p.rapidapi.com',
          'X-RapidAPI-Key': process.env.EMAIL_VERIFICATION_API
        }
    };
}