import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 11;

const TOKEN_KEY =
  process.env.NODE_ENV === "production"
    ? process.env.TOKEN_KEY
    : "themostamazingestkey";

const today = new Date();
const exp = new Date(today);
exp.setDate(today.getDate() + 30);

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); //.populate({
    //   path: "member_of_projects",
    //   model: project,
    // });
    res.json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getOneUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (user) {
      return res.json(user);
    }
    return res.status(404).json({ message: "User not found." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (deletedUser) {
      return res
        .status(200)
        .send({ deletionStatus: true, message: "User deleted." });
    }
    throw new Error("User not found.");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ deletionStatus: false, error: error.message });
  }
};

export const addPortfolioProject = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { $push: { portfolio_projects: req.body } },
      { new: true }
    );
    // i believe this can be handled better by throwing an error rather than responding with a 404
    if (user) {
      return res.status(200).send(user);
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const checkEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.json({
        message: "An account with this email address already exists.",
      });
    }
    return res.status(200).json({ message: false });
  } catch (error) {
    console.error({ err: error.message });
    res.status(500).json({ error: error.message });
  }
};

// Auth
export const signUp = async (req, res) => {
  try {
    const { email, first_name, last_name, password } = req.body;

    const password_digest = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ email, first_name, last_name, password_digest });
    await user.save();

    const payload = {
      userID: user._id,
      email: user.email,
      exp: parseInt(exp.getTime() / 1000),
    };
    const token = jwt.sign(payload, TOKEN_KEY);
    let secureUser = Object.assign({}, user._doc, {
      password_digest: undefined,
    });

    res.status(201).json({ user: secureUser, token });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email }).select(
      "about email first_name fun_fact interested_projects last_name member_of_projects password_digest portfolio_projects portfolio_link rejected_projects role"
    ); // to avoid setting `select` to true on the user model, i select all properties here then copy the user object without the password_digest below
    let secureUser = Object.assign({}, user._doc, {
      password_digest: undefined,
    });
    if (await bcrypt.compare(password, user.password_digest)) {
      const payload = {
        userID: user._id,
        email: user.email,
        exp: parseInt(exp.getTime() / 1000),
      };
      const token = jwt.sign(payload, TOKEN_KEY);
      res.status(201).json({ user: secureUser, token });
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(token, TOKEN_KEY);
    if (payload) {
      res.json(payload);
    }
  } catch (error) {
    console.log(error.message);
    res.status(401).send("Not authorized");
  }
};

export const confirmPassword = async (req, res) => {
  const { email, password } = req.body;
  // is it better to find the user by their email or id?
  console.log("email", email);
  if (email) {
    let user = await User.findOne({ email }).select("password_digest");
    if (await bcrypt.compare(password, user.password_digest)) {
      res.status(201).json({ passwordConfirmed: true });
    } else {
      res.status(401).json({ passwordConfirmed: false }); // status code: unnacceptable lol
    }
  } else {
    res.status(401).json({ passwordConfirmed: false });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { userID } = req.params;
    const newPasswordDigest = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const user = await User.findByIdAndUpdate(
      userID,
      { password_digest: newPasswordDigest },
      { new: true }
    );
    const payload = {
      userID: user._id,
      email: user.email,
      exp: parseInt(exp.getTime() / 1000),
    };
    const token = jwt.sign(payload, TOKEN_KEY);
    res
      .status(201)
      .json({ status: true, message: "Password Updated", user, token });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};
