import mongoose from "mongoose";
import { db_name } from "../constants.js";


const connectDB = async () => {
    try {
        const connectionInstance=await mongoose.connect(`${process.env.mongodb_uri}`)
        console.log(`MongoDB connected db host: ${ connectionInstance.connection.host }`);
        
    } catch (error) {
        console.log("MongoDB connection error",error);
        process.exit(1);
    }
}
export default connectDB;