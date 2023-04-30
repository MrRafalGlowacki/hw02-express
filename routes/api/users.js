import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../../models/userSchema.js";
import { validateUser } from "../../helpers/validation.js";
import { config } from "../../helpers/config.js";
import jwt from "jsonwebtoken";
import { auth } from "../../helpers/authMiddlewares.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  passwordValidator,
} from "../../models/users.js";

const router = Router();

router.post("/signup", validateUser, async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Register", { email, password });
  const user = await findUserByEmail(email);

  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email is already in use",
      data: "Conflict",
    });
  }
  try {
    const user = await createUser(email, password);
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
  const user = await findUserByEmail(email);
  if (!user)
    return res.status(401).json({ message: "Invalid Email or password" });

  const isValidPassword = await passwordValidator(password, user.password);

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

router.get("/current", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res.json({
      status: "success",
      code: 200,
      data: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/logout", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
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

router.patch("/:id", async (req, res, next) => {
  try {
    const { subscription } = req.body;
    if (!["starter", "pro", "business"].includes(subscription)) {
      return res.status(400).json({ message: "Invalid subscription type" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { subscription },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
