import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) return;
  try {
    await mongoose.connect(process.env.DATABASE_URL || "");
    connection.isConnected = mongoose.connection.readyState;
  } catch {
    throw new Error("Database connection failed");
  }
}

export default dbConnect;
