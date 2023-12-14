const auth = require('firebase-admin/auth');
const axios = require('axios');
const admin = require('firebase-admin');

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

    // this method is used to create a user with phone number in firebase authentication
    // the phone number is used to check if the user authentication data already exist.
    // The OTP is sent on the client app.
    // This method is used to verify the OTP and also create a new user.
    // If the data exist, just verify the OTP.
    // If the data does not exist, first verify the OPT and then create a firebase authentication user with the phone number.
    // Note that i don't have to generate the OTP in the flutter application. The Termii service generates the OTP.
    async createUserWithPhoneNumber(req, res) {
        try {
            const { phoneNumber, otpCode, pinId } = req.body;
            const data = await getUserByPhoneNumber(phoneNumber);
            if (data !== 'No data') {
                const response = await axios(requestOptions(otpCode, pinId));
                if (response.data['verified'] === true) {
                    const user = await getUserDocument(data.uid);
                    return res.status(200).json({message: 'Phone number verified successfully.', newUser: false, user});
                }
            } else {
                const response = await axios(requestOptions(otpCode, pinId));
                if (response.data['verified'] === true) {
                    const authAdmin = auth.getAuth();
                    const user = await authAdmin.createUser({
                        phoneNumber: phoneNumber,
                        disabled: false,
                    });
                    return res.status(200).json({message: 'User created successfully.', newUser: true, userId: user.uid});
                }
            }
        } catch (error) {
            return res.status(500).json({message: 'Phone number authentication failed.'})
        }
    },
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

function requestOptions(pinCode, pinId) {
    return {
        method: 'POST',
        url: 'https://api.ng.termii.com/api/sms/otp/verify',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "Access-Control-Allow-Origin": "*",
        },
        data: {
            'api_key': process.env.TERMII_API_KEY,
            'pin_id': pinId,
            'pin': pinCode
        }
    };
}