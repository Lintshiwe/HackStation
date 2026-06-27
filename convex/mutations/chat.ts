import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      channelId: args.channelId,
      senderId: args.senderId,
      content: args.content,
      type: args.type ?? "text",
    });
    return { messageId };
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.deletedAt) throw new Error("Message already deleted");

    await ctx.db.patch(args.messageId, { deletedAt: Date.now() });
  },
});
