const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

const ADMINS = 'referrals';

module.exports = {
    async updateReferralCount(req, res) {
        try {
            const { referralId } = req.body;
            await admin.firestore().collection(ADMINS).doc(referralId).update({
                count: FieldValue.increment(1),
            });
            return res.json({message: 'Referral count updated'});

        } catch (error) {
            return res.json(error);
        }
    },
}