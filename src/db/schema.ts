import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * Auth.js core tables (user / account / session / verificationToken) plus the
 * coffee-team additions: a `role` on each user and an `invite` table that gates
 * invite-only sign-in. Column names match the Auth.js Drizzle adapter exactly so
 * the adapter can read and write them.
 */

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  // Team role; new users default to Volunteer and are promoted via invite.
  role: text("role", { enum: ["lead", "volunteer"] })
    .notNull()
    .default("volunteer"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

/**
 * An outstanding invitation. One per email (latest invite wins via upsert).
 * `acceptedAt` records when the invitee first signed in.
 */
export const invites = pgTable("invite", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["lead", "volunteer"] }).notNull(),
  invitedByUserId: text("invitedByUserId").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  acceptedAt: timestamp("acceptedAt", { mode: "date" }),
});

/**
 * A Supply tracked in inventory (beans, cups, filters…). `designated` marks the
 * ones counted on every Service Report; `minimumLevel` is the optional threshold
 * that drives Restock Alerts. Retiring a Supply sets `retiredAt` (soft delete) so
 * its history survives while it drops out of active views. See CONTEXT.md.
 */
export const supplies = pgTable(
  "supply",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    designated: boolean("designated").notNull().default(false),
    minimumLevel: integer("minimumLevel"),
    retiredAt: timestamp("retiredAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    // Mirror the app-level validation at the database so direct SQL can't break
    // the invariants the inventory module relies on.
    check("supply_name_length", sql`char_length(${t.name}) <= 100`),
    check(
      "supply_minimum_level_nonneg",
      sql`${t.minimumLevel} is null or ${t.minimumLevel} >= 0`,
    ),
  ],
);

/**
 * An observed Stock Count for a Supply — the inventory snapshot mechanism (see
 * ADR-0001). Counts are never edited or deleted; the latest count (by
 * `countedAt`) is the Supply's current level. `source` records whether the count
 * came from an ad-hoc update or a Service Report.
 */
export const stockCounts = pgTable(
  "stock_count",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    supplyId: text("supplyId")
      .notNull()
      .references(() => supplies.id, { onDelete: "cascade" }),
    count: integer("count").notNull(),
    source: text("source", { enum: ["ad_hoc", "service_report"] })
      .notNull()
      .default("ad_hoc"),
    recordedByUserId: text("recordedByUserId").references(() => users.id, {
      onDelete: "set null",
    }),
    countedAt: timestamp("countedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    check("stock_count_nonneg", sql`${t.count} >= 0`),
    check(
      "stock_count_source",
      sql`${t.source} in ('ad_hoc', 'service_report')`,
    ),
  ],
);
