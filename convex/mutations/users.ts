import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    gender: v.optional(v.string()),
    age: v.optional(v.number()),
    role: v.optional(v.union(v.literal("hacker"), v.literal("mentor"), v.literal("organiser"), v.literal("judge"))),
    passwordHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
  },
});

export const banUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { status: "banned" });
  },
});
