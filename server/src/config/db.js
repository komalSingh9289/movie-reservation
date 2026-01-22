import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("⚠️  Server will continue running, but database operations will fail");
    console.error("📋 Please check:");
    console.error("   1. Your internet connection");
    console.error("   2. MongoDB Atlas IP whitelist (should include 0.0.0.0/0)");
    console.error("   3. Database credentials in .env file");
    console.error("   4. Firewall/antivirus blocking port 27017");
    // Don't exit - let server run for debugging
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
console.error("❌ MongoDB connection failed FULL ERROR:", err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from MongoDB');
});
