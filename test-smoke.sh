#!/usr/bin/env bash
set -u
P=0; F=0; ERRS=""; S="\e[32m"; E="\e[0m"; R="\e[31m"
API="http://127.0.0.1:8001"; WEB="http://localhost:8088"; OWK="owa_k1_dce7abe2bf56ffb6ced23d329589bcc1cf55a0bf7304f8b25d6d2a26cf9e60d2"
ok() { echo -e "  ${S}PASS${E}  $1"; ((P++)); }
fl() { echo -e "  ${R}FAIL${E}  $1"; ERRS+="FAIL: $1"$'\n'; ((F++)); }
t() { local m="$1"; shift; if "$@" >/dev/null 2>&1; then ok "$m"; else fl "$m"; fi; }
ec() { local m="$1"; shift; if echo "$("$@")" | python3 -c "$2" 2>/dev/null; then ok "$m"; else fl "$m"; fi; }

echo "==== HACKSTATION FULL SMOKE TEST ===="
echo ""

echo "--- 1. SERVICES ---"
t "Mock Convex"  curl -sf --connect-timeout 2 "$API/api/ping" -o /dev/null
t "Web Frontend" curl -sf --connect-timeout 2 "$WEB/" -o /dev/null
t "n8n"          curl -sf --connect-timeout 2 http://localhost:5678/healthz -o /dev/null
t "OpenWA"       curl -sf --connect-timeout 2 http://localhost:2785/api/sessions -H "x-api-key: $OWK" -o /dev/null

echo "--- 2. STATIC ASSETS (8088) ---"
for a in "" index.html css/app.css css/style.css css/components.css js/app.js js/router.js js/auth.js js/convex-client.js js/utils.js images/Favicon.png images/HacStationLogo.png; do
  [ "$(curl -s --connect-timeout 2 -o /dev/null -w '%{http_code}' "$WEB/$a" 2>/dev/null)" = "200" ] && ok "200 /$a" || fl "200 /$a"
done

echo "--- 3. PAGE SCRIPTS (21) ---"
for p in $(find /home/ntoampi/Documents/Projects/HackStation/web/js/pages -name "*.js" | sed 's|.*/web/||'); do
  [ "$(curl -s --connect-timeout 2 -o /dev/null -w '%{http_code}' "$WEB/$p" 2>/dev/null)" = "200" ] && ok "200 $p" || fl "200 $p"
done

echo "--- 4. CONVEX AUTH ---"
R1=$(curl -sf -X POST "$API/api/mutation" -H "Content-Type: application/json" \
  -d '{"path":"auth:register","args":{"name":"Smoke","email":"s@t.com","password":"x","role":"hacker"}}' 2>/dev/null)
echo "$R1" | python3 -c "import json,sys; exit(0 if 'userId' in json.load(sys.stdin) else 1)" 2>/dev/null && ok "Register" || fl "Register"

R2=$(curl -sf -X POST "$API/api/mutation" -H "Content-Type: application/json" \
  -d '{"path":"auth:login","args":{"email":"s@t.com","password":"x"}}' 2>/dev/null)
echo "$R2" | python3 -c "import json,sys; exit(0 if 'token' in json.load(sys.stdin) else 1)" 2>/dev/null && ok "Login OK" || fl "Login OK"

R3=$(curl -sf -X POST "$API/api/mutation" -H "Content-Type: application/json" \
  -d '{"path":"auth:login","args":{"email":"s@t.com","password":"wrong"}}' 2>/dev/null)
echo "$R3" | python3 -c "import json,sys; exit(0 if 'error' in json.load(sys.stdin) else 1)" 2>/dev/null && ok "Login bad pw rejects" || fl "Login bad pw rejects"

echo "--- 5. CONVEX QUERIES (30) ---"
for q in events:listEvents events:getEvent users:listByEvent users:listByRole groups:listGroupsByEvent groups:getGroup groups:listMyGroups chat:listMessages chat:getMessage announcements:listByEvent announcements:getAnnouncement alerts:listByEventAndStatus alerts:getAlert registrations:listByEvent registrations:getRegistration registrations:listByEmail timer:getTimer schedule:listByEvent schedule:getScheduleItem judging:listCriteria judging:listScoresByGroup judging:listScoresByJudge sponsors:listByEvent sponsors:getSponsor badges:listByUserAndEvent badges:getBadge teamFinder:listActiveByEvent teamFinder:getPost discord:getDiscordState discord:getGroupChannel; do
  s=$(curl -s --connect-timeout 2 -X POST "$API/api/query" -H "Content-Type: application/json" -d "{\"path\":\"$q\",\"args\":{}}" -o /dev/null -w '%{http_code}' 2>/dev/null)
  [ "$s" = "200" ] && ok "200 $q" || fl "200 $q ($s)"
done

echo "--- 6. CONVEX MUTATIONS (36) ---"
for m in auth:register auth:login groups:createGroup groups:updateGroup groups:deleteGroup groups:shuffleMembers chat:sendMessage announcements:create announcements:update announcements:delete alerts:createAlert alerts:updateAlert alerts:resolveAlert registrations:create registrations:updateStatus registrations:delete timer:startTimer timer:pauseTimer timer:resumeTimer timer:setTimer schedule:createItem schedule:updateItem schedule:deleteItem judging:createCriteria judging:updateCriteria judging:deleteCriteria judging:submitScore judging:updateScore sponsors:addSponsor sponsors:updateSponsor sponsors:deleteSponsor badges:awardBadge teamFinder:createPost teamFinder:deletePost discord:updateState discord:createChannel; do
  s=$(curl -s --connect-timeout 2 -X POST "$API/api/mutation" -H "Content-Type: application/json" -d "{\"path\":\"$m\",\"args\":{}}" -o /dev/null -w '%{http_code}' 2>/dev/null)
  [ "$s" = "200" ] && ok "200 $m" || fl "200 $m ($s)"
done

echo "--- 7. n8n WEBHOOKS ---"
R=$(curl -sf -X POST "$API/api/n8n/screening-complete" -H "Content-Type: application/json" \
  -d '{"registrationId":"reg1","status":"accepted","screeningScore":88}' 2>/dev/null)
echo "$R" | python3 -c "import json,sys; exit(0 if json.load(sys.stdin).get('ok') else 1)" 2>/dev/null && ok "Screening webhook" || fl "Screening webhook"

R=$(curl -sf -X POST "$API/api/n8n/send-invite" -H "Content-Type: application/json" \
  -d '{"email":"t@t.com","discordUsername":"tester"}' 2>/dev/null)
echo "$R" | python3 -c "import json,sys; exit(0 if json.load(sys.stdin).get('inviteUrl') else 1)" 2>/dev/null && ok "Discord invite webhook" || fl "Discord invite webhook"

R=$(curl -sf -X POST "$API/api/n8n/send-certificate" -H "Content-Type: application/json" \
  -d '{"userId":"u1","eventId":"evt1"}' 2>/dev/null)
echo "$R" | python3 -c "import json,sys; exit(0 if json.load(sys.stdin).get('ok') else 1)" 2>/dev/null && ok "Certificate webhook" || fl "Certificate webhook"

echo "--- 8. FULL REGISTRATION FLOW ---"
t "Reg: list registrations" curl -sf -X POST "$API/api/query" -H "Content-Type: application/json" \
  -d '{"path":"registrations:listByEvent","args":{}}' -o /dev/null
t "Reg: screen to accepted" curl -sf -X POST "$API/api/n8n/screening-complete" \
  -H "Content-Type: application/json" -d '{"registrationId":"reg1","status":"accepted"}' -o /dev/null
R=$(curl -sf -X POST "$API/api/query" -H "Content-Type: application/json" \
  -d '{"path":"registrations:listByEvent","args":{}}' 2>/dev/null)
echo "$R" | python3 -c "import json,sys; d=json.load(sys.stdin); exit(0 if any(r.get('status')=='accepted' for r in d) else 1)" 2>/dev/null && ok "Reg: verify accepted" || fl "Reg: verify accepted"
t "Reg: award badge" curl -sf -X POST "$API/api/mutation" -H "Content-Type: application/json" \
  -d '{"path":"badges:awardBadge","args":{"userId":"u1","name":"Winner"}}' -o /dev/null

echo "--- 9. DISCORD BOT ---"
t "Process alive" pgrep -f "node.*discord-bot"
for cmd in help status team schedule link; do
  t "cmd: $cmd" test -f "/home/ntoampi/Documents/Projects/HackStation/discord-bot/src/commands/$cmd.js"
done

echo "--- 10. JAVA DESKTOP ---"
J="/home/ntoampi/Documents/Projects/HackStation/desktop/build/libs/HackStation-1.0.0.jar"
t "JAR exists" test -f "$J"
t "App.class" jar tf "$J" 2>/dev/null | grep -q "App.class"
t "Controllers" jar tf "$J" 2>/dev/null | grep -q "controllers"
t "Models" jar tf "$J" 2>/dev/null | grep -q "models"
for f in login dashboard chat timer; do
  t "fxml: $f" test -f "/home/ntoampi/Documents/Projects/HackStation/desktop/src/main/resources/$f.fxml"
done

echo "--- 11. n8n FILES ---"
for w in 01-registration-screening 02-discord-invite 03-deadline-reminders 04-certificate-generator 05-group-sync 06-discord-announcement-mirror; do
  t "workflow: $w" test -f "/home/ntoampi/Documents/Projects/HackStation/n8n/workflows/$w.json"
done

echo "--- 12. DEPLOYMENT ---"
t "netlify" test -f /home/ntoampi/Documents/Projects/HackStation/web/netlify.toml
t "gh: deploy-web" test -f /home/ntoampi/Documents/Projects/HackStation/.github/workflows/deploy-web.yml
t "gh: deploy-convex" test -f /home/ntoampi/Documents/Projects/HackStation/.github/workflows/deploy-convex.yml
t "gh: keepalive" test -f /home/ntoampi/Documents/Projects/HackStation/.github/workflows/keepalive-discord-bot.yml
t "gh: build-desktop" test -f /home/ntoampi/Documents/Projects/HackStation/.github/workflows/build-desktop.yml

echo ""
echo "============"
echo "  PASS: $P"
echo "  FAIL: $F"
[ -n "$ERRS" ] && echo "" && echo "FAILURES:" && echo "$ERRS"
echo "============"
