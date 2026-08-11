const assert = require("node:assert/strict");
const fs = require("node:fs");

const server = fs.readFileSync("server.js", "utf8");

[
  "while (claimedKeys.length < quantity)",
  "claimVipStoreKey(supplierProductId, 1)",
  "WHERE order_id = $1",
  "keyCount: claimedKeys.length",
  "keys: claimedKeys",
  "body: { product_id: cleanProductId, qty: cleanQuantity }",
  'const maxAttempts = method === "GET" ? 2 : 1',
  "if (!vipStoreCatalogRequest)",
  "vipStoreCatalogRequest = null",
].forEach((marker) =>
  assert.ok(server.includes(marker), `Missing safe supplier claim marker: ${marker}`),
);

assert.ok(
  server.indexOf("WHERE order_id = $1") <
    server.indexOf("while (claimedKeys.length < quantity)"),
  "Stored supplier keys must be loaded before another purchase",
);

assert.ok(
  !server.includes("body: { product_id: cleanProductId, quantity: cleanQuantity }"),
  "VIP Store claim must use qty, not the ignored quantity field",
);

console.log("VIP Store multi-key recovery check passed.");
