import mongoose from "mongoose";

const connectDB = async () => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URL}/talky`)
       console.log(`\n mongoDB connected..!!`)
    } catch (error) {
        console.log("MONGODB connection Failed : ",error)
        process.exit(1)
    }
}

export default connectDB