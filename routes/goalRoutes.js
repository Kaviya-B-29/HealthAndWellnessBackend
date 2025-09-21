import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createGoal,
  getGoals,
  deleteGoal,
} from "../controllers/goalController.js";

const router = express.Router();

// Create a goal
router.post("/", protect, createGoal);

// Get all goals for logged-in user (with progress info)
router.get("/", protect, getGoals);

// Delete a goal
router.delete("/:id", protect, deleteGoal);

export default router;
