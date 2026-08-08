const assert = require("node:assert/strict");
const fs = require("node:fs");
const { buildSupplierComparison } = require("../server/supplier-compare-utils");

const now = Date.parse("2026-08-08T08:00:00.000Z");
const offers = buildSupplierComparison(100000, [
  { supplier_source: "vipstore", price_idr: 75000, stock: 5, status: "ready", last_sync: "2026-08-08T07:59:00.000Z" },
  { supplier_source: "cheatgame", price_idr: 69000, stock: 2, status: "ready", last_sync: "2026-08-08T07:58:00.000Z" },
  { supplier_source: "stale", price_idr: 1000, stock: 9, status: "ready", last_sync: "2026-08-08T07:00:00.000Z" },
], now);

assert.equal(offers.find((offer) => offer.supplier_source === "cheatgame").cheapest, true);
assert.equal(offers.find((offer) => offer.supplier_source === "vipstore").difference_from_cheapest, 6000);
assert.equal(offers.find((offer) => offer.supplier_source === "stale").eligible, false);
assert.equal(offers.find((offer) => offer.supplier_source === "cheatgame").profit, 31000);

const server = fs.readFileSync("server.js", "utf8");
const admin = fs.readFileSync("views/admin.html", "utf8");
const migrations = fs.readFileSync("server/database-migrations.js", "utf8");
for (const marker of [
  "CREATE TABLE IF NOT EXISTS product_supplier_offers",
  'app.get("/api/admin/products/:productId/supplier-offers"',
  'app.post("/api/admin/products/:productId/supplier-offers/:source/select"',
  'id="supplierCompareModal"',
  "openSupplierComparison(${item.id}, this)",
]) {
  assert.ok(server.includes(marker) || admin.includes(marker) || migrations.includes(marker), `Missing supplier comparison marker: ${marker}`);
}

console.log("Supplier comparison checks passed.");
