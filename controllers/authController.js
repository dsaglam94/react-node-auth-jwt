require("dotenv").config;
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Handle errors
const handleErrors = (err) => {
  console.log(err.message, err.errors, err.code);
  let errors = { email: "", password: "", username: "" };

  // duplicate email error
  if (err.code === 11000 && err.message.includes("user_name")) {
    errors.username = "This username is already registered";
    return errors;
  } else if (err.code === 11000 && err.message.includes("email")) {
    errors.email = "This email is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

// Create JWT
const maxAge = 1 * 24 * 60 * 60; // 1 day
const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: maxAge,
  });
};

module.exports.signup_post = async (req, res) => {
  const { email, password, user_name, name } = req.body;
  try {
    const user = await User.create({ email, password, user_name, name });
    const token = createToken(user._id);
    console.log(token);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      secure: process.env.ENVIRONMENT === "production" ? "true" : "auto",
      sameSite: process.env.ENVIRONMENT === "production" ? "none" : "lax",
    });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  res.status(200).send("User login");
};

module.exports.login_get = async (req, res) => {
  res.json({ message: "working" });
};

module.exports.logout_get = (req, res) => {
  res.json({ message: "working" });
};
