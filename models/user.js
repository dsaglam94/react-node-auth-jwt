const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  user_name: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    default: "basic",
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    // select must be true to compare the password
    // otherwise MongoDB returns the password === undefined
    select: true,
    minLength: [6, "Password can not be less than 6 characters"],
  },
});

// Mongoose hook
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// static method to log in the user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

const User = mongoose.model("user", userSchema);

module.exports = User;
