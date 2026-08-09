const assert = require("node:assert/strict");
const fs = require("node:fs");

const server = fs.readFileSync("server.js", "utf8");
const routeStart = server.indexOf('app.post("/api/ai-assistant"');
const routeEnd = server.indexOf(
  "// Public list of currently active vouchers",
  routeStart,
);
const route = server.slice(routeStart, routeEnd);

assert.ok(routeStart > -1, "AI assistant route is missing");
assert.match(server, /persistentRateLimit\("ai-assistant"/);
assert.match(route, /process\.env\.OPENAI_API_KEY/);
assert.match(route, /process\.env\.OPENAI_MODEL \|\| "gpt-5\.6-luna"/);
assert.match(route, /https:\/\/api\.openai\.com\/v1\/responses/);
assert.match(route, /store: false/);
assert.match(route, /AbortSignal\.timeout\(20_000\)/);
assert.match(route, /WHERE p\.active = 1/);
assert.match(route, /price_idr/);
assert.doesNotMatch(route, /supplier_cost|api_secret|game_key|password_hash/);
assert.doesNotMatch(route, /console\.(log|error)\([^\n]*message/);

console.log("AI assistant security contract check passed.");
