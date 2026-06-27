import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createAnnouncement = mutation({
  args: {
    eventId: v.id("events"),
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
    priority: v.optional(v.union(v.literal("normal"), v.literal("important"), v.literal("urgent"))),
  },
  handler: async (ctx, args) => {
    const announcementId = await ctx.db.insert("announcements", {
      eventId: args.eventId,
      authorId: args.authorId,
      title: args.title,
      content: args.content,
      priority: args.priority ?? "normal",
    });
    return { announcementId };
  },
});

export const deleteAnnouncement = mutation({
  args: { announcementId: v.id("announcements") },
  handler: async (ctx, args) => {
    const announcement = await ctx.db.get(args.announcementId);
    if (!announcement) throw new Error("Announcement not found");
    await ctx.db.delete(args.announcementId);
  },
});
