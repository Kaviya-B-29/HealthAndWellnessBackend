import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getReminders, markRemindersViewed } from "../controllers/reminderController.js";

const router = express.Router();

// Get reminders + comments for logged in user
router.get("/", protect, getReminders);

// Mark reminders as viewed
router.post("/viewed", protect, markRemindersViewed); // <--- add this

export default router;
