// controllers/workoutController.js
import Workout from "../models/Workout.js";
import mongoose from "mongoose";


/**
 * Estimate calories server-side if not provided.
 * Same simple MET based estimator used on client.
 */
const estimateCalories = (type, duration, intensity) => {
  const MET = {
    Running: 10,
    Cycling: 8,
    Walking: 4,
    "Strength Training": 6,
    Yoga: 3,
    HIIT: 12,
    Swimming: 9,
    Dancing: 7,
  };
  const intensityFactor = intensity === "Low" ? 0.85 : intensity === "High" ? 1.15 : 1;
  const met = MET[type] || 5;
  return Math.max(0, Math.round(met * (+duration || 0) * intensityFactor));
};

export const createWorkout = async (req, res) => {
  try {
    const { type, duration, distance, calories, intensity, date } = req.body;

    if (!type || !duration) {
      return res.status(400).json({ message: "type and duration are required" });
    }

    // coerce to numbers safely
    const dur = Number(duration);
    const dist = distance !== undefined && distance !== null ? Number(distance) : undefined;

    if (isNaN(dur) || dur <= 0) {
      return res.status(400).json({ message: "duration must be a positive number" });
    }

    const cal =
      calories !== undefined && calories !== null && String(calories).trim() !== ""
        ? Number(calories)
        : estimateCalories(type, dur, intensity || "Medium");

    const payload = {
      type: String(type).trim(),
      duration: dur,
      intensity: intensity || "Medium",
      calories: Number(cal || 0),
      date: date ? new Date(date) : new Date(),
    };
    if (dist !== undefined && !isNaN(dist)) payload.distance = dist;
    // attach user if protected middleware added req.user
    if (req.user && req.user._id) payload.user = req.user._id;

    const created = await Workout.create(payload);
    // return created doc (canonical shape)
    res.status(201).json(created);
  } catch (err) {
    console.error("createWorkout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getWorkouts = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user._id) filter.user = req.user._id;
    // optional query params: from, to
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }
    const list = await Workout.find(filter).sort({ date: -1 });
    res.json(list);
  } catch (err) {
    console.error("getWorkouts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid workout ID" });
    }

    const doc = await Workout.findById(id);
    if (!doc) return res.status(404).json({ message: "Workout not found" });

    if (req.user && doc.user && String(doc.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await doc.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteWorkout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Summary endpoint: total calories, total minutes, total distance over optional window
 */
export const getSummary = async (req, res) => {
  try {
    const match = {};
    if (req.user && req.user._id) match.user = req.user._id;
    if (req.query.from || req.query.to) {
      match.date = {};
      if (req.query.from) match.date.$gte = new Date(req.query.from);
      if (req.query.to) match.date.$lte = new Date(req.query.to);
    }
    const agg = await Workout.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: "$calories" },
          totalMinutes: { $sum: "$duration" },
          totalDistance: { $sum: "$distance" },
          count: { $sum: 1 },
        },
      },
    ]);
    const out = agg[0] || { totalCalories: 0, totalMinutes: 0, totalDistance: 0, count: 0 };
    res.json(out);
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

