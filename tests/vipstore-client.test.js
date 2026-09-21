const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { request, createGuardedRequest, headersFor, BASE_URL, METHODS } = require("../server/vipstore-client");
const config = { baseUrl: BASE_URL, apiKey: "test-key", apiSecret: "test-secret" };
const response = (body, status = 200, contentType = "application/json") => ({
  ok: status >= 200 && status < 300, status,
  headers: new Map([["content-type", contentType]]), text: async () => body,
});
(async () => {
  let clock = 1000000;
  let timeoutCalls = 0;
  const timeoutGuard = createGuardedRequest(async () => {
    timeoutCalls++;
    throw Object.assign(new Error("timeout"), { code: "VIPSTORE_TIMEOUT" });
  }, () => clock);
  await assert.rejects(timeoutGuard(config, "catalog.php"), { code: "VIPSTORE_TIMEOUT" });
  await assert.rejects(timeoutGuard(config, "balance.php"), { code: "VIPSTORE_REQUEST_PAUSED", supplierHttpCode: 503 });
  assert.equal(timeoutCalls, 1);
  clock += 60000;
  await assert.rejects(timeoutGuard(config, "catalog.php"), { code: "VIPSTORE_TIMEOUT" });
  assert.equal(timeoutCalls, 2, "Timeout cooldown expires without automatic retry");
  let guardedCalls = 0;
  let nextResult = { ok: true, http_code: 200, data: { success: true, balance: 10 } };
  const guarded = createGuardedRequest(async () => {
    guardedCalls++;
    await Promise.resolve();
    if (nextResult instanceof Error) throw nextResult;
    return nextResult;
  }, () => clock);
  await Promise.all(Array.from({ length: 20 }, () => guarded(config, "balance.php")));
  assert.equal(guardedCalls, 1, "Concurrent balance checks share one request");
  await guarded(config, "balance.php");
  assert.equal(guardedCalls, 1, "Repeated balance checks use cache");
  clock += 60001;
  await guarded(config, "balance.php");
  assert.equal(guardedCalls, 2, "Balance cache expires");
  await guarded(config, "claim.php", { method: "POST" });
  await guarded(config, "claim.php", { method: "POST" });
  assert.equal(guardedCalls, 4, "Purchases are never deduplicated or cached");
  await guarded(config, "balance.php");
  assert.equal(guardedCalls, 5, "Purchase invalidates cached balance");
  nextResult = { ok: false, http_code: 403 };
  await guarded(config, "catalog.php");
  for (const endpoint of Object.keys(METHODS)) {
    await assert.rejects(guarded(config, endpoint), { code: "VIPSTORE_REQUEST_PAUSED", supplierHttpCode: 403 });
  }
  assert.equal(guardedCalls, 6, "403 pauses every endpoint, including cached reads and purchases");
  clock += 24 * 60 * 60 * 1000;
  nextResult = Object.assign(new Error("challenge"), { code: "VIPSTORE_SECURITY_CHALLENGE", diagnostics: { http_status: 200 } });
  await assert.rejects(guarded(config, "balance.php"), { code: "VIPSTORE_SECURITY_CHALLENGE" });
  await assert.rejects(guarded(config, "claim.php"), { code: "VIPSTORE_REQUEST_PAUSED" });
  assert.equal(guardedCalls, 7, "HTTP 200 browser challenge also pauses all requests");
  clock += 24 * 60 * 60 * 1000;
  nextResult = { ok: false, http_code: 429, diagnostics: { retry_after: "3600" } };
  await guarded(config, "balance.php");
  clock += 20 * 60 * 1000;
  await assert.rejects(guarded(config, "catalog.php"), { supplierHttpCode: 429 });
  assert.equal(guardedCalls, 8, "Retry-After longer than default is respected");
  clock += 40 * 60 * 1000;
  nextResult = { ok: true, http_code: 200, data: { success: true } };
  await guarded(config, "balance.php");
  assert.equal(guardedCalls, 9, "Requests resume after cooldown");
  let challengeCalls = 0;
  await assert.rejects(request(config, "balance.php", {}, async () => {
    challengeCalls++;
    return response("Imunify360 bot-protection", 403, "text/html");
  }), { code: "VIPSTORE_SECURITY_CHALLENGE" });
  assert.equal(challengeCalls, 1, "Balance browser challenges are never retried");
  for (const raw of ["", '{"product_id":679,"qty":1}', '{"product_id":"AORUS","key":"a/b"}']) {
    const headers = headersFor(config, raw, 1234, "nonce");
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    assert.equal(headers["X-Signature"], crypto.createHmac("sha256", config.apiSecret).update(`1234.nonce.${hash}`).digest("hex"));
    assert.equal(headers["X-Timestamp"], "1234");
  }
  for (const [endpoint, method] of Object.entries(METHODS)) {
    await request(config, endpoint, { method, body: { product_id: 679, qty: 1 } }, async (url, init) => {
      assert.equal(url, `${BASE_URL}/${endpoint}`);
      assert.equal(init.method, method);
      assert.equal(init.redirect, "manual");
      assert.equal(init.body, method === "GET" ? undefined : '{"product_id":679,"qty":1}');
      const expected = headersFor(config, init.body || "", init.headers["X-Timestamp"], init.headers["X-Nonce"]);
      assert.deepEqual(init.headers, expected);
      return response('{"success":true}');
    });
  }
  let calls = 0;
  await assert.rejects(request(config, "catalog.php", {}, async () => {
    calls++; return response("<title>One moment, please...</title>", 200, "text/html");
  }), { code: "VIPSTORE_SECURITY_CHALLENGE" });
  assert.equal(calls, 1, "The large catalog must never be retried automatically");
  calls = 0;
  await assert.rejects(request(config, "claim.php", { method: "POST", body: { product_id: 679, qty: 1 } }, async () => {
    calls++; return response("<title>One moment, please...</title>", 200, "text/html");
  }), { code: "VIPSTORE_SECURITY_CHALLENGE" });
  assert.equal(calls, 1, "A purchase must never be retried automatically");
  calls = 0;
  await assert.rejects(request(config, "balance.php", { timeoutMs: 1 }, async (_url, init) => {
    calls++;
    return new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true }));
  }), { code: "VIPSTORE_TIMEOUT" });
  assert.equal(calls, 1, "Timeouts must not trigger automatic retries");
  calls = 0;
  const denied = await request(config, "catalog.php", {}, async () => { calls++; return response('{"success":false,"message":"test-secret denied"}', 403); });
  assert.equal(denied.ok, false);
  assert.equal(calls, 1);
  assert.ok(!JSON.stringify(denied).includes("test-secret"));
  for (const payload of [{ message: "API disabled" }, { error: "Account suspended" }, { detail: "Forbidden" }]) {
    calls = 0;
    const rejection = await request(config, "catalog.php", {}, async () => { calls++; return response(JSON.stringify(payload), 403); });
    assert.equal(rejection.ok, false);
    assert.equal(rejection.data.success, false);
    assert.ok(rejection.diagnostic_message && rejection.diagnostic_message !== "Request ditolak VIPStore");
    assert.equal(calls, 1, "A JSON HTTP rejection must not be retried");
  }
  await assert.rejects(request(config, "catalog.php", {}, async () => response("", 302)), { code: "VIPSTORE_REDIRECT" });
  const product = { id: 679, name: "Test product", price: 1, stock: 6 };
  for (const success of [true, 1, "1", "true"]) {
    const result = await request(config, "catalog.php", {}, async () => response(JSON.stringify({ success, products: [product] })));
    assert.equal(result.ok, true);
    assert.equal(result.data.success, true);
  }
  for (const payload of [{ products: [product] }, [product], { ok: true, products: [product] }]) {
    const result = await request(config, "catalog.php", {}, async () => response(JSON.stringify(payload)));
    assert.equal(result.ok, true);
    assert.deepEqual(result.data.products, [product]);
  }
  for (const marker of [{ success: false }, { success: "false" }, { success: 0 }, { success: "0" },
    { success: true, ok: false }, { success: true, status: "0" }, { error: "Denied" }]) {
    const result = await request(config, "catalog.php", {}, async () => response(JSON.stringify({ ...marker, products: [product] })));
    assert.equal(result.ok, false, "Never override a denial with catalog data");
  }
  for (const payload of [null, {}, [], { products: [] }, { products: [{ id: 679 }] },
    { success: "unknown", products: [product] }, { status: "error", products: [product] },
    { products: [{ ...product, stock: -1 }] }]) {
    await assert.rejects(request(config, "catalog.php", {}, async () => response(JSON.stringify(payload))),
      (error) => error.code === "VIPSTORE_INVALID_RESPONSE" && Boolean(error.diagnostics.response_shape));
  }
  const httpDenied = await request(config, "catalog.php", {}, async () => response(JSON.stringify({ products: [product] }), 403));
  assert.equal(httpDenied.ok, false, "HTTP failure must remain failure");
  for (const endpoint of ["claim.php", "reset-key.php"]) {
    calls = 0;
    await assert.rejects(request(config, endpoint, {}, async () => {
      calls++; return response(JSON.stringify({ success: "true", products: [product], codes: ["DO-NOT-ACCEPT"] }));
    }), { code: "VIPSTORE_INVALID_RESPONSE" });
    assert.equal(calls, 1, "Catalog compatibility must not weaken or retry POST requests");
  }
  await assert.rejects(request({ ...config, baseUrl: "https://other.example" }, "catalog.php"), { code: "VIPSTORE_INVALID_BASE_URL" });
  await assert.rejects(request(config, "claim.php", { method: "GET" }), { code: "VIPSTORE_INVALID_REQUEST" });
  const fs = require("node:fs"), vm = require("node:vm");
  const server = fs.readFileSync("server.js", "utf8");
  const catalogSource = server.slice(server.indexOf("let vipStoreCatalogRequest"), server.indexOf("async function getVipStoreBalance"));
  let catalogCalls = 0;
  const catalogContext = vm.createContext({
    Date, process: { env: {} },
    vipStoreRequest: async () => { catalogCalls++; return { ok: true, data: { success: true, products: [{ id: 1 }] } }; },
    validateSupplierCatalog: () => true,
  });
  vm.runInContext(catalogSource, catalogContext);
  await catalogContext.getVipStoreCatalog();
  await catalogContext.getVipStoreCatalog();
  assert.equal(catalogCalls, 1, "Successful catalogs are reused instead of spamming VIPStore");
  catalogCalls = 0;
  const blockedContext = vm.createContext({
    Date, process: { env: {} },
    vipStoreRequest: async () => { catalogCalls++; throw Object.assign(new Error("blocked"), { code: "VIPSTORE_SECURITY_CHALLENGE", diagnostics: { http_status: 403 } }); },
    validateSupplierCatalog: () => true,
  });
  vm.runInContext(catalogSource, blockedContext);
  await assert.rejects(blockedContext.getVipStoreCatalog());
  await assert.rejects(blockedContext.getVipStoreCatalog());
  assert.equal(catalogCalls, 1, "A bot-protection rejection starts a no-request cooldown");
  assert.match(server, /VIPSTORE_SYNC_INTERVAL_MS \|\| 30 \* 60 \* 1000/);
  assert.match(server, /15 \* 60 \* 1000,\s*\);/);
  let stored = [], issued = 0, logs = [];
  let claimResponse = { ok: true, http_code: 200, data: { success: true, product_id: 679, qty: 1, codes: ["LICENSE-ONE"] } };
  const context = vm.createContext({
    normalizeSupplierProductId: (id) => String(id), getOrderQuantity: Number,
    query: async () => ({ rows: stored.map((key_value) => ({ key_value })) }),
    decryptGameKey: (key) => key, db: {},
    claimVipStoreKey: async () => { issued++; return claimResponse; },
    persistOrderKeys: async (_db, value) => { stored = [...value.keys]; },
    logVipStoreClaimAttempt: async (log) => logs.push(log),
    summarizeVipStoreClaimResponse: () => "redacted",
  });
  vm.runInContext(server.slice(server.indexOf("function extractVipStoreClaimKeys("), server.indexOf("async function syncSupplierMappedProducts(")), context);
  const order = { id: "ORDER-TEST", supplier_product_id: "679", product_id: 1, quantity: 1 };
  assert.equal((await context.claimVipStoreKeyForOrder(order)).key, "LICENSE-ONE");
  await context.claimVipStoreKeyForOrder(order);
  assert.equal(issued, 1, "A persisted key must not be purchased twice");
  stored = [];
  claimResponse = { ok: false, http_code: 403, data: { success: false, message: "Insufficient balance" } };
  await assert.rejects(context.claimVipStoreKeyForOrder(order), { code: "VIPSTORE_CLAIM_REJECTED" });
  claimResponse = { ok: false, http_code: 500, data: { success: false, message: "Server failure" } };
  await assert.rejects(context.claimVipStoreKeyForOrder(order), { code: "VIPSTORE_CLAIM_UNCERTAIN" });
  claimResponse = { ok: true, http_code: 200, data: { success: true, product_id: 999, qty: 1, codes: ["WRONG-PRODUCT"] } };
  await assert.rejects(context.claimVipStoreKeyForOrder(order), { code: "VIPSTORE_CLAIM_UNCERTAIN" });
  assert.deepEqual(stored, []);
  assert.ok(logs.some((log) => /product_id/.test(log.message)), "Ambiguous claims leave a review trail");
  console.log("VIPStore documented client contract tests passed.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
