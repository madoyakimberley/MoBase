import { NextResponse } from "next/server";
import { and, count, desc, eq, inArray, sum } from "drizzle-orm";
import { db } from "@/db";
import { clients, developers, milestones, projects } from "@/db/schema";
import { getSession } from "@/lib/auth";

const n = (v: unknown) => Number(v ?? 0);

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Not signed in" }, { status: 401 });
  }
  if (!["DEVELOPER", "SUPER_ADMIN"].includes(session.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    let developerId: string | null = null;
    if (session.role === "DEVELOPER") {
      const [dev] = await db
        .select({ id: developers.id })
        .from(developers)
        .where(eq(developers.userId, session.userId))
        .limit(1);
      if (!dev) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      developerId = dev.id;
    }
    const projectScope = developerId
      ? eq(projects.developerId, developerId)
      : undefined;
    const clientScope = developerId
      ? eq(clients.developerId, developerId)
      : undefined;

    const byStatusRows = await db
      .select({
        status: projects.status,
        total: count(),
        value: sum(projects.totalPriceKes),
      })
      .from(projects)
      .where(projectScope)
      .groupBy(projects.status);

    const byStatus = Object.fromEntries(
      byStatusRows.map((r) => [
        r.status,
        { total: n(r.total), value: n(r.value) },
      ]),
    );
    const get = (s: string) => byStatus[s] ?? { total: 0, value: 0 };

    const [signoffs] = await db
      .select({ value: count() })
      .from(milestones)
      .innerJoin(projects, eq(milestones.projectId, projects.id))
      .where(and(projectScope, eq(milestones.status, "VERIFYING")));

    const [deposits] = await db
      .select({ value: count() })
      .from(projects)
      .where(
        and(
          projectScope,
          eq(projects.depositPaid, false),
          inArray(projects.status, ["DEPOSIT_PENDING", "IN_PROGRESS"]),
        ),
      );

    const [clientCount] = await db
      .select({ value: count() })
      .from(clients)
      .where(clientScope);

    const activeBuilds = await db
      .select({
        id: projects.id,
        title: projects.title,
        searchCode: projects.searchCode,
        status: projects.status,
        clientName: clients.name,
        brandName: clients.brandName,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(
        and(
          projectScope,
          inArray(projects.status, ["IN_PROGRESS", "IN_REVIEW"]),
        ),
      )
      .orderBy(desc(projects.createdAt))
      .limit(5);

    const leads = await db
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
        totalPriceKes: projects.totalPriceKes,
      })
      .from(projects)
      .where(
        and(
          projectScope,
          inArray(projects.status, ["PROSPECT", "DEPOSIT_PENDING"]),
        ),
      )
      .orderBy(desc(projects.createdAt))
      .limit(5);

    return NextResponse.json({
      money: {
        pipelineKes: get("PROSPECT").value + get("DEPOSIT_PENDING").value,
        inProgressKes: get("IN_PROGRESS").value + get("IN_REVIEW").value,
        deliveredKes: get("DELIVERED").value + get("ARCHIVED").value,
      },
      actions: {
        signoffsPending: n(signoffs?.value),
        inReview: get("IN_REVIEW").total,
        depositsPending: n(deposits?.value),
      },
      counts: {
        active: get("IN_PROGRESS").total + get("IN_REVIEW").total,
        prospects: get("PROSPECT").total + get("DEPOSIT_PENDING").total,
        clients: n(clientCount?.value),
        delivered: get("DELIVERED").total + get("ARCHIVED").total,
      },
      activeBuilds: activeBuilds.map((b) => ({
        ...b,
        brandName: b.brandName ?? "Unbranded",
        clientName: b.clientName ? b.clientName : "No client assigned",
      })),
      leads,
    });
  } catch (error) {
    console.error("Overview query failed:", error);
    return NextResponse.json(
      { message: "Could not load overview" },
      { status: 500 },
    );
  }
}
