import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "check-timers",
  { seconds: 30 },
  internal.mutations.timer.checkTimers,
);

crons.interval(
  "sync-discord",
  { seconds: 60 },
  internal.mutations.discord.syncDiscord,
);

export default crons;
