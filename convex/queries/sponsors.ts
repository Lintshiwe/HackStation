import { v } from "convex/values";
import { query } from "../_generated/server";

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.query("sponsors")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const getSponsor = query({
  args: { sponsorId: v.id("sponsors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sponsorId);
  },
});
