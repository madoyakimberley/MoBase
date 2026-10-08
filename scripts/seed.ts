import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function seed() {
  console.log("🌱 Seeding Super Admin into MoBase...");

  const email = process.env.SUPER_ADMIN;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const fullName = process.env.SUPER_ADMIN_USERNAME || "Super Admin";
  const username = "Head Of Mobase";

  if (!email || !password) {
    console.error(
      "❌ Missing SUPER_ADMIN or SUPER_ADMIN_PASSWORD in .env.local",
    );
    process.exit(1);
  }

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      console.log(
        `⚠️ Super Admin (${email}) already exists. Skipping insertion.`,
      );
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      email: email.toLowerCase().trim(),
      username,
      passwordHash,
      fullName,
      role: "SUPER_ADMIN",
      isActive: true,
    });

    console.log(`✅ Super Admin created successfully: ${email}`);
  } catch (error) {
    console.error("❌ Failed to seed Super Admin:", error);
  } finally {
    process.exit(0);
  }
}

seed();
