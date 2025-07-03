import { generateOTP } from "../utils/generateOTP.js";
import { sendMail } from "../utils/email.js";
import { Otp } from "../models/otp.model.js";
import bcrypt from "bcrypt"

export const sendOtpToEmail = async (email) => {
    const otp = generateOTP();

    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.create({ email, otp: hashedOtp });

    await sendMail({
        to: email,
        subject: "Your OTP Code for Clicx",
        text: `Your OTP is: ${otp}`,
    });

    return true;
};

export const verifyOtp = async (email, enteredOtp) => {
    const record = await Otp.findOne({ email });

    if (!record) {
        throw new Error("OTP expired or not found");
    }

    const isMatch = await bcrypt.compare(enteredOtp, record.otp);

    if (!isMatch) {
        throw new Error("Invalid OTP");
    }

    await Otp.deleteMany({ email }); // Clean up on success
    return true;
};
