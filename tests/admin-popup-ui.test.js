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
  "AE patch 20260825-order-receipt-v1",
  'class="order-drawer-brief"',
  'class="order-drawer-section is-status"',
  'class="order-drawer-field order-key-panel"',
  'class="order-drawer-field claim-log-entry"',
  'class="ghost-btn order-copy-action"',
  'class="order-drawer-head-copy"',
  "Retry Claim Supplier",
  "Tandai Selesai",
  "completeManualOrder",
  "function showAdminLoading(title, text)",
  'customClass: { popup: "admin-loading-popup" }',
  'class="admin-loading-track" role="progressbar"',
  'id="adminLoadingPercent">8%</strong>',
  "async function finishAdminLoading",
  'await finishAdminLoading("Produk tersimpan")',
  "function showAdminSuccess(",
  'class="admin-success-receipt"',
  'popup: "admin-success-popup"',
  'confirmButton: "admin-success-confirm"',
  'isEditMode ? "Produk diperbarui" : "Produk ditambahkan"',
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
  "Inventory Ticket: scannable mobile product records.",
  'class="product-inventory-card"',
  'class="product-card-price"',
  'class="product-card-supplier ${isAdminSupplierDelivery(item.delivery_type) ? "" : "is-empty"}"',
  "Operations Brief: prioritized mobile dashboard.",
  'class="stats dashboard-metrics delay-1"',
  'class="dashboard-metric-rail"',
  'class="stat-card dashboard-primary-metric"',
  'class="stat-card dashboard-metric-profit"',
  'id="netProfitMonthStat"',
  'class="dashboard-session-panel"',
  "Muat Ulang Data",
  "Pocket Log: useful actions and live order context fill the dashboard tail.",
  'id="dashboardActivityList"',
  "function loadDashboardActivity()",
  "openDashboardWorkspace('products', 'productEditorPanel')",
  "Admin Command Deck: management and system actions have distinct weight.",
  'class="admin-more-sheet-kicker">Admin toolbox</small>',
  'class="admin-more-sheet-grid is-system"',
  "Keluar dari panel admin",
  "Key Vault Workstation: inventory first, recovery on demand.",
  'class="key-vault-stats"',
  'id="keyStockPanel" open',
  'class="card key-control-panel key-reset-panel delay-2"',
  'class="key-inventory-table"',
  'id="keyPageAvailableStat"',
  'fetch(\`/keys?fresh=\${Date.now()}\`,',
  'class="key-inventory-card \${Number(item.used) === 1 ? "is-used" : "is-ready"}"',
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
  "Buyer Registry: account-first operations with access tools on demand.",
  'class="user-registry-hero delay-1"',
  'id="userTotalStat"',
  'id="userResellerStat"',
  'id="userPaidOrderStat"',
  'id="userSpendStat"',
  'id="userDirectoryCountBadge"',
  'class="user-access-grid"',
  "function updateUserRegistryStats()",
  'class="user-state-card"',
  'class="user-identity"',
  "#section-users .user-control-actions",
  'id="userRefreshButton"',
  'refreshButton.setAttribute("aria-busy", "true")',
  'fetch("/users", { cache: "no-store" })',
  'aria-describedby="resellerDetailMeta"',
  'class="reseller-detail-heading"',
  'class="reseller-detail-summary"><div class="is-balance"',
  'class="reseller-adjustment-head"',
  'class="reseller-detail-loading" role="status"',
  "grid-template-rows: auto minmax(0, 1fr)",
  "overscroll-behavior: contain",
  "height: min(760px, calc(100dvh - 20px - env(safe-area-inset-top) - env(safe-area-inset-bottom)))",
  'class="voucher-filter-card"',
  'id="voucherEditorPanel" open',
  'class="voucher-form-grid"',
  "Pilih yang tampil",
  "Kosongkan pilihan",
  'type="hidden" id="voucherGameName"',
  'type="hidden" id="voucherBrandName"',
  'type="hidden" id="voucherDurationName"',
  '`/vouchers?fresh=${Date.now()}-${loadVersion}`',
  "if (loadVersion !== voucherLoadVersion) return;",
  'async function loadVouchers(resetFilters = false)',
  'onclick="loadVouchers(true)"',
  'await loadVouchers(true);',
  'id="voucherStatusText" aria-live="polite"',
  'class="table-wrap voucher-ledger-wrap"',
  'class="voucher-ticket-card ${active ? "is-active" : "is-inactive"}"',
  'class="voucher-ticket-actions"',
  'document.getElementById("voucherEditorPanel")',
  "padding-bottom: calc(100px + var(--safe-bottom))",
].forEach((marker) =>
  assert.ok(admin.includes(marker), `Missing admin popup marker: ${marker}`),
);
assert.ok(
  !admin.includes('class="user-badge-lab reseller-badge-lab" open'),
  "Reseller access tools should stay collapsed until requested",
);
assert.ok(
  !admin.includes("margin: auto 6px 0") &&
    !admin.includes("margin: auto 0 0"),
  "Reseller detail dialog must stay centered instead of becoming a bottom sheet",
);
assert.match(
  admin,
  /\.reseller-detail-dialog\s*\{\s*position:\s*fixed;\s*inset:\s*0;/,
  "Reseller detail dialog must be positioned against the viewport",
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
assert.ok(
  server.includes("net_profit_month") &&
    server.includes("o.delivery_status = 'delivered'"),
  "Dashboard profit must only include paid, delivered orders",
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
