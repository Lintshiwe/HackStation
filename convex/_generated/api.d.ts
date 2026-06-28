/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as mutations_alerts from "../mutations/alerts.js";
import type * as mutations_announcements from "../mutations/announcements.js";
import type * as mutations_badges from "../mutations/badges.js";
import type * as mutations_chat from "../mutations/chat.js";
import type * as mutations_discord from "../mutations/discord.js";
import type * as mutations_events from "../mutations/events.js";
import type * as mutations_groups from "../mutations/groups.js";
import type * as mutations_judging from "../mutations/judging.js";
import type * as mutations_registrations from "../mutations/registrations.js";
import type * as mutations_schedule from "../mutations/schedule.js";
import type * as mutations_sponsors from "../mutations/sponsors.js";
import type * as mutations_teamFinder from "../mutations/teamFinder.js";
import type * as mutations_timer from "../mutations/timer.js";
import type * as mutations_users from "../mutations/users.js";
import type * as queries_alerts from "../queries/alerts.js";
import type * as queries_announcements from "../queries/announcements.js";
import type * as queries_badges from "../queries/badges.js";
import type * as queries_chat from "../queries/chat.js";
import type * as queries_discord from "../queries/discord.js";
import type * as queries_events from "../queries/events.js";
import type * as queries_groups from "../queries/groups.js";
import type * as queries_judging from "../queries/judging.js";
import type * as queries_registrations from "../queries/registrations.js";
import type * as queries_schedule from "../queries/schedule.js";
import type * as queries_sponsors from "../queries/sponsors.js";
import type * as queries_teamFinder from "../queries/teamFinder.js";
import type * as queries_timer from "../queries/timer.js";
import type * as queries_users from "../queries/users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  http: typeof http;
  "mutations/alerts": typeof mutations_alerts;
  "mutations/announcements": typeof mutations_announcements;
  "mutations/badges": typeof mutations_badges;
  "mutations/chat": typeof mutations_chat;
  "mutations/discord": typeof mutations_discord;
  "mutations/events": typeof mutations_events;
  "mutations/groups": typeof mutations_groups;
  "mutations/judging": typeof mutations_judging;
  "mutations/registrations": typeof mutations_registrations;
  "mutations/schedule": typeof mutations_schedule;
  "mutations/sponsors": typeof mutations_sponsors;
  "mutations/teamFinder": typeof mutations_teamFinder;
  "mutations/timer": typeof mutations_timer;
  "mutations/users": typeof mutations_users;
  "queries/alerts": typeof queries_alerts;
  "queries/announcements": typeof queries_announcements;
  "queries/badges": typeof queries_badges;
  "queries/chat": typeof queries_chat;
  "queries/discord": typeof queries_discord;
  "queries/events": typeof queries_events;
  "queries/groups": typeof queries_groups;
  "queries/judging": typeof queries_judging;
  "queries/registrations": typeof queries_registrations;
  "queries/schedule": typeof queries_schedule;
  "queries/sponsors": typeof queries_sponsors;
  "queries/teamFinder": typeof queries_teamFinder;
  "queries/timer": typeof queries_timer;
  "queries/users": typeof queries_users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
