const express = require("express");

const { getBacklogs, getCourseStatus } = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/backlogs/:studentId", getBacklogs);
router.get("/course-status/:studentId", getCourseStatus);

module.exports = router;
