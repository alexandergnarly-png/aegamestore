const assert = require("node:assert/strict");
const fs = require("node:fs");

const admin = fs.readFileSync("views/admin.html", "utf8");
const server = fs.readFileSync("server.js", "utf8");
assert.match(admin, /fetch\(`\/products\?fresh=\$\{Date\.now\(\)\}`,[\s\S]*?cache: "no-store"/);
const scripts = [
  ...admin.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi),
];

scripts.forEach(([, source]) =>
  assert.doesNotThrow(() => new Function(source)),
);

[
  'customClass: { popup: "admin-key-popup" }',
  'class="admin-key-state" role="alert"',
  'claimFailed ? "Mengerti" : "Copy Key"',
  "Supplier Claim Log",
  "Retry Claim Supplier",
  "Tandai Selesai",
  "completeManualOrder",
  "function showAdminLoading(title, text)",
  'didOpen: () => Swal.showLoading()',
  'isEditMode ? "Mengupdate produk..." : "Menambahkan produk..."',
  'isSingle ? "Sync stok produk..." : "Sync semua stok supplier..."',
  'class="product-compare-btn"',
  '#section-products th:last-child',
  'data-label="Aksi" class="action-cell"',
  'id="productFilterPanel" open',
  'id="productEditorPanel" open',
  "Katalog / Saring",
  "Produk / Susun",
  'class="product-form-section"',
  "Sinkron Supplier",
  'document.querySelectorAll(".product-control-panel")',
  ".product-control-panel:not([open]) > summary",
  "ORDERS_STATE.manualCount",
  "ORDERS_STATE.pendingCount",
  "ORDERS_STATE.deliveredCount",
  "paidEl.innerText = ORDERS_STATE.paidCount",
  'id="opsAllCount"',
  'id="opsDeliveredCount"',
  'id="adminOrderRefresh"',
  'data-safety-action="refresh"',
  'data-safety-action="paid"',
  'button.dataset.safetyAction === "refresh"',
  'button.dataset.safetyAction === "paid"',
  'fetch("/api/admin/vipstore/safety", {',
  'class="ui-icon" aria-hidden="true"><use href="#icon-refresh"',
  'refreshButton.setAttribute("aria-busy", "true")',
  'fetch(orderUrl, { cache: "no-store" })',
  '"Koneksi terputus. Mencoba sekali lagi..."',
  '"Koneksi terputus. Data terakhir tetap ditampilkan; klik Refresh untuk mencoba lagi."',
  'document.querySelectorAll("[data-quick-order]")',
  'ordersSection?.classList.contains("active")',
  ".admin-ops-card.active",
  'class="order-advanced-panel"',
  "Mobile order control: one primary search, compact stats, advanced on demand.",
  'class="admin-order-kicker">Ops // Live</span>',
  'placeholder="Cari ID atau buyer"',
  "scroll-snap-type: inline mandatory",
  'class="toolbar order-date-toolbar"',
  'class="btn-group order-action-grid"',
  'class="danger-btn order-danger-action"',
  "Aksi &amp; pilihan",
  "Fulfillment Ticket: compact mobile order cards.",
  'class="order-fulfillment-table"',
  'class="key-inline-panel"',
  ".order-filter-toolbar .order-desktop-search",
  'class="user-control-deck"',
  'class="user-badge-lab"',
  'for="userSearchInput"',
  "#section-users .user-control-actions",
  'id="userRefreshButton"',
  'refreshButton.setAttribute("aria-busy", "true")',
  'fetch("/users", { cache: "no-store" })',
  "Buyer Ledger: compact mobile account cards.",
  'class="voucher-filter-card"',
  'id="voucherEditorPanel" open',
  'class="voucher-form-grid"',
  "Pilih yang tampil",
  "Kosongkan pilihan",
  'type="hidden" id="voucherGameName"',
  'type="hidden" id="voucherBrandName"',
  'type="hidden" id="voucherDurationName"',
  'fetch("/vouchers", { cache: "no-store" })',
  'async function loadVouchers(resetFilters = false)',
  'onclick="loadVouchers(true)"',
  'await loadVouchers(true);',
  'id="voucherStatusText" aria-live="polite"',
  'document.getElementById("voucherEditorPanel")',
  "padding-bottom: calc(104px + var(--safe-bottom))",
].forEach((marker) =>
  assert.ok(admin.includes(marker), `Missing admin popup marker: ${marker}`),
);
assert.ok(
  !admin.includes('label for="voucherGameName"') &&
    !admin.includes('label for="voucherBrandName"') &&
    !admin.includes('label for="voucherDurationName"'),
  "Legacy voucher scope fields must stay hidden when products are selected",
);
assert.ok(
  server.includes("AS pending_count") &&
    server.includes("AS manual_count") &&
    server.includes("AS delivered_count"),
  "Order control counts must come from the full filtered query",
);
assert.match(
  server,
  /app\.get\("\/users"[\s\S]*?Cache-Control", "private, no-store, max-age=0"/,
);
assert.match(
  admin,
  /const deleteBtn[\s\S]*?return `\s*<tr class="order-ticket-row payment-\$\{escapeHtml\(ps\)\} delivery-\$\{escapeHtml\(ds\)\}"/,
);

assert.ok(
  server.includes('"KEY BELUM TERSEDIA - HUBUNGI ADMIN"'),
  "Supplier failure must use the neutral key placeholder",
);
assert.ok(
  server.includes("ILIKE '%VIP STORE%'") &&
    server.includes("ILIKE '%KEY BELUM TERSEDIA%'"),
  "Safety query must support old and new failure placeholders",
);
[
  '"/admin-orders/:id/complete-manual"',
  "KEY SUDAH DIKIRIM MANUAL OLEH ADMIN",
  "gameKeys.length !== quantity",
  "Order ditandai selesai tanpa mengirim ulang key",
].forEach((marker) =>
  assert.ok(server.includes(marker), `Missing manual completion marker: ${marker}`),
);

console.log("Admin key popup UI check passed.");
