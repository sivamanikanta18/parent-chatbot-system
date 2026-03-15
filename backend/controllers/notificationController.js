const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const category = String(req.query.category || "").trim().toLowerCase();
    const limit = Number(req.query.limit) || 20;

    if (limit <= 0) {
      return res.status(400).json({ message: "limit must be greater than 0" });
    }

    const filter = {};
    if (category) {
      filter.category = category;
    }

    const notifications = await Notification.find(filter)
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

module.exports = {
  getNotifications,
};
