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
    uri: connectionString,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 10000,
    ssl: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = poolConnection;
}

export const db = drizzle(poolConnection, { schema, mode: "default" });
