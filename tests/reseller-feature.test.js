const assert = require("node:assert/strict");
const fs = require("node:fs");

const server = fs.readFileSync("server.js", "utf8");
const page = fs.readFileSync("public/reseller.html", "utf8");
const admin = fs.readFileSync("views/admin.html", "utf8");

[...page.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].forEach(
  ([, source]) => assert.doesNotThrow(() => new Function(source)),
);

[
  'app.get("/reseller"',
  'app.get("/api/reseller"',
  'app.post("/api/reseller/apply", requireUserCsrf',
  'app.get("/api/reseller/preview"',
  'reseller_status = \'approved\'',
  'resellerOrder && paymentMethod !== "midtrans"',
  'Voucher tidak dapat digabung dengan harga reseller',
  "getResellerPricing(productRow).unit_idr",
  "UPDATE orders SET pricing_tier = 'reseller'",
  'RESELLER_DISCOUNT_RATE',
].forEach((marker) => assert.ok(server.includes(marker), `Missing reseller server marker: ${marker}`));

[
  'id="balanceUsd"',
  'id="heroRate"',
  'id="checkoutButton"',
  'payment_method:"midtrans"',
  'reseller_order:true',
  '/(^|\\.)midtrans\\.com$/i',
  'USD hanya tampilan harga',
].forEach((marker) => assert.ok(page.includes(marker), `Missing reseller UI marker: ${marker}`));

assert.ok(admin.includes("setResellerStatus"));
assert.ok(admin.includes("/users/${userId}/reseller-status"));
assert.ok(!page.includes("linear-gradient"));

console.log("Reseller Desk security and UI checks passed.");
