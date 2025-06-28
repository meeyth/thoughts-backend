import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Blog } from "../models/blog.model.js"


//successfull
const getBlogComments = asyncHandler(async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const { blogId } = req.params
    console.log(blogId);
    const options = {
        page,
        limit
    }
    if (!isValidObjectId(blogId)) {
        throw new ApiError(400, "BlogId is missing")
    }
    // const blogs=
    const commentsInBlog = Comment.aggregate([
        {
            $match: {
                blog: new mongoose.Types.ObjectId(blogId)
            },

        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                "owner._id": 1,
                "owner.username": 1,
                "owner.avatar": 1,
                content: 1,
                _id: 1

            }
        }
    ])
    const paginatedBlogComments = await Comment.aggregatePaginate(commentsInBlog, options)
    console.log(paginatedBlogComments)
    return res.status(200)
        .json(new ApiResponse(200, paginatedBlogComments, "Fetched all comments successfully"))

})

//successfull
const addComment = asyncHandler(async (req, res) => {
    const { blogId, content } = req.body;

    if (!blogId || !isValidObjectId(blogId)) {
        throw new ApiError(400, "Blog id is not valid");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(400, "Blog not found");
    }

    if (!content) {
        throw new ApiError(400, "Content not found");
    }

    const comment = await Comment.create({
        content,
        blog: blogId,
        owner: req.user?._id,
    });

    if (!comment) {
        throw new ApiError(400, "Couldn't comment");
    }

    // ✅ Increment commentCount in Blog by 1
    await Blog.findByIdAndUpdate(blogId, {
        $inc: { commentCount: 1 }
    });

    return res.status(200)
        .json(new ApiResponse(200, comment, "Commented successfully"));
});


//successfull
const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.body
    const { newComment } = req.body

    console.log(commentId);

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Comment id invalid")
    }
    if (!newComment) {
        throw new ApiError(400, "Comment not found")
    }
    const verifyComment = await Comment.findById(commentId)

    if (!verifyComment) {
        throw new ApiError(400, "comment does not exist")
    }

    if (verifyComment?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "Only valid user can update comment")
    }

    const comment = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            content: newComment
        }
    }, { new: true })

    if (!comment) {
        throw new ApiError(400, "Couldn't update comment")
    }
    return res.status(200)
        .json(new ApiResponse(200, comment, "Updated successfully"))
})

//successfull
const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.body
    if (!commentId) {
        throw new ApiError(400, "Comment id is not valid")
    }

    console.log(commentId)
    const verifyUser = await Comment.findById(commentId)
    console.log(verifyUser)
    if (verifyUser.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "Only valid user can delete the comment")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if (!comment) {
        throw new ApiError(400, "Couldn't delete the comment")
    }

    // ✅ Decrement commentCount in Blog by 1
    await Blog.findByIdAndUpdate(comment.blog, {
        $inc: { commentCount: -1 }
    });


    return res.status(200)
        .json(new ApiResponse(200, comment, "Comment deleted successfully"))
})

export {
    getBlogComments,
    addComment,
    updateComment,
    deleteComment
}