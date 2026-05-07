import mongoose from "mongoose";

const connectDB = async () => {

  let mogodbURI = process.env.MONGODB_URI;
  const projectName = "resume-builder";

  if (!mogodbURI) {
    console.error("❌ MONGODB_URI environment variable is not set");
    return;
  }

  if (mogodbURI.endsWith("/")) {
    mogodbURI = mogodbURI.slice(0, -1);
  }

  const DB_URI = `${mogodbURI}/${projectName}`;

  const connect = async () => {

    try {

      await mongoose.connect(DB_URI);

      console.log("✅ Database connected successfully 🔗");

    } catch (error) {

      console.error("❌ MongoDB connection failed. Retrying in 5 seconds...");
      setTimeout(connect, 5000); // retry after 5 seconds

    }

  };

  mongoose.connection.on("connected", () => {
    console.log("📦 MongoDB connection established");
  });

  mongoose.connection.on("disconnected", () => {
    console.log("⚠️ MongoDB disconnected. Reconnecting...");
    connect();
  });

  connect();

};

export default connectDB;