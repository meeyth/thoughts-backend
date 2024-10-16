import { Router } from "express"
import {
    getBlogComments, 
    addComment, 
    updateComment,
    deleteComment
    
} from "../controllers/comment.controller.js"

import { verifyJwt } from "../middlewares/Auth.middleware.js"

const router = Router()

//middleware
router.route("/add-comment").post(verifyJwt,addComment)
router.route("/blog-comment").get(verifyJwt,getBlogComments)
router.route("/update-comment").put(verifyJwt,updateComment)
router.route("/delete-comment").delete(verifyJwt,deleteComment)

export default router