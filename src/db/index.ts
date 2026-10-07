import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables.");
}

const globalForDb = globalThis as unknown as {
  conn: mysql.Pool | undefined;
};

const poolConnection =
  globalForDb.conn ??
  mysql.createPool({
    uri: connectionString, // Retain full connection string including parameters
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // Maintain active idle connections in the pool
    idleTimeout: 60000, // Evict dead idle connections after 60s
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000, // Send TCP keep-alive probes after 10s of inactivity
    connectTimeout: 10000, // Fail fast after 10s rather than hanging for 110s
    ssl: {
      rejectUnauthorized: process.env.NODE_ENV === "production", // Flexible SSL verification
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = poolConnection;
}

export const db = drizzle(poolConnection, { schema, mode: "default" });
