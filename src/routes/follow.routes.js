import { Router } from "express"
import {
    getFollower,
    getFollowing,
    toggleFollow

} from "../controllers/follow.controller.js"

import { verifyJwt } from "../middlewares/Auth.middleware.js"

const router = Router()

//middleware

router.route("/toggle-follow").post(verifyJwt, toggleFollow)
router.route("/get-following/:userId").get(verifyJwt, getFollowing)
router.route("/get-follower/:userId").get(verifyJwt, getFollower)

export default router