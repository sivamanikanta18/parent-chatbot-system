const express = require("express");

const {
  getCgpaSummary,
  getSemesterPerformance,
  getSubjectWiseMarks,
} = require("../controllers/performanceController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/cgpa/:studentId", getCgpaSummary);
router.get("/semester/:studentId", getSemesterPerformance);
router.get("/marks/:studentId", getSubjectWiseMarks);

module.exports = router;
