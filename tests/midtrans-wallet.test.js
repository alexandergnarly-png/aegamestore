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
  `async function syncPendingMidtransWalletTopup(userId)`,
  `await snap.transaction.status(providerOrderId)`,
  `await syncPendingMidtransWalletTopup(user.id)`,
  `["expire", "cancel", "deny"].includes(transactionStatus)`,
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
  `WHERE id = $1 AND status = 'rejected'`,
  `reset-products.php`,
  `reset-key.php`,
  `"/api/admin/vipstore/reset-key"`,
].forEach((marker) => assert.ok(server.includes(marker), `Missing failed-history delete guard: ${marker}`));

console.log("Midtrans wallet security check passed.");
