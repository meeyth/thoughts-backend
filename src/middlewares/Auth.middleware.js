import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        console.log(token);

        if (!token) {
            // console.log("hello");
            return res.status(403).json(new ApiResponse(403, "Forbidden request", "Failed"))
            // throw new ApiError(403, "Unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.access_token_secret)
        console.log(decodedToken);

        const user = await User.findById(decodedToken?._id).select("--password --refreshToken")

        if (!user) {
            return res.status(403).json(new ApiResponse(403, "Forbidden request", "Failed"))
            // throw new ApiError(403, "Invalid access token")
        }

        req.user = user;
        next()
    } catch (error) {
        return res.status(403).json(new ApiResponse(403, "Unauthorized request", "Failed"))
        // throw new ApiError(403, "Invalid access token")
    }
})