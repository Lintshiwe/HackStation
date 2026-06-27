import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const addScheduleItem = mutation({
  args: {
    eventId: v.id("events"),
    title: v.string(),
    location: v.optional(v.string()),
    speaker: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.number(),
  },
  handler: async (ctx, args) => {
    const itemId = await ctx.db.insert("scheduleItems", {
      eventId: args.eventId,
      title: args.title,
      location: args.location,
      speaker: args.speaker,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
    });
    return { itemId };
  },
});

export const updateScheduleItem = mutation({
  args: {
    itemId: v.id("scheduleItems"),
    title: v.optional(v.string()),
    location: v.optional(v.string()),
    speaker: v.optional(v.string()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { itemId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(itemId, filtered);
  },
});

export const deleteScheduleItem = mutation({
  args: { itemId: v.id("scheduleItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Schedule item not found");
    await ctx.db.delete(args.itemId);
  },
});
