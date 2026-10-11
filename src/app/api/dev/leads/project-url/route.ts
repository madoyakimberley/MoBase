import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { leadId, projectUrl } = body;

    if (!leadId || typeof projectUrl !== "string") {
      return NextResponse.json(
        { error: "leadId and projectUrl are required." },
        { status: 400 },
      );
    }

    // URL Sanitization
    let formattedUrl = projectUrl.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Database update query placeholder (DB Driver/Drizzle integration point)
    // await db.update(leads).set({ projectUrl: formattedUrl }).where(eq(leads.id, leadId));

    return NextResponse.json({
      success: true,
      leadId,
      projectUrl: formattedUrl,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Failed to update project URL:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error." },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json(
        { error: "leadId parameter is required." },
        { status: 400 },
      );
    }

    // Database select query placeholder
    // const record = await db.select({ projectUrl: leads.projectUrl }).from(leads).where(eq(leads.id, leadId)).limit(1);

    return NextResponse.json({
      success: true,
      leadId,
      projectUrl: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch project URL." },
      { status: 500 },
    );
  }
}
