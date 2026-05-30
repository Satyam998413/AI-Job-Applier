import mongoose from "mongoose";
import { env } from "@/lib/env";

/**
 * Cached Mongoose connection. In dev, Next.js hot-reload re-evaluates modules, so we
 * stash the connection promise on globalThis to avoid opening a new pool each reload.
 * Safe to call in every route handler — connect is a no-op once established.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as { _mongooseCache?: MongooseCache };

const cache: MongooseCache = globalForMongoose._mongooseCache ?? { conn: null, promise: null };
globalForMongoose._mongooseCache = cache;

export async function dbConnect(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
