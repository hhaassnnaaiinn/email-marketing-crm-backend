const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   

    // Use userId, _id, or id, in that order of preference
    const userId = decoded.userId || decoded._id || decoded.id;
    if (!userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Set the user object on the request with consistent userId
    req.user = {
      userId: userId, // This is the only ID we'll use
      email: user.email || decoded.email
    };
    
    
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

module.exports = auth; 