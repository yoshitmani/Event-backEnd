import express from "express";
import cors from "cors";
import "dotenv/config";
import dns from "dns";

import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Server is live... 🚀");
});

app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/ai", aiRouter);

// Connect DB
await connectDB();

// Export for Vercel
export default app;