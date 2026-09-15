const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { verifyCheatGameWebhook, extractCheatGameClaimKeys } = require("../server/cheatgame-utils");
const server = fs.readFileSync("server.js", "utf8");
const section = (start, end) => server.slice(server.indexOf(start), server.indexOf(end));

const timestamp = String(Math.floor(Date.now() / 1000));
const eventId = "test-event";
const rawBody = '{"data":{"keys":["KEY-1"]}}';
const secret = "test-only-secret";
const signature = crypto.createHmac("sha256", secret).update(`${timestamp}.${eventId}.${rawBody}`).digest("hex");
const signed = { timestamp, eventId, rawBody, signature, secret };
assert.equal(verifyCheatGameWebhook(signed), true);
assert.equal(verifyCheatGameWebhook({ ...signed, rawBody: "{}" }), false);
assert.equal(verifyCheatGameWebhook({ ...signed, now: Date.now() + 601000 }), false);
assert.equal(verifyCheatGameWebhook({ ...signed, signature: "invalid" }), false);
assert.deepEqual(extractCheatGameClaimKeys({ data: { order: { keys: ["KEY-1", "KEY-1", "KEY-2"] } } }), ["KEY-1", "KEY-2"]);
assert.deepEqual(extractCheatGameClaimKeys({ data: "success", message: "paid", product: { download_link: "metadata" } }), []);

(async () => {
  let requests = [];
  let reply = { ok: true, status: 200, text: async () => '{"success":true,"products":[{"id":7}]}' };
  const ctx = vm.createContext({
    process: { env: { CHEATGAME_API_KEY: "test-key", CHEATGAME_CUSTOMER_EMAIL: "test@example.com" } },
    URL, AbortController, setTimeout, clearTimeout,
    fetch: async (url, options) => { requests.push({ url, options }); return reply; },
    sanitizeSupplierCatalogMessage: value => String(value || ""),
    validateSupplierCatalog: result => {
      if (!result.ok || result.data.success === false) throw new Error("Rejected catalog");
      return result.data.products;
    },
    isValidEmail: value => String(value).includes("@"),
    getOrderQuantity: value => Number(value) || 1,
  });
  vm.runInContext(section("const CHEATGAME_API_URL", "const ADMIN_CATALOG_CACHE_TTL_MS"), ctx);
  vm.runInContext(section("function getCheatGameOrderStatus", "async function getVipStoreIdrRate"), ctx);
  await Promise.all([ctx.getCheatGameCatalog(), ctx.getCheatGameCatalog()]);
  assert.equal(requests.length, 1, "Concurrent catalog calls share a request");
  assert.equal(requests[0].url.searchParams.get("action"), "products");
  assert.equal(requests[0].options.headers["X-API-Key"], "test-key");
  assert.equal(requests[0].options.redirect, "error", "Never forward API credentials to a redirect");
  await ctx.createCheatGameOrder({ id: "AE-1", supplier_product_id: "7", quantity: 2, name: "Buyer", contact: "buyer@example.com" });
  const body = JSON.parse(requests[1].options.body);
  assert.deepEqual(body, { action: "order", external_ref: "AE-1", product_id: 7, quantity: 2, customer_name: "Buyer", customer_email: "buyer@example.com" });
  reply = { ok: true, status: 200, text: async () => "<html>blocked</html>" };
  await assert.rejects(ctx.createCheatGameOrder({ id: "AE-2", quantity: 1 }), /non-JSON/);
  assert.equal(requests.length, 3, "A purchase is never automatically retried");
  reply = { ok: false, status: 402, text: async () => '{"success":false}' };
  await assert.rejects(ctx.getCheatGameCatalog(), /Rejected/);
  const before = requests.length;
  await assert.rejects(ctx.getCheatGameCatalog(), /Rejected/);
  assert.equal(requests.length, before, "Cooldown suppresses repeated failed catalog calls");

  let order, purchases, statusCalls, savedKeys, stockWrites;
  const reset = () => {
    order = { id: "AE-1", product_id: 9, supplier_product_id: "7", supplier_source: "cheatgame", payment_status: "paid", delivery_status: "processing_supplier", quantity: 1, contact: "buyer@example.com" };
    purchases = statusCalls = stockWrites = 0;
    savedKeys = [];
  };
  let purchaseResult;
  const query = async (sql, args = []) => {
    if (sql.includes("SELECT o.*") || sql.startsWith("SELECT * FROM orders")) return { rows: [{ ...order }] };
    if (sql.startsWith("UPDATE orders SET cheatgame_attempted_at = $2")) order.cheatgame_attempted_at = args[1];
    if (sql.startsWith("UPDATE orders SET cheatgame_attempted_at = NULL")) order.cheatgame_attempted_at = null;
    if (sql.includes("SET supplier_order_id = COALESCE")) order.supplier_order_id = args[1];
    if (sql.includes("SET delivery_status = 'delivered'")) { order.delivery_status = "delivered"; order.supplier_order_id = args[3]; }
    if (sql.startsWith("UPDATE products")) stockWrites++;
    return { rows: [] };
  };
  const fulfillCtx = vm.createContext({
    db: { connect: async () => ({ query, release() {} }) }, query,
    getCheatGameConfig: () => ({ apiKey: "test-key", customerEmail: "buyer@example.com" }),
    getOrderQuantity: value => Number(value) || 1,
    normalizeSupplierProductId: value => String(value || ""),
    isValidEmail: value => String(value).includes("@"),
    getFirstDefinedValue: (data, fields) => fields.map(field => data?.[field]).find(value => value != null && value !== ""),
    sanitizeSupplierCatalogMessage: value => String(value || ""),
    extractCheatGameClaimKeys,
    createCheatGameOrder: async () => { purchases++; return purchaseResult(); },
    getCheatGameOrderStatus: async () => { statusCalls++; return { ok: true, data: { order_id: "CG-1", keys: ["KEY-1"] } }; },
    persistOrderKeys: async (_db, { keys }) => { savedKeys.push(...keys); },
    encryptGameKey: value => "encrypted:" + value,
  });
  vm.runInContext(section("function extractCheatGameOrderId", "async function syncSupplierMappedProducts"), fulfillCtx);
  reset();
  order.payment_status = "pending";
  await assert.rejects(fulfillCtx.fulfillCheatGameOrder(order), /harus paid/);
  assert.equal(purchases, 0);
  reset();
  purchaseResult = () => { throw new Error("timeout"); };
  await assert.rejects(fulfillCtx.fulfillCheatGameOrder(order), /timeout/);
  await assert.rejects(fulfillCtx.fulfillCheatGameOrder(order), /pembelian ulang diblokir/);
  assert.equal(purchases, 1);
  reset();
  purchaseResult = () => ({ ok: true, http_code: 200, data: { order_id: "CG-1", external_ref: "AE-1" } });
  assert.equal((await fulfillCtx.fulfillCheatGameOrder(order)).pending, true);
  assert.equal(order.supplier_order_id, "CG-1");
  assert.equal((await fulfillCtx.fulfillCheatGameOrder(order, "admin_retry")).pending, false);
  assert.equal(purchases, 1);
  assert.equal(statusCalls, 1, "Retry polls status, not a new purchase");
  assert.deepEqual(savedKeys, ["KEY-1"]);
  await fulfillCtx.fulfillCheatGameOrder(order, "webhook", { order_id: "CG-1", keys: ["KEY-1"] });
  assert.equal(stockWrites, 1, "Repeated delivery must not decrement stock twice");
  assert.equal(savedKeys.length, 1);
  reset();
  order.supplier_order_id = "CG-1";
  await assert.rejects(fulfillCtx.fulfillCheatGameOrder(order, "webhook", { order_id: "CG-other", keys: ["KEY-X"] }), /tidak cocok/);
  assert.equal(savedKeys.length, 0);
  reset();
  purchaseResult = () => ({ ok: false, http_code: 402, data: { success: false, message: "Insufficient balance" } });
  await assert.rejects(fulfillCtx.fulfillCheatGameOrder(order), error => error.code === "CHEATGAME_ORDER_REJECTED");
  assert.equal(order.cheatgame_attempted_at, null);
  reset();
  purchaseResult = () => ({ ok: false, http_code: 500, data: { success: false } });
  await assert.rejects(fulfillCtx.fulfillCheatGameOrder(order));
  assert.ok(order.cheatgame_attempted_at, "Server failures remain uncertain, not refundable/retryable");

  reset();
  let finishPurchase;
  purchaseResult = () => new Promise(resolve => { finishPurchase = resolve; });
  const inFlight = fulfillCtx.fulfillCheatGameOrder(order);
  while (!finishPurchase) await new Promise(resolve => setImmediate(resolve));
  await assert.rejects(fulfillCtx.fulfillCheatGameOrder(order), /pembelian ulang diblokir/);
  finishPurchase({ ok: true, data: { order_id: "CG-1", keys: ["KEY-1"] } });
  await inFlight;
  assert.equal(purchases, 1, "A second request while a purchase is in flight cannot buy again");

  const syncCtx = vm.createContext({
    isVipStoreConfigured: () => true,
    isCheatGameConfigured: () => true,
    syncVipStoreMappedProducts: async () => ({ synced: 2, total_mapped: 2, ready: 2 }),
    syncCheatGameMappedProducts: async () => { throw new Error("CheatGame unavailable"); },
  });
  vm.runInContext(section("async function syncAllMappedSupplierProducts", "let vipStoreAutoSyncRunning"), syncCtx);
  const summary = await syncCtx.syncAllMappedSupplierProducts();
  assert.equal(summary.synced, 2, "CheatGame failure must preserve a successful VIPStore sync");
  assert.equal(summary.supplier_errors[0].supplier, "CHEATGAME");

  const migrations = fs.readFileSync("server/database-migrations.js", "utf8");
  assert.ok(!migrations.includes("supplier_status = 'retired'"), "Startup must not retire restored CheatGame products");
  const admin = fs.readFileSync("views/admin.html", "utf8");
  assert.ok(admin.includes('<option value="cheatgame_api">CHEATGAME API</option>'));
  assert.ok(admin.includes('let vipStorePickerNotice = "";'), "Keep the existing VIPStore fallback notice state");
  assert.ok(admin.includes('normalizeAdminDeliveryType(product.delivery_type) === "vipstore_api"'), "Bulk local switch remains VIPStore-only");
  console.log("CheatGame request, fulfillment, webhook signature and restoration checks passed.");
})().catch(error => { console.error(error); process.exitCode = 1; });
