import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) return;
  try {
    const db = await mongoose.connect(process.env.DATABASE_URL || "");
    connection.isConnected = db.connections[0].readyState;
  } catch {
    throw new Error("Database connection failed");
  }
}

export default dbConnect;
