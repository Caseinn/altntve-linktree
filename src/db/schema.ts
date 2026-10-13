import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { BRAND, LINK_KINDS } from "@/config/brand"

const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())

export const SITE_ID = "00000000-0000-0000-0000-000000000001"

export const site = pgTable("site", {
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  displayName: text("display_name").notNull().default(BRAND.name),
  email: text("email"),
  id: uuid("id").primaryKey().default(SITE_ID),
  location: text("location"),
  tagline: text("tagline").notNull().default(BRAND.tagline),
  updatedAt: updatedAt(),
})

export const links = pgTable(
  "links",
  {
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    icon: text("icon"),
    id: uuid("id").primaryKey().defaultRandom(),
    isVisible: boolean("is_visible").notNull().default(true),
    kind: text("kind", { enum: LINK_KINDS }).notNull().default("social"),
    note: text("note"),
    position: integer("position").notNull().default(0),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    updatedAt: updatedAt(),
    url: text("url").notNull(),
  },
  (t) => [
    uniqueIndex("links_slug_key").on(t.slug),
    index("links_kind_position_idx").on(t.kind, t.position),
    index("links_visible_idx")
      .on(t.kind, t.position)
      .where(sql`is_visible`),
  ],
)

export const clicks = pgTable(
  "clicks",
  {
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    id: uuid("id").primaryKey().defaultRandom(),
    linkId: uuid("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    referer: text("referer"),
  },
  (t) => [index("clicks_link_id_idx").on(t.linkId)],
)
