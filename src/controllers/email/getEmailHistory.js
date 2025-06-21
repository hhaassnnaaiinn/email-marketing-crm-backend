const EmailLog = require('../../models/email-log.model');
const logEmail = require('./logEmail');

/**
 * Get email history for the authenticated user
 */
const getEmailHistory = async (req, res) => {
  try {
  
    
    // Get user ID from either _id or userId field
    const userId = req.user._id || req.user.userId || req.user.id;
    
    if (!userId) {
      console.error("No valid user ID found in user object:", req.user);
      return res.status(401).json({ error: "Invalid user session" });
    }


    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query using the user ID from token
    const query = { user: userId };  // MongoDB will handle the type conversion
  

    // Add filters
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    }
    if (req.query.type && req.query.type !== "all") {
      query.type = req.query.type;
    }
    if (req.query.search) {
      query.$or = [
        { to: { $regex: req.query.search, $options: "i" } },
        { subject: { $regex: req.query.search, $options: "i" } },
      ];
    }
    if (req.query.startDate || req.query.endDate) {
      query.sentAt = {};
      if (req.query.startDate) {
        query.sentAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.sentAt.$lte = new Date(req.query.endDate);
      }
    }


    // Get total count
    const total = await EmailLog.countDocuments(query);

    // Get logs
    const logs = await EmailLog.find(query)
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (logs.length > 0) {
    }

    // Get stats
    const stats = await EmailLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: {
            $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
        },
      },
    ]);


    const response = {
      emails: logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Error in email history:", error);
    res.status(500).json({ error: "Failed to fetch email history" });
  }
};

module.exports = getEmailHistory; 