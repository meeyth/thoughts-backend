import { Router } from "express"
import {
    getUserBlog,
    addBlog,
    updateBlog,
    deleteBlog,
    getSpecificBlog
} from "../controllers/blog.controller.js"
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJwt } from "../middlewares/Auth.middleware.js"


const router = Router()

router.route("/user-blog").get(verifyJwt, getUserBlog)

//secured routes
router.route("/add-blog").post(
    verifyJwt,
    upload.fields([
        {
            name: "image",
            maxCount: 1
        }
    ]),
    addBlog)

//endpoint
router.route("/update-blog").put(
    verifyJwt,
    upload.fields([
        {
            name: "image",
            maxCount: 1
        }
    ]),
    updateBlog)

router.route("/delete-blog").delete(verifyJwt, deleteBlog)
router.route("/get-blog/:blogId").get(verifyJwt, getSpecificBlog)


export default router  