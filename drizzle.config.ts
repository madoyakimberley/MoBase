import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const rawUrl = process.env.DATABASE_URL || "";
const cleanUrl = rawUrl.split("?")[0];
const parsed = new URL(
  cleanUrl.startsWith("mysql") ? cleanUrl : `mysql://${cleanUrl}`,
);

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: parsed.hostname,
    port: Number(parsed.port) || 4000,
    user: parsed.username,
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace("/", ""),
    ssl: {
      rejectUnauthorized: true,
    },
  },
});
