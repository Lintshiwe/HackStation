import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createAlert = mutation({
  args: {
    eventId: v.id("events"),
    fromUserId: v.id("users"),
    groupId: v.optional(v.id("groups")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const alertId = await ctx.db.insert("alerts", {
      eventId: args.eventId,
      fromUserId: args.fromUserId,
      groupId: args.groupId,
      message: args.message,
      status: "open",
    });
    return { alertId };
  },
});

export const assignAlert = mutation({
  args: {
    alertId: v.id("alerts"),
    assignedTo: v.id("users"),
  },
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");
    if (alert.status !== "open") throw new Error("Alert is not open");

    await ctx.db.patch(args.alertId, {
      assignedTo: args.assignedTo,
      status: "assigned",
    });
  },
});

export const resolveAlert = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");
    if (alert.status === "resolved") throw new Error("Alert already resolved");

    await ctx.db.patch(args.alertId, { status: "resolved" });
  },
});
