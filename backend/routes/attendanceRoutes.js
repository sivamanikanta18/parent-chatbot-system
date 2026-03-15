const express = require("express");

const {
  getOverallAttendance,
  getSubjectWiseAttendance,
  getSemesterWiseAttendance,
} = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/overall/:studentId", getOverallAttendance);
router.get("/subject/:studentId", getSubjectWiseAttendance);
router.get("/semester/:studentId", getSemesterWiseAttendance);

module.exports = router;
