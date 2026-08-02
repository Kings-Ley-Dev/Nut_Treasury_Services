import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Soft authentication: if a valid token is present, attach req.user.
 * If not, continue anyway (used by public forms that can optionally
 * be linked to a logged-in customer's dashboard).
 */
export const optionalAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) req.user = user;
    } catch {
      // Ignore invalid token — treat as an anonymous submission
    }
  }
  next();
};
