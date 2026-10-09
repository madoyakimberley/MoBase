import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  mysqlEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────
export const roleEnum = mysqlEnum("role", [
  "SUPER_ADMIN",
  "DEVELOPER",
  "CLIENT",
]);

export const leadStatusEnum = mysqlEnum("lead_status", [
  "UNCLAIMED",
  "CLAIMED",
  "CONTACTED",
  "REJECTED",
  "CONVERTED",
]);

export const senderTypeEnum = mysqlEnum("sender_type", ["DEVELOPER", "CLIENT"]);

export const messageStatusEnum = mysqlEnum("message_status", [
  "PENDING",
  "SENT",
  "DELIVERED",
  "FAILED",
]);

export const projectStatusEnum = mysqlEnum("project_status", [
  "PROSPECT",
  "DEPOSIT_PENDING",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DELIVERED",
  "ARCHIVED",
]);

export const milestoneStatusEnum = mysqlEnum("milestone_status", [
  "BACKLOG",
  "IN_PROGRESS",
  "VERIFYING",
  "COMPLETED",
]);

// ─────────────────────────────────────────────
// Tables
// ─────────────────────────────────────────────

// 1. Users Table
export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    username: varchar("username", { length: 64 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: varchar("full_name", { length: 180 }).notNull(),
    role: roleEnum.default("DEVELOPER").notNull(),
    avatarUrl: text("avatar_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("idx_users_email").on(table.email),
    usernameIdx: uniqueIndex("idx_users_username").on(table.username),
    roleIdx: index("idx_users_role").on(table.role),
  }),
);

// 2. Developers Table (Workspaces)
export const developers = mysqlTable(
  "developers",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    workspaceSlug: varchar("workspace_slug", { length: 64 }).notNull(),
    companyName: varchar("company_name", { length: 180 }),
    phone: varchar("phone", { length: 32 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: uniqueIndex("idx_developers_user_id").on(table.userId),
    slugIdx: uniqueIndex("idx_developers_slug").on(table.workspaceSlug),
  }),
);

// 3. Leads Table (Google Maps Scraped Targets)
export const leads = mysqlTable(
  "leads",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    niche: varchar("niche", { length: 100 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    reviewCount: int("review_count").default(0).notNull(),
    rating: varchar("rating", { length: 10 }),
    mapsUrl: text("maps_url"),
    phone: varchar("phone", { length: 32 }),
    maskedPhone: varchar("masked_phone", { length: 32 }),
    realPhoneNumber: varchar("real_phone_number", { length: 32 }), // SECURED / HIDDEN
    status: leadStatusEnum.default("UNCLAIMED").notNull(),
    hasWebsite: boolean("has_website").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    cityNicheIdx: index("idx_leads_city_niche").on(table.city, table.niche),
    phoneIdx: index("idx_leads_phone").on(table.phone),
  }),
);

// 4. Lead Assignments Table
export const leadAssignments = mysqlTable(
  "lead_assignments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    leadId: varchar("lead_id", { length: 36 }).notNull(),
    developerId: varchar("developer_id", { length: 36 }).notNull(),
    claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  },
  (table) => ({
    leadDevIdx: uniqueIndex("idx_lead_assignments_unique").on(
      table.leadId,
      table.developerId,
    ),
  }),
);

// 5. Messages Table (Masked Chat Logs)
export const messages = mysqlTable(
  "messages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    leadId: varchar("lead_id", { length: 36 }).notNull(),
    senderId: varchar("sender_id", { length: 36 }),
    senderType: senderTypeEnum.notNull(),
    messageText: text("message_text").notNull(),
    status: messageStatusEnum.default("PENDING").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    leadMsgIdx: index("idx_messages_lead_id").on(table.leadId),
    statusIdx: index("idx_messages_status").on(table.status),
  }),
);

// 6. System Status Table (Live WhatsApp QR & Connection Session)
export const systemStatus = mysqlTable("system_status", {
  id: varchar("id", { length: 64 }).primaryKey(), // e.g. "whatsapp-session"
  qrCode: text("qr_code"),
  isConnected: boolean("is_connected").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// 7. Search Rate Limiting Log Table
export const searchLogs = mysqlTable(
  "search_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    developerId: varchar("developer_id", { length: 36 }).notNull(),
    query: varchar("query", { length: 255 }).notNull(),
    executedAt: timestamp("executed_at").defaultNow().notNull(),
  },
  (table) => ({
    devTimeIdx: index("idx_search_logs_dev_time").on(
      table.developerId,
      table.executedAt,
    ),
  }),
);

// 8. Clients Table
export const clients = mysqlTable(
  "clients",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    developerId: varchar("developer_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }),
    name: varchar("name", { length: 180 }).notNull(),
    brandName: varchar("brand_name", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 64 }).notNull(),
    businessType: varchar("business_type", { length: 64 }).notNull(),
    customDomain: varchar("custom_domain", { length: 255 }),
    whatsappNumber: varchar("whatsapp_number", { length: 32 }).notNull(),
    logoUrl: text("logo_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    devIdx: index("idx_clients_developer_id").on(table.developerId),
    slugIdx: uniqueIndex("idx_clients_slug").on(table.slug),
    domainIdx: index("idx_clients_custom_domain").on(table.customDomain),
  }),
);

// 9. Projects & Search Code (JOB-XXXXX)
export const projects = mysqlTable(
  "projects",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    searchCode: varchar("search_code", { length: 16 }).notNull(),
    clientId: varchar("client_id", { length: 36 }).notNull(),
    developerId: varchar("developer_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    status: projectStatusEnum.default("IN_PROGRESS").notNull(),
    depositPaid: boolean("deposit_paid").default(false).notNull(),
    totalPriceKes: int("total_price_kes").default(20000).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    searchCodeIdx: uniqueIndex("idx_projects_search_code").on(table.searchCode),
    clientDevIdx: index("idx_projects_client_dev").on(
      table.clientId,
      table.developerId,
    ),
  }),
);

// 10. Milestones Table
export const milestones = mysqlTable(
  "milestones",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("project_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    status: milestoneStatusEnum.default("BACKLOG").notNull(),
    sortOrder: int("sort_order").default(0).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    projOrderIdx: index("idx_milestones_proj_order").on(
      table.projectId,
      table.sortOrder,
    ),
  }),
);

// ─────────────────────────────────────────────
// Drizzle Relations
// ─────────────────────────────────────────────
export const usersRelations = relations(users, ({ one }) => ({
  developer: one(developers, {
    fields: [users.id],
    references: [developers.userId],
  }),
}));

export const developersRelations = relations(developers, ({ one, many }) => ({
  user: one(users, { fields: [developers.userId], references: [users.id] }),
  clients: many(clients),
  projects: many(projects),
  leadAssignments: many(leadAssignments),
}));

export const leadsRelations = relations(leads, ({ many }) => ({
  assignments: many(leadAssignments),
  messages: many(messages),
}));

export const leadAssignmentsRelations = relations(
  leadAssignments,
  ({ one }) => ({
    lead: one(leads, {
      fields: [leadAssignments.leadId],
      references: [leads.id],
    }),
    developer: one(developers, {
      fields: [leadAssignments.developerId],
      references: [developers.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  lead: one(leads, { fields: [messages.leadId], references: [leads.id] }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  developer: one(developers, {
    fields: [clients.developerId],
    references: [developers.id],
  }),
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  developer: one(developers, {
    fields: [projects.developerId],
    references: [developers.id],
  }),
  milestones: many(milestones),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
}));
