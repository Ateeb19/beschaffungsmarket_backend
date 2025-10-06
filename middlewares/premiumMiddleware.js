const jwt = require("jsonwebtoken");

const User = require("../models/User");
const keys = require("../config/keys");

const premiumMiddleware = (req, res, next) => {
  const authHeader = req.headers.cookie;

  if (!authHeader) {
    req.user = {};

    return next();
  }

  const token = authHeader
    .split("; ")
    .find((row) => row.startsWith("procurement_token="))
    ?.split("=")[1];

  if (token == null) {
    req.user = {};

    return next();
  }

  const decoded = jwt.decode(token, { complete: true });

  if (decoded.payload.exp * 1000 < Date.now()) {
    console.log("Token expired");
    res.clearCookie("procurement_token");
    return res
      .status(401)
      .json({ message: "Session expired. Please log in again." });
  }

  jwt.verify(token, keys.secretOrKey, async (err, user) => {
    if (err) return res.sendStatus(403);

    let userInfo = await User.findById(user.id);

    if (!userInfo || userInfo.block) {
      req.user = {};
    } else {
      req.user = user;
    }

    next();
  });
};

module.exports = premiumMiddleware;
