const assert = require("node:assert/strict");
const fs = require("node:fs");

const admin = fs.readFileSync("views/admin.html", "utf8");
const server = fs.readFileSync("server.js", "utf8");
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
  'document.querySelectorAll(".product-control-panel")',
].forEach((marker) =>
  assert.ok(admin.includes(marker), `Missing admin popup marker: ${marker}`),
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
