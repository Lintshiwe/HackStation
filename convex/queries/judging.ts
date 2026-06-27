import { v } from "convex/values";
import { query } from "../_generated/server";

export const listCriteria = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.query("judgingCriteria")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const listScoresByGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db.query("scores")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .collect();
  },
});

export const listScoresByJudge = query({
  args: { judgeId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.query("scores")
      .withIndex("by_judge", q => q.eq("judgeId", args.judgeId))
      .collect();
  },
});
