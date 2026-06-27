import { v } from "convex/values";
import { query } from "../_generated/server";

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("registrations").collect();
    return all.filter(r => r.eventId === args.eventId);
  },
});

export const getRegistration = query({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.registrationId);
  },
});

export const listByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("registrations")
      .withIndex("by_email_event", q => q.eq("email", args.email))
      .collect();
  },
});

export const getByEmailEvent = query({
  args: { email: v.string(), eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.query("registrations")
      .withIndex("by_email_event", q => q.eq("email", args.email).eq("eventId", args.eventId))
      .first();
  },
});
