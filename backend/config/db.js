const mongoose = require("mongoose");

const hasDbNameInUri = (uri) => /\/[^/?]+(\?|$)/.test(uri);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI missing. Set MONGO_URI or MONGODB_URI in .env");
    }

    const dbName = process.env.DB_NAME || "studentPortal";
    const connectionOptions = hasDbNameInUri(mongoUri) ? {} : { dbName };

    await mongoose.connect(mongoUri, connectionOptions);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
