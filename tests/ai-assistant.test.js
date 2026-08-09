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
assert.match(server, /function buildLocalCatalogReply\(message, catalog\)/);
assert.match(route, /if \(!apiKey\) return res\.json\(\{ answer: localAnswer, mode: "catalog" \}\)/);
assert.doesNotMatch(route, /supplier_cost|api_secret|game_key|password_hash/);
assert.doesNotMatch(route, /console\.(log|error)\([^\n]*message/);

const helperStart = server.indexOf("function buildLocalCatalogReply");
const helperEnd = server.indexOf('\n\napp.post("/api/ai-assistant"', helperStart);
const buildLocalCatalogReply = new Function(
  `${server.slice(helperStart, helperEnd)}; return buildLocalCatalogReply;`,
)();
const sampleCatalog = [
  { game: "Delta Force", brand: "Nike", duration: "1 Hari", platform: "android", price_idr: 40000, stock: 5 },
  { game: "Delta Force", brand: "Aorus", duration: "1 Hari", platform: "android", price_idr: 30000, stock: 2 },
  { game: "PUBG", brand: "Basic", duration: "1 Hari", platform: "ios", price_idr: 20000, stock: 0 },
];
const localReply = buildLocalCatalogReply("Delta Force Android paling murah", sampleCatalog);
assert.match(localReply, /Aorus/);
assert.doesNotMatch(localReply, /PUBG/);

console.log("AI assistant security contract check passed.");
