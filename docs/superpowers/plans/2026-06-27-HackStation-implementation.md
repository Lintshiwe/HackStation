# HackStation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete HackStation hackathon management platform — Convex backend, HTML/CSS/JS web frontend, Java/JavaFX desktop app, Discord bot, and n8n automation.

**Architecture:** Convex (serverless DB + real-time) powers the backend. Web frontend is vanilla HTML + CSS + JS with Tailwind CSS via CDN and shadcn-inspired components. Discord bot uses discord.js v14. Desktop app uses Java 21 + JavaFX. n8n handles automation workflows.

**Tech Stack:** Convex (TypeScript), HTML/CSS/JS, Tailwind CSS CDN, Lucide CDN, Java 21 + JavaFX, Node.js + discord.js v14, n8n

---

## File Structure

```
hackstation/
├── convex/
│   ├── schema.ts
│   ├── http.ts
│   ├── crons.ts
│   ├── auth.ts
│   ├── queries/
│   │   ├── users.ts, events.ts, groups.ts, chat.ts, announcements.ts
│   │   ├── alerts.ts, registrations.ts, timer.ts, schedule.ts
│   │   ├── judging.ts, sponsors.ts, badges.ts, teamFinder.ts, discord.ts
│   ├── mutations/
│   │   ├── users.ts, events.ts, groups.ts (incl shuffleMembers, swapMembers)
│   │   ├── chat.ts, announcements.ts, alerts.ts, registrations.ts
│   │   ├── timer.ts, schedule.ts, judging.ts, sponsors.ts
│   │   ├── badges.ts, teamFinder.ts, discord.ts
│   ├── actions/
│   │   ├── n8nBridge.ts
│   │   └── discordBridge.ts
│   └── convex.json
├── web/
│   ├── index.html
│   ├── css/
│   │   ├── style.css            # Global styles + Tailwind directives
│   │   ├── components.css       # shadcn-style component classes
│   │   └── pages.css            # Page-specific styles
│   ├── js/
│   │   ├── convex-client.js     # Convex HTTP client
│   │   ├── auth.js              # Auth state management
│   │   ├── router.js            # SPA router
│   │   ├── utils.js             # Helpers
│   │   ├── app.js               # App shell init
│   │   └── pages/               # One file per page
│   │       ├── login.js
│   │       ├── register.js
│   │       ├── hacker/ (5 files)
│   │       ├── organiser/ (11 files)
│   │       ├── mentor/ (3 files)
│   │       └── judge/ (2 files)
│   ├── public/
│   │   ├── Favicon.png
│   │   ├── HacStationLogo.png
│   │   └── images/ (undraw SVGs)
│   └── netlify.toml
├── desktop/
│   ├── build.gradle
│   ├── settings.gradle
│   └── src/main/java/com/hackathon/
│       ├── App.java
│       ├── controllers/ (per page)
│       ├── views/ (per page, FXML)
│       └── convex/ConvexClient.java
├── discord-bot/
│   ├── package.json
│   ├── Dockerfile
│   ├── render.yaml
│   ├── deploy-commands.js
│   └── src/
│       ├── index.js
│       ├── config.js
│       ├── convex-client.js
│       ├── commands/ (5 files)
│       ├── events/ (3 files)
│       ├── tasks/ (2 files)
│       └── utils/ (3 files)
├── n8n/workflows/ (6 JSONs)
├── .github/workflows/ (4 YMLs)
├── .env
├── .env.example
└── .gitignore
```

---

## Phase 1: Project Setup + Convex Schema + Auth + Layout Shell

### Task 1.1: Initialize project root and .gitignore

**Files:**
- Create: `.gitignore`
- Create: `.env.example`
- Create: `.env`

- [ ] **Create .gitignore**

```
node_modules/
dist/
.env
*.local
.DS_Store
desktop/build/
desktop/.gradle/
desktop/bin/
```

- [ ] **Create .env.example**

```
# Convex
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key

# Discord Bot
DISCORD_TOKEN=your-bot-token
DISCORD_CLIENT_ID=1520185168579788851
DISCORD_GUILD_ID=your-server-id
BOT_SECRET=random-secret-string

# n8n
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook
N8N_WEBHOOK_SECRET=random-secret-string
DISCORD_ANNOUNCEMENT_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy
```

- [ ] **Create .env** with real Discord credentials

```
DISCORD_TOKEN=MTUyMDE4NTE2ODU3OTc4ODg1MQ.GHnmJ9.JbDTkX4eAFyp31aio6A2yOJY9At_SYJqFrLJoU
DISCORD_CLIENT_ID=1520185168579788851
```

- [ ] **Commit**
```bash
git init
git add .gitignore .env.example
git commit -m "chore: initial project setup with gitignore and env template"
```

### Task 1.2: Convex project setup

**Files:**
- Create: `convex/package.json`
- Create: `convex/tsconfig.json`
- Create: `convex/convex.json`

- [ ] **Create convex/package.json**
```json
{
  "name": "hackstation-convex",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "convex dev",
    "deploy": "convex deploy"
  },
  "dependencies": {
    "convex": "^1.17.0"
  }
}
```

- [ ] **Create convex/tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["./**/*.ts"]
}
```

- [ ] **Install Convex**

Run: `cd convex && npm install`

- [ ] **Commit**
```bash
git add convex/
git commit -m "feat: init convex project"
```

### Task 1.3: Convex schema — all 19 tables

**Files:**
- Create: `convex/schema.ts`

- [ ] **Create convex/schema.ts**

```typescript
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
  }).index("by_channel", ["channelId", "_creationTime"]),

  announcements: defineTable({
    eventId: v.id("events"),
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
    priority: v.union(v.literal("normal"), v.literal("important"), v.literal("urgent")),
  }).index("by_event", ["eventId", "_creationTime"]),

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
```

- [ ] **Verify schema compiles**

Run: `cd convex && npx tsc --noEmit`

- [ ] **Commit**
```bash
git add convex/schema.ts
git commit -m "feat: complete convex schema with 19 tables"
```

### Task 1.4: Convex auth (password-based)

**Files:**
- Create: `convex/auth.ts`
- Create: `convex/queries/users.ts`
- Create: `convex/mutations/users.ts`

- [ ] **Create convex/auth.ts**

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Password hashing via Web Crypto API (SHA-256)
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
```

- [ ] **Create convex/queries/users.ts**

```typescript
import { v } from "convex/values";
import { query } from "../_generated/server";

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const listUsers = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const members = await ctx.db.query("eventMembers")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .collect();
    const userIds = members.map(m => m.userId);
    const users = await Promise.all(userIds.map(id => ctx.db.get(id)));
    return users.filter(Boolean);
  },
});
```

- [ ] **Create convex/mutations/users.ts**

```typescript
import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
  },
});

export const banUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { status: "banned" });
  },
});
```

- [ ] **Commit**
```bash
git add convex/auth.ts convex/queries/users.ts convex/mutations/users.ts
git commit -m "feat: add auth (register/login) and user queries/mutations"
```

### Task 1.5: Remaining Convex queries (13 files)

**Files:**
- Create: `convex/queries/events.ts`
- Create: `convex/queries/groups.ts`
- Create: `convex/queries/chat.ts`
- Create: `convex/queries/announcements.ts`
- Create: `convex/queries/alerts.ts`
- Create: `convex/queries/registrations.ts`
- Create: `convex/queries/timer.ts`
- Create: `convex/queries/schedule.ts`
- Create: `convex/queries/judging.ts`
- Create: `convex/queries/sponsors.ts`
- Create: `convex/queries/badges.ts`
- Create: `convex/queries/teamFinder.ts`
- Create: `convex/queries/discord.ts`

Each file follows the pattern of query with args and handler, using index lookups where applicable.

- [ ] **Create all 13 query files with basic CRUD queries**

Each query file exports 2-5 query functions following this pattern:

```typescript
import { v } from "convex/values";
import { query } from "../_generated/server";

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.query("tableName")
      .withIndex("by_event", q => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("tableName") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

- [ ] **Commit**
```bash
git add convex/queries/
git commit -m "feat: all convex queries (13 files)"
```

### Task 1.6: Remaining Convex mutations (13 files)

**Files:**
- Create: `convex/mutations/events.ts`
- Create: `convex/mutations/groups.ts` (with shuffleMembers, swapMembers)
- Create: `convex/mutations/chat.ts`
- Create: `convex/mutations/announcements.ts`
- Create: `convex/mutations/alerts.ts`
- Create: `convex/mutations/registrations.ts`
- Create: `convex/mutations/timer.ts`
- Create: `convex/mutations/schedule.ts`
- Create: `convex/mutations/judging.ts`
- Create: `convex/mutations/sponsors.ts`
- Create: `convex/mutations/badges.ts`
- Create: `convex/mutations/teamFinder.ts`
- Create: `convex/mutations/discord.ts`

- [ ] **Create groups.ts with shuffleMembers logic:**

```typescript
import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const shuffleMembers = mutation({
  args: {
    eventId: v.id("events"),
    mode: v.union(v.literal("full"), v.literal("partial")),
    targetGroupIds: v.optional(v.array(v.id("groups"))),
    preserveLeaders: v.boolean(),
    minGroupSize: v.number(),
    maxGroupSize: v.number(),
    triggeredBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const groupIds = args.targetGroupIds || (
      await ctx.db.query("groups")
        .withIndex("by_event", q => q.eq("eventId", args.eventId))
        .collect()
    ).map(g => g._id);

    // Collect all members from target groups
    const allMembers = [];
    const leaders: Array<{ groupId: string; userId: string }> = [];

    for (const groupId of groupIds) {
      const members = await ctx.db.query("groupMembers")
        .withIndex("by_group", q => q.eq("groupId", groupId))
        .collect();
      
      for (const m of members) {
        if (args.preserveLeaders && m.role === "leader") {
          leaders.push({ groupId: groupId, userId: m.userId });
        } else {
          allMembers.push(m.userId);
          await ctx.db.delete(m._id);
        }
      }
    }

    // Fisher-Yates shuffle
    for (let i = allMembers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allMembers[i], allMembers[j]] = [allMembers[j], allMembers[i]];
    }

    // Distribute to groups
    const activeGroups = groupIds.filter(id => {
      const leaderCount = leaders.filter(l => l.groupId === id).length;
      return leaderCount < args.maxGroupSize;
    });

    let memberIdx = 0;
    while (memberIdx < allMembers.length) {
      for (const groupId of activeGroups) {
        if (memberIdx >= allMembers.length) break;
        const currentCount = leaders.filter(l => l.groupId === groupId).length;
        if (currentCount >= args.maxGroupSize) continue;
        await ctx.db.insert("groupMembers", {
          groupId: groupId as any,
          userId: allMembers[memberIdx],
          role: "member",
        });
        memberIdx++;
      }
    }

    return { shuffled: memberIdx, total: allMembers.length };
  },
});

export const swapMembers = mutation({
  args: {
    userA: v.id("users"),
    groupA: v.id("groups"),
    userB: v.id("users"),
    groupB: v.id("groups"),
    triggeredBy: v.id("users"),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const memberA = await ctx.db.query("groupMembers")
      .withIndex("by_group_user", q => q.eq("groupId", args.groupA).eq("userId", args.userA))
      .first();
    const memberB = await ctx.db.query("groupMembers")
      .withIndex("by_group_user", q => q.eq("groupId", args.groupB).eq("userId", args.userB))
      .first();

    if (!memberA || !memberB) throw new Error("Member not found");

    const roleA = memberA.role;
    const roleB = memberB.role;

    await ctx.db.patch(memberA._id, { groupId: args.groupB as any, role: roleB });
    await ctx.db.patch(memberB._id, { groupId: args.groupA as any, role: roleA });
  },
});
```

- [ ] **Create all 13 mutation files**

Each with insert, update, delete patterns.

- [ ] **Create convex/http.ts**

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/api/n8n/screening-complete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    // Handle n8n webhook callback
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/api/ping",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
```

- [ ] **Create convex/crons.ts**

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("check-timers", { seconds: 30 }, internal.timer.checkTimers);
crons.interval("sync-discord", { seconds: 60 }, internal.discord.syncState);

export default crons;
```

- [ ] **Commit**
```bash
git add convex/mutations/ convex/http.ts convex/crons.ts
git commit -m "feat: all convex mutations, http actions, and crons"
```

### Task 1.7: Web frontend — index.html shell

**Files:**
- Create: `web/index.html`
- Create: `web/css/style.css`
- Create: `web/js/app.js`
- Create: `web/js/convex-client.js`
- Create: `web/js/router.js`
- Create: `web/js/auth.js`
- Create: `web/js/utils.js`
- Create: `web/public/images/` (copy logo + favicon)

- [ ] **Create web/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HackStation</title>
  <link rel="icon" type="image/png" href="public/Favicon.png">
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/components.css">
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="js/convex-client.js" defer></script>
  <script src="js/utils.js" defer></script>
  <script src="js/auth.js" defer></script>
  <script src="js/router.js" defer></script>
  <script src="js/app.js" defer></script>
</head>
<body class="bg-white text-gray-900 font-sans antialiased">
  <div id="app"></div>
</body>
</html>
```

- [ ] **Create web/css/style.css**

```css
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8F9FA;
  --bg-tertiary: #F1F3F5;
  --border: #DEE2E6;
  --border-light: #E9ECEF;
  --text-primary: #212529;
  --text-secondary: #495057;
  --text-muted: #868E96;
  --accent: #228BE6;
  --accent-hover: #1C7ED6;
  --accent-light: #E7F5FF;
  --success: #40C057;
  --warning: #FAB005;
  --danger: #FA5252;
  --info: #15AABF;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-primary);
}

h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 700; color: var(--text-primary); }
h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 600; color: var(--text-primary); }
h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; font-weight: 600; color: var(--text-primary); }

code, pre { font-family: 'JetBrains Mono', monospace; font-size: 13px; }

.text-muted { color: var(--text-muted); font-size: 12px; }
.text-secondary { color: var(--text-secondary); font-size: 13px; font-weight: 500; }

/* Layout */
.app-shell { display: flex; height: 100vh; }
.sidebar { width: 240px; min-width: 240px; background: var(--bg-primary); border-right: 1px solid var(--border); display: flex; flex-direction: column; transition: width 0.2s; }
.sidebar.collapsed { width: 64px; min-width: 64px; }
.main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.topbar { height: 64px; background: var(--bg-primary); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; }
.content { flex: 1; overflow-y: auto; padding: 32px; background: var(--bg-secondary); }
```

- [ ] **Copy images**

```bash
cp /home/ntoampi/Documents/Projects/HackStation/Favicon.png web/public/
cp /home/ntoampi/Documents/Projects/HackStation/HacStationLogo.png web/public/images/
```

- [ ] **Commit**
```bash
git add web/
git commit -m "feat: web frontend shell with layout, styles, and assets"
```

### Task 1.8: Web frontend — components CSS (shadcn-style)

**Files:**
- Create: `web/css/components.css`

- [ ] **Create web/css/components.css with all UI primitives:**

Cover: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.card`, `.input`, `.textarea`, `.select`, `.modal`, `.modal-backdrop`, `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`, `.avatar`, `.tabs`, `.tab`, `.dropdown`, `.dropdown-menu`, `.tooltip`, `.spinner`, `.empty-state`, `.toast`, `.toast-success`, `.toast-error`, `.confirm-dialog`

```css
/* Buttons */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500;
  border: 1px solid transparent; cursor: pointer; transition: all 0.15s;
  font-family: 'Inter', sans-serif; line-height: 1;
}
.btn-primary { background: var(--accent); color: white; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-secondary { background: var(--bg-primary); color: var(--text-primary); border-color: var(--border); }
.btn-secondary:hover { background: var(--bg-tertiary); }
.btn-danger { background: var(--danger); color: white; }
.btn-ghost { background: transparent; color: var(--text-secondary); }
.btn-ghost:hover { background: var(--bg-tertiary); }
.btn-sm { padding: 4px 12px; font-size: 12px; }
.btn-lg { padding: 12px 24px; font-size: 16px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Cards */
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
}
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-body { }
.card-footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-light); }

/* Inputs */
.input, .textarea, .select {
  width: 100%; padding: 8px 12px; border-radius: 8px;
  border: 1px solid var(--border); font-size: 14px; font-family: 'Inter', sans-serif;
  color: var(--text-primary); background: var(--bg-primary); transition: border-color 0.15s;
}
.input:focus, .textarea:focus, .select:focus {
  outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light);
}
.textarea { min-height: 100px; resize: vertical; }
.input-error { border-color: var(--danger); }

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal {
  background: var(--bg-primary); border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  width: 90%; max-width: 480px; max-height: 80vh; overflow-y: auto;
}
.modal-header { padding: 20px 24px 0; display: flex; align-items: center; justify-content: space-between; }
.modal-body { padding: 16px 24px; }
.modal-footer { padding: 16px 24px 20px; display: flex; gap: 8px; justify-content: flex-end; }

/* Badges */
.badge {
  display: inline-flex; align-items: center; padding: 2px 8px;
  border-radius: 6px; font-size: 12px; font-weight: 500;
}
.badge-blue { background: var(--accent-light); color: var(--accent); }
.badge-green { background: #EBFBEE; color: var(--success); }
.badge-yellow { background: #FFF9DB; color: #E67700; }
.badge-red { background: #FFE3E3; color: var(--danger); }

/* Avatars */
.avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--accent-light); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600;
}
.avatar-sm { width: 28px; height: 28px; font-size: 11px; }
.avatar-lg { width: 48px; height: 48px; font-size: 18px; }
.avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }

/* Tabs */
.tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
.tab {
  padding: 10px 16px; cursor: pointer; font-size: 14px; font-weight: 500;
  color: var(--text-secondary); border-bottom: 2px solid transparent;
  transition: all 0.15s;
}
.tab:hover { color: var(--text-primary); }
.tab.active { color: var(--accent); border-bottom-color: var(--accent); }

/* Spinner */
.spinner {
  width: 24px; height: 24px; border: 3px solid var(--border);
  border-top-color: var(--accent); border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty State */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 64px 32px; text-align: center;
  color: var(--text-muted);
}
.empty-state svg { width: 120px; height: 120px; margin-bottom: 16px; opacity: 0.6; }
.empty-state h3 { color: var(--text-secondary); margin-bottom: 8px; }

/* Toast */
.toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 2000; display: flex; flex-direction: column; gap: 8px; }
.toast {
  padding: 12px 20px; border-radius: 8px; font-size: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 8px;
}
.toast-success { background: var(--success); color: white; }
.toast-error { background: var(--danger); color: white; }
.toast-info { background: var(--accent); color: white; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

/* Sidebar nav */
.nav-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 16px;
  border-radius: 8px; cursor: pointer; color: var(--text-secondary);
  transition: all 0.15s; text-decoration: none; font-size: 14px;
}
.nav-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
.nav-item.active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
.nav-item.active::before { content: ''; position: absolute; left: 0; width: 3px; height: 20px; background: var(--accent); border-radius: 0 3px 3px 0; }

/* Timer widget */
.timer-display { font-family: 'JetBrains Mono', monospace; font-size: 48px; font-weight: 400; color: var(--text-primary); }
.timer-phase { font-size: 16px; color: var(--text-secondary); margin-top: 4px; }

/* Priority colors */
.priority-normal { border-left: 3px solid var(--accent); }
.priority-important { border-left: 3px solid var(--warning); }
.priority-urgent { border-left: 3px solid var(--danger); }

/* Role badges */
.role-hacker { color: var(--accent); }
.role-mentor { color: var(--success); }
.role-organiser { color: var(--danger); }
.role-judge { color: #F76707; }
```

- [ ] **Commit**
```bash
git add web/css/components.css
git commit -m "feat: shadcn-style component CSS (buttons, cards, modals, etc.)"
```

---

## Phase 2: Hacker Pages

### Task 2.1: Login + Register pages
**Files:** `web/pages/login.html`, `web/pages/register.html`, `web/js/pages/login.js`, `web/js/pages/register.js`
- Login: two-column layout with illustration, email + password form
- Register: name, email, password, confirm form
- Wire to Convex auth mutations

### Task 2.2: App shell with sidebar
**Files:** `web/js/app.js` (update), `web/pages/shell.html`
- Sidebar with role-based nav items per spec
- Collapsible sidebar (240px → 64px)
- TopBar with breadcrumb, notification bell, user dropdown

### Task 2.3: HackerHome
**Files:** `web/pages/hacker/home.html`, `web/js/pages/hacker/home.js`
- Timer widget, announcement card, team card, schedule item, help button

### Task 2.4: HackerChat
**Files:** `web/pages/hacker/chat.html`, `web/js/pages/hacker/chat.js`
- Two tabs (Community / My Team), message list, MessageInput

### Task 2.5: HackerTeam + HackerSchedule + HackerHelp
**Files:** 3 html + 3 js files
- Team: name, members, project description, URLs
- Schedule: vertical timeline with current item highlighted
- Help: request form + my requests list

---

## Phase 3: Organiser Pages

### Task 3.1: OrganiserDashboard
**Files:** `web/pages/organiser/dashboard.html`, `web/js/pages/organiser/dashboard.js`
- Stats grid (4 columns), activity feed, quick actions

### Task 3.2: OrganiserGroups + ShuffleDialog
**Files:** `web/pages/organiser/groups.html`, `web/js/pages/organiser/groups.js`
- Group cards, create/delete/edit, shuffle dialog (mode, constraints, preview)

### Task 3.3: OrganiserRegistrations
**Files:** `web/pages/organiser/registrations.html`, `web/js/pages/organiser/registrations.js`
- Table with filters, accept/reject per row, registration link

### Task 3.4: OrganiserAnnouncements + OrganiserTimer
**Files:** 4 files
- Announcements: list + create form with priority selector
- Timer: big display, phase list, controls (start/pause/resume/extend)

### Task 3.5: OrganiserWheel
**Files:** `web/js/pages/organiser/wheel.js`
- Canvas spinning wheel with requestAnimationFrame deceleration

### Task 3.6: OrganiserJudging + Schedule + Alerts + Sponsors + Stats
**Files:** 10 files
- Judging: criteria setup, assign judges, leaderboard
- Schedule: timeline editor (add/edit/delete)
- Alerts: filterable list, assign/resolve
- Sponsors: grid with tier sizing
- Stats: summary with CSV export

---

## Phase 4: Mentor Pages

### Task 4.1: MentorHome + MentorHelpQueue + MentorGroups
**Files:** 6 html+js files
- Home: summary cards + recent requests
- Help Queue: open requests with accept/resolve, filter
- Groups: assigned groups list with details

---

## Phase 5: Judge Pages

### Task 5.1: JudgeProjects + JudgeScoring
**Files:** 4 html+js files
- Projects list with score progress
- Scoring form with sliders per criterion, weighted total

---

## Phase 6: Discord Bot

### Task 6.1: Discord bot setup
**Files:** `discord-bot/package.json`, `discord-bot/src/index.js`, `discord-bot/src/config.js`, `discord-bot/src/convex-client.js`
- Initialize discord.js v14 with intents
- Load commands and events
- Connect to Convex via HTTP API

### Task 6.2: Slash commands
**Files:** `discord-bot/src/commands/help.js`, `status.js`, `team.js`, `schedule.js`, `link.js`
- /help: create alert in Convex
- /status: show timer from Convex
- /team: show user's team info
- /schedule: show event schedule
- /link: link Discord to registration

### Task 6.3: Events + Tasks + Utils
**Files:** 8 files
- guildMemberAdd: auto-role on join
- messageCreate + interactionCreate handlers
- timerSync: poll timer every 30s
- announcementMirror: post to Discord channel
- roleManager + channelManager + embedBuilder utils
- deploy-commands.js: register slash commands

### Task 6.4: Docker + Render config
**Files:** `discord-bot/Dockerfile`, `discord-bot/render.yaml`

---

## Phase 7: n8n Workflows

### Task 7.1-7.6: 6 workflow JSONs
**Files:** `n8n/workflows/01-registration-screening.json` through `06-discord-announcement-mirror.json`
- Registration screening, Discord invite, deadline reminders, certificate generator, group sync, announcement mirror

---

## Phase 8: Deployment Configs

### Task 8.1: Netlify + GitHub Actions
**Files:** `web/netlify.toml`, `.github/workflows/deploy-web.yml`, `deploy-convex.yml`, `deploy-bot.yml`, `build-desktop.yml`

---

## Phase 9: Desktop App (Java 21 + JavaFX)

### Task 9.1: Java project setup
**Files:** `desktop/build.gradle`, `desktop/settings.gradle`, `desktop/src/main/java/com/hackathon/App.java`
- Gradle project with JavaFX plugins
- jpackage configuration for .exe/.AppImage

### Task 9.2: Convex Java client
**Files:** `desktop/src/main/java/com/hackathon/convex/ConvexClient.java`
- HTTP client using java.net.http.HttpClient
- Methods for queries and mutations

### Task 9.3: JavaFX UI
**Files:** Controllers + FXML views per page
- Login, Dashboard, Chat, Timer views
- Match web styling with CSS

---

## Phase 10: Polish + Testing + Seed Data

### Task 10.1: Seed data mutation
**Files:** `convex/seed.ts`
- Create test users, event, groups, messages, etc.

### Task 10.2: Loading + error states
Ensure all pages have spinner loading states and error states with retry buttons

### Task 10.3: Responsive design
Verify all pages work on mobile via Tailwind responsive classes

### Task 10.4: Toast notifications
Wire success/error toasts to all mutations
