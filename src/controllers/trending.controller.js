import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Blog } from "../models/blog.model.js"


//TODO: implement pagination where needed
export const getTrendingBlogs = asyncHandler(async (req, res) => {

    const trendingBlogs = await Blog.aggregate([
        {
            $addFields: {
                // Calculate time difference (in days, you can adjust it to hours or minutes if needed)
                timeDiff: {
                    $divide: [
                        { $subtract: [new Date(), "$createdAt"] },
                        1000 * 60 * 60 * 24 // Convert milliseconds to days
                    ]
                }
            }
        },
        {
            $addFields: {
                // Calculate trend score
                trendScore: {
                    $divide: ["$totalReads", "$timeDiff"]
                }
            }
        },
        {
            // Sort by trendScore in descending order
            $sort: { trendScore: -1 }
        },
        {
            $project: {
                // trendScore: 0,
                timeDiff: 0
            }
        },
        {
            // Limit the result to top 10 blogs
            $limit: 10
        }
    ])

    return res.status(200).json(new ApiResponse(200, trendingBlogs, "trending blogs fetched"))
})
