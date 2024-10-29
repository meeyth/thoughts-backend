import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    origin: [process.env.cors_origin, "https://thethoughts.netlify.app"],
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

/*
url response request-
error,req,res,next- from url 
next is a flag for middleware
 
*/



//routes import 
import userRouter from './routes/user.routes.js'
import commentRouter from './routes/comment.routes.js'

import likeRouter from './routes/like.routes.js'
import blogRouter from './routes/blog.routes.js'
import followRouter from './routes/follow.routes.js'
import feedRouter from './routes/feed.routes.js'
import trendingRouter from './routes/trending.routes.js'


// Test route
app.get("/api/v1/test", (req, res, next) => {
    return res.send("Working..")
})

//routes declaration
app.use("/api/v1/users", userRouter)
//http://localhost:8000/api/v1/users/register

app.use("/api/v1/blog", commentRouter)

app.use("/api/v1/blog", likeRouter)

app.use("/api/v1/blog", blogRouter)

app.use("/api/v1/users", followRouter)

app.use("/api/v1/users", feedRouter)
app.use("/api/v1/users", trendingRouter)

export { app };

