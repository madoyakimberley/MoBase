import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables.");
}

const connectionString = rawConnectionString.split("?")[0];

const globalForDb = globalThis as unknown as {
  conn: mysql.Pool | undefined;
};

const poolConnection =
  globalForDb.conn ??
  mysql.createPool({
    uri: connectionString,
    ssl: {
      rejectUnauthorized: true,
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = poolConnection;
}

export const db = drizzle(poolConnection, { schema, mode: "default" });
