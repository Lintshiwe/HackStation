import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";

export const startTimer = mutation({
  args: {
    eventId: v.id("events"),
    phases: v.array(v.object({
      name: v.string(),
      durationSeconds: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("timer")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .first();
    if (existing) throw new Error("Timer already exists for this event");

    const timerId = await ctx.db.insert("timer", {
      eventId: args.eventId,
      phases: args.phases,
      currentPhase: 0,
      status: "running",
      startedAt: Date.now(),
      totalPausedSeconds: 0,
    });
    return { timerId };
  },
});

export const pauseTimer = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const timer = await ctx.db.query("timer")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .first();
    if (!timer) throw new Error("Timer not found");
    if (timer.status !== "running") throw new Error("Timer is not running");

    const now = Date.now();
    const elapsedSinceStart = now - (timer.startedAt ?? now);
    const totalPausedSeconds = timer.totalPausedSeconds + Math.floor(elapsedSinceStart / 1000);

    await ctx.db.patch(timer._id, {
      status: "paused",
      totalPausedSeconds,
      startedAt: undefined,
    });
  },
});

export const resumeTimer = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const timer = await ctx.db.query("timer")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .first();
    if (!timer) throw new Error("Timer not found");
    if (timer.status !== "paused") throw new Error("Timer is not paused");

    await ctx.db.patch(timer._id, {
      status: "running",
      startedAt: Date.now(),
    });
  },
});

export const extendCurrentPhase = mutation({
  args: {
    eventId: v.id("events"),
    extraSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const timer = await ctx.db.query("timer")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .first();
    if (!timer) throw new Error("Timer not found");

    const phases = [...timer.phases];
    const phaseIndex = timer.currentPhase;
    phases[phaseIndex] = {
      ...phases[phaseIndex],
      durationSeconds: phases[phaseIndex].durationSeconds + args.extraSeconds,
    };

    await ctx.db.patch(timer._id, { phases });
  },
});

export const setTimerStatus = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("not_started"), v.literal("running"), v.literal("paused"), v.literal("ended")),
  },
  handler: async (ctx, args) => {
    const timer = await ctx.db.query("timer")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .first();
    if (!timer) throw new Error("Timer not found");

    const patch: Record<string, any> = { status: args.status };
    if (args.status === "running") {
      patch.startedAt = Date.now();
    }
    if (args.status === "ended" || args.status === "not_started") {
      patch.startedAt = undefined;
    }
    await ctx.db.patch(timer._id, patch);
  },
});

export const checkTimers = internalMutation({
  handler: async (ctx) => {
    const timers = await ctx.db.query("timer").collect();

    for (const timer of timers) {
      if (timer.status !== "running" || !timer.startedAt) continue;

      const elapsed = (Date.now() - timer.startedAt) / 1000 + timer.totalPausedSeconds;
      let cumulative = 0;
      let nextPhase = timer.currentPhase;

      for (let i = 0; i < timer.phases.length; i++) {
        cumulative += timer.phases[i].durationSeconds;
        if (elapsed >= cumulative) {
          nextPhase = i + 1;
        } else {
          break;
        }
      }

      if (nextPhase >= timer.phases.length) {
        await ctx.db.patch(timer._id, { status: "ended", startedAt: undefined });
      } else if (nextPhase > timer.currentPhase) {
        await ctx.db.patch(timer._id, { currentPhase: nextPhase });
      }
    }
  },
});
