import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/api/ping",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ ok: true, timestamp: Date.now() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/api/n8n/screening-complete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    const { registrationId, status, screeningScore, email, eventId } = body;

    if (registrationId) {
      await ctx.runMutation("mutations/registrations:updateRegistrationStatus", {
        registrationId,
        status: status ?? "accepted",
        screeningScore,
      });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (email && eventId) {
      const registration = await ctx.runQuery("queries/registrations:getByEmailEvent", {
        email,
        eventId,
      });
      if (!registration) {
        return new Response(JSON.stringify({ error: "Registration not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      await ctx.runMutation("mutations/registrations:updateRegistrationStatus", {
        registrationId: registration._id,
        status: status ?? "accepted",
        screeningScore,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Missing registrationId or email+eventId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
