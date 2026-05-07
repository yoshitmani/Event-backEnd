import mongoose from "mongoose";

const connectDB = async () => {
  try {
    let mongodbURI = process.env.MONGODB_URI;

    if (!mongodbURI) {
      throw new Error("❌ MONGODB_URI is missing");
    }

    // Remove trailing slash if exists
    if (mongodbURI.endsWith("/")) {
      mongodbURI = mongodbURI.slice(0, -1);
    }

    const DB_URI = `${mongodbURI}/resume-builder`;

    // Prevent multiple connections
    if (mongoose.connections[0].readyState) {
      console.log("✅ MongoDB already connected");
      return;
    }

    await mongoose.connect(DB_URI);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};

export default connectDB;