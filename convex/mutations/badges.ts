import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const awardBadge = mutation({
  args: {
    userId: v.id("users"),
    eventId: v.id("events"),
    badge: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("badges")
      .withIndex("by_user_event", q => q.eq("userId", args.userId).eq("eventId", args.eventId))
      .collect();

    if (existing.some(b => b.badge === args.badge)) {
      throw new Error("Badge already awarded to this user for this event");
    }

    const badgeId = await ctx.db.insert("badges", {
      userId: args.userId,
      eventId: args.eventId,
      badge: args.badge,
      awardedAt: Date.now(),
    });
    return { badgeId };
  },
});

export const revokeBadge = mutation({
  args: { badgeId: v.id("badges") },
  handler: async (ctx, args) => {
    const badge = await ctx.db.get(args.badgeId);
    if (!badge) throw new Error("Badge not found");
    await ctx.db.delete(args.badgeId);
  },
});
