import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createEvent = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("ended")),
    createdBy: v.id("users"),
    screeningRules: v.object({
      requiredSkills: v.array(v.string()),
      minExperience: v.string(),
      maxParticipants: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      name: args.name,
      description: args.description,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      status: args.status,
      createdBy: args.createdBy,
      screeningRules: args.screeningRules,
    });

    await ctx.db.insert("eventMembers", {
      eventId,
      userId: args.createdBy,
      role: "organiser",
    });

    return { eventId };
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("ended"))),
    screeningRules: v.optional(v.object({
      requiredSkills: v.array(v.string()),
      minExperience: v.string(),
      maxParticipants: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(eventId, filtered);
  },
});

export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const members = await ctx.db.query("eventMembers")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .collect();
    await Promise.all(members.map(m => ctx.db.delete(m._id)));

    await ctx.db.delete(args.eventId);
  },
});
