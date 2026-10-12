import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";

async function getDbConnection() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }
  return await mysql.createConnection({
    uri: connectionString,
    ssl: { rejectUnauthorized: false },
  });
}

// GET: Fetch all real clients from MySQL
export async function GET() {
  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM clients ORDER BY created_at DESC",
    );
    return NextResponse.json({ success: true, clients: rows });
  } catch (error: any) {
    console.error("❌ Failed to fetch clients from DB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch clients" },
      { status: 500 },
    );
  } finally {
    if (connection) await connection.end();
  }
}

// POST: Insert a new real client into MySQL
export async function POST(req: Request) {
  let connection;
  try {
    const body = await req.json();
    const {
      leadName,
      domainUrl,
      category,
      assignedTier,
      suggestedPrice,
      confidenceScore,
    } = body;

    connection = await getDbConnection();

    const [result] = await connection.query(
      `INSERT INTO clients (name, domain_url, category, assigned_tier, suggested_price, confidence_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        leadName,
        domainUrl || "N/A",
        category || "General",
        assignedTier || "TIER_ALPHA_01",
        suggestedPrice || "$50,000.00",
        confidenceScore || "98.50%",
      ],
    );

    return NextResponse.json({
      success: true,
      insertedId: (result as any).insertId,
    });
  } catch (error: any) {
    console.error("❌ Failed to insert client into DB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save client" },
      { status: 500 },
    );
  } finally {
    if (connection) await connection.end();
  }
}
