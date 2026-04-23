import { boolean, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core"

// Neon-managed external schema. Declared for typed reads only.
// This file is NOT included in drizzle-kit's schema path — drizzle-kit only
// manages the public schema (see drizzle.config.ts schemaFilter + schema path).
const neonAuth = pgSchema("neon_auth")

export const neonUser = neonAuth.table("user", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires", { withTimezone: true }),
})
