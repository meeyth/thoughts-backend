import { asyncHandler } from "../utils/asyncHandler.js"
import { sendOtpToEmail, verifyOtp } from "../services/otp.service.js";

export const requestOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new Error("Email is required");

    await sendOtpToEmail(email);

    res.status(200).json({ success: true, message: "OTP sent to email" });
});

export const validateOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) throw new Error("Email and OTP are required");

    await verifyOtp(email, otp);

    res.status(200).json({ success: true, message: "OTP verified successfully" });
});
