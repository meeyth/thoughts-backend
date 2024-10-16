import { Router } from "express"
import {
    getTrendingBlogs
} from "../controllers/trending.controller.js"

import { verifyJwt } from "../middlewares/Auth.middleware.js"

const router = Router()

//middleware
router.route("/get-trending-blogs").get(verifyJwt, getTrendingBlogs)

export default router