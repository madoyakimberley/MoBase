import { mysqlTable, varchar, timestamp, text } from 'drizzle-orm/mysql-core';

export const clients = mysqlTable('clients', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('prospect').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
