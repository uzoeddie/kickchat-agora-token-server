const express = require("express");
const router = express.Router();

const userCtrl = require("../controllers/userCtrl");

router.post("/delete-admin-user", userCtrl.deleteAdminUser);
router.post("/send_phone_number_otp", userCtrl.sendPhoneNumberOtp);
router.post("/check_user", userCtrl.checkIfUserExist);
router.post("/check_email", userCtrl.checkIfEmailExist);
router.post("/check_username", userCtrl.checkIfUsernameExist);
router.post("/check_phone_number", userCtrl.checkIfPhoneNumberExist);
router.post("/verify_nigerian_otp", userCtrl.verifyOTP);
router.post(
  "/create_user_with_phone_number",
  userCtrl.createUserWithPhoneNumber,
);

module.exports = router;
