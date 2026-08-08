const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const { verifyCheatGameWebhook } = require("../server/cheatgame-utils");

const timestamp = "1786172400";
const eventId = "wh_test_123";
const rawBody = '{"external_ref":"ORDER-test","order_id":"RSAPI-test"}';
const secret = "test-webhook-secret";
const signature = `sha256=${crypto.createHmac("sha256", secret).update(`${timestamp}.${eventId}.${rawBody}`).digest("hex")}`;

assert.ok(verifyCheatGameWebhook({ timestamp, eventId, rawBody, signature, secret, now: Number(timestamp) * 1000 }));
assert.ok(!verifyCheatGameWebhook({ timestamp, eventId, rawBody: rawBody + " ", signature, secret, now: Number(timestamp) * 1000 }));
assert.ok(!verifyCheatGameWebhook({ timestamp, eventId, rawBody, signature, secret, now: (Number(timestamp) + 301) * 1000 }));

const server = fs.readFileSync("server.js", "utf8");
const admin = fs.readFileSync("views/admin.html", "utf8");
for (const marker of [
  'const CHEATGAME_API_URL = "https://cheatgame.online/reseller_api.php"',
  'app.post("/api/webhooks/cheatgame"',
  'eventType !== "order.success"',
  "ON CONFLICT (event_id) DO NOTHING",
  'source: "cheatgame"',
  'value="cheatgame_api">CHEATGAME API',
]) {
  assert.ok(server.includes(marker) || admin.includes(marker), `Missing CHEATGAME marker: ${marker}`);
}

console.log("CHEATGAME integration checks passed.");
