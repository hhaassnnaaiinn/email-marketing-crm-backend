const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
  try {
    console.log("=== Auth Middleware ===");
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token received:", token ? "Yes" : "No");
    
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", {
      id: decoded.id,
      _id: decoded._id,
      userId: decoded.userId,
      email: decoded.email,
      hasRole: !!decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    });

    // Use userId, _id, or id, in that order of preference
    const userId = decoded.userId || decoded._id || decoded.id;
    if (!userId) {
      console.log("No user ID found in token");
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = await User.findById(userId);
    console.log("User found:", user ? {
      _id: user._id,
      email: user.email
    } : "No user found");

    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({ error: "User not found" });
    }

    // Set the user object on the request with consistent userId
    req.user = {
      userId: userId, // This is the only ID we'll use
      email: user.email || decoded.email
    };
    
    console.log("Auth successful, user set in request:", {
      userId: req.user.userId,
      email: req.user.email
    });
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt
    });
    res.status(401).json({ error: "Please authenticate" });
  }
};

module.exports = auth; 