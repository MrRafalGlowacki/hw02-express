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
    const newUser = new User({ email, password: hashedPassword });
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
