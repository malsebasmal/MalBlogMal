import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Reusable field shape ────────────────────────────────────
// Shared between createPost and updatePost to avoid repetition
const postFields = {
  title:         v.string(),
  slug:          v.string(),
  body:          v.string(),
  excerpt:       v.optional(v.string()),
  coverImageUrl: v.optional(v.string()),
};

// ─── QUERIES (read) ──────────────────────────────────────────
// Queries are public — no auth check needed.
// The public blog reads posts freely; only writes are protected.

// Get all published posts — used by the public blog homepage
export const getPublishedPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
  },
});

// Get a single post by its URL slug — used by the public blog post page
export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

// Get ALL posts (drafts + published) — used by the admin dashboard
export const getAllPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .order("desc")
      .collect();
  },
});

// Get a single post by its Convex ID — used by the admin editor
export const getPostById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ─── MUTATIONS (write) ───────────────────────────────────────
// TODO: re-add Better Auth session check once frontend is wired up

// Create a new post — always starts as a draft, never published directly
export const createPost = mutation({
  args: postFields,
  handler: async (ctx, args) => {
    return await ctx.db.insert("posts", {
      ...args,
      status: "draft",
      publishedAt: undefined,
    });
  },
});

// Update an existing post — all fields optional, only patch what changed
export const updatePost = mutation({
  args: {
    id:            v.id("posts"),
    title:         v.optional(v.string()),
    slug:          v.optional(v.string()),
    body:          v.optional(v.string()),
    excerpt:       v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

// Publish a post — changes status to "published" and records the timestamp
export const publishPost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "published",
      publishedAt: Date.now(),
    });
  },
});

// Unpublish a post — reverts to draft and clears the publish timestamp
export const unpublishPost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "draft",
      publishedAt: undefined,
    });
  },
});

// Delete a post permanently — this cannot be undone
export const deletePost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});