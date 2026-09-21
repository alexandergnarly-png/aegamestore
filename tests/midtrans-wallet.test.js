const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const { parseMidtransAmount, verifyMidtransSignature } = require("../server/midtrans-utils");

const serverKey = "test-server-key";
const notification = {
  order_id: "WALLET-test",
  status_code: "200",
  gross_amount: "50000.00",
};
notification.signature_key = crypto
  .createHash("sha512")
  .update(notification.order_id + notification.status_code + notification.gross_amount + serverKey)
  .digest("hex");

assert.equal(verifyMidtransSignature(notification, serverKey), true);
assert.equal(verifyMidtransSignature({ ...notification, gross_amount: "50001.00" }, serverKey), false);
assert.equal(parseMidtransAmount("50000.00"), 50000);
assert.equal(parseMidtransAmount("50000.50"), 0);
assert.equal(parseMidtransAmount(Number.MAX_SAFE_INTEGER + 1), 0);

const server = fs.readFileSync("server.js", "utf8");
[
  `provider = 'midtrans' AND provider_order_id = $1`,
  `LIMIT 1 FOR UPDATE`,
  `paidAmount !== Number(request.payment_amount || request.amount)`,
  `ON CONFLICT (reference_type, reference_id, direction) DO NOTHING`,
  `const paymentFee = paymentAmount - amount`,
  `itemDetails.push({ id: "MIDTRANS-FEE"`,
  `error.code = "TOPUP_PENDING"`,
  `err.paymentUrl ? { paymentUrl: err.paymentUrl }`,
  `checkoutUrl: \`/reseller-checkout?topup=\${encodeURIComponent(topupId)}\``,
  `app.get("/api/wallet/topups/:id/checkout"`,
  `WHERE id = $1 AND user_id = $2 AND provider = 'midtrans'`,
  `snapToken: topup.status === "pending" ? topup.snap_token : ""`,
  `async function syncPendingMidtransWalletTopup(userId)`,
  `await snap.transaction.status(providerOrderId)`,
  `await syncPendingMidtransWalletTopup(user.id)`,
  `["expire", "cancel", "deny", "failure"].includes(transactionStatus)`,
  `custom_expiry: { expiry_duration: MIDTRANS_QRIS_EXPIRY_MINUTES, unit: "minute" }`,
  `MIDTRANS_PENDING_GRACE_MINUTES`,
  `!["pending", "rejected"].includes(request.status)`,
].forEach((marker) => assert.ok(server.includes(marker), `Missing wallet webhook guard: ${marker}`));

const walletMidtransRoute = server.slice(
  server.indexOf('app.post("/api/wallet/topups/midtrans"'),
  server.indexOf('app.get("/api/admin/wallet/topups"'),
);
const walletManualRoute = server.slice(
  server.indexOf('app.post("/api/wallet/topups"'),
  server.indexOf('app.post("/api/wallet/topups/midtrans"'),
);
assert.ok(
  walletManualRoute.includes("RESELLER_MANUAL_TOPUP_DISABLED"),
  "Approved resellers must not bypass deposit rules through manual top-up",
);
assert.ok(
  walletMidtransRoute.includes("await syncPendingMidtransWalletTopup(user.id)"),
  "Midtrans top-up must synchronize an existing transaction before creating another",
);
assert.ok(
  walletMidtransRoute.includes(
    'normalizeResellerStatus(user.reseller_status) === "approved"',
  ),
  "Reseller deposit rules must come from the authenticated account",
);
assert.ok(
  walletMidtransRoute.includes(
    "...(isResellerDeposit ? getMidtransPaymentOptions() : {})",
  ),
  "Approved reseller deposits must only enable QRIS",
);
assert.ok(
  walletMidtransRoute.includes("const paymentAmount = isResellerDeposit"),
  "Approved reseller deposits must include the configured payment fee",
);

const admin = fs.readFileSync("views/admin.html", "utf8");
[...admin.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
  .forEach(([, source]) => assert.doesNotThrow(() => new Function(source)));
[
  'id="walletProviderFilter"',
  "Midtrans otomatis",
  "row.provider_transaction_id",
  "row.paid_at || row.reviewed_at || row.created_at",
  "deleteWalletTopup",
  "syncWalletTopup",
  "cancelWalletTopup",
  'id="walletGrantUsdEstimate"',
  'id="walletGrantUserOptions"',
  'id="walletGrantUserId"',
  'aria-controls="walletGrantUserOptions"',
  'role="combobox"',
  "handleWalletGrantUserKeydown",
  "walletGrantInFlight",
  'class="wallet-rate-card"',
  'class="card wallet-grant-card',
  'class="wallet-recipient-proof"',
  'class="card wallet-history-card',
  "loadWalletGrantUsers",
  "syncWalletGrantUserSelection",
  "JSON.stringify({ user_id: userId, amount, reason, direction, request_id: isDebit ? walletDebitRequest.id : undefined })",
  "setWalletGrantUsd(10)",
  "updateWalletGrantUsdEstimate",
  'id="vipResetProductSelect"',
  'id="vipResetKeyInput"',
  "loadVipStoreResetProducts",
  "resetVipStoreKeyFromAdmin",
].forEach((marker) => assert.ok(admin.includes(marker), `Missing admin wallet history marker: ${marker}`));

[
  'class="skip-link" href="#admin-main"',
  'id="adminLiveRegion"',
  'id="icon-dashboard"',
  'aria-current="page"',
  "Promise.allSettled",
  'id="refreshAllButton"',
].forEach((marker) => assert.ok(admin.includes(marker), `Missing admin UX marker: ${marker}`));

const sidebarNav = admin.match(/<nav class="sidebar-nav"[\s\S]*?<\/nav>/)?.[0] || "";
const bottomNav = admin.match(/<nav\s+class="admin-bottom-nav"[\s\S]*?<\/nav>/)?.[0] || "";
assert.ok(sidebarNav && bottomNav, "Admin navigation markup is missing");
assert.doesNotMatch(sidebarNav + bottomNav, /[📊📦🧾👥🔑🎟👑]/u, "Admin navigation must use SVG icons");

[
  `app.delete("/api/admin/wallet/topups/:id", requireAdminAuth, requireAdminCsrf`,
  `app.post("/api/admin/wallet/topups/:id/sync", requireAdminAuth, requireAdminCsrf`,
  `app.post("/api/admin/wallet/topups/:id/cancel", requireAdminAuth, requireAdminCsrf`,
  `usd_idr_rate: usdIdrRate`,
  `WHERE id = $3 AND status = 'rejected' AND archived_at IS NULL`,
  `SET archived_at = $1, archived_by = $2`,
  `archived_at = NULL, archived_by = NULL`,
  `reset-products.php`,
  `reset-key.php`,
  `"/api/admin/vipstore/reset-key"`,
].forEach((marker) => assert.ok(server.includes(marker), `Missing failed-history delete guard: ${marker}`));

[
  `const userId = Number(req.body?.user_id)`,
  `const amount = Number(req.body?.amount)`,
  `!Number.isSafeInteger(amount)`,
  `SELECT id, username FROM users WHERE id = $1 FOR UPDATE`,
].forEach((marker) => assert.ok(server.includes(marker), `Missing wallet grant guard: ${marker}`));

const walletGrantRoute = server.slice(
  server.indexOf('app.post("/api/admin/wallet/grant"'),
  server.indexOf('// ----------------------------------------------', server.indexOf('app.post("/api/admin/wallet/grant"')),
);
assert.doesNotMatch(walletGrantRoute, /LOWER\(username\)/, "Wallet grant must target the selected buyer ID, not an ambiguous username");

console.log("Midtrans wallet security check passed.");

// Execute the actual route with a transactional DB stub: no real wallet is touched.
(async () => {
  const vm = require("node:vm");
  let handler;
  let balance = 5000;
  let entry;
  let writes = 0;
  const client = {
    async query(sql, values = []) {
      if (sql.includes("SELECT id, username")) return { rows: [{ id: 1, username: "buyer" }] };
      if (sql.includes("SELECT balance FROM wallet_accounts")) return { rows: [{ balance }] };
      if (sql.includes("SELECT user_id, amount")) return { rows: entry ? [entry] : [] };
      if (sql.includes("UPDATE wallet_accounts")) { balance = values[0]; writes++; }
      if (sql.includes("INSERT INTO wallet_ledger")) {
        assert.equal(values[8], "debit");
        assert.equal(values[9], "admin_debit");
        entry = { user_id: values[0], amount: values[1], description: values[5], balance_after: values[3] };
      }
      return { rows: [] };
    }, release() {},
  };
  vm.runInNewContext(walletGrantRoute, {
    app: { post(_path, ...args) { handler = args.at(-1); } },
    requireAdminAuth() {}, requireAdminCsrf() {}, WALLET_MAX_TOPUP: 2000000,
    WALLET_MAX_BALANCE: 10000000, getAdminSessionUsername: async () => "admin",
    db: { connect: async () => client }, ensureWalletAccount: async () => {},
    crypto: { randomUUID: () => "test" }, formatWalletAmountForMessage: String, console,
  });
  async function call(body) {
    const result = { statusCode: 200, status(value) { this.statusCode = value; return this; }, json(value) { this.body = value; return this; } };
    await handler({ body }, result);
    return result;
  }
  const body = { user_id: 1, amount: 2000, reason: "Koreksi", direction: "debit", request_id: "12345678-1234-1234-1234-123456789012" };
  assert.equal((await call({ ...body, amount: 6000 })).statusCode, 409);
  assert.equal(writes, 0, "Insufficient balance cannot change wallet");
  assert.equal((await call({ ...body, reason: "" })).statusCode, 400);
  assert.equal((await call({ ...body, direction: "invalid" })).statusCode, 400);
  assert.equal((await call(body)).statusCode, 200);
  assert.equal(balance, 3000);
  assert.equal((await call(body)).statusCode, 200);
  assert.equal(writes, 1, "Replay must not deduct twice");
  assert.equal((await call({ ...body, amount: 1000 })).statusCode, 409);
  console.log("Manual buyer debit validation, ledger and replay checks passed.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
