import { v } from "convex/values";
import { query } from "../_generated/server";

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const listUsers = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const members = await ctx.db.query("eventMembers")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .collect();
    const userIds = members.map(m => m.userId);
    const users = await Promise.all(userIds.map(id => ctx.db.get(id)));
    return users.filter(Boolean);
  },
});
