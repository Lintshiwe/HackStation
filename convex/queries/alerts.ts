import { v } from "convex/values";
import { query } from "../_generated/server";

export const listByEventAndStatus = query({
  args: {
    eventId: v.id("events"),
    status: v.optional(v.union(v.literal("open"), v.literal("assigned"), v.literal("resolved"))),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db.query("alerts")
        .withIndex("by_event_status", q =>
          q.eq("eventId", args.eventId).eq("status", args.status!)
        )
        .collect();
    }
    return await ctx.db.query("alerts")
      .withIndex("by_event_status", q => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const getAlert = query({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.alertId);
  },
});
