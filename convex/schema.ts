import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("hacker"), v.literal("mentor"), v.literal("organiser"), v.literal("judge")),
    status: v.union(v.literal("active"), v.literal("banned")),
    lastActiveAt: v.number(),
    gender: v.optional(v.string()),
    age: v.optional(v.number()),
    discordUserId: v.optional(v.string()),
    discordUsername: v.optional(v.string()),
  }).index("by_email", ["email"])
    .index("by_discordUserId", ["discordUserId"])
    .index("by_discordUsername", ["discordUsername"]),

  events: defineTable({
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
  }),

  eventMembers: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    role: v.union(v.literal("hacker"), v.literal("mentor"), v.literal("organiser"), v.literal("judge")),
  }).index("by_event", ["eventId"])
    .index("by_event_user", ["eventId", "userId"]),

  groups: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    projectDescription: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    demoUrl: v.optional(v.string()),
    channelId: v.id("channels"),
    maxMembers: v.number(),
  }).index("by_event", ["eventId"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.union(v.literal("leader"), v.literal("member")),
  }).index("by_group", ["groupId"])
    .index("by_group_user", ["groupId", "userId"]),

  channels: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    type: v.union(v.literal("community"), v.literal("team"), v.literal("organisers"), v.literal("help")),
  }).index("by_event", ["eventId"]),

  messages: defineTable({
    channelId: v.id("channels"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("system")),
    deletedAt: v.optional(v.number()),
  }).index("by_channel", ["channelId"]),

  announcements: defineTable({
    eventId: v.id("events"),
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
    priority: v.union(v.literal("normal"), v.literal("important"), v.literal("urgent")),
  }).index("by_event", ["eventId"]),

  alerts: defineTable({
    eventId: v.id("events"),
    fromUserId: v.id("users"),
    groupId: v.optional(v.id("groups")),
    message: v.string(),
    status: v.union(v.literal("open"), v.literal("assigned"), v.literal("resolved")),
    assignedTo: v.optional(v.id("users")),
  }).index("by_event_status", ["eventId", "status"]),

  registrations: defineTable({
    eventId: v.id("events"),
    email: v.string(),
    name: v.string(),
    skills: v.array(v.string()),
    experience: v.string(),
    discordUsername: v.optional(v.string()),
    status: v.union(v.literal("submitted"), v.literal("accepted"), v.literal("rejected")),
    userId: v.optional(v.id("users")),
    screeningScore: v.optional(v.number()),
  }).index("by_email_event", ["email", "eventId"])
    .index("by_discord_username", ["discordUsername"]),

  timer: defineTable({
    eventId: v.id("events"),
    phases: v.array(v.object({
      name: v.string(),
      durationSeconds: v.number(),
    })),
    currentPhase: v.number(),
    status: v.union(v.literal("not_started"), v.literal("running"), v.literal("paused"), v.literal("ended")),
    startedAt: v.optional(v.number()),
    totalPausedSeconds: v.number(),
  }).index("by_event", ["eventId"]),

  judgingCriteria: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    weight: v.number(),
    maxScore: v.number(),
  }).index("by_event", ["eventId"]),

  scores: defineTable({
    eventId: v.id("events"),
    groupId: v.id("groups"),
    judgeId: v.id("users"),
    criterionId: v.id("judgingCriteria"),
    score: v.number(),
    note: v.optional(v.string()),
  }).index("by_group", ["groupId"])
    .index("by_judge", ["judgeId"]),

  scheduleItems: defineTable({
    eventId: v.id("events"),
    title: v.string(),
    location: v.optional(v.string()),
    speaker: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.number(),
  }).index("by_event_starts", ["eventId", "startsAt"]),

  teamFinderPosts: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    type: v.union(v.literal("looking_for_team"), v.literal("looking_for_members")),
    skills: v.array(v.string()),
    idea: v.optional(v.string()),
    groupId: v.optional(v.id("groups")),
    active: v.boolean(),
  }).index("by_event_active", ["eventId", "active"]),

  badges: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),
    badge: v.string(),
    awardedAt: v.number(),
  }).index("by_user_event", ["userId", "eventId"]),

  sponsors: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    logoUrl: v.string(),
    websiteUrl: v.string(),
    tier: v.union(v.literal("gold"), v.literal("silver"), v.literal("bronze")),
  }).index("by_event", ["eventId"]),

  discordState: defineTable({
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
  }).index("by_event", ["eventId"]),

  groupDiscordChannels: defineTable({
    groupId: v.id("groups"),
    channelId: v.string(),
    voiceChannelId: v.optional(v.string()),
  }).index("by_group", ["groupId"]),
});
