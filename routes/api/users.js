import { Router } from "express";
import User from "../../models/userSchema.js";
import { validateEmail, validateUser } from "../../helpers/validation.js";
import { config } from "../../helpers/config.js";
import jwt from "jsonwebtoken";
import { auth } from "../../helpers/authMiddlewares.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByVeryficationTokenAndVerify,
  passwordValidator,
  updateUserAvatar,
} from "../../models/users.js";
import { upload } from "../../helpers/upload.js";
import { sendVerificationEmail } from "../../helpers/sendgrid.js";

const router = Router();

// tworzenie nowego usera
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
    sendVerificationEmail(user);
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

// weryfikacja adresu email nowego usera
router.get("/verify/:verificationToken", async (req, res, next) => {
  const verificationToken = req.params.verificationToken;
  try {
    const user = await findUserByVeryficationTokenAndVerify(verificationToken);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else if (user === "verified") {
      res.status(400).json({ message: "User already verified" });
    } else {
      res.status(200).json({ message: "Verification successful" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ponownie wysyłanie maila z weryfikacją

router.post("/verify/", validateEmail, async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "missing required field: email" });
  }
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid Email, there is no such user" });
    } else if (user.verify === true) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }
    sendVerificationEmail(user);
    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// logowanie usera
router.post("/login", validateUser, async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Login", { email, password });
  const user = await findUserByEmail(email);
  if (!user)
    return res.status(401).json({ message: "Invalid Email or password" });

  if (user.verify !== true)
    return res.status(401).json({ message: "User email adress not verified" });

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
// autoryzowana ścieżka usera
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
// wylogowanie
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

// update avatara
router.patch(
  "/avatar",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { filename } = req.file;
      const avatarUpdate = await updateUserAvatar(_id, filename);
      res.status(200).json({
        avatarURL: avatarUpdate,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);
// update typu subskrypcji
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
