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
assert.ok(
  walletMidtransRoute.includes("await syncPendingMidtransWalletTopup(user.id)"),
  "Midtrans top-up must synchronize an existing transaction before creating another",
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

console.log("Midtrans wallet security check passed.");
