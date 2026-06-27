import { v } from "convex/values";
import { query } from "../_generated/server";

export const listActiveByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.query("teamFinderPosts")
      .withIndex("by_event_active", q =>
        q.eq("eventId", args.eventId).eq("active", true)
      )
      .collect();
  },
});

export const getPost = query({
  args: { postId: v.id("teamFinderPosts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});
