import { v } from "convex/values";
import { query } from "../_generated/server";

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.query("scheduleItems")
      .withIndex("by_event_starts", q => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const getScheduleItem = query({
  args: { scheduleItemId: v.id("scheduleItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.scheduleItemId);
  },
});
