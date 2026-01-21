import mongoose from "mongoose";

export async function connectMongo() {
  const uri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/testdel";

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
}
