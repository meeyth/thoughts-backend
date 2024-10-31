import { Router } from "express"
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserProfile,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getReadHistory
} from "../controllers/user.controller.js"
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJwt } from "../middlewares/Auth.middleware.js"
import multer from "multer"

var multParse = multer()
const router = Router()

//middleware
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(multParse.none(), loginUser)

//secured routes
router.route("/logout").post(verifyJwt, logoutUser)

//endpoint
router.route("/refresh-token").get(refreshAccessToken)

router.route("/change-password").post(verifyJwt, changeCurrentPassword)

router.route("/current-user").get(verifyJwt, getCurrentUser)

router.route("/update-account").patch(verifyJwt, updateAccountDetails)

router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)

router.route("/cover-image").patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage)

router.route("/profile/:userId").get(verifyJwt, getUserProfile)

router.route("/history").get(verifyJwt, getReadHistory)


export default router  