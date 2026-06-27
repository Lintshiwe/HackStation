import { v } from "convex/values";
import { query } from "../_generated/server";

export const listByUserAndEvent = query({
  args: {
    userId: v.id("users"),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("badges")
      .withIndex("by_user_event", q =>
        q.eq("userId", args.userId).eq("eventId", args.eventId)
      )
      .collect();
  },
});

export const getBadge = query({
  args: { badgeId: v.id("badges") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.badgeId);
  },
});
