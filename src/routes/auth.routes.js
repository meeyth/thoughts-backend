import express from "express";
import { requestOtp, validateOtpAndResetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", validateOtpAndResetPassword);

export default router;
