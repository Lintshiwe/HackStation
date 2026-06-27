#!/usr/bin/env python3
import json, http.server, urllib.parse, hashlib, os, re

PORT = 8001

events_db = [
    {"_id": "evt1", "name": "HackStation 2026", "description": "Main hackathon event",
     "startTime": 1750000000000, "endTime": 1850000000000, "status": "active", "timezone": "UTC"}
]
registrations_db = [
    {"_id": "reg1", "eventId": "evt1", "email": "test@hacker.com", "name": "Test Hacker",
     "status": "accepted", "skills": ["python", "js"], "experience": "intermediate",
     "createdAt": 1700000000000, "screeningScore": 85},
    {"_id": "reg2", "eventId": "evt1", "email": "beginner@test.com", "name": "New Hacker",
     "status": "pending", "skills": ["html", "css"], "experience": "beginner",
     "createdAt": 1700000001000}
]
discord_state = {"guildId": "1520185168579788851", "channelId": "announcements", "webhookUrl": ""}
announcements_db = [{"_id": "ann1", "eventId": "evt1", "title": "Welcome!", "content": "Welcome to HackStation",
                      "priority": "high", "createdAt": 1700000000000, "mirroredToDiscord": False}]
groups_db = [{"_id": "grp1", "eventId": "evt1", "name": "Team Alpha", "members": ["user1", "user2"],
              "projectRepo": "https://github.com/test/project"}]
users_db = [{"_id": "user1", "name": "Test User", "email": "test@hacker.com", "role": "hacker"}]
badges_db = []
messages_db = [{"_id": "msg1", "channelId": "general", "senderId": "user1", "senderName": "Test User",
                "content": "Hello hackathon!", "createdAt": 1700000002000}]
criteria_db = [{"_id": "crit1", "eventId": "evt1", "name": "Innovation", "weight": 30}]
scores_db = []
sponsors_db = [{"_id": "sp1", "eventId": "evt1", "name": "Test Sponsor", "tier": "gold", "website": "https://test.com"}]
schedule_db = [{"_id": "sched1", "eventId": "evt1", "title": "Opening Ceremony",
                "startTime": 1750000000000, "endTime": 1753600000000}]
timer_db = {"_id": "timer1", "eventId": "evt1", "phase": "running", "remainingMs": 3600000}
alerts_db = [{"_id": "alert1", "eventId": "evt1", "title": "Network Issue", "status": "open",
              "createdAt": 1700000000000}]
teamFinder_db = [{"_id": "tf1", "eventId": "evt1", "userId": "user1", "skills": ["python"],
                  "lookingFor": "frontend", "active": True}]

def find(collection, key, val):
    for item in collection:
        if item.get(key) == val:
            return item
    return None

def find_all(collection, key, val):
    return [i for i in collection if i.get(key) == val]

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/ping":
            return self.send_json({"ok": True, "timestamp": 1780000000000})
        self.send_json({"error": "not_found"}, 404)

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length > 0 else {}

        fn_name = body.get("path", path) if path in ("/api/query","/api/mutation","/api/action") else path
        args = body.get("args", {}) if path in ("/api/query","/api/mutation","/api/action") else body

        # ---- n8n native webhooks (direct paths) ----
        if path == "/api/n8n/screening-complete":
            for r in registrations_db:
                if r["_id"] == body.get("registrationId"):
                    r["status"] = body.get("status", "accepted")
                    r["screeningScore"] = body.get("screeningScore")
                    break
            return self.send_json({"ok": True})
        if path == "/api/n8n/send-invite":
            return self.send_json({"ok": True, "inviteUrl": "https://discord.gg/test"})
        if path == "/api/n8n/send-certificate":
            return self.send_json({"ok": True})

        # ---- Dynamic Convex-style routing by path ----
        if fn_name.endswith("events:listEvents"):
            return self.send_json(events_db)
        if fn_name.endswith("events:getEvent"):
            return self.send_json(events_db[0] if events_db else None)
        if fn_name.endswith("events:createEvent"):
            return self.send_json({"_id": "evt_new"})
        if fn_name.endswith("events:updateEvent"):
            return self.send_json({"ok": True})
        if fn_name.endswith("events:deleteEvent"):
            return self.send_json({"ok": True})

        if fn_name.endswith("users:listUsers") or fn_name.endswith("users:listByEvent"):
            return self.send_json(users_db)
        if fn_name.endswith("users:listByRole"):
            return self.send_json(users_db)
        if fn_name.endswith("users:getUser"):
            return self.send_json(find(users_db, "_id", args.get("id", "")))
        if fn_name.endswith("users:updateProfile"):
            return self.send_json({"ok": True})
        if fn_name.endswith("users:banUser"):
            return self.send_json({"ok": True})

        if fn_name.endswith("auth:register"):
            uid = "user_" + hashlib.md5(args.get("email","").encode()).hexdigest()[:8]
            users_db.append({"_id": uid, "name": args.get("name"), "email": args.get("email"),
                             "password": args.get("password",""), "role": args.get("role","hacker")})
            return self.send_json({"userId": uid, "token": "mock-token-"+uid,
                                   "name": args.get("name"), "role": args.get("role","hacker")})
        if fn_name.endswith("auth:login"):
            u = find(users_db, "email", args.get("email",""))
            if u and u.get("password") == args.get("password",""):
                return self.send_json({"userId": u["_id"], "token": "mock-token-"+u["_id"],
                                       "name": u.get("name",""), "role": u.get("role","hacker")})
            if u:
                return self.send_json({"error": "Invalid credentials"})
            return self.send_json({"error": "User not found"})

        if fn_name.endswith("registrations:listByEvent"):
            if "eventId" in args:
                return self.send_json(find_all(registrations_db, "eventId", args["eventId"]))
            return self.send_json(registrations_db)
        if fn_name.endswith("registrations:getRegistration"):
            r = find(registrations_db, "_id", args.get("id",""))
            return self.send_json(r)
        if fn_name.endswith("registrations:listByEmail"):
            r = find(registrations_db, "email", args.get("email",""))
            return self.send_json([r] if r else [])
        if fn_name.endswith("registrations:getByEmailEvent"):
            r = find(registrations_db, "email", args.get("email",""))
            return self.send_json(r)
        if fn_name.endswith("registrations:submitRegistration"):
            return self.send_json({"_id": "reg_new"})
        if fn_name.endswith("registrations:updateRegistrationStatus") or fn_name.endswith("registrations:updateStatus"):
            for r in registrations_db:
                if r["_id"] == args.get("id"):
                    r["status"] = args.get("status", r["status"])
                    break
            return self.send_json({"ok": True})
        if fn_name.endswith("registrations:create") or fn_name.endswith("registrations:submitRegistration"):
            return self.send_json({"_id": "reg_new"})
        if fn_name.endswith("registrations:delete"):
            return self.send_json({"ok": True})
        if fn_name.endswith("registrations:linkRegistrationToUser"):
            return self.send_json({"ok": True})

        if fn_name.endswith("groups:listGroupsByEvent"):
            if "eventId" in args:
                return self.send_json(find_all(groups_db, "eventId", args["eventId"]))
            return self.send_json(groups_db)
        if fn_name.endswith("groups:getGroup"):
            return self.send_json(find(groups_db, "_id", args.get("id", "")))
        if fn_name.endswith("groups:listMyGroups"):
            return self.send_json(groups_db)
        if fn_name.endswith("groups:createGroup"):
            return self.send_json({"_id": "grp_new"})
        if fn_name.endswith("groups:updateGroup"):
            return self.send_json({"ok": True})
        if fn_name.endswith("groups:deleteGroup"):
            return self.send_json({"ok": True})
        if fn_name.endswith("groups:shuffleMembers"):
            return self.send_json({"ok": True})
        if fn_name.endswith("groups:swapMembers"):
            return self.send_json({"ok": True})

        if fn_name.endswith("announcements:listByEvent"):
            if "eventId" in args:
                return self.send_json(find_all(announcements_db, "eventId", args["eventId"]))
            return self.send_json(announcements_db)
        if fn_name.endswith("announcements:getAnnouncement"):
            return self.send_json(find(announcements_db, "_id", args.get("id","")))
        if fn_name.endswith("announcements:createAnnouncement") or fn_name.endswith("announcements:create"):
            return self.send_json({"_id": "ann_new"})
        if fn_name.endswith("announcements:deleteAnnouncement") or fn_name.endswith("announcements:delete"):
            return self.send_json({"ok": True})
        if fn_name.endswith("announcements:updateAnnouncement") or fn_name.endswith("announcements:updateAnnouncement") or fn_name.endswith("announcements:update"):
            return self.send_json({"ok": True})

        if fn_name.endswith("timer:getTimer"):
            return self.send_json(timer_db)
        if fn_name.endswith("timer:startTimer") or fn_name.endswith("timer:pauseTimer") or \
           fn_name.endswith("timer:resumeTimer") or fn_name.endswith("timer:setTimerStatus") or \
           fn_name.endswith("timer:checkTimers") or fn_name.endswith("timer:setTimer"):
            return self.send_json({"ok": True})
        if fn_name.endswith("timer:extendCurrentPhase"):
            return self.send_json({"ok": True})

        if fn_name.endswith("schedule:listByEvent"):
            if "eventId" in args:
                return self.send_json(find_all(schedule_db, "eventId", args["eventId"]))
            return self.send_json(schedule_db)
        if fn_name.endswith("schedule:getScheduleItem"):
            return self.send_json(find(schedule_db, "_id", args.get("id","")))
        if fn_name.endswith("schedule:addScheduleItem") or fn_name.endswith("schedule:createItem"):
            return self.send_json({"_id": "sched_new"})
        if fn_name.endswith("schedule:updateScheduleItem") or fn_name.endswith("schedule:updateItem"):
            return self.send_json({"ok": True})
        if fn_name.endswith("schedule:deleteScheduleItem") or fn_name.endswith("schedule:deleteItem"):
            return self.send_json({"ok": True})

        if fn_name.endswith("sponsors:listByEvent"):
            if "eventId" in args:
                return self.send_json(find_all(sponsors_db, "eventId", args["eventId"]))
            return self.send_json(sponsors_db)
        if fn_name.endswith("sponsors:getSponsor"):
            return self.send_json(find(sponsors_db, "_id", args.get("id","")))
        if fn_name.endswith("sponsors:addSponsor"):
            return self.send_json({"_id": "sp_new"})
        if fn_name.endswith("sponsors:updateSponsor"):
            return self.send_json({"ok": True})
        if fn_name.endswith("sponsors:deleteSponsor"):
            return self.send_json({"ok": True})

        if fn_name.endswith("judging:listCriteria"):
            if "eventId" in args:
                return self.send_json(find_all(criteria_db, "eventId", args["eventId"]))
            return self.send_json(criteria_db)
        if fn_name.endswith("judging:listScoresByGroup"):
            return self.send_json(find_all(scores_db, "groupId", args.get("groupId","")))
        if fn_name.endswith("judging:listScoresByJudge"):
            return self.send_json(find_all(scores_db, "judgeId", args.get("judgeId","")))
        if fn_name.endswith("judging:addCriterion") or fn_name.endswith("judging:createCriteria") or \
           fn_name.endswith("judging:updateCriterion") or fn_name.endswith("judging:updateCriteria") or \
           fn_name.endswith("judging:deleteCriterion") or fn_name.endswith("judging:deleteCriteria"):
            return self.send_json({"ok": True})
        if fn_name.endswith("judging:submitScore") or fn_name.endswith("judging:updateScore"):
            return self.send_json({"ok": True, "scoreId": "score_new"})

        if fn_name.endswith("chat:listMessages"):
            return self.send_json(messages_db)
        if fn_name.endswith("chat:getMessage"):
            return self.send_json(find(messages_db, "_id", args.get("id","")))
        if fn_name.endswith("chat:sendMessage"):
            return self.send_json({"_id": "msg_new"})
        if fn_name.endswith("chat:deleteMessage"):
            return self.send_json({"ok": True})

        if fn_name.endswith("badges:listByUserAndEvent"):
            return self.send_json([])
        if fn_name.endswith("badges:getBadge"):
            return self.send_json(find(badges_db, "_id", args.get("id","")))
        if fn_name.endswith("badges:awardBadge"):
            return self.send_json({"_id": "badge_new"})
        if fn_name.endswith("badges:revokeBadge"):
            return self.send_json({"ok": True})

        if fn_name.endswith("alerts:listByEventAndStatus"):
            result = alerts_db
            if "eventId" in args:
                result = find_all(result, "eventId", args["eventId"])
            if "status" in args:
                result = find_all(result, "status", args["status"])
            return self.send_json(result)
        if fn_name.endswith("alerts:getAlert"):
            return self.send_json(find(alerts_db, "_id", args.get("id","")))
        if fn_name.endswith("alerts:createAlert"):
            return self.send_json({"_id": "alert_new"})
        if fn_name.endswith("alerts:assignAlert") or fn_name.endswith("alerts:updateAlert"):
            return self.send_json({"ok": True})
        if fn_name.endswith("alerts:resolveAlert"):
            return self.send_json({"ok": True})

        if fn_name.endswith("teamFinder:listActiveByEvent"):
            result = find_all(teamFinder_db, "eventId", args.get("eventId", ""))
            return self.send_json([t for t in result if t.get("active", False)])
        if fn_name.endswith("teamFinder:getPost"):
            return self.send_json(find(teamFinder_db, "_id", args.get("id","")))
        if fn_name.endswith("teamFinder:createPost") or fn_name.endswith("teamFinder:updatePost") or \
           fn_name.endswith("teamFinder:deactivatePost") or fn_name.endswith("teamFinder:deletePost"):
            return self.send_json({"ok": True})

        if fn_name.endswith("discord:getDiscordState"):
            return self.send_json(discord_state)
        if fn_name.endswith("discord:getGroupChannel"):
            return self.send_json({"channelId": "grp_channel"})
        if fn_name.endswith("discord:updateDiscordState") or fn_name.endswith("discord:updateState") or \
           fn_name.endswith("discord:saveGroupChannel") or fn_name.endswith("discord:createChannel") or \
           fn_name.endswith("discord:syncDiscord"):
            return self.send_json({"ok": True})

        self.send_json({"error": f"not_found: {fn_name}"}, 404)

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        print(f"[Mock] {args[0]} {args[1]}")

if __name__ == "__main__":
    server = http.server.HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Mock Convex server on http://localhost:{PORT}")
    server.serve_forever()
