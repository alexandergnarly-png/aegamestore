const assert = require("node:assert/strict");
const fs = require("node:fs");

const server = fs.readFileSync("server.js", "utf8");
const page = fs.readFileSync("public/reseller.html", "utf8");
const login = fs.readFileSync("public/reseller-login.html", "utf8");
const admin = fs.readFileSync("views/admin.html", "utf8");

assert.ok(server.includes("const RESELLER_MIN_DEPOSIT_USD = 10"));
assert.ok(server.includes("min_topup: resellerMinDepositIdr"));

const inlineScripts = (html) =>
  [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(
    ([, source]) => source,
  );

[page, login].forEach((html) =>
  inlineScripts(html).forEach((source) =>
    assert.doesNotThrow(() => new Function(source)),
  ),
);

[
  'app.get("/reseller"',
  'app.get("/reseller-login"',
  'app.get("/api/reseller"',
  'app.get("/api/reseller/preview"',
  "reseller_status = 'approved'",
  'resellerLogin && normalizeResellerStatus(user.reseller_status) !== "approved"',
  '!["approved", "suspended"].includes(status)',
  'resellerOrder && paymentMethod !== "ae_credit"',
  "Order reseller dibayar dari deposit",
  'calculatePaymentPrice(subtotal, "ae_credit")',
  'returnToReseller ? "reseller" : "account"',
  "Voucher tidak dapat digabung dengan harga reseller",
  "getResellerPricing(productRow).unit_idr",
  "getResellerFinancials(productRow, cleanQuantity)",
  "supplier_cost = $2, gross_profit = $3",
  "bukan produk API",
  "LOWER(COALESCE(p.delivery_type, '')) IN ('vipstore_api', 'cheatgame_api')",
  "RESELLER_DISCOUNT_RATE",
].forEach((marker) =>
  assert.ok(
    server.includes(marker),
    `Missing reseller server marker: ${marker}`,
  ),
);

const pageJs = inlineScripts(page).join("\n");
const hasId = (id) => new RegExp(`\\bid=["']${id}["']`).test(page);

[
  "balanceUsd",
  "balanceIdr",
  "depositForm",
  "depositAmount",
  "quickAmounts",
  "depositButton",
  "depositMessage",
  "discountPercent",
  "gamePicker",
  "gamePickerSummary",
  "gamePickerMenu",
  "selectedProduct",
  "variantPicker",
  "quantityPicker",
  "quantity",
  "unitPrice",
  "subtotal",
  "balanceAfter",
  "checkoutButton",
  "checkoutMessage",
  "productCount",
  "search",
  "catalog",
  "orders",
].forEach((id) => assert.ok(hasId(id), `Missing reseller control #${id}`));

assert.match(page, /<meta[^>]+name=["']viewport["']/i);
assert.match(page, /:focus-visible/);
assert.match(page, /prefers-reduced-motion\s*:\s*reduce/);
assert.match(page, /aria-live=["'](?:polite|assertive)["']/);
assert.match(page, /type=["']search["']/);
assert.match(page, /inputmode=["']numeric["']/);
assert.match(page, /data-usd=["']10["']/);
assert.match(page, /class=["'][^"']*\bgame-group\b[^"']*["']/);
assert.match(page, /class=["'][^"']*\bbrand-block\b[^"']*["']/);
assert.match(page, /Produk API/);
assert.match(page, /key supplier/);
assert.match(page, /Order dari saldo/);

assert.match(pageJs, /fetch\(\s*["']\/api\/reseller["']/);
assert.match(pageJs, /fetch\(\s*["']\/api\/reseller\/preview\?/);
assert.match(pageJs, /fetch\(\s*["']\/api\/wallet\/topups\/midtrans["']/);
assert.match(pageJs, /fetch\(\s*["']\/create-order["']/);
assert.match(pageJs, /["']x-user-csrf-token["']\s*:/);
assert.match(pageJs, /payment_method\s*:\s*["']ae_credit["']/);
assert.match(pageJs, /reseller_order\s*:\s*true/);
assert.match(pageJs, /return_to\s*:\s*["']reseller["']/);
assert.match(pageJs, /status\s*===\s*409[\s\S]*TOPUP_PENDING/);
assert.match(pageJs, /midtrans\\\.com/);
assert.match(pageJs, /protocol\s*!==\s*["']https:["']/);
assert.match(pageJs, /status\s*===\s*401[\s\S]*status\s*===\s*403/);
assert.match(page, /Midtrans/i);
assert.match(page, /(?:fee|tagihan)/i);
assert.doesNotMatch(page, /(?:Ã.|Â.|â€¦|â€”|ï¿½|�)/u);

const pageIds = [...page.matchAll(/\bid=["']([^"']+)["']/g)].map(
  ([, id]) => id,
);
assert.equal(pageIds.length, new Set(pageIds).size, "Duplicate HTML id found");

[
  'id="loginForm"',
  'id="submitButton" type="submit">Login</button>',
  "reseller_login: true",
  'location.replace("/reseller")',
  "Badge check",
  'rel="icon" href="/favicon.svg"',
  "<h1><span>RESELLER</span><span>ENTRY.</span></h1>",
].forEach((marker) =>
  assert.ok(login.includes(marker), `Missing reseller login marker: ${marker}`),
);

assert.ok(admin.includes("setResellerStatus"));
assert.ok(admin.includes("/users/${userId}/reseller-status"));
assert.ok(admin.includes('id="resellerBadgeSearchInput"'));
assert.ok(admin.includes('id="resellerBadgeTableBody"'));
assert.ok(admin.includes("renderResellerBadgeMatches"));
assert.ok(admin.includes("Modal Supplier"));
assert.ok(admin.includes("Laba Kotor"));
assert.ok(!page.includes("linear-gradient"));
assert.ok(!login.includes("Periksa badge & masuk"));
assert.ok(!page.includes("1 USD"));
assert.ok(!page.includes("Ajukan akun reseller"));
assert.ok(!page.includes("Biaya Midtrans"));
assert.ok(!page.includes("Fund reseller wallet"));
assert.ok(!page.includes("Ready to spend"));
assert.ok(!server.includes('app.post("/api/reseller/apply"'));

const resellerLoginRoute = server.slice(
  server.indexOf('app.post("/user-login"'),
  server.indexOf('app.get("/user/orders"'),
);
const badgeCheckIndex = resellerLoginRoute.indexOf(
  "resellerLogin && normalizeResellerStatus",
);
const loginCookieIndex = resellerLoginRoute.indexOf('res.cookie("user_auth"');
assert.ok(
  badgeCheckIndex >= 0 && loginCookieIndex > badgeCheckIndex,
  "Badge reseller must be checked before the login cookie is created",
);

console.log("Reseller Desk security and UI checks passed.");
