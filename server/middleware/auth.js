import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect routes: requires a valid Bearer token in the Authorization header.
 * Attaches the authenticated user (minus password) to req.user.
 */
export const protect = async (req, res, next) => {
  let token;
  const auth = req.headers.authorization;

  if (auth && auth.startsWith("Bearer ")) {
    token = auth.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized — no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized — token invalid" });
  }
};

/**
 * Restrict a route to one or more roles, e.g. authorize("admin").
 */
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied for this role" });
    }
    next();
  };

/**
 * Require the user to be approved (used for banking actions that need KYC/approval).
 */
export const requireApproved = (req, res, next) => {
  if (req.user?.status !== "approved") {
    return res.status(403).json({
      success: false,
      message: "Your account is pending approval. Please complete KYC and wait for review.",
    });
  }
  next();
};
