import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createGroup = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    channelId: v.id("channels"),
    maxMembers: v.number(),
  },
  handler: async (ctx, args) => {
    const groupId = await ctx.db.insert("groups", {
      eventId: args.eventId,
      name: args.name,
      channelId: args.channelId,
      maxMembers: args.maxMembers,
    });
    return { groupId };
  },
});

export const updateGroup = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.optional(v.string()),
    projectDescription: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    demoUrl: v.optional(v.string()),
    maxMembers: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { groupId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(groupId, filtered);
  },
});

export const deleteGroup = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const members = await ctx.db.query("groupMembers")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .collect();
    await Promise.all(members.map(m => ctx.db.delete(m._id)));

    const channel = await ctx.db.query("groupDiscordChannels")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .first();
    if (channel) await ctx.db.delete(channel._id);

    await ctx.db.delete(args.groupId);
  },
});

export const shuffleMembers = mutation({
  args: {
    eventId: v.id("events"),
    mode: v.union(v.literal("groups"), v.literal("event")),
    targetGroupIds: v.optional(v.array(v.id("groups"))),
    preserveLeaders: v.boolean(),
    minGroupSize: v.number(),
    maxGroupSize: v.number(),
    triggeredBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    let groups;
    if (args.mode === "groups" && args.targetGroupIds && args.targetGroupIds.length > 0) {
      const fetched = await Promise.all(args.targetGroupIds.map(id => ctx.db.get(id)));
      groups = fetched.filter((g): g is NonNullable<typeof g> => g !== null);
    } else {
      groups = await ctx.db.query("groups")
        .withIndex("by_event", q => q.eq("eventId", args.eventId))
        .collect();
    }

    if (groups.length === 0) throw new Error("No groups found");

    const pool: Array<{ userId: string }> = [];

    for (const group of groups) {
      const members = await ctx.db.query("groupMembers")
        .withIndex("by_group", q => q.eq("groupId", group._id))
        .collect();

      for (const m of members) {
        if (args.preserveLeaders && m.role === "leader") continue;
        pool.push({ userId: m.userId });
        await ctx.db.delete(m._id);
      }
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    let idx = 0;
    let round = 0;
    while (idx < pool.length && round < 100) {
      for (const group of groups) {
        if (idx >= pool.length) break;
        const count = (await ctx.db.query("groupMembers")
          .withIndex("by_group", q => q.eq("groupId", group._id))
          .collect()).length;
        if (count < args.maxGroupSize) {
          await ctx.db.insert("groupMembers", {
            groupId: group._id,
            userId: pool[idx].userId as any,
            role: "member",
          });
          idx++;
        }
      }
      round++;
    }

    return { shuffled: true, totalMoved: idx };
  },
});

export const swapMembers = mutation({
  args: {
    groupId1: v.id("groups"),
    userId1: v.id("users"),
    groupId2: v.id("groups"),
    userId2: v.id("users"),
    triggeredBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const member1 = await ctx.db.query("groupMembers")
      .withIndex("by_group_user", q => q.eq("groupId", args.groupId1).eq("userId", args.userId1))
      .first();
    if (!member1) throw new Error("Member 1 not found in group 1");

    const member2 = await ctx.db.query("groupMembers")
      .withIndex("by_group_user", q => q.eq("groupId", args.groupId2).eq("userId", args.userId2))
      .first();
    if (!member2) throw new Error("Member 2 not found in group 2");

    await ctx.db.patch(member1._id, { groupId: args.groupId2 });
    await ctx.db.patch(member2._id, { groupId: args.groupId1 });

    return { swapped: true };
  },
});
