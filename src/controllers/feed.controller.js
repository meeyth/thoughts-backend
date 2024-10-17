import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Follow } from "../models/follow.model.js"


export const getUserFeed = asyncHandler(async (req, res) => {

    const { page, limit } = req.query
    const options = {
        page,
        limit
    }
    const feeds = Follow.aggregate([
        {
            $match: {
                follower: req.user?._id
            }
        },
        {
            $lookup: {
                from: "blogs",
                localField: "following",
                foreignField: "owner",
                as: "feeds",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                },
                                // {
                                //     $unwind: "$owner"
                                // }
                            ]
                        },
                    },
                    // {
                    //     $project: {
                    //         feeds: 1,
                    //         owner: 1
                    //     }
                    // },
                    // {
                    //     $addFields: {
                    //         owner: {
                    //             $first: "$owner"
                    //         },
                    //         feeds: {
                    //             $second: "$feeds"
                    //         }
                    //     }
                    // }
                ]
            }
        },
        // {
        //     $lookup: {
        //         from: "users",
        //         localField: "feeds.owner",
        //         foreignField: "_id",
        //         as: "owner",
        //     }
        // },
        {
            $project: {
                feeds: 1,
                // owner: 1
            }
        },
        {
            $unwind: "$feeds",

        },
        {
            $sort: {
                "feeds.createdAt": -1
            }
        }
    ])

    const paginatedUserFeeds = await Follow.aggregatePaginate(feeds, options)

    // console.log(paginatedUserFeeds);
    return res.status(200).json(new ApiResponse(200, paginatedUserFeeds, "feed fetched"))
})
