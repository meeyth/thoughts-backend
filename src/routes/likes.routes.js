import { Router } from "express"
import {
    toggleBlogLike,
    addLike,
    toggleCommentLike,
    getLikedBlogs
    
} from "../controllers/like.controller.js"

import { verifyJwt } from "../middlewares/Auth.middleware.js"

const router = Router()

//middleware
router.route("/add-like").post(verifyJwt,addLike)
router.route("/toggle-comment-like").put(verifyJwt,toggleCommentLike)
router.route("/toggle-blog-like").put(verifyJwt,toggleBlogLike)
router.route("/get-liked-blogs").get(verifyJwt,getLikedBlogs)

export default router