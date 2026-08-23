const auth = require("firebase-admin/auth");
const axios = require("axios");
const crypto = require("crypto");
const { getFirestore } = require("firebase-admin/firestore");
const {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} = require("libphonenumber-js");
const { getCode } = require("country-list");
const parseMax = require("libphonenumber-js/max");
const parseMin = require("libphonenumber-js/min");
const parseMobile = require("libphonenumber-js/mobile");

const db = getFirestore();
const PHONE_OTPS = "phone_otps";

module.exports = {
  async deleteAdminUser(req, res) {
    try {
      const { uid } = req.body;
      const authAdmin = auth.getAuth();
      await authAdmin.deleteUser(uid);
      return res.json({ message: "Auth user deleted" });
    } catch (error) {
      return res.json(error);
    }
  },

  async checkIfUserExist(req, res) {
    try {
      const { email } = req.body;
      const authAdmin = auth.getAuth();
      const data = await authAdmin.getUserByEmail(email);
      const user = await getUserDocument(data?.uid ?? "");
      return res
        .status(200)
        .json({ message: "User data", newUser: user === null, user });
    } catch (error) {
      return res.json({
        message: "User data does not exist",
        newUser: true,
        user: null,
      });
    }
  },

  async checkIfEmailExist(req, res) {
    try {
      const { email } = req.body;
      const authAdmin = auth.getAuth();
      const data = await authAdmin.getUserByEmail(email);
      return res.status(200).json({
        message: "User email exist",
        userExist: data?.uid ? true : false,
      });
    } catch (error) {
      console.log(error);
      if (error.code === "auth/user-not-found") {
        return res.status(200).json({
          message: "User email exist",
          userExist: false,
        });
      }
      return res.status(500).json({
        message: "User email does not exist",
        userExist: false,
      });
    }
  },

  async checkIfUsernameExist(req, res) {
    try {
      const { username } = req.body;
      const data = await getUserDocumentByUsername(username);
      return res
        .status(200)
        .json({ message: "Username exist", userExist: data });
    } catch (error) {
      return res.json({ message: "Username does not exist", userExist: false });
    }
  },

  async checkIfPhoneNumberExist(req, res) {
    try {
      const { phoneNumber } = req.body;
      const phoneNumberExist = await checkPhoneNumberExists(phoneNumber);
      if (!phoneNumberExist.exists) {
        return res.status(400).json({
          message:
            "Phone number does not exist. Use Google, Apple, Facebook or email.",
          userExist: false,
        });
      }
      return res
        .status(200)
        .json({ message: "Phone number exist", userExist: true });
    } catch (error) {
      return res.status(500).json({
        message:
          "Phone number does not exist. Use Google, Apple, Facebook or email.",
        userExist: false,
      });
    }
  },

  // This method is used to send OTP to user's phone
  async sendPhoneNumberOtp(req, res) {
    try {
      const { phoneNumber, country } = req.body;
      const phoneNumberExist = await checkPhoneNumberExists(phoneNumber);
      if (!phoneNumberExist.exists) {
        return res.status(500).json({
          message:
            "Phone authentication not available at the moment. Use Google, Apple, Facebook or email.",
          phoneNumberExist: false,
        });
      }
      const countryName = getCode(country);
      /**
       * I did the first parsing so that i can get the actual country code of the phone number,
       * because the user might be in a different country than the one they are
       * trying to register with. For example, a user might be in the US but trying
       * to register with a Nigerian phone number. So we need to get the actual country code
       * of the phone number to validate it correctly.
       */
      const firstParsing = parsePhoneNumberFromString(phoneNumber, countryName);
      const actualCountryCode = firstParsing?.country;
      const min = parseMin(phoneNumber, actualCountryCode).getType();
      const max = parseMax(phoneNumber, actualCountryCode).getType();
      const mobile = parseMobile(phoneNumber, actualCountryCode).getType();
      if (!min && (!max || !mobile)) {
        return res
          .status(500)
          .json({ message: "Invalid phone number.", invalidPhoneNumber: true });
      }
      const parsed = parsePhoneNumberFromString(phoneNumber, actualCountryCode);
      if (!parsed.isValid()) {
        return res
          .status(500)
          .json({ message: "Invalid phone number.", invalidPhoneNumber: true });
      }
      const nigerianNumber = isNigerianNumber(phoneNumber);
      // min 6 digits and max 6 digits
      const otpCode = crypto.randomInt(10 ** 5, 10 ** 6 - 1);
      // Step 1 - save the otp to firestore database
      const phoneNumberDocID = phoneNumber.replace(/[^\w\s]/gi, "");
      console.log(phoneNumberDocID, otpCode);
      await db.collection(PHONE_OTPS).doc(phoneNumberDocID).set({
        otp: otpCode,
      });
      let kudiResult = null;
      let sevenIOResult = null;
      // Step 2 - send the otp sms message
      if (nigerianNumber || country === "Nigeria") {
        kudiResult = await axios(kudiRequestOptions(phoneNumber, otpCode));
      } else {
        sevenIOResult = await axios(
          sevenIORequestOptions(phoneNumber, otpCode),
        );
      }

      if (kudiResult && isKudiError(kudiResult)) {
        return res.status(500).json({
          message: "Please provide a valid Nigerian phone number.",
          validNigerianNumber: false,
        });
      }

      if (sevenIOResult && isSevenIOError(sevenIOResult)) {
        return res.status(500).json({
          message: "Please provide a valid phone number.",
          validPhoneNumber: false,
        });
      }
      return res.status(200).json({ message: "6 digit OTP sent.", otpCode });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Phone number authentication failed.",
        phoneAuthenticationFailed: true,
      });
    }
  },

  async verifyOTP(req, res) {
    try {
      const { phoneNumber, otpCode } = req.body;
      const doc = await getPhoneOtpCode(phoneNumber);
      if (!doc) {
        return res.status(400).json({ message: "Incorrect OTP code" });
      } else {
        if (otpCode !== `${doc.otp}`) {
          return res.status(400).json({ message: "Incorrect OTP code" });
        } else {
          let token = null;
          const authAdmin = auth.getAuth();
          const data = await authAdmin.getUserByPhoneNumber(phoneNumber);
          const user = await getUserDocument(data?.uid ?? "");
          if (user) {
            token = await authAdmin.createCustomToken(data.uid);
          }
          return res.status(200).json({
            message: "Phone number verified successfully.",
            newUser: user === null,
            user,
            token,
          });
        }
      }
    } catch (error) {
      return res.status(400).json({
        message: "User data does not exist",
        newUser: true,
        user: null,
        token: null,
      });
    }
  },

  async createUserWithPhoneNumber(req, res) {
    try {
      const { phoneNumber } = req.body;
      const authAdmin = auth.getAuth();
      const data = await authAdmin.createUser({
        phoneNumber,
        disabled: false,
        metadata: {
          creationTime: new Date().toUTCString(),
          lastSignInTime: new Date().toUTCString(),
        },
      });
      const token = await authAdmin.createCustomToken(data.uid);
      return res
        .status(200)
        .json({ message: "User created", token, userId: data.uid });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "User not created", token: null, userId: null });
    }
  },
};

async function getPhoneOtpCode(phoneNumber) {
  try {
    const phoneNumberDocID = phoneNumber.replace(/[^\w\s]/gi, "");
    const phoneOtpCodeRef = db.collection(PHONE_OTPS).doc(phoneNumberDocID);
    const doc = await phoneOtpCodeRef.get();
    return doc.data();
  } catch (error) {
    return null;
  }
}

async function getUserDocument(userUID) {
  try {
    const document = await db.collection("users").doc(userUID).get();
    if (!document.data().deleted) {
      return document.data();
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

async function getUserDocumentByUsername(username) {
  try {
    const document = await db
      .collection("users")
      .where("username", "==", username)
      .limit(1)
      .get();
    return !document.empty;
  } catch (error) {
    return null;
  }
}

async function checkPhoneNumberExists(phoneNumber) {
  try {
    const authAdmin = auth.getAuth();
    const userRecord = await authAdmin.getUserByPhoneNumber(phoneNumber);
    return { exists: true, user: userRecord };
  } catch (error) {
    return { exists: false, user: null };
  }
}

function kudiRequestOptions(phoneNumber, otpCode) {
  return {
    method: "POST",
    url: "https://my.kudisms.net/api/otp",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    data: {
      token: process.env.KUDI_SMS_TOKEN,
      senderID: "KickChat",
      recipients: phoneNumber,
      otp: otpCode,
      appnamecode: "1553456476",
      templatecode: "1248646928",
    },
  };
}

function sevenIORequestOptions(phoneNumber, otpCode) {
  return {
    method: "POST",
    url: "https://gateway.seven.io/api/sms",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${process.env.SEVEN_IO_KEY}`,
    },
    data: {
      from: "KickChat",
      to: phoneNumber,
      text: `${otpCode} is your verification code`,
    },
  };
}

function isNigerianNumber(phoneNumber) {
  // Remove any whitespace from the phone number
  const cleanNumber = phoneNumber.replace(/\s+/g, "");

  // Check if the phone number starts with +234
  return cleanNumber.startsWith("+234");
}

function isKudiError(kudiResult) {
  return kudiResult?.data?.status === "error";
}

function isSevenIOError(sevenIOResult) {
  const message = sevenIOResult?.data?.messages?.[0];
  return message?.success === false && message?.error_text !== null;
}
