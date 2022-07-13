require("dotenv").config;
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { rmSync } = require("fs");

// Handle errors
const handleErrors = (err) => {
  console.log(err.message, err.errors, err.code);
  let errors = { email: "", password: "", username: "" };

  // incorrect email
  if (err.message === "incorrect email") {
    errors.email = "This email is not registered";
  }

  if (err.message === "incorrect password") {
    errors.password = "This password is incorrect";
  }

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
    console.log(typeof user._id.toString());
    const id = user._id.toString();
    const token = createToken(id);
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

  try {
    const user = await User.login(email, password);

    const id = user._id;
    const token = createToken(id.toString());
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      secure: process.env.ENVIRONMENT === "production" ? "true" : "auto",
      sameSite: process.env.ENVIRONMENT === "production" ? "none" : "lax",
    });
    res.status(201).json({ loggedIn: true, username: user.user_name });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_get = (req, res) => {
  const token = req.cookies.jwt;
  console.log("from get login request:", token);
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        res.status(400).json({ loggedIn: false });
      } else {
        const user = await User.findById(decoded.id);
        console.log(user);
        res.json({ loggedIn: true, username: user.user_name });
      }
    });
  } else {
    res.json({ loggedIn: false });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.json({ loggedIn: false });
};
