import { Router } from "express"
import {
    getUserFeed
    
} from "../controllers/feed.controller.js"

import { verifyJwt } from "../middlewares/Auth.middleware.js"

const router = Router()

//middleware
router.route("/get-feed").get(verifyJwt, getUserFeed)

export default router