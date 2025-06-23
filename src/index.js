// require('dotenv').config({ path: './env' })

import "dotenv/config"
import connectDB from "./db/index.js";
import { app } from './app.js'


// dotenv.config({
//     path: './.env'
// })



connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`server is running at port: ${process.env.PORT}`);

        })
    })
    .catch((err) => {
        console.log("Mongo db connection failed!!!", err);

    })


/*
import express from "express";
const app=express()

(async () => {
    try {
        await mongoose.connect(`${process.env.mongodb_uri}/${db_name}`)
        app.on("error", (error) => {
            console.log("Error: ", error);
        throw error
        })

        app.listen(process.env.port, () => {
            console.log("App is listening on port ${process.env.port");
        
        })
    } catch (error) {
        console.log("Error: ", error);
        throw error
        
    }
})()
*/