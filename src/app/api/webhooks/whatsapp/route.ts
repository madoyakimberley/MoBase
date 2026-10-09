import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads, messages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { fromPhoneNumber, text } = payload;

    // Match phone number to lead in TiDB
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.realPhoneNumber, fromPhoneNumber));

    if (!lead) {
      return NextResponse.json({ status: "ignored_unknown_number" });
    }

    // Save Client Reply into TiDB
    await db.insert(messages).values({
      id: globalThis.crypto.randomUUID(),
      leadId: lead.id,
      senderId: lead.id,
      senderType: "CLIENT",
      messageText: text,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
