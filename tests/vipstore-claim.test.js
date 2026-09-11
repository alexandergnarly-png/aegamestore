const assert = require("node:assert/strict");
const fs = require("node:fs");

const server = fs.readFileSync("server.js", "utf8");
const migrations = fs.readFileSync("server/database-migrations.js", "utf8");
const vm = require("node:vm");
const catalogContext = vm.createContext({});
vm.runInContext(server.slice(server.indexOf("function describeVipStoreInvalidResponse("), server.indexOf("function isTruthyApiValue(")), catalogContext);
assert.match(catalogContext.describeVipStoreInvalidResponse("<html>Private login details</html>", "text/html; charset=utf-8"), /berupa HTML/);
assert.match(catalogContext.describeVipStoreInvalidResponse("", "application/json"), /kosong/);
assert.match(catalogContext.describeVipStoreInvalidResponse('{"products":', "application/json"), /terpotong/);
assert.ok(!catalogContext.describeVipStoreInvalidResponse("<html>Private login details</html>", "text/html").includes("Private login details"));
const validateCatalog = catalogContext.validateSupplierCatalog;
const sanitizeMessage = catalogContext.sanitizeSupplierCatalogMessage;
assert.equal(sanitizeMessage("Catalog temporarily unavailable"), "Catalog temporarily unavailable");
const safeMessage = sanitizeMessage("<b>Denied</b>\nsecret-example API-Key: abc token=xyz user@example.com https://example.com/private", ["secret-example"]);
for (const secret of ["secret-example", "abc", "xyz", "user@example.com", "https://", "<b>", "\n"]) assert.ok(!safeMessage.includes(secret));
assert.ok(sanitizeMessage("x".repeat(500)).length <= 240);
assert.equal(sanitizeMessage({ message: "Do not stringify arbitrary payloads" }), "");
assert.throws(() => validateCatalog({ ok: false, http_code: 402, diagnostic_message: "Catalog temporarily unavailable", data: { success: false } }), /Detail respons: Catalog temporarily unavailable/);
assert.throws(() => validateCatalog({ ok: false, http_code: 402, data: { success: false } }), /Pesan rinci tidak tersedia/);
catalogContext.normalizeCatalogLabel = (value) => String(value || "").trim();
catalogContext.convertUsdToIdr = (value, rate) => value == null ? null : value * rate;
vm.runInContext(server.slice(server.indexOf("function isTruthyApiValue("), server.indexOf("function normalizeCheatGameCatalogProduct(")), catalogContext);
const documentedProduct = { id: 679, product_id: 679, variant_id: 679, name: "ACE DFM iOS 1 day", price: 1, reseller_price: 1, public_price_idr: 40000, public_price_usd: 3, stock: 6, is_active: true, is_hidden: 0, is_maintenance_mode: 0 };
const normalized = catalogContext.normalizeVipStoreCatalogProduct(documentedProduct, 17000);
assert.equal(normalized.price, 17000, "Use effective reseller price, not public price");
assert.equal(normalized.status, "ready");
assert.equal(normalized.product_id, "679");
for (const is_active of [false, 0, "0", "false"]) {
  const disabled = catalogContext.normalizeVipStoreCatalogProduct({ ...documentedProduct, is_active }, 17000);
  assert.equal(disabled.status, "maintenance", "Inactive products must not be orderable even with stock");
  assert.equal(disabled.is_maintenance, true);
}
assert.equal(catalogContext.normalizeVipStoreCatalogProduct({ variant_id: 679, stock: 6 }, 17000).product_id, "679");
assert.equal(catalogContext.normalizeVipStoreCatalogProduct({ id: 1, stock: 6 }, 17000).status, "ready", "Missing optional active flag preserves legacy supplier behavior");
assert.equal(validateCatalog({ ok: true, data: { success: true, products: [{ variant_id: 679 }] } }).length, 1);

const crypto = require("node:crypto");
const authContext = vm.createContext({ crypto, process: { env: { VIPSTORE_API_KEY: "test-key", VIPSTORE_API_SECRET: "test-secret" } } });
vm.runInContext(server.slice(server.indexOf("const VIPSTORE_DEFAULT_BASE_URL"), server.indexOf("function normalizeVipStoreEndpoint(")), authContext);
for (const rawBody of ["", '{"product_id":679,"qty":1}']) {
  const headers = authContext.createVipStoreHeaders(rawBody);
  const payload = `${headers["X-Timestamp"]}.${headers["X-Nonce"]}.${crypto.createHash("sha256").update(rawBody).digest("hex")}`;
  assert.equal(headers["X-Signature"], crypto.createHmac("sha256", "test-secret").update(payload).digest("hex"));
  assert.match(headers["X-Nonce"], /^[a-f0-9]{32}$/);
  assert.equal(headers["X-API-Key"], "test-key");
}
for (const result of [
  { ok: false, http_code: 401, data: { products: [{ id: 1 }] } },
  { ok: true, http_code: 200, data: { success: false } },
  { ok: true, http_code: 200, data: { success: "false", products: [{ id: 1 }] } },
  { ok: true, http_code: 200, data: { products: [] } },
  { ok: true, http_code: 200, data: { products: [{ name: "Invalid" }] } },
  { ok: true, http_code: 200, data: "Not JSON" },
]) assert.throws(() => validateCatalog(result), /Katalog supplier/);
for (const data of [[{ id: 1 }], { products: [{ product_id: "20" }] }, { data: { products: [{ productId: 3 }] } }]) {
  assert.equal(validateCatalog({ ok: true, http_code: 200, data }).length, 1);
}
const syncSource = server.slice(server.indexOf("async function syncSupplierMappedProducts("), server.indexOf("function syncVipStoreMappedProducts("));
assert.ok(syncSource.indexOf("validateSupplierCatalog(catalogResult)") < syncSource.indexOf("UPDATE products"), "Reject invalid catalogs before changing stored stock");

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
  "o.supplier_product_id AS order_supplier_product_id",
  "FROM vipstore_claim_logs",
  "VIP Store menolak claim:",
].forEach((marker) =>
  assert.ok(server.includes(marker), `Missing safe supplier claim marker: ${marker}`),
);

[
  "supplier_delivery_type TEXT DEFAULT ''",
  "supplier_source TEXT DEFAULT ''",
  "supplier_product_id TEXT DEFAULT ''",
  "supplier_product_name TEXT DEFAULT ''",
].forEach((marker) =>
  assert.ok(migrations.includes(marker), `Missing order supplier snapshot: ${marker}`),
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

const refundPolicy = server.slice(
  server.indexOf("const CONFIRMED_PRE_DELIVERY_SUPPLIER_FAILURES"),
  server.indexOf("async function settleWalletVipOrder"),
);
[
  '"VIPSTORE_CLAIM_REJECTED"',
  '"CHEATGAME_ORDER_REJECTED"',
  'order.payment_status === "paid"',
  'order.delivery_status === "processing_supplier"',
  'order.pricing_tier === "reseller"',
  "!order.has_keys",
  '!String(order.game_key_value || "").trim()',
  '!String(order.supplier_order_id || "").trim()',
  "FOR UPDATE",
  "'supplier_refund'",
  "'order_refund'",
  "payment_status = 'refunded'",
].forEach((marker) =>
  assert.ok(refundPolicy.includes(marker), `Missing guarded refund marker: ${marker}`),
);
assert.ok(!refundPolicy.includes("VIPSTORE_TIMEOUT"), "Timeout must require manual review");
assert.ok(!refundPolicy.includes("VIPSTORE_REQUEST_FAILED"), "Network errors must require manual review");
assert.ok(
  migrations.includes("UNIQUE(reference_type, reference_id, direction)"),
  "Wallet refund must be idempotent at database level",
);

console.log("VIP Store multi-key recovery check passed.");
