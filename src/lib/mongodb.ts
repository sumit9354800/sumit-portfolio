import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  lastError: string | null;
  lastAttemptTime: number;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const RETRY_COOLDOWN_MS = 60 * 1000; // 60-second cooldown on connection failures

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  lastError: null,
  lastAttemptTime: 0,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    return null;
  }

  // If already connected, return connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If previous attempt failed recently, enforce cooldown to prevent blocking requests and spamming DNS
  const now = Date.now();
  if (cached.lastError && (now - cached.lastAttemptTime) < RETRY_COOLDOWN_MS) {
    return null;
  }

  if (!cached.promise) {
    cached.lastAttemptTime = now;
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
      socketTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        cached.lastError = null;
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        cached.lastError = err?.message || 'Database connection failed';
        // Graceful silent fallback to local store without spamming stderr
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch {
    cached.promise = null;
    cached.conn = null;
    return null;
  }

  return cached.conn;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
}

export function getDatabaseStatus(): {
  connected: boolean;
  configured: boolean;
  state: string;
  error?: string | null;
  fallbackMode: boolean;
} {
  const configured = isDatabaseConfigured();
  const readyState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const connected = readyState === 1;

  return {
    configured,
    connected,
    state: states[readyState] || 'unknown',
    error: cached.lastError,
    fallbackMode: !connected,
  };
}

