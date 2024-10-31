import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import { options } from "../constants.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

//successfull
const registerUser = asyncHandler(async (req, res) => {
    //1. get user details from frontend
    //2. validation- not empty
    //3. check if user already exists: username,email
    //4. check for images, check for avatar
    //5. upload them to cloudinary, avatar
    //6. create user object- create entry in db
    //7. remove password and refresh token field from response
    //8. check for user creation
    // return res 

    const { fullname, email, username, password } = req.body


    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]

    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath = ""
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered successfully")
    )

})

//successfull
const loginUser = asyncHandler(async (req, res) => {
    //1. req body -> data
    //2. username or email
    //3. find the user
    //4. find the user
    //5. password check
    //6. access and refresh token
    //7. send cookies

    console.log(req.body)
    const { email, username, password } = req.body
    if (!username || !email) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    console.log("Refreshing access token");
    // console.log(req.cookies);
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        return res.status(401).json(new ApiResponse(401, "Unauthorized request", "Failed"))
        // throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.refresh_token_secret
        )

        const user = await User.findById(decodedToken?._id).select("-password")

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is invalid or expired")
        }

        const { accessToken, refreshToken, user: userWithNewRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access Token refreshed"
                )
            )
    }
    catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "invalid old password")
    }


    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

//successfull
//TODO: check undefined conditions 
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email, username } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "All fileds are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email: email,
                username: username
            }
        },
        { new: true }//updated data will be returned back
    ).select("-password ")

    return res.status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})

//successfull
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    //todo-delete old image after successfully adding the new in video 19
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "Avatar image updated successfully"))
})

//successfull
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on coverImage")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "cover image updated successfully"))
})

//successfull
const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    // console.log(username);

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }

    const profile = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            //finding the blogs of the user
            $project: {
                // _id: 0,
                refreshToken: 0,
                previousReads: 0,
                email: 0,
                password: 0,
                createdAt: 0,
                updatedAt: 0,
            }
        }
    ])

    // console.log(profile);

    if (!profile?.length) {
        throw new ApiError(404, "Profile does not exist");
    }

    // const paginatedReadHistory = await Blog.aggregatePaginate(profile, options)
    return res.status(200)
        .json(new ApiResponse(200, profile, "User profile fetched successfully"))
})

//successfull
const getReadHistory = asyncHandler(async (req, res) => {

    const { page, limit } = req.query
    const options = {
        page,
        limit
    }

    const reads = User.findById(req.user?._id).select("previousReads")

    const paginatedReadHistory = await Blog.aggregatePaginate(reads, options)
    return res.status(200)
        .json(new ApiResponse(200, paginatedReadHistory, "read history fetched successfully"))
})




export {
    registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails,
    updateUserAvatar, updateUserCoverImage,
    getUserProfile, getReadHistory
}
