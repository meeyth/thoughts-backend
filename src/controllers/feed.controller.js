import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Follow } from "../models/follow.model.js";
import { User } from "../models/user.model.js";
import { Blog } from "../models/blog.model.js";

export const getUserFeed = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch the IDs of users the current user is following
    const followingIds = await Follow.find({ follower: req.user._id })
        .select('following')  // Select only the followingId field
        .lean()
        .exec();

    console.log(followingIds, "followingIdList");

    const followingIdList = followingIds.map(follow => follow.following);

    // Fetch the blogs from the following users, sorted by createdAt in descending order, with pagination
    const feed = await Blog.aggregate([
        {
            $match: { owner: { $in: followingIdList } } // Match blogs by following user IDs
        },
        {
            $sort: { createdAt: -1 }  // Sort by createdAt in descending order
        },
        {
            $lookup: {
                from: 'users',  // Name of the User collection
                localField: 'owner',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'  // Unwind the user array to get the actual user object
        },
        {
            $skip: skip  // For pagination
        },
        {
            $limit: limit  // Limit the number of results
        },
        // {
        //     $project: {
        //         title: 1,
        //         content: 1,
        //         createdAt: 1,
        //         'user.name': 1,
        //         'user.email': 1
        //     }
        // }
    ]);

    // Count total blogs for the users followed (for pagination purposes)
    const totalBlogs = await Blog.countDocuments({
        owner: { $in: followingIdList }
    });

    // Return paginated response with feed data
    res.status(200).json({
        page,
        limit,
        totalPages: Math.ceil(totalBlogs / limit),
        totalBlogs,
        feed
    });
});