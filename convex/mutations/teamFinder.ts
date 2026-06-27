import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createPost = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    type: v.union(v.literal("looking_for_team"), v.literal("looking_for_members")),
    skills: v.array(v.string()),
    idea: v.optional(v.string()),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("teamFinderPosts")
      .withIndex("by_event_active", q => q.eq("eventId", args.eventId).eq("active", true))
      .collect();

    const hasActive = existing.some(p => p.userId === args.userId);
    if (hasActive) throw new Error("User already has an active post");

    const postId = await ctx.db.insert("teamFinderPosts", {
      eventId: args.eventId,
      userId: args.userId,
      type: args.type,
      skills: args.skills,
      idea: args.idea,
      groupId: args.groupId,
      active: true,
    });
    return { postId };
  },
});

export const updatePost = mutation({
  args: {
    postId: v.id("teamFinderPosts"),
    type: v.optional(v.union(v.literal("looking_for_team"), v.literal("looking_for_members"))),
    skills: v.optional(v.array(v.string())),
    idea: v.optional(v.string()),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    const { postId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(postId, filtered);
  },
});

export const deactivatePost = mutation({
  args: { postId: v.id("teamFinderPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (!post.active) throw new Error("Post already inactive");

    await ctx.db.patch(args.postId, { active: false });
  },
});
