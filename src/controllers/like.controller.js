
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
        //dislike the blog

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
    const { page = 1, limit = 10 } = req.query;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
    };

    // Step 1: Find all blog IDs liked by user with createdAt (time of liking)
    const blogLikes = await Like.find({ likedBy: req.user._id })
        .select('blog createdAt')
        .sort({ createdAt: -1 }) // Sort by time of like (most recent first)
        .lean();

    const blogIdList = blogLikes.map((like) => like.blog);

    // Step 2: Maintain like order in lookup using $addFields and $set
    const likesInBlog = Blog.aggregate([
        {
            $match: { _id: { $in: blogIdList } }
        },
        {
            $addFields: {
                likeOrder: {
                    $indexOfArray: [blogIdList, "$_id"]
                }
            }
        },
        {
            $sort: { likeOrder: 1 } // Maintain order based on like time
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: "$owner" },
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
    ]);

    const paginatedLikedBlogs = await Blog.aggregatePaginate(likesInBlog, options);

    return res.status(200).json(new ApiResponse(200, paginatedLikedBlogs, "Fetched all liked blogs successfully"));
});


export {
    isBlogLiked,
    toggleCommentLike,
    toggleBlogLike,
    getLikedBlogs,
    addLike
} 