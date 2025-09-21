// routes/workoutRoutes.js
import express from "express";
import { createWorkout, getWorkouts, deleteWorkout, getSummary } from "../controllers/workoutController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect endpoints if you have auth; if not, protecting won't break (protect should call next())
router.get("/", protect, getWorkouts);
router.post("/", protect, createWorkout);
router.delete("/:id", protect, deleteWorkout);

// summary
router.get("/summary", protect, getSummary);

export default router;
