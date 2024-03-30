const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const axios = require('axios');

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

    async readBranchDeepLink(req, res) {
        try {
            const { deepLink } = req.params;
            const getUrl = `https://api2.branch.io/v1/url?url=${deepLink}&branch_key=${process.env.BRANCH_KEY}`;
            const response = await axios.get(getUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            return res.json({message: 'Branch deep link', url: response.data.data.url});

        } catch (error) {
            return res.json(error);
        }
    },

    async createBranchDeepLink(req, res) {
        try {
            const { alias } = req.body;
            const url = 'https://api2.branch.io/v1/url';
            const response = await axios.post(url, {
                branch_key: process.env.BRANCH_KEY,
                channel: "kickchat",
                alias,
                feature: "referral",
                data: {
                    referral_key: alias,
                    $og_title: "KickChat",
                    $og_description: "Connect with fans of your favorite teams that share the same interests as you. Download the app to get started.",
                    $og_image_url: "https://res.cloudinary.com/soccerkik/image/upload/v1641150827/icon.png",
                    $desktop_url: "https://kickchat.download"
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            return res.json({message: 'Branch deep link created', url: response.data.url});

        } catch (error) {
            return res.json(error);
        }
    }
}