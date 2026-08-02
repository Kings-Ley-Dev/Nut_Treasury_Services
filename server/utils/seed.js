import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

/**
 * Seeds an admin account from the ADMIN_* environment variables.
 * Run with:  npm run seed   (from the /server folder)
 */
const seed = async () => {
  await connectDB();
  try {
    const email = (process.env.ADMIN_EMAIL || "admin@nutbank.com").toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
      console.log(`ℹ️  Admin already exists: ${email}`);
    } else {
      await User.create({
        name: process.env.ADMIN_NAME || "Nut Treasury Services Admin",
        email,
        password: process.env.ADMIN_PASSWORD || "Admin@12345",
        role: "admin",
        status: "approved",
      });
      console.log(`✅  Admin created: ${email}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || "Admin@12345"}`);
    }
  } catch (err) {
    console.error("Seed error:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
