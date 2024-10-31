import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Follow } from "../models/follow.model.js";
import { User } from "../models/user.model.js";
import { Blog } from "../models/blog.model.js";

export const getUserFeed = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;

    console.log(page, limit);
    const options = {
        page,
        limit,
    }

    // Fetch the IDs of users the current user is following
    const followingIds = await Follow.find({ follower: req.user._id })
        .select('following')  // Select only the followingId field
        .lean()
        .exec();

    // console.log(followingIds, "followingIds");

    const followingIdList = followingIds.map(follow => follow.following);

    // console.log(followingIdList, "followingIdList");

    // Fetch the blogs from the following users, sorted by createdAt in descending order, with pagination
    const feed = Blog.aggregate([
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
                as: 'owner'
            }
        },
        {
            $unwind: '$owner'  // Unwind the user array to get the actual user object
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
    ]);

    // Count total blogs for the users followed (for pagination purposes)
    // const totalBlogs = await Blog.countDocuments({
    //     owner: { $in: followingIdList }
    // });

    const paginatedFeed = await Blog.aggregatePaginate(feed, options)

    return res.status(200)
        .json(new ApiResponse(200, paginatedFeed, "Fetched all likes successfully"))


    // return res.status(200)
    //     .json(new ApiResponse(200, {
    //         page,
    //         limit,
    //         totalPages: Math.ceil(totalBlogs / limit),
    //         totalBlogs,
    //         feed
    //     }, "Fetched feed successfully"))
});