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

// Enums
export const roleEnum = mysqlEnum("role", [
  "SUPER_ADMIN",
  "DEVELOPER",
  "CLIENT",
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

// 1. Users Table
export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
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

// 3. Clients Table
export const clients = mysqlTable(
  "clients",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    developerId: varchar("developer_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }), // Connected Client Account
    name: varchar("name", { length: 180 }).notNull(),
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

// 4. Projects & Search Code (JOB-XXXXX)
export const projects = mysqlTable(
  "projects",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    searchCode: varchar("search_code", { length: 16 }).notNull(), // Unique search lookup code
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

// 5. Milestones Table
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

// Drizzle Relations
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
