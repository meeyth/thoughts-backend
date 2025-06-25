import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Follow } from "../models/follow.model.js"
import mongoose from "mongoose"


const getFollowingList = async (loggedInUserId) => {
    const allFollowing = await Follow.find({
        //we need the following list of the current logged in user so that we can check if the userId(coming from the body )is present in the following list of loggedInUserId or not.then we can render the follow/unfollow btn accordingly
        follower: loggedInUserId
    });

    return allFollowing;
}

//successfull
const toggleFollow = asyncHandler(async (req, res) => {
    const { userId } = req.params

    console.log(userId);

    const checkFollowing = await Follow.findOne({
        following: userId,
        follower: req.user?._id
    })

    //already following
    if (checkFollowing) {
        await User.findById(userId).updateOne({
            $inc: { totalFollowers: -1 }
        })
        await User.findById(req.user?._id).updateOne({
            $inc: { totalFollowings: -1 }
        })
        await Follow.deleteOne({
            following: userId,
            follower: req.user._id
        })
        // TODO: delete item from Follow collection , update total followers count for the other user
        return res.status(200).json(new ApiResponse(200, false, "Already following...unfollow"))
    }
    else {
        await User.findById(userId).updateOne({
            $inc: { totalFollowers: 1 }
        })
        await User.findById(req.user?._id).updateOne({
            $inc: { totalFollowings: 1 }
        })
        await Follow.create({
            following: userId,
            follower: req.user._id
        })
        return res.status(200).json(new ApiResponse(200, true, "started following"))
    }

    // return res.status(200).json(new ApiResponse(200, true, "started following"))

})

// const isUserFollowed = asyncHandler(async (req, res) => {
//     const { blogId } = req.params

//     const blogLikedAlready = await Follow.findOne({
//         blog: blogId,
//         likedBy: req.user?._id
//     });

//     // console.log(Boolean(blogLikedAlready));
//     return res.status(200)
//         .json(new ApiResponse(200, Boolean(blogLikedAlready), "Blog Liked successfully"));
// })


//successfull
const getFollowing = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { page, limit } = req.query
    const options = {
        page,
        limit
    }
    const allFollowing = Follow.aggregate([
        {
            $match: {
                follower: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "following",
                foreignField: "_id",
                as: "following"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                'user._id': 1,
                'user.username': 1,
                'user.avatar': 1,
                'user.fullname': 1,
                // createdAt: 1
            }
        },
    ]);
    const paginatedFollowing = await Follow.aggregatePaginate(allFollowing, options)

    return res.status(200).json(new ApiResponse(200, paginatedFollowing, "fetched follwings"))

})

//successfull
const getFollower = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { page, limit } = req.query
    const options = {
        page,
        limit
    }
    // console.log(userId);
    const allFollower = Follow.aggregate([
        {
            $match: {
                following: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "follower",
                foreignField: "_id",
                as: "follower"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                'user._id': 1,
                'user.username': 1,
                'user.avatar': 1,
                'user.fullname': 1,
                // createdAt: 1
            }
        },
    ]);

    const paginatedFollowers = await Follow.aggregatePaginate(allFollower, options)
    return res.status(200).json(new ApiResponse(200, paginatedFollowers, "fetched follwers"))
})
export {
    toggleFollow,
    getFollowing,
    getFollower
} 