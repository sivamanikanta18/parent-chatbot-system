const Faculty = require("../models/Faculty");

const getAllFaculty = async (req, res) => {
  try {
    const subjectFilter = String(req.query.subject || "").trim();
    const filter = {};

    if (subjectFilter) {
      filter.subject = { $regex: `^${subjectFilter}$`, $options: "i" };
    }

    const faculty = await Faculty.find(filter).sort({ subject: 1, name: 1 }).lean();

    return res.status(200).json({
      count: faculty.length,
      faculty,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

const getFacultyBySubject = async (req, res) => {
  try {
    const subject = String(req.params.subject || "").trim();
    if (!subject) {
      return res.status(400).json({ message: "subject is required" });
    }

    const faculty = await Faculty.find({ subject: { $regex: `^${subject}$`, $options: "i" } })
      .sort({ name: 1 })
      .lean();

    if (faculty.length === 0) {
      return res.status(404).json({ message: "Faculty not found for subject" });
    }

    return res.status(200).json({
      subject,
      count: faculty.length,
      faculty,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

module.exports = {
  getAllFaculty,
  getFacultyBySubject,
};
