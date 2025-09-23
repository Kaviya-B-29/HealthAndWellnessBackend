import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createGoal,
  getGoals,
  deleteGoal,
} from "../controllers/goalController.js";
import Goal from "../models/Goal.js";


const router = express.Router();

// Create a goal
router.post("/", protect, createGoal);

// Get all goals for logged-in user (with progress info)
router.get("/", protect, getGoals);

// Delete a goal
router.delete("/:id", protect, deleteGoal);
// PATCH /api/goals/:id
router.patch("/:id", async (req, res) => {
  try {
    const goalId = req.params.id;
    const { manualCompleted, targetCalories, targetWorkoutMinutes } = req.body;

    const updates = {};
    if (manualCompleted !== undefined) updates.manualCompleted = manualCompleted;
    if (targetCalories !== undefined) updates.targetCalories = targetCalories;
    if (targetWorkoutMinutes !== undefined) updates.targetWorkoutMinutes = targetWorkoutMinutes;

    const updatedGoal = await Goal.findByIdAndUpdate(goalId, updates, { new: true });

    if (!updatedGoal) return res.status(404).json({ message: "Goal not found" });

    res.json(updatedGoal);
  } catch (err) {
    console.error("PATCH /goals/:id error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
