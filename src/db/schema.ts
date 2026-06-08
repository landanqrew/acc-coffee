import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
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

/**
 * A recurring weekly gathering definition (e.g. "9am Gathering" every Sunday).
 * Leads configure these; the calendar materializes a Service per occurrence.
 */
export const serviceSchedules = pgTable(
  "service_schedule",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    // 0 = Sunday … 6 = Saturday.
    weekday: integer("weekday").notNull(),
    time: text("time").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    check("service_schedule_weekday", sql`${t.weekday} between 0 and 6`),
    check("service_schedule_time", sql`${t.time} ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'`),
  ],
);

/**
 * A single Service — one Sunday gathering, or an ad-hoc special event. Recurring
 * Services are materialized from a `serviceSchedule` (one per date, deduped by
 * the unique (scheduleId, date)); ad-hoc Services stand alone with no schedule.
 */
export const services = pgTable(
  "service",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    time: text("time").notNull(),
    kind: text("kind", { enum: ["recurring", "ad_hoc"] }).notNull(),
    scheduleId: text("scheduleId").references(() => serviceSchedules.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    // Listing paths (listServices/getTodaysServices) scan by date and sort by time.
    index("service_date_time_idx").on(t.date, t.time),
    unique("service_schedule_date").on(t.scheduleId, t.date),
    check("service_kind", sql`${t.kind} in ('recurring', 'ad_hoc')`),
    check("service_time", sql`${t.time} ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'`),
    // Recurring Services always belong to a schedule; ad-hoc Services never do.
    check(
      "service_kind_schedule",
      sql`(${t.kind} = 'recurring' and ${t.scheduleId} is not null) or (${t.kind} = 'ad_hoc' and ${t.scheduleId} is null)`,
    ),
  ],
);
