import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const addCriterion = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    weight: v.number(),
    maxScore: v.number(),
  },
  handler: async (ctx, args) => {
    const criterionId = await ctx.db.insert("judgingCriteria", {
      eventId: args.eventId,
      name: args.name,
      weight: args.weight,
      maxScore: args.maxScore,
    });
    return { criterionId };
  },
});

export const updateCriterion = mutation({
  args: {
    criterionId: v.id("judgingCriteria"),
    name: v.optional(v.string()),
    weight: v.optional(v.number()),
    maxScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { criterionId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(criterionId, filtered);
  },
});

export const deleteCriterion = mutation({
  args: { criterionId: v.id("judgingCriteria") },
  handler: async (ctx, args) => {
    const criterion = await ctx.db.get(args.criterionId);
    if (!criterion) throw new Error("Criterion not found");

    const scores = await ctx.db.query("scores")
      .withIndex("by_group", q => q.eq("groupId", args.criterionId as any))
      .collect();
    await Promise.all(scores.map(s => ctx.db.delete(s._id)));

    await ctx.db.delete(args.criterionId);
  },
});

export const submitScore = mutation({
  args: {
    eventId: v.id("events"),
    groupId: v.id("groups"),
    judgeId: v.id("users"),
    criterionId: v.id("judgingCriteria"),
    score: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const criterion = await ctx.db.get(args.criterionId);
    if (!criterion) throw new Error("Criterion not found");
    if (args.score < 0 || args.score > criterion.maxScore) {
      throw new Error(`Score must be between 0 and ${criterion.maxScore}`);
    }

    const existing = await ctx.db.query("scores")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .collect();

    const duplicate = existing.find(
      s => s.judgeId === args.judgeId && s.criterionId === args.criterionId
    );
    if (duplicate) {
      await ctx.db.patch(duplicate._id, {
        score: args.score,
        note: args.note,
      });
      return { scoreId: duplicate._id, updated: true };
    }

    const scoreId = await ctx.db.insert("scores", {
      eventId: args.eventId,
      groupId: args.groupId,
      judgeId: args.judgeId,
      criterionId: args.criterionId,
      score: args.score,
      note: args.note,
    });
    return { scoreId, updated: false };
  },
});
