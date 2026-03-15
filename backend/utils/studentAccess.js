const normalizeStudentId = (value = "") => String(value).trim().toUpperCase();

const enforceStudentAccess = (req, res, requestedStudentId) => {
  const normalizedRequested = normalizeStudentId(requestedStudentId);

  if (!normalizedRequested) {
    res.status(400).json({
      message: "studentId is required",
    });
    return null;
  }

  const tokenStudentId = normalizeStudentId(req?.student?.studentId);
  if (!tokenStudentId) {
    res.status(401).json({
      message: "Invalid JWT token",
    });
    return null;
  }

  if (tokenStudentId !== normalizedRequested) {
    res.status(403).json({
      message: "Access denied for requested studentId",
    });
    return null;
  }

  return normalizedRequested;
};

module.exports = {
  normalizeStudentId,
  enforceStudentAccess,
};
