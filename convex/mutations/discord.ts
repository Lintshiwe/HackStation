import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";

export const updateDiscordState = mutation({
  args: {
    eventId: v.id("events"),
    guildId: v.string(),
    channels: v.object({
      announcements: v.optional(v.string()),
      general: v.optional(v.string()),
      helpRequests: v.optional(v.string()),
      schedule: v.optional(v.string()),
      organiserChat: v.optional(v.string()),
      mentorChat: v.optional(v.string()),
    }),
    roles: v.object({
      hacker: v.optional(v.string()),
      mentor: v.optional(v.string()),
      organiser: v.optional(v.string()),
      judge: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("discordState")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        guildId: args.guildId,
        channels: args.channels,
        roles: args.roles,
      });
      return { stateId: existing._id, updated: true };
    }

    const stateId = await ctx.db.insert("discordState", {
      eventId: args.eventId,
      guildId: args.guildId,
      channels: args.channels,
      roles: args.roles,
    });
    return { stateId, updated: false };
  },
});

export const saveGroupChannel = mutation({
  args: {
    groupId: v.id("groups"),
    channelId: v.string(),
    voiceChannelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("groupDiscordChannels")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        channelId: args.channelId,
        voiceChannelId: args.voiceChannelId,
      });
      return { channelRecordId: existing._id, updated: true };
    }

    const channelRecordId = await ctx.db.insert("groupDiscordChannels", {
      groupId: args.groupId,
      channelId: args.channelId,
      voiceChannelId: args.voiceChannelId,
    });
    return { channelRecordId, updated: false };
  },
});

export const syncDiscord = internalMutation({
  handler: async (ctx) => {
    const states = await ctx.db.query("discordState").collect();

    for (const state of states) {
      const members = await ctx.db.query("eventMembers")
        .withIndex("by_event", q => q.eq("eventId", state.eventId))
        .collect();

      for (const member of members) {
        const user = await ctx.db.get(member.userId);
        if (!user) continue;

        const roleId = state.roles[member.role as keyof typeof state.roles];
        if (!roleId) continue;

        if (!user.discordUserId) continue;
      }
    }
  },
});
