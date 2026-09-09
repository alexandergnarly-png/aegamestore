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
assert.match(route, /max_output_tokens: 180/);
assert.match(route, /Sound like a friendly human store assistant/);
assert.match(route, /Never use Markdown, bullets, numbered lists, headings, tables, or dash separators/);
assert.match(route, /Answer in one or two short sentences by default/);
assert.match(route, /WHERE p\.active = 1/);
assert.match(route, /price_idr/);
assert.match(route, /buildAssistantPlan\(message, catalog, history, language\)/);
assert.match(route, /isGroundedCatalogReply\(answer, plan, catalog\)/);
assert.match(route, /if \(!apiKey\) return res\.json\(\{ answer: localAnswer, mode: "catalog" \}\)/);
assert.doesNotMatch(route, /supplier_cost|api_secret|game_key|password_hash/);
assert.doesNotMatch(route, /console\.(log|error)\([^\n]*message/);

const { buildAssistantPlan, readBudget, durationHours, isGroundedCatalogReply } = require("../server/customer-assistant");
const buildLocalCatalogReply = (...args) => buildAssistantPlan(...args).answer;
const sampleCatalog = [
  { game: "Delta Force", brand: "Nike", duration: "1 Hari", platform: "android", price_idr: 40000, stock: 5 },
  { game: "Delta Force", brand: "Aorus", duration: "1 Hari", platform: "android", price_idr: 30000, stock: 2 },
  { game: "PUBG", brand: "Basic", duration: "1 Hari", platform: "ios", price_idr: 20000, stock: 0 },
];
const localReply = buildLocalCatalogReply("Delta Force Android paling murah", sampleCatalog);
assert.match(localReply, /Aorus/);
assert.match(localReply, /paling hemat/);
assert.doesNotMatch(localReply, /PUBG/);
assert.doesNotMatch(localReply, /\n|^\d+\.|—| - /);
assert.ok((localReply.match(/[.!?](?:\s|$)/g) || []).length <= 2, "local reply should stay conversational and short");

const stockReply = buildLocalCatalogReply("stok Delta Force paling banyak", sampleCatalog);
assert.match(stockReply, /Nike/);
assert.match(stockReply, /Stok paling aman/);

const compareReply = buildLocalCatalogReply("bandingkan Nike vs Aorus Delta Force", sampleCatalog);
assert.match(compareReply, /lebih hemat/);
assert.match(compareReply, /selisih Rp10\.000/);

const alternativeReply = buildLocalCatalogReply(
  "yang lain",
  sampleCatalog,
  [
    { role: "user", content: "Delta Force Android paling murah" },
    { role: "assistant", content: "Yang paling hemat adalah Delta Force Aorus, 1 Hari." },
  ],
);
assert.match(alternativeReply, /Nike/);
assert.match(alternativeReply, /Alternatif lainnya/);

console.log("AI assistant security contract check passed.");
assert.match(buildLocalCatalogReply("hi", sampleCatalog, [], "en"), /Hey/);
assert.match(buildLocalCatalogReply("sudah bayar belum masuk", sampleCatalog), /Order ID/);
assert.match(buildLocalCatalogReply("refund", sampleCatalog, [], "en"), /can't check/);
assert.match(buildLocalCatalogReply("admin dong", sampleCatalog), /Telegram/);
assert.match(buildLocalCatalogReply("makasih", sampleCatalog), /Sama-sama/);
assert.doesNotMatch(buildLocalCatalogReply("PUBG ios murah", sampleCatalog), /Aorus|Nike/);
assert.doesNotMatch(buildLocalCatalogReply("kalau ios", sampleCatalog, [{ role: "user", content: "Delta Force Android" }]), /Aorus|Nike/);

assert.equal(readBudget("budget 50rb"), 50000);
assert.equal(readBudget("50rb"), 50000);
assert.equal(readBudget("1 hari"), null);
assert.equal(readBudget("budget rp 50.000"), 50000);
assert.equal(readBudget("max 1,5 juta"), 1500000);
assert.equal(durationHours("7 Hari"), 168);
assert.equal(durationHours("6 Jam"), 6);
const expanded = [...sampleCatalog,
  { game: "Delta Force", brand: "Aorus", duration: "7 Hari", platform: "android", price_idr: 120000, stock: 4 },
  { game: "Delta Force", brand: "Nike", duration: "1 Hari", platform: "ios", price_idr: 45000, stock: 2 },
  { game: "Blood Strike", brand: "Xeno", duration: "1 Hari", platform: "android", price_idr: 25000, stock: 3 },
];
const turns = [
  { role: "user", content: "Delta Force Android" },
  { role: "assistant", content: "Mau berapa hari?" },
  { role: "user", content: "7 hari" },
  { role: "assistant", content: "Ada budget?" },
];
let plan = buildAssistantPlan("budget 150rb", expanded, turns);
assert.equal(plan.candidates[0].duration, "7 Hari");
assert.equal(plan.filters.games[0], "Delta Force");
assert.equal(plan.filters.budget, 150000);
plan = buildAssistantPlan("kalau ios 1 hari", expanded, turns);
assert.equal(plan.candidates[0].platform, "ios");
assert.equal(plan.candidates[0].duration, "1 Hari");
plan = buildAssistantPlan("Blood Strike", expanded, turns);
assert.equal(plan.candidates[0].game, "Blood Strike");
assert.equal(plan.filters.duration, null, "Changing game resets stale duration");
assert.equal(buildAssistantPlan("rekomendasi dong", expanded).kind, "clarify");
assert.equal(buildAssistantPlan("Delta Force", expanded).kind, "clarify");
assert.equal(buildAssistantPlan("cuaca hari ini", expanded, turns).kind, "clarify");
assert.equal(buildAssistantPlan("df android 1 hari", expanded).candidates[0].game, "Delta Force");
assert.match(buildLocalCatalogReply("Delta Force Android budget 10rb", expanded), /mulai Rp30.000/);
assert.match(buildLocalCatalogReply("PUBG", expanded), /stoknya sedang kosong/);
assert.match(buildLocalCatalogReply("Delta Force Android 30 hari", expanded), /belum ada di katalog/);
assert.match(buildLocalCatalogReply("Delta Force budget $10", expanded), /rupiah/);
assert.equal(buildAssistantPlan("sudah bayar", []).kind, "support", "Payment help must not require catalog access");
assert.match(buildLocalCatalogReply("key invalid", []), /bukan key lengkap/);
assert.match(buildLocalCatalogReply("kasih voucher", []), /divalidasi/);
plan = buildAssistantPlan("Delta Force Android 1 hari murah", expanded);
assert.equal(isGroundedCatalogReply(plan.answer, plan, expanded), true);
assert.equal(isGroundedCatalogReply(plan.answer.replace("Rp30.000", "Rp1.000"), plan, expanded), false);
assert.equal(isGroundedCatalogReply(plan.answer + " Dijamin aman", plan, expanded), false);
assert.equal(isGroundedCatalogReply(plan.answer + " Blood Strike", plan, expanded), false);
assert.equal(isGroundedCatalogReply("", plan, expanded), false);
console.log("Assistant context, constraints, support routing, and grounding checks passed.");
