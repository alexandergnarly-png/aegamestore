const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { request, headersFor, BASE_URL, METHODS } = require("../server/vipstore-client");
const config = { baseUrl: BASE_URL, apiKey: "test-key", apiSecret: "test-secret" };
const response = (body, status = 200, contentType = "application/json") => ({
  ok: status >= 200 && status < 300, status,
  headers: new Map([["content-type", contentType]]), text: async () => body,
});
(async () => {
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
  let signatures = [];
  const recovered = await request(config, "catalog.php", {}, async (_url, init) => {
    signatures.push(init.headers["X-Nonce"]);
    return ++calls === 1 ? response("<title>One moment, please...</title>", 200, "text/html") : response('{"success":true,"products":[{"id":679}]}');
  });
  assert.equal(recovered.ok, true);
  assert.equal(calls, 2);
  assert.notEqual(signatures[0], signatures[1]);
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
  assert.equal(calls, 2, "AbortError numeric code must be handled and retried only for GET");
  calls = 0;
  const denied = await request(config, "catalog.php", {}, async () => { calls++; return response('{"success":false,"message":"test-secret denied"}', 403); });
  assert.equal(denied.ok, false);
  assert.equal(calls, 1);
  assert.ok(!JSON.stringify(denied).includes("test-secret"));
  await assert.rejects(request(config, "catalog.php", {}, async () => response("", 302)), { code: "VIPSTORE_REDIRECT" });
  await assert.rejects(request(config, "catalog.php", {}, async () => response('{"success":"true"}')), { code: "VIPSTORE_INVALID_RESPONSE" });
  await assert.rejects(request({ ...config, baseUrl: "https://other.example" }, "catalog.php"), { code: "VIPSTORE_INVALID_BASE_URL" });
  await assert.rejects(request(config, "claim.php", { method: "GET" }), { code: "VIPSTORE_INVALID_REQUEST" });
  const fs = require("node:fs"), vm = require("node:vm");
  const server = fs.readFileSync("server.js", "utf8");
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
