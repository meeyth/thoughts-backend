import express from "express";
import { requestOtp, validateOtp } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", validateOtp);

export default router;
