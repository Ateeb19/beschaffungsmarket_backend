const jwt = require("jsonwebtoken");

const User = require("../models/User");
const keys = require("../config/keys");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.cookie;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const token = authHeader
    .split("; ")
    .find((row) => row.startsWith("procurement_token="))
    ?.split("=")[1];

  if (token == null) return res.sendStatus(401);

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
      return res.sendStatus(401);
    }

    req.user = user;

    next();
  });
};

module.exports = authMiddleware;
