const requireInAnyEnv = ["JWT_SECRET"];

const isPresent = (value) => Boolean(String(value || "").trim());

const validateEnv = () => {
  const errors = [];
  const nodeEnv = process.env.NODE_ENV || "development";
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!isPresent(mongoUri)) {
    errors.push("MONGO_URI or MONGODB_URI is required");
  }

  for (const key of requireInAnyEnv) {
    if (!isPresent(process.env[key])) {
      errors.push(`${key} is required`);
    }
  }

  if (nodeEnv === "production") {
    const smtpHost = String(process.env.SMTP_HOST || "").trim();
    const smtpPort = String(process.env.SMTP_PORT || "").trim();
    const smtpUser = String(process.env.SMTP_USER || "").trim();
    const smtpPass = String(process.env.SMTP_PASS || "").trim();
    const smtpFrom = String(process.env.SMTP_FROM || "").trim();

    if (!smtpHost) {
      errors.push("SMTP_HOST is required in production");
    }

    if (!smtpPort) {
      errors.push("SMTP_PORT is required in production");
    } else if (Number.isNaN(Number(smtpPort))) {
      errors.push("SMTP_PORT must be a valid number");
    }

    if (!smtpUser) {
      errors.push("SMTP_USER is required in production");
    }

    if (!smtpPass) {
      errors.push("SMTP_PASS is required in production");
    }

    if (!smtpFrom) {
      errors.push("SMTP_FROM is required in production");
    }
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n- ${errors.join("\n- ")}`);
  }
};

module.exports = validateEnv;