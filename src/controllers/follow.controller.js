import {ApiResponse} from "../utils/ApiResponse.js"
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
    const { userId } = req.body

    const checkFollowing = await Follow.findOne({
        following: userId,
        follower: req.user._id
    })
    
    //already following
    if (checkFollowing) {
        await User.findById(userId).updateOne({
            $inc: { totalFollowing: -1 }
        })
        return res.status(200).json(new ApiResponse(200,false,"Already following...unfollow"))
    }
    else {
        await User.findById(userId).updateOne({
            $inc: { totalFollowing: 1 }
        })
        await Follow.create({
            following: userId,
            follower: req.user._id  
        })
        return res.status(200).json(new ApiResponse(200,true,"started following"))
    }

    
})


//successfull
const getFollowing = asyncHandler(async (req, res) => {
    const { userId } = req.body
    const { page , limit  } = req.query
    const options = {
        page,
        limit
    }
    const allFollowing =  Follow.aggregate([
        {
            $match: {
                follower:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "following",
                foreignField: "_id",
                as:"followings"
            }
        },
        {
            $project: {
                followings:1
            }
        },
        {
            $unwind: "$followings"
        },
        {
            $sort: {
                "followings.createdAt": -1
            }
        }
    ]);
    const paginatedFollowing = await Follow.aggregatePaginate(allFollowing,options)
    
    return res.status(200).json(new ApiResponse(200, paginatedFollowing, "fetched follwings"))
    
})

//successfull
const getFollower = asyncHandler(async (req, res) => {
    const { userId } = req.body
    const { page , limit  } = req.query
    const options = {
        page,
        limit
    }
    const allFollower =  Follow.aggregate([
        {
            $match: {
                following:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "follower",
                foreignField: "_id",
                as:"followers"
            }
        },
        {
            $project: {
                followers:1
            }
        },
        {
            $unwind: "$followers"
        },
        {
            $sort: {
                "followers.createdAt": -1
            }
        }
    ]);
    
    const paginatedFollowers = await Follow.aggregatePaginate(allFollower,options)
    return res.status(200).json(new ApiResponse(200, paginatedFollowers, "fetched follwers"))
})
export {
    toggleFollow,
    getFollowing,
    getFollower
} 