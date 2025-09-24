import Goal from "../models/Goal.js";
import Workout from "../models/Workout.js";
import Food from "../models/Food.js";

function getDateRange(type) {
  const now = new Date();
  let start;
  if (type === "Daily") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (type === "Weekly") {
    const firstDay = now.getDate() - now.getDay(); // Sunday as start
    start = new Date(now.getFullYear(), now.getMonth(), firstDay);
  } else if (type === "Monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return { start, end: now };
}

// Create a new goal
export const createGoal = async (req, res) => {
  try {
    const { type, category, targetCalories, targetWorkoutMinutes } = req.body;

    const goal = new Goal({
      user: req.user._id,
      type,
      category,
      targetCalories,
      targetWorkoutMinutes,
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get user goals with progress
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });

    const updatedGoals = await Promise.all(
      goals.map(async (goal) => {
        const { start, end } = getDateRange(goal.type);

        // workouts in timeframe
        const workouts = await Workout.find({
          user: req.user._id,
          createdAt: { $gte: start, $lte: end },
        });

        // foods in timeframe
        const foods = await Food.find({
          user: req.user._id,
          createdAt: { $gte: start, $lte: end },
        });

        const totalWorkoutMinutes = workouts.reduce(
          (s, w) => s + (w.duration || 0),
          0
        );
        const totalWorkoutCalories = workouts.reduce(
          (s, w) => s + (w.caloriesBurned || w.calories || 0),
          0
        );
        const totalFoodCalories = foods.reduce((s, f) => s + (f.calories || 0), 0);

        // Weight Loss => focus on burned calories <= targetCalories and workout >= targetMinutes
// Weight Gain => focus on consumed calories >= targetCalories and workout >= targetMinutes
// General Fitness => mix of calories balance and workout

let completed = false;

if (goal.category === "Weight Loss") {
  completed = totalFoodCalories <= goal.targetCalories && totalWorkoutMinutes >= goal.targetWorkoutMinutes;
} else if (goal.category === "Weight Gain") {
  completed = totalFoodCalories >= goal.targetCalories && totalWorkoutMinutes >= goal.targetWorkoutMinutes;
} else if (goal.category === "General Fitness") {
  const totalWorkoutCalories = workouts.reduce((s, w) => s + (w.caloriesBurned ?? w.calories ?? 0), 0);
  completed =
    totalWorkoutMinutes >= goal.targetWorkoutMinutes &&
    totalWorkoutCalories - totalFoodCalories >= goal.targetCalories;
}

// Update DB if changed
if (goal.completed !== completed) {
  goal.completed = completed;
  await goal.save();
}

        

        return {
          ...goal.toObject(),
          progress: {
            totalWorkoutMinutes,
            totalWorkoutCalories,
            totalFoodCalories,
          },
        };
      })
    );

    res.json(updatedGoals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete goal
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) return res.status(404).json({ message: "Goal not found" });

    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
