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

    // This method is used to send OTP to user's phone
    async sendPhoneNumberOtp(req, res) {
        try {
            const { phoneNumber } = req.body;
            // min 6 digits and max 6 digits
            const otpCode = crypto.randomInt(10**5, 10**6-1);
            // Step 1 - save the otp to firestore database
            const phoneNumberDocID = phoneNumber.replace(/[^\w\s]/gi, '');
            await db.collection(PHONE_OTPS).doc(phoneNumberDocID).set({
                otp: otpCode
            });
            // Step 2 - send the otp sms message
            await axios(requestOptions(phoneNumber, otpCode));
            return res.status(200).json({message: '6 digit OTP sent.', otpCode });
        } catch (error) {
            return res.status(400).json({message: 'Phone number authentication failed.'});
        }
    },

    // This method is used to verify the OTP and also create a new user.
    async verifyOTPAndCreateUser(req, res) {
        try {
            const { phoneNumber, otpCode } = req.body;
            // the phone number acts as the identifier in firebase auth
            const data = await getUserByPhoneNumber(phoneNumber);
            if (data !== 'No data') {
                await phoneAuthUserExist(res, phoneNumber, otpCode, data);
            } else {
                await phoneNumberUserDoesNotExist(res, phoneNumber, otpCode);
            }
        } catch (error) {
            return res.status(400).json({message: 'OTP verification failed.'});
        }
    }
}

async function phoneAuthUserExist(res, phoneNumber, otpCode, data) {
    // if user phone auth exist
    const doc = await getPhoneOtpCode(phoneNumber);
    if (!doc) {
        return res.status(400).json({message: 'Incorrect OTP code'});
    } else {
        if (otpCode !== `${doc.otp}`) {
            return res.status(400).json({message: 'Incorrect OTP code'});
        } else {
            const authAdmin = auth.getAuth();
            const token = await authAdmin.createCustomToken(data.uid);
            const user = await getUserDocument(data.uid);
            const key = user !== null ? 'user' : 'userId';
            const value = user !== null ? user : data.uid;
            return res.status(200).json({message: 'Phone number verified successfully.', token, newUser: user === null, [`${key}`]: value});
        }
    }
}

async function phoneNumberUserDoesNotExist(res, phoneNumber, otpCode) {
    // if user phone auth does not exist
    const doc = await getPhoneOtpCode(phoneNumber);
    if (!doc) {
        return res.status(400).json({message: 'Incorrect OTP code'});
    } else {
        if (otpCode !== `${doc.otp}`) {
            return res.status(400).json({message: 'Incorrect OTP code'});
        } else {
            const authAdmin = auth.getAuth();
            const user = await authAdmin.createUser({
                phoneNumber,
                disabled: false,
                metadata: {
                    creationTime: new Date().toUTCString(),
                    lastSignInTime: new Date().toUTCString(),
                }
            });
            const token = await authAdmin.createCustomToken(data.uid);
            return res.status(200).json({message: 'Phone number verified successfully.', token, newUser: true, userId: user.uid});
        }
    }
}

async function getUserByPhoneNumber(phoneNumber) {
    try {
        const authAdmin = auth.getAuth();
        const data = await authAdmin.getUserByPhoneNumber(phoneNumber);
        return data;
    } catch (error) {
        return 'No data';
    }
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

function requestOptions(phoneNumber, otpCode) {
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