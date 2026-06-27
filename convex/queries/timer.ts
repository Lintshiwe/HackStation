import { v } from "convex/values";
import { query } from "../_generated/server";

export const getTimer = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.query("timer")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .first();
  },
});
