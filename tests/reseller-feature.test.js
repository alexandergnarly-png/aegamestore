const assert = require("node:assert/strict");
const fs = require("node:fs");

const server = fs.readFileSync("server.js", "utf8");
const page = fs.readFileSync("public/reseller.html", "utf8");
const login = fs.readFileSync("public/reseller-login.html", "utf8");
const checkout = fs.readFileSync("public/reseller-checkout.html", "utf8");
const admin = fs.readFileSync("views/admin.html", "utf8");

assert.ok(server.includes("const RESELLER_MIN_DEPOSIT_USD = 10"));
assert.ok(server.includes("https://api.frankfurter.dev/v2/rate/USD/IDR"));
assert.ok(server.includes("getResellerUsdIdrRate()"));
assert.ok(server.includes("AbortSignal.timeout(5000)"));
assert.ok(server.includes("min_topup: Math.ceil(RESELLER_MIN_DEPOSIT_USD * resellerRate)"));
assert.ok(!server.includes("resellerMinDepositIdr"));

const inlineScripts = (html) =>
  [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(
    ([, source]) => source,
  );

[page, login, checkout, admin].forEach((html) =>
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
  "getResellerPricing(productRow, resellerRate).unit_idr",
  "getResellerFinancials(productRow, cleanQuantity, resellerRate)",
  "SET pricing_tier = $2, supplier_cost = $3, gross_profit = $4",
  "bukan produk API",
  "LOWER(COALESCE(p.delivery_type, '')) IN ('vipstore_api', 'cheatgame_api')",
  "calculateResellerPrice(supplierUnitCost, exchangeRate)",
].forEach((marker) =>
  assert.ok(
    server.includes(marker),
    `Missing reseller server marker: ${marker}`,
  ),
);

const pageJs = inlineScripts(page).join("\n");
const loginJs = inlineScripts(login).join("\n");
const hasId = (id) => new RegExp(`\\bid=["']${id}["']`).test(page);
const hasLoginId = (id) => new RegExp(`\\bid=["']${id}["']`).test(login);

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
assert.match(page, /Modal API/);
assert.match(page, /Harga reseller/);
assert.doesNotMatch(page, /% off/);
assert.doesNotMatch(server, /RESELLER_DISCOUNT_RATE/);

assert.match(pageJs, /fetch\(\s*["']\/api\/reseller["']/);
assert.match(pageJs, /fetch\(\s*["']\/api\/reseller\/preview\?/);
assert.match(pageJs, /fetch\(\s*["']\/api\/wallet\/topups\/midtrans["']/);
assert.match(pageJs, /fetch\(\s*["']\/create-order["']/);
assert.match(pageJs, /["']x-user-csrf-token["']\s*:/);
assert.match(pageJs, /payment_method\s*:\s*["']ae_credit["']/);
assert.match(pageJs, /reseller_order\s*:\s*true/);
assert.match(pageJs, /return_to\s*:\s*["']reseller["']/);
assert.match(pageJs, /status\s*===\s*409[\s\S]*TOPUP_PENDING/);
assert.match(pageJs, /location\.assign\(data\.checkoutUrl\)/);
assert.match(pageJs, /status\s*===\s*401[\s\S]*status\s*===\s*403/);
assert.match(page, /Midtrans/i);
assert.match(page, /(?:fee|tagihan)/i);
assert.match(page, /data-lang=["']en["']/);
assert.match(page, /Fast stock\. Clear margins\./);
assert.match(pageJs, /localStorage\.getItem\(["']ae_lang["']\)/);
assert.doesNotMatch(page, /(?:Ã.|Â.|â€¦|â€”|ï¿½|�)/u);

const pageIds = [...page.matchAll(/\bid=["']([^"']+)["']/g)].map(
  ([, id]) => id,
);
assert.equal(pageIds.length, new Set(pageIds).size, "Duplicate HTML id found");

[
  "loginForm",
  "username",
  "password",
  "reveal",
  "submitButton",
  "submitLabel",
  "message",
].forEach((id) =>
  assert.ok(hasLoginId(id), `Missing reseller login control #${id}`),
);

assert.match(login, /<meta[^>]+name=["']viewport["']/i);
assert.match(login, /href=["']\/favicon\.svg["']/i);
assert.match(login, /href=["']#loginForm["']/i);
assert.match(login, /:focus-visible/);
assert.match(login, /prefers-reduced-motion\s*:\s*reduce/);
assert.match(login, /aria-live=["']polite["']/);
assert.match(login, /role=["']status["']/);
assert.match(login, /<label[^>]+for=["']username["']/i);
assert.match(login, /<label[^>]+for=["']password["']/i);
assert.match(login, /autocomplete=["']username["']/i);
assert.match(login, /autocomplete=["']current-password["']/i);
assert.match(login, /id=["']password["'][\s\S]*?type=["']password["']/i);
assert.match(login, /id=["']reveal["'][\s\S]*?aria-pressed=["']false["']/i);
assert.match(login, /id=["']submitButton["'][^>]*type=["']submit["']/i);
assert.match(login, /Masuk ke Reseller Desk/);
assert.match(login, /data-lang=["']en["']/);
assert.match(login, /Sign in to Reseller Desk/);
assert.match(loginJs, /localStorage\.getItem\(["']ae_lang["']\)/);

assert.match(loginJs, /fetch\(\s*["']\/user-login["']/);
assert.match(loginJs, /["']Content-Type["']\s*:\s*["']application\/json["']/);
assert.match(loginJs, /username\s*:\s*username\.value\.trim\(\)/);
assert.match(loginJs, /password\s*:\s*password\.value/);
assert.match(loginJs, /reseller_login\s*:\s*true/);
assert.match(loginJs, /location\.replace\(["']\/reseller["']\)/);
assert.match(loginJs, /form\.reportValidity\(\)/);
assert.match(
  loginJs,
  /new URLSearchParams\(location\.search\)\.has\(["']denied["']\)/,
);
assert.match(loginJs, /button\.disabled\s*=\s*busy/);
assert.match(loginJs, /password\.focus\(\)/);
assert.match(loginJs, /setAttribute\([\s\S]*?["']aria-pressed["']/);

const loginIds = [...login.matchAll(/\bid=["']([^"']+)["']/g)].map(
  ([, id]) => id,
);
assert.equal(
  loginIds.length,
  new Set(loginIds).size,
  "Duplicate reseller login id found",
);
assert.doesNotMatch(login, /(?:Ãƒ.|Ã‚.|Ã¢â‚¬Â¦|Ã¢â‚¬â€|Ã¯Â¿Â½|ï¿½)/u);

assert.ok(admin.includes("setResellerStatus"));
assert.ok(admin.includes("/users/${userId}/reseller-status"));
assert.ok(admin.includes('id="resellerBadgeSearchInput"'));
assert.ok(admin.includes('id="resellerBadgeTableBody"'));
assert.ok(admin.includes("renderResellerBadgeMatches"));
assert.ok(admin.includes("Modal Supplier"));
assert.ok(admin.includes("Laba Kotor"));
[
  'id="section-resellers"',
  'id="resellerControlTableBody"',
  'id="resellerDepositTableBody"',
  'id="resellerProfitTableBody"',
  'id="resellerDetailDialog"',
  "loadResellerControl",
  "openResellerDetail",
  "adjustResellerBalance",
].forEach((marker) => assert.ok(admin.includes(marker), `Missing reseller admin UI marker: ${marker}`));
[
  'app.get("/api/admin/resellers"',
  'app.get("/api/admin/resellers/:id"',
  'app.post("/api/admin/resellers/:id/balance"',
  "admin_reseller_adjustment",
  "balance_before",
  "balance_after",
  "scope = String(req.query.scope",
].forEach((marker) => assert.ok(server.includes(marker), `Missing reseller admin API marker: ${marker}`));
[
  "section-resellers",
  "resellerControlTableBody",
  "resellerDepositTableBody",
  "resellerProfitTableBody",
  "resellerDetailDialog",
].forEach((id) => assert.equal((admin.match(new RegExp(`id="${id}"`, "g")) || []).length, 1, `Duplicate reseller admin ID: ${id}`));
assert.ok(!page.includes("linear-gradient"));
assert.ok(!login.includes("linear-gradient"));
assert.ok(!login.includes("Periksa badge & masuk"));
assert.ok(!login.includes("Badge check"));
assert.ok(!login.includes("Approved access only"));
assert.ok(!login.includes("RESELLER ENTRY."));
assert.ok(!page.includes("1 USD"));
assert.ok(!page.includes("Ajukan akun reseller"));
assert.ok(!page.includes("Biaya Midtrans"));
assert.ok(!page.includes("Fund reseller wallet"));
assert.ok(!page.includes("Ready to spend"));
assert.ok(!server.includes('app.post("/api/reseller/apply"'));

[
  'id="checkout"',
  'id="statusCard"',
  'id="payButton"',
  'id="checkButton"',
  'id="fallbackLink"',
  "Snap resmi Midtrans",
  "Selesaikan deposit.",
].forEach((marker) => assert.ok(checkout.includes(marker), `Missing reseller checkout UI marker: ${marker}`));
assert.match(checkout, /<meta[^>]+name=["']viewport["']/i);
assert.match(checkout, /:focus-visible/);
assert.match(checkout, /prefers-reduced-motion\s*:\s*reduce/);
assert.match(checkout, /aria-live=["']polite["']/);
assert.match(checkout, /window\.snap\.pay\(/);
assert.match(checkout, /\/api\/wallet\/topups\/\$\{encodeURIComponent\(topupId\)\}\/checkout/);
assert.match(checkout, /\(\^\|\\\.\)midtrans\\\.com\$/);
assert.match(checkout, /protocol\s*!==\s*["']https:["']/);
assert.doesNotMatch(checkout, /linear-gradient/);
assert.doesNotMatch(checkout, /(?:Ãƒ.|Ã‚.|Ã¢â‚¬Â¦|Ã¢â‚¬â€|Ã¯Â¿Â½|ï¿½)/u);

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
