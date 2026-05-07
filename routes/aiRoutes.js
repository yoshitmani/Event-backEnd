import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  enhanceJobDescription,
  enhanceProfessionalSummary,
  uploadResume,
} from "../controllers/aiController.js";
import { getSkillSuggestions } from "../controllers/skillSuggestionController.js";

const aiRouter = express.Router();

aiRouter.post("/enhanced-pro-sum", protect, enhanceProfessionalSummary);
aiRouter.post("/enhanced-job-desc", protect, enhanceJobDescription);
aiRouter.post("/upload-resume", protect, uploadResume);
aiRouter.post("/skill-suggestions", protect, getSkillSuggestions);

export default aiRouter;