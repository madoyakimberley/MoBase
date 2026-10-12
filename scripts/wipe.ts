import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mysql, { RowDataPacket } from "mysql2/promise";

async function wipeDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL is missing in environment variables.");
    process.exit(1);
  }

  console.log(
    "⚠️  Wiping ALL tables and views dynamically in MoBase Database...",
  );

  let connection;
  try {
    connection = await mysql.createConnection({
      uri: connectionString,
      ssl: { rejectUnauthorized: false },
    });

    // 1. Get current active database name with RowDataPacket[] generic typing
    const [dbRows] = await connection.query<RowDataPacket[]>(
      "SELECT DATABASE() AS dbName;",
    );
    const currentDb = dbRows[0]?.dbName as string | undefined;

    if (!currentDb) {
      throw new Error(
        "Could not identify target database name from connection string.",
      );
    }

    console.log(`🎯 Target Database Schema: "${currentDb}"`);

    // 2. Disable Foreign Key Constraints
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

    // 3. Fetch all existing tables and views dynamically from information_schema
    const [schemaObjects] = await connection.query<RowDataPacket[]>(
      `
      SELECT TABLE_NAME, TABLE_TYPE 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
      `,
      [currentDb],
    );

    if (schemaObjects.length === 0) {
      console.log("ℹ️ No tables or views were found in this database.");
    } else {
      console.log(
        `🔍 Found ${schemaObjects.length} schema object(s) to purge...`,
      );

      // 4. Drop each table or view dynamically
      for (const obj of schemaObjects) {
        const name = obj.TABLE_NAME as string;
        const isView = obj.TABLE_TYPE === "VIEW";

        if (isView) {
          await connection.query(`DROP VIEW IF EXISTS \`${name}\`;`);
          console.log(`  └─ 🗑️ Dropped VIEW: ${name}`);
        } else {
          await connection.query(`DROP TABLE IF EXISTS \`${name}\`;`);
          console.log(`  └─ 🗑️ Dropped TABLE: ${name}`);
        }
      }
    }

    // 5. Re-enable Foreign Key Constraints
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("✅ Database completely wiped clean successfully.");
  } catch (error) {
    console.error("❌ Error wiping database:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

wipeDatabase();
