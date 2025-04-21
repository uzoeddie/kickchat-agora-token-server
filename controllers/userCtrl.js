const auth = require('firebase-admin/auth');
const axios = require('axios');
const admin = require('firebase-admin');
const crypto = require("crypto");
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();
const PHONE_OTPS = 'phone_otps';

module.exports = {
    async deleteAdminUser(req, res) {
        try {
            const { uid } = req.body;
            const authAdmin = auth.getAuth();
            await authAdmin.deleteUser(uid);
            return res.json({message: 'Auth user deleted'});

        } catch (error) {
            return res.json(error);
        }
    },

    async checkIfUserExist(req, res) {
        try {
            const { email } = req.body;
            const authAdmin = auth.getAuth();
            const data = await authAdmin.getUserByEmail(email);     
            const user = await getUserDocument(data?.uid ?? '');
            return res.status(200).json({message: 'User data', newUser: user === null, user });
        } catch (error) {
            return res.status(400).json({message: 'User data does not exist', newUser: true, user: null });
        }
    },

    // This method is used to send OTP to user's phone
    async sendPhoneNumberOtp(req, res) {
        try {
            const { phoneNumber, country } = req.body;
            // min 6 digits and max 6 digits
            const otpCode = crypto.randomInt(10**5, 10**6-1);
            // Step 1 - save the otp to firestore database
            const phoneNumberDocID = phoneNumber.replace(/[^\w\s]/gi, '');
            await db.collection(PHONE_OTPS).doc(phoneNumberDocID).set({
                otp: otpCode
            });
            // Step 2 - send the otp sms message
            if (country === 'Nigeria') {
                await axios(kudiRequestOptions(phoneNumber, otpCode));
            } else {
                await axios(sevenIORequestOptions(phoneNumber, otpCode));
            }
            return res.status(200).json({message: '6 digit OTP sent.', otpCode });
        } catch (error) {
            return res.status(400).json({message: 'Phone number authentication failed.'});
        }
    },

    async verifyOTP(req, res) {
        try {
            const { phoneNumber, otpCode } = req.body;
            const doc = await getPhoneOtpCode(phoneNumber);
            if (!doc) {
                return res.status(400).json({message: 'Incorrect OTP code'});
            } else {
                if (otpCode !== `${doc.otp}`) {
                    return res.status(400).json({message: 'Incorrect OTP code'});
                } else {
                    let token = null;
                    const authAdmin = auth.getAuth();
                    const data = await authAdmin.getUserByPhoneNumber(phoneNumber);   
                    const user = await getUserDocument(data?.uid ?? '');
                    if (user) {
                        token = await authAdmin.createCustomToken(data.uid);
                    }
                    return res.status(200).json({message: 'Phone number verified successfully.', newUser: user === null, user, token});
                }
            }
        } catch (error) {
            return res.status(400).json({message: 'User data does not exist', newUser: true, user: null, token: null });
        }
    },

    async createUserWithNumber(req, res) {
        try {
            const { phoneNumber } = req.body;
            const authAdmin = auth.getAuth();
            const data = await authAdmin.createUser({
                phoneNumber,
                disabled: false,
                metadata: {
                    creationTime: new Date().toUTCString(),
                    lastSignInTime: new Date().toUTCString(),
                }
            });
            const token = await authAdmin.createCustomToken(data.uid);
            return res.status(200).json({message: 'User created', token, userId: data.uid });
        } catch (error) {
            return res.status(400).json({message: 'User not created', token: null, userId: null });
        }
    },
}

async function getPhoneOtpCode(phoneNumber) {
    try {
        const phoneNumberDocID = phoneNumber.replace(/[^\w\s]/gi, '');
        const phoneOtpCodeRef = db.collection(PHONE_OTPS).doc(phoneNumberDocID);
        const doc = await phoneOtpCodeRef.get();
        return doc.data();
    } catch (error) {
        return null;
    }
}

async function getUserDocument(userUID) {
    try {
        const document = await admin.firestore().collection('users').doc(userUID).get();
        if (!document.data().deleted) {
            return document.data();
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

function kudiRequestOptions(phoneNumber, otpCode) {
    return {
        method: 'POST',
        url: 'https://my.kudisms.net/api/otp',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "Access-Control-Allow-Origin": "*",
        },
        data: {
            'token': process.env.KUDI_SMS_TOKEN,
            'senderID': 'KickChat',
            'recipients': phoneNumber,
            'otp': otpCode,
            'appnamecode': '1553456476',
            'templatecode': '1248646928'
        }
    };
}

function sevenIORequestOptions(phoneNumber, otpCode) {
    return {
        method: 'POST',
        url: 'https://gateway.seven.io/api/sms',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Key': process.env.SEVEN_IO_KEY
        },
        data: {
            'from': 'KickChat',
            'to': phoneNumber,
            "text": `${otpCode} is your verification code`
        }
    };
}