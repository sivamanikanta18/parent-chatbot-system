const express = require("express");

const { getNotifications } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getNotifications);

module.exports = router;
