# HackStation — Hackathon Management Platform

## Overview

Name: **HackStation**
Purpose: Cross-platform hackathon event management for organisers, mentors, judges, and participants (hackers).

Based on the spec in `code.txt`, adapted per user decisions.

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Backend | Convex (TypeScript, serverless DB + real-time) |
| Web Frontend | HTML + CSS + JS (vanilla, Tailwind CSS via CDN) |
| Desktop App | Java 21 + JavaFX (`.exe` / `.AppImage` via jpackage) |
| Discord Bot | Node.js + discord.js v14 (Admin permissions) |
| Automation | n8n (self-hosted, webhooks) |
| Icons | Lucide (CDN) |
| UI Primitives | Hand-crafted HTML/CSS matching shadcn styling |
| UI Effects | Magic UI effects adapted to CSS/JS (confetti, animated elements) |

### Deployment Targets
- Web: Netlify (static site, connects to Convex cloud)
- Discord Bot: Render (Docker service)
- Convex: Convex cloud (`npx convex deploy`)
- n8n: Self-hosted Docker or Render
- Desktop: GitHub Releases (`.exe` + `.AppImage` via GitHub Actions)

---

## Design System

**Style**: Light theme, minimalist, bright colors. No cyberpunk, no dark mode, no neon.

### Color Palette
- Canvas: `#FFFFFF` (white), `#F8F9FA` (cards), `#F1F3F5` (hover/sidebar)
- Borders: `#DEE2E6` (subtle), `#E9ECEF` (lighter dividers)
- Text: `#212529` (primary), `#495057` (secondary), `#868E96` (muted)
- Accent: `#228BE6` (blue — links, buttons, active), `#1C7ED6` (hover), `#E7F5FF` (light blue bg)
- Success: `#40C057` | Warning: `#FAB005` | Danger: `#FA5252` | Info: `#15AABF`

### Typography
- Headings: Plus Jakarta Sans (600, 700) | Body: Inter (400, 500, 600) | Code: JetBrains Mono
- Google Fonts CDN for all three

### Components (HTML/CSS shadcn-style)
Button, Card, Input, Textarea, Select, Modal, Badge, Avatar, Tabs, Dropdown, Tooltip, Spinner, EmptyState, ConfirmDialog, Toast, TimerWidget

### Icons
Lucide React via CDN — all UI icons use Lucide.

---

## Project Structure

```
hackstation/
├── convex/                    # Convex backend
│   ├── schema.ts              # Full DB schema (19 tables)
│   ├── http.ts                # HTTP actions (webhook endpoints)
│   ├── crons.ts               # Scheduled functions
│   ├── queries/               # Real-time queries (14 files)
│   ├── mutations/             # Data mutations (14 files)
│   └── actions/               # Async actions (n8nBridge, discordBridge)
│
├── web/                       # HTML + CSS + JS frontend
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── public/
│   │   ├── Favicon.png
│   │   ├── HacStationLogo.png
│   │   └── images/            # SVG illustrations
│   └── pages/                 # Role-based HTML pages
│
├── desktop/                   # Java 21 + JavaFX
│   └── src/main/java/com/hackathon/
│       ├── App.java
│       ├── controllers/
│       ├── views/
│       └── convex/
│           └── ConvexClient.java
│
├── discord-bot/               # Node.js + discord.js v14
│   ├── src/
│   │   ├── index.js
│   │   ├── config.js
│   │   ├── convex-client.js
│   │   ├── commands/
│   │   ├── events/
│   │   ├── tasks/
│   │   └── utils/
│   ├── Dockerfile
│   └── render.yaml
│
├── n8n/workflows/             # 6 n8n workflow JSONs
├── .github/workflows/         # 4 CI/CD workflows
├── .env                       # (gitignored)
└── .env.example
```

---

## Data Flow

- **Browser → Convex**: Queries (real-time subscriptions) + Mutations (CRUD)
- **Discord Bot → Convex**: HTTP API (fetch data)
- **Discord Bot → Discord Gateway**: Server management, commands, events
- **n8n → Convex**: Webhooks (event-driven)
- **n8n → Discord**: Webhooks (announcements)
- **Java Desktop → Convex**: HTTP API

---

## Pages by Role

### Hacker (5)
Home (timer + team + announcements), Chat (community/team tabs), My Team, Schedule, Help

### Organiser (11)
Dashboard, Groups (with shuffle), Registrations (accept/reject), Announcements, Timer, Wheel (Canvas spinning), Judging, Schedule, Alerts, Sponsors, Stats

### Mentor (3)
Home, Help Queue, Assigned Groups

### Judge (2)
Projects list, Scoring form

---

## Discord Bot

- **Features**: guildMemberAdd (auto-role), slash commands (/help, /status, /team, /schedule, /link), announcement mirror, timer sync, channel/role management
- **Permissions**: Administrator (int 8)
- **Client ID**: 1520185168579788851
- **Token**: Set in `.env`

---

## Convex Schema (19 tables)

users, events, eventMembers, groups, groupMembers, channels, messages, announcements, alerts, registrations, timer, judgingCriteria, scores, scheduleItems, teamFinderPosts, badges, sponsors, discordState, groupDiscordChannels

---

## Build Phases

1. Project setup + Convex schema + Auth + Layout shell
2. Hacker pages (Home, Chat, Team, Schedule, Help)
3. Organiser pages (Dashboard, Groups w/ shuffle, Registrations, Announcements)
4. Timer + Spinning Wheel + Alerts
5. Mentor pages + Judge pages
6. Discord bot
7. n8n workflows
8. Deployment configs (Netlify, Render, GitHub Actions)
9. Desktop app (JavaFX + Convex client)
10. Polish, seed data, testing
