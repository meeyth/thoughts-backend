import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        about: {
            type: String,
            trim: true,
            default: ""
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,//cloudinary url
            required: true,
        },
        coverImage: {
            type: String,
        },
        totalBlogs: {
            type: Number,
            default: 0
        },
        totalFollowers: {
            type: Number,
            default: 0
        },
        totalFollowings: {
            type: Number,
            default: 0
        },
        previousReads: [
            {
                type: Schema.Types.ObjectId,
                ref: "Blog"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
// model's hook-this hook functionality is provided by mongoose
// 
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        //arguments- object(actual data),key,time period
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.access_token_secret,
        {
            expiresIn: process.env.access_token_expiry

        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.refresh_token_secret,
        {
            expiresIn: process.env.refresh_token_expiry

        }
    )
}

userSchema.plugin(mongooseAggregatePaginate);

export const User = mongoose.model("User", userSchema)
