import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const followSchema = new Schema(
    {
        follower: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        following: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

followSchema.plugin(mongooseAggregatePaginate)
export const Follow = mongoose.model("Follow", followSchema)