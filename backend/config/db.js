const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log("🚀 MongoDB Connected");
    console.log("📌 Connected DB Name:", conn.connection.name);
    console.log("📌 Connected Host:", conn.connection.host);
  } catch (err) {
    console.log("❌ DB Connection Error:", err);
  }
};

module.exports = connectDB;
