const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const axios = require('axios');

const REFERRALS = 'referrals';

module.exports = {
    async updateReferralCount(req, res) {
        try {
            const { referralId } = req.body;
            await admin.firestore().collection(REFERRALS).doc(referralId).update({
                count: FieldValue.increment(1),
            });
            return res.json({message: 'Referral count updated'});

        } catch (error) {
            return res.json(error);
        }
    },

    async createBranchDeepLink(req, res) {
        try {
            const { alias } = req.body;
            const referralId = getRandomString(28);
            const url = 'https://api2.branch.io/v1/url';
            const response = await axios.post(url, {
                branch_key: process.env.BRANCH_KEY,
                channel: "kickchat",
                alias,
                feature: "Share",
                data: {
                    referral_key: alias,
                    referral_id: referralId,
                    $canonical_identifier: 'kickchat/branch',
                    $canonical_url: "https://kickchat.download",
                    $always_deeplink: true,
                    $publicly_indexable: true,
                    $og_title: "KickChat",
                    $og_description: "Connect with fans of your favorite teams that share the same interests as you. Download the app to get started.",
                    $og_image_url: "https://res.cloudinary.com/soccerkik/image/upload/v1641150827/icon.png",
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            if (response && response.data && response.data.url) {
                await admin.firestore().collection(REFERRALS).doc(referralId).set({
                    referralId,
                    count: 0,
                    alias,
                    url: response.data.url
                });
            }
            return res.json({message: 'Branch deep link created', url: response.data.url});
        } catch (error) {
            return res.json(error);
        }
    }
}

function getRandomString(length) {
    var randomChars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}