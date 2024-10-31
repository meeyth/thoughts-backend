
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Blog } from "../models/blog.model.js"


//successfull
const toggleBlogLike = asyncHandler(async (req, res) => {
    const { blogId } = req.params

    console.log(blogId, "toggleBlogLike");

    if (!blogId) {
        throw new ApiError(400, "Blog not found")
    }
    // console.log(req.user?._id);

    const blogLikedAlready = await Like.findOne({
        blog: blogId,
        likedBy: req.user?._id
    });

    console.log(blogLikedAlready);

    if (blogLikedAlready) {
        //dislike the video

        //decrement the like count
        await Blog.findById(blogId).updateOne({
            $inc: { likeCount: -1 }
        })

        await Like.findByIdAndDelete(blogLikedAlready?._id);
        return res.status(200)
            .json(new ApiResponse(200, false, "Blog Disliked successfully"));
    }
    else {
        //like the blog

        //increment the like count of the blog
        await Blog.findById(blogId).updateOne({
            $inc: { likeCount: 1 }
        })
        await Like.create({
            blog: blogId,
            likedBy: req.user?._id
        })
    }

    return res.status(200)
        .json(new ApiResponse(200, true, "Blog Liked successfully"));

})


const isBlogLiked = asyncHandler(async (req, res) => {
    const { blogId } = req.params

    const blogLikedAlready = await Like.findOne({
        blog: blogId,
        likedBy: req.user?._id
    });

    // console.log(Boolean(blogLikedAlready));
    return res.status(200)
        .json(new ApiResponse(200, Boolean(blogLikedAlready), "Blog Liked successfully"));
})

//not needed
const addLike = asyncHandler(async (req, res) => {

    const { blogId } = req.body
    if (!blogId) {
        throw new ApiError(400, "Blog not found")
    }
    const like = await Like.create({
        blog: blogId,
        likedBy: req.user?._id
    })

    if (!like) {
        throw new ApiError(400, "Couldn't like the blog")
    }

    return res.status(200)
        .json(new ApiResponse(200, true, "Blog Liked successfully"));

})



const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.body
    //TODO: toggle like on comment
    if (!commentId) {
        throw new ApiError(400, "Comment not found")
    }

    const commentLikedAlready = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })
    if (commentLikedAlready) {
        //dislike the comment
        await Like.findByIdAndDelete(commentLikedAlready?._id)
        res.status(200)
            .json(new ApiResponse(200, {}, "Comment disliked successfully"))
    }
    else {
        await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })

    }
    res.status(200)
        .json(new ApiResponse(200, {}, "Comment liked successfully"))

})

//successfull
const getLikedBlogs = asyncHandler(async (req, res) => {

    const { page, limit } = req.query
    const options = {
        page,
        limit
    }

    const blogIds = await Like.find({ likedBy: req.user._id })
        .select('blog')  // Select only the followingId field
        .lean()
        .exec();

    const blogIdList = blogIds.map(like => like.blog);

    console.log(blogIdList);

    const likesInBlog = Blog.aggregate([
        {
            $match: { _id: { $in: blogIdList } } // Match blogs by following user IDs
        },
        {
            $sort: { createdAt: -1 }  // Sort by createdAt in descending order
        },
        {
            $lookup: {
                //using lookup to get all the liked blogs mapped from the Blog model to the blog attribute in Like model
                from: "users",
                localField: "owner",//this blog attribute in likes
                foreignField: "_id",//id field of each blog
                as: "owner"
            }
        },
        // {
        //     $unwind: "$likedBlog",
        // },
        {
            $unwind: "$owner",
        },
        {
            $project: {
                'owner._id': 0,
                'owner.email': 0,
                'owner.about': 0,
                'owner.coverImage': 0,
                'owner.fullname': 0,
                'owner.password': 0,
                'owner.previousReads': 0,
                'owner.refreshToken': 0,
                'owner.createdAt': 0,
                'owner.updatedAt': 0,
            }
        }
    ])
    const paginatedLikedBlogs = await Blog.aggregatePaginate(likesInBlog, options)

    console.log(paginatedLikedBlogs);
    return res.status(200)
        .json(new ApiResponse(200, paginatedLikedBlogs, "Fetched all likes successfully"))
})

export {
    isBlogLiked,
    toggleCommentLike,
    toggleBlogLike,
    getLikedBlogs,
    addLike
} 