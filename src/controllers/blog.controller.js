import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Blog } from "../models/blog.model.js"
import { User } from "../models/user.model.js"
import { Like } from "../models/like.model.js"


//successfull
const getUserBlog = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { page, limit } = req.query
    const options = {
        page,
        limit
    }

    // console.log(options)

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "User isn't registered or userId is invalid")
    }
    const userBlogs = Blog.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            },
        },
        {
            $sort: { createdAt: -1 }  // Sort by createdAt in descending order
        },
    ])

    const paginatedUserBlogs = await Blog.aggregatePaginate(userBlogs, options)

    return res.status(200)
        .json(new ApiResponse(200, paginatedUserBlogs, "Fetched all blogs successfully"))

})

//done
const addBlog = asyncHandler(async (req, res) => {
    // console.log("called ADD BLOG");

    const { title, tag, content } = req.body
    // console.log(title, tag, content, "Add blog");

    if (!content || !title) {
        throw new ApiError(400, "Required fields are mandatory");
    }

    const imageLocalPath = req.files?.image[0]?.path;

    // console.log(imageLocalPath, "Img local path");

    if (!imageLocalPath) {
        throw new ApiError(400, "image file is required")
    }

    const image = await uploadOnCloudinary(imageLocalPath)

    if (!image) {
        throw new ApiError(400, "image file is required")
    }

    const newBlog = await Blog.create({
        content: content,
        title: title,
        tag: tag,
        owner: req.user?._id,
        image: image.url
    })

    await User.findById(req.user?._id).updateOne({
        $inc: { totalBlogs: 1 }
    })

    // console.log(req.user)
    if (!newBlog) {
        throw new ApiError(400, "Couldn't create new Blog")
    }

    return res.status(200)
        .json(new ApiResponse(200, newBlog, "Created new blog successfully"))

})

//successfull
const getSpecificBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    if (!blogId || !isValidObjectId(blogId)) {
        throw new ApiError(400, "Blog id is invalid");
    }

    // ✅ Fetch blog and populate owner details
    const verifyBlog = await Blog.findById(blogId)
        .populate({
            path: "owner",
            select: "username fullname avatar"
        });

    if (!verifyBlog) {
        throw new ApiError(400, "Blog does not exist");
    }

    // ✅ Increment read count
    await Blog.findByIdAndUpdate(blogId, {
        $inc: { totalReads: 1 }
    });

    // ✅ Add to user's previousReads history (avoid duplicates)
    await User.updateOne(
        { _id: req.user?._id },
        { $addToSet: { previousReads: blogId } }
    );

    // ✅ Check if the blog is liked by the current user
    const isLiked = await Like.exists({
        blog: blogId,
        likedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { blog: verifyBlog, isLiked: Boolean(isLiked) },
            "Fetched successfully"
        )
    );
});


//successfull
const updateBlog = asyncHandler(async (req, res) => {

    const { blogId } = req.body
    const { newContent } = req.body
    const { tag } = req.body
    const { title } = req.body

    if (!blogId || !isValidObjectId(blogId)) {
        throw new ApiError(400, "Blog id is invalid")
    }
    const verifyBlog = await Blog.findById(blogId)

    if (!verifyBlog) {
        throw new ApiError(400, "Blog does not exist")
    }
    if (verifyBlog?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "Only valid user can update blog")
    }


    const imageLocalPath = req.files?.image[0]?.path;

    //updating image
    if (!imageLocalPath) {
        throw new ApiError(400, "Image file is missing")
    }
    //todo-delete old image after successfully adding the new in video 19
    const image = await uploadOnCloudinary(imageLocalPath)

    if (!image.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const updatedBlog = await Blog.findByIdAndUpdate(blogId,
        {
            $set: {
                image: image.url,
                content: newContent,
                tag: tag,
                title: title,

            }
        },
        { new: true }
    )

    if (!updatedBlog) {
        throw new ApiError(400, "Couldn't update blog")
    }
    return res.status(200)
        .json(new ApiResponse(200, updatedBlog, "Updated successfully"))
})

//successfull
const deleteBlog = asyncHandler(async (req, res) => {

    const { blogId } = req.body
    if (!blogId) {
        throw new ApiError(400, "Blog id is not valid")
    }

    // console.log(commentId)
    const verifyUser = await Blog.findById(blogId)
    // console.log(verifyUser)
    if (verifyUser.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "Only owner can delete the blog")
    }
    const checkBlog = await Blog.findByIdAndDelete(blogId)
    await User.findById(req.user?._id).updateOne({
        $inc: { totalBlogs: -1 }
    })

    if (!checkBlog) {
        throw new ApiError(400, "Couldn't delete the blog")
    }
    return res.status(200)
        .json(new ApiResponse(200, checkBlog, "Blog deleted successfully"))
})

export {
    getUserBlog,
    addBlog,
    updateBlog,
    deleteBlog,
    getSpecificBlog
}