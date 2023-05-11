import Jimp from "jimp";
import fs from "fs/promises";
import { userAvatar } from "../helpers/gravatar.js";
import User from "./userSchema.js";
import bcrypt from "bcrypt";

const hashPassword = async (pwd) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pwd, salt);
  return hash;
};

const validatePassword = (pwd, hash) => bcrypt.compare(pwd, hash);

export const findUserById = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });
    return user;
  } catch (error) {
    console.error(error);
  }
};
export const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error(error);
  }
};

export const createUser = async (email, password) => {
  try {
    const hashedPassword = await hashPassword(password);
    const avatar = await userAvatar(email);
    const newUser = new User({
      email,
      password: hashedPassword,
      avatarURL: avatar,
    });
    const user = await newUser.save();
    return user;
  } catch (error) {
    console.error(error);
  }
};

export const passwordValidator = async (password, userPassword) => {
  const isValidPassword = await validatePassword(password, userPassword);
  return isValidPassword;
};

export const updateUserAvatar = async (userId, filename) => {
  const user = await User.findById(userId);
  const img = await Jimp.read(`tmp/${filename}`);

  const avatarPath = `public/avatars/avatar-${user.email}-${Date.now()}.jpg`;

  await img.resize(250, 250).write(avatarPath);

  await fs.unlink(`tmp/${filename}`);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { avatarURL: avatarPath },
    { new: true }
  );

  return updatedUser.avatarURL;
};

export const deleteUser = async (email) => {
  try {
    const deletedUser = await User.findOneAndDelete({ email });
    if (!deletedUser) {
      throw new Error(`User with ID ${userId} does not exist`);
    }
    console.log(`User ${email} deleted`);
    return deletedUser;
  } catch (error) {
    console.error(error);
  }
};
