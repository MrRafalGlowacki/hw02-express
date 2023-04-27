import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../../models/userSchema.js";
import { validateUser } from "../../helpers/validation.js";
import { config } from "../../helpers/config.js";
import jwt from "jsonwebtoken";
import { auth } from "../../helpers/authMiddlewares.js";

const router = Router();

const hashPassword = async (pwd) => {
  const salt = await bcrypt.genSalt(10); // 10 salt rounds
  const hash = await bcrypt.hash(pwd, salt);
  return hash;
};

const validatePassword = (pwd, hash) => bcrypt.compare(pwd, hash);

router.post("/signup", validateUser, async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Register", { email, password });
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email is already in use",
      data: "Conflict",
    });
  }
  try {
    const hashedPassword = await hashPassword(password);
    const newUser = new User({ email, password: hashedPassword });
    const user = await newUser.save();
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", validateUser, async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Login", { email, password });
  const user = await User.findOne({ email });

  if (!user)
    return res.status(401).json({ message: "Invalid Email or password" });

  const isValidPassword = await validatePassword(password, user.password);

  if (!isValidPassword)
    return res.status(401).json({ message: "Invalid email or Password" });

  const payload = {
    id: user.id,
    username: user.username,
  };
  const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: "1h" });
  user.token = token;
  await user.save();
  return res.json({
    status: "success",
    code: 200,
    data: {
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    },
  });
});

router.get("/logout", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    user.token = null;
    await user.save();
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
