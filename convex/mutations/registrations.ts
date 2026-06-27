import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const submitRegistration = mutation({
  args: {
    eventId: v.id("events"),
    email: v.string(),
    name: v.string(),
    skills: v.array(v.string()),
    experience: v.string(),
    discordUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("registrations")
      .withIndex("by_email_event", q => q.eq("email", args.email).eq("eventId", args.eventId))
      .first();
    if (existing) throw new Error("Already registered for this event");

    const registrationId = await ctx.db.insert("registrations", {
      eventId: args.eventId,
      email: args.email,
      name: args.name,
      skills: args.skills,
      experience: args.experience,
      discordUsername: args.discordUsername,
      status: "submitted",
    });
    return { registrationId };
  },
});

export const updateRegistrationStatus = mutation({
  args: {
    registrationId: v.id("registrations"),
    status: v.union(v.literal("submitted"), v.literal("accepted"), v.literal("rejected")),
    screeningScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) throw new Error("Registration not found");

    const patch: Record<string, any> = { status: args.status };
    if (args.screeningScore !== undefined) {
      patch.screeningScore = args.screeningScore;
    }
    await ctx.db.patch(args.registrationId, patch);
  },
});

export const linkRegistrationToUser = mutation({
  args: {
    registrationId: v.id("registrations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) throw new Error("Registration not found");

    await ctx.db.patch(args.registrationId, { userId: args.userId });
  },
});
