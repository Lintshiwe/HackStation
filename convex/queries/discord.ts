import { v } from "convex/values";
import { query } from "../_generated/server";

export const getDiscordState = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.query("discordState")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .first();
  },
});

export const getGroupChannel = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db.query("groupDiscordChannels")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .first();
  },
});
