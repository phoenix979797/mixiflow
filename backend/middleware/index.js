const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const { users } = require("../models");

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).json({ message: "No token provided" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Invalid token format" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await users.findOne({ where: { id: decoded.id } });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    logger.error("Token verification error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await users.findByPk(req.user.id);

    if (user?.role !== "admin") {
      return res.status(403).json({
        message: "Require Admin Role!",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
