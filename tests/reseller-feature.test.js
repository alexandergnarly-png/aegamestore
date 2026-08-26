const assert = require("node:assert/strict");
const fs = require("node:fs");

const server = fs.readFileSync("server.js", "utf8");
const page = fs.readFileSync("public/reseller.html", "utf8");
const login = fs.readFileSync("public/reseller-login.html", "utf8");
const admin = fs.readFileSync("views/admin.html", "utf8");

[page, login].forEach((html) =>
  [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].forEach(
    ([, source]) => assert.doesNotThrow(() => new Function(source)),
  ),
);

[
  'app.get("/reseller"',
  'app.get("/reseller-login"',
  'app.get("/api/reseller"',
  'app.get("/api/reseller/preview"',
  'reseller_status = \'approved\'',
  'resellerLogin && normalizeResellerStatus(user.reseller_status) !== "approved"',
  '!["approved", "suspended"].includes(status)',
  'resellerOrder && paymentMethod !== "midtrans"',
  'Voucher tidak dapat digabung dengan harga reseller',
  "getResellerPricing(productRow).unit_idr",
  "UPDATE orders SET pricing_tier = 'reseller'",
  'RESELLER_DISCOUNT_RATE',
].forEach((marker) => assert.ok(server.includes(marker), `Missing reseller server marker: ${marker}`));

[
  'id="balanceUsd"',
  'id="checkoutButton"',
  'payment_method:"midtrans"',
  'reseller_order:true',
  '/(^|\\.)midtrans\\.com$/i',
].forEach((marker) => assert.ok(page.includes(marker), `Missing reseller UI marker: ${marker}`));

[
  'id="loginForm"',
  'id="submitButton" type="submit">Login</button>',
  'reseller_login: true',
  'location.replace("/reseller")',
  'Badge check',
].forEach((marker) => assert.ok(login.includes(marker), `Missing reseller login marker: ${marker}`));

assert.ok(admin.includes("setResellerStatus"));
assert.ok(admin.includes("/users/${userId}/reseller-status"));
assert.ok(admin.includes('id="resellerBadgeSearchInput"'));
assert.ok(admin.includes('id="resellerBadgeTableBody"'));
assert.ok(admin.includes("renderResellerBadgeMatches"));
assert.ok(!page.includes("linear-gradient"));
assert.ok(!login.includes("Periksa badge & masuk"));
assert.ok(!page.includes("1 USD"));
assert.ok(!page.includes("Ajukan akun reseller"));
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
