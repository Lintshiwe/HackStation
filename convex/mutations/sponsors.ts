import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const addSponsor = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    logoUrl: v.string(),
    websiteUrl: v.string(),
    tier: v.union(v.literal("gold"), v.literal("silver"), v.literal("bronze")),
  },
  handler: async (ctx, args) => {
    const sponsorId = await ctx.db.insert("sponsors", {
      eventId: args.eventId,
      name: args.name,
      description: args.description,
      logoUrl: args.logoUrl,
      websiteUrl: args.websiteUrl,
      tier: args.tier,
    });
    return { sponsorId };
  },
});

export const updateSponsor = mutation({
  args: {
    sponsorId: v.id("sponsors"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    tier: v.optional(v.union(v.literal("gold"), v.literal("silver"), v.literal("bronze"))),
  },
  handler: async (ctx, args) => {
    const { sponsorId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(sponsorId, filtered);
  },
});

export const deleteSponsor = mutation({
  args: { sponsorId: v.id("sponsors") },
  handler: async (ctx, args) => {
    const sponsor = await ctx.db.get(args.sponsorId);
    if (!sponsor) throw new Error("Sponsor not found");
    await ctx.db.delete(args.sponsorId);
  },
});
