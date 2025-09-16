import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  console.log("📩 registerUser called - body:", req.body);
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      console.warn("registerUser: missing fields", req.body);
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    let user;
    try {
      user = await User.create({ name, email, password: hashed });
    } catch (err) {
      console.error("User.create error:", err);
      if (err.code === 11000) return res.status(400).json({ message: "Email already exists" });
      throw err;
    }

    if (!process.env.JWT_SECRET) {
      console.error("Missing JWT_SECRET on register");
      return res.status(500).json({ message: "Server misconfigured" });
    }

    const token = generateToken(user._id);
    return res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Register error full:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  console.log("🔐 loginUser called - body:", { email: req.body?.email });
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Provide email and password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
      console.error("Missing JWT_SECRET on login");
      return res.status(500).json({ message: "Server misconfigured" });
    }

    const token = generateToken(user._id);
    return res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login error full:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    return res.json(req.user);
  } catch (err) {
    console.error("GetMe error full:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
