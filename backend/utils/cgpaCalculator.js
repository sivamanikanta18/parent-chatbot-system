const GRADE_POINTS = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  P: 4,
  F: 0,
  FAIL: 0,
  AB: 0,
  RA: 0,
};

const normalizeGrade = (grade) => String(grade || "").trim().toUpperCase();

const marksToGradePoint = (marks) => {
  const value = Number(marks);
  if (Number.isNaN(value)) return 0;
  if (value >= 90) return 10;
  if (value >= 80) return 9;
  if (value >= 70) return 8;
  if (value >= 60) return 7;
  if (value >= 50) return 6;
  if (value >= 45) return 5;
  if (value >= 40) return 4;
  return 0;
};

const resolveGradePoint = (record) => {
  const normalizedGrade = normalizeGrade(record.grade);
  if (Object.prototype.hasOwnProperty.call(GRADE_POINTS, normalizedGrade)) {
    return GRADE_POINTS[normalizedGrade];
  }
  return marksToGradePoint(record.marks);
};

const calculateCGPA = (records = []) => {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      cgpa: 0,
      totalCredits: 0,
      totalGradePoints: 0,
      recordCount: 0,
    };
  }

  const result = records.reduce(
    (acc, record) => {
      const credits = Number(record.credits) || 3;
      const gradePoint = resolveGradePoint(record);
      acc.totalCredits += credits;
      acc.totalGradePoints += credits * gradePoint;
      acc.recordCount += 1;
      return acc;
    },
    {
      totalCredits: 0,
      totalGradePoints: 0,
      recordCount: 0,
    }
  );

  const cgpa =
    result.totalCredits > 0
      ? Number((result.totalGradePoints / result.totalCredits).toFixed(2))
      : 0;

  return {
    cgpa,
    totalCredits: result.totalCredits,
    totalGradePoints: Number(result.totalGradePoints.toFixed(2)),
    recordCount: result.recordCount,
  };
};

const calculateGroupedCGPA = (records = [], groupResolver) => {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  const grouped = records.reduce((acc, record) => {
    const key = groupResolver(record);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(record);
    return acc;
  }, {});

  return Object.entries(grouped).map(([key, list]) => {
    const cgpaResult = calculateCGPA(list);
    return {
      key,
      ...cgpaResult,
    };
  });
};

const getPerformanceInsights = (records = [], options = {}) => {
  const strongThreshold = Number(options.strongThreshold) || 75;
  const weakThreshold = Number(options.weakThreshold) || 50;

  const strongSubjects = new Set();
  const weakSubjects = new Set();

  for (const record of records) {
    const subject = String(record.subject || "").trim();
    const marks = Number(record.marks);
    if (!subject || Number.isNaN(marks)) {
      continue;
    }

    if (marks >= strongThreshold) {
      strongSubjects.add(subject);
    }

    if (marks < weakThreshold) {
      weakSubjects.add(subject);
    }
  }

  const suggestions = [];
  if (weakSubjects.size > 0) {
    suggestions.push("Prioritize weak subjects with targeted weekly revision and faculty guidance.");
  }
  if (strongSubjects.size > 0) {
    suggestions.push("Maintain strong subjects and use them to balance overall CGPA.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Not enough marks data to generate suggestions.");
  }

  return {
    strongThreshold,
    weakThreshold,
    strongSubjects: Array.from(strongSubjects),
    weakSubjects: Array.from(weakSubjects),
    suggestions,
  };
};

module.exports = {
  calculateCGPA,
  calculateGroupedCGPA,
  getPerformanceInsights,
};
