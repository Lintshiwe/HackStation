import { v } from "convex/values";
import { mutation } from "./_generated/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "hackstation-salt");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export const register = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();
    if (existing) throw new Error("Email already registered");

    const passwordHash = await hashPassword(args.password);
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      passwordHash,
      role: "hacker",
      status: "active",
      lastActiveAt: Date.now(),
    });

    return { userId };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();
    if (!user) throw new Error("Invalid email or password");
    if (user.status === "banned") throw new Error("Account is banned");

    const passwordHash = await hashPassword(args.password);
    if (user.passwordHash !== passwordHash) throw new Error("Invalid email or password");

    await ctx.db.patch(user._id, { lastActiveAt: Date.now() });
    return { userId: user._id, name: user.name, email: user.email, role: user.role };
  },
});
