const express = require("express");

const { getAllFaculty, getFacultyBySubject } = require("../controllers/facultyController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getAllFaculty);
router.get("/:subject", getFacultyBySubject);

module.exports = router;
