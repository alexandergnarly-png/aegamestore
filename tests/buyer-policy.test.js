const assert = require("node:assert/strict");
const fs = require("node:fs");
const { getBuyerBadgeCode } = require("../server/buyer-policy");

assert.equal(getBuyerBadgeCode(0, 0), "entry");
assert.equal(getBuyerBadgeCode(1, 0), "verified");
assert.equal(getBuyerBadgeCode(5, 0), "prime");
assert.equal(getBuyerBadgeCode(0, 300000), "prime");
assert.equal(getBuyerBadgeCode(15, 0), "prestige");
assert.equal(getBuyerBadgeCode(0, 1000000), "prestige");
assert.equal(getBuyerBadgeCode(30, 0), "sovereign");
assert.equal(getBuyerBadgeCode(0, 2500000), "sovereign");

const server = fs.readFileSync("server.js", "utf8");
for (const marker of [
  "NOW() - INTERVAL '7 days'",
  "NOT EXISTS (SELECT 1 FROM orders",
  "NOT EXISTS (SELECT 1 FROM wallet_topup_requests",
  "NOT EXISTS (SELECT 1 FROM wallet_ledger",
  "NOT EXISTS (SELECT 1 FROM reviews",
  "w.balance <> 0",
  "u.badge_override",
  "startDormantAccountCleanup()",
]) assert.ok(server.includes(marker), `Missing dormant-account policy: ${marker}`);

console.log("Buyer badge and dormant-account policy checks passed.");
