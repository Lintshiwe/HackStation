import { v } from "convex/values";
import { query } from "../_generated/server";

export const listMessages = query({
  args: {
    channelId: v.id("channels"),
    paginationOpts: v.optional(v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
      endCursor: v.union(v.string(), v.null()),
      maximumItemsRead: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    if (args.paginationOpts) {
      return await ctx.db.query("messages")
        .withIndex("by_channel", q => q.eq("channelId", args.channelId))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db.query("messages")
      .withIndex("by_channel", q => q.eq("channelId", args.channelId))
      .order("desc")
      .take(50);
  },
});

export const getMessage = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});
