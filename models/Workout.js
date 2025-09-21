// models/Workout.js
import mongoose from "mongoose";

const WorkoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    type: { type: String, required: true, trim: true },
    duration: { type: Number, required: true }, // minutes
    distance: { type: Number, default: 0 }, // km (optional)
    calories: { type: Number, default: 0 }, // canonical numeric calories field
    intensity: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Workout", WorkoutSchema);
