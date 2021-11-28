const emailValidator = require('deep-email-validator');

module.exports = {
    async validateEmail(req, res) {
        const response = await emailValidator.validate(req.query.email);
        return res.json(response);
    },
}