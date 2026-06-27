import { v } from "convex/values";
import { query } from "../_generated/server";

export const listGroupsByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.query("groups")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const getGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.groupId);
  },
});

export const listMyGroups = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db.query("groupMembers")
      .collect();
    const userGroups = memberships.filter(m => m.userId === args.userId);
    const groups = await Promise.all(
      userGroups.map(m => ctx.db.get(m.groupId))
    );
    return groups.filter(Boolean);
  },
});
