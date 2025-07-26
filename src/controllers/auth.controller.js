import { asyncHandler } from "../utils/asyncHandler.js"
import { sendOtpToEmail, verifyOtpAndSetPassword } from "../services/otp.service.js";


export const requestOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new Error("Email is required");

    await sendOtpToEmail(email);

    res.status(200).json({ success: true, message: "OTP sent to email" });
});


export const validateOtpAndResetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    console.log("OTP: ", otp);

    if (!email || !otp || !newPassword) {
        res.status(400);
        throw new Error("Email, OTP and new password are required");
    }

    await verifyOtpAndSetPassword(email, otp, newPassword);

    res.status(200).json({ success: true, message: "Password reset successfully" });
});



