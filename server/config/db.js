import mongoose from "mongoose";

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Exits the process on failure so the app never runs in a broken state.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is not defined in the environment.");

    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(uri);
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
