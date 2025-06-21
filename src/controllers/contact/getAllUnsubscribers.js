const Unsubscribe = require('../../models/unsubscribe.model');

/**
 * Get all unsubscribers for the authenticated user (with pagination and search)
 */
const getAllUnsubscribers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.userId };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { email: searchRegex },
        { reason: searchRegex }
      ];
    }

    let total = await Unsubscribe.countDocuments(query);
    let unsubscribers = await Unsubscribe
      .find(query)
      .sort({ unsubscribedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fallback: If no data found, try without userId filter (for legacy/missing data)
    if (total === 0) {
      query = {};
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
          { email: searchRegex },
          { reason: searchRegex }
        ];
      }
      total = await Unsubscribe.countDocuments(query);
      unsubscribers = await Unsubscribe
        .find(query)
        .sort({ unsubscribedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    const response = {
      unsubscribers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };

    return res.json(response);
  } catch (err) {
    console.error('Get all unsubscribers error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = getAllUnsubscribers;