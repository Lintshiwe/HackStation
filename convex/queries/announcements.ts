import { v } from "convex/values";
import { query } from "../_generated/server";

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.query("announcements")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .order("desc")
      .collect();
  },
});

export const getAnnouncement = query({
  args: { announcementId: v.id("announcements") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.announcementId);
  },
});
