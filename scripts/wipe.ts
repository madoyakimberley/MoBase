import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mysql from "mysql2/promise";

async function wipeDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL is missing in environment variables.");
    process.exit(1);
  }

  console.log("⚠️  Wiping all tables in MoBase Database...");

  const connection = await mysql.createConnection({
    uri: connectionString,
    ssl: { rejectUnauthorized: true },
  });

  try {
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

    const tables = ["milestones", "projects", "clients", "developers", "users"];
    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS \`${table}\`;`);
      console.log(`  └─ Dropped table (if existed): ${table}`);
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("✅ Database wiped clean successfully.");
  } catch (error) {
    console.error("❌ Error wiping database:", error);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

wipeDatabase();
