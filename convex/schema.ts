import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    // Core content
    title: v.string(),
    slug: v.string(),
    body: v.string(),
    excerpt: v.optional(v.string()),

    // Cover image (stored via UploadThing)
    coverImageUrl: v.optional(v.string()),

    // Status: "draft" | "published"
    status: v.union(v.literal("draft"), v.literal("published")),

    // Timestamps
    publishedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),
});