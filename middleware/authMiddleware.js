const jwt = require("jsonwebtoken");
const User = require("../models/user");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  console.log(token);
  // check jwt exist && verify
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log(err.message);
        res.status(400).json({ loggedIn: false });
      } else {
        console.log(decoded);
        next();
      }
    });
  } else {
    res.status(400).json({ loggedIn: false });
  }
};

module.exports = {
  requireAuth,
};
