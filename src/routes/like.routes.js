import { Router } from "express"
import {
    toggleBlogLike,
    addLike,
    toggleCommentLike,
    getLikedBlogs,
    isBlogLiked

} from "../controllers/like.controller.js"

import { verifyJwt } from "../middlewares/Auth.middleware.js"

const router = Router()

//middleware
// router.route("/add-like").post(verifyJwt,addLike)
router.route("/toggle-comment-like").put(verifyJwt, toggleCommentLike)
router.route("/toggle-blog-like/:blogId").put(verifyJwt, toggleBlogLike)
router.route("/is-blog-like/:blogId").get(verifyJwt, isBlogLiked)
router.route("/get-liked-blogs").get(verifyJwt, getLikedBlogs)

export default router