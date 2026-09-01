const assert = require("node:assert/strict");
const {
  calculateNetProfit,
  calculateResellerPrice,
  calculateUsdtPayment,
  getSafeUsdtIdrRate,
  grossUpPaymentPrice,
  isResellerQuoteAccepted,
  parseMarketUsdIdrRate,
  recommendUsdtPrice,
  toUsd,
} = require("../server/payment-pricing");
const {
  normalizeProductDuration,
  normalizeProductGameName,
} = require("../server/product-utils");
const fs = require("node:fs");

assert.equal(grossUpPaymentPrice(100000, 0.007, 0.11), 100784);
assert.equal(toUsd(18000), 1);
assert.equal(toUsd(27000), 1.5);
assert.equal(recommendUsdtPrice(25000, 18000), 1.5);
assert.equal(recommendUsdtPrice(53000, 18000), 3.1);
assert.equal(calculateUsdtPayment(50000, 1.5, 25000, 18000), 3);
assert.equal(calculateUsdtPayment(45000, 1.5, 25000, 18000), 2.7);
assert.equal(getSafeUsdtIdrRate(16000), 18000);
assert.equal(getSafeUsdtIdrRate(19500), 19500);
assert.equal(getSafeUsdtIdrRate(undefined, 0), 18000);
assert.equal(parseMarketUsdIdrRate(17694.4), 17694);
assert.equal(parseMarketUsdIdrRate("20000"), 20000);
assert.equal(parseMarketUsdIdrRate(5000), null);
assert.equal(parseMarketUsdIdrRate("invalid"), null);
assert.equal(calculateNetProfit(100784, 784, 80000), 20000);
assert.equal(calculateNetProfit(23400, 0, 18000), 5400);
assert.equal(calculateNetProfit(100, 10, 120), -30);
assert.deepEqual(calculateResellerPrice(18000, 18000), {
  unit_idr: 23400,
  unit_usd: 1.3,
  profit_idr: 5400,
  profit_usd: 0.3,
});
assert.equal(calculateResellerPrice(90000, 18000).profit_usd, 0.5);
assert.deepEqual(calculateResellerPrice(360000, 18000), {
  unit_idr: 396000,
  unit_usd: 22,
  profit_idr: 36000,
  profit_usd: 2,
});
assert.deepEqual(calculateResellerPrice(900000, 18000), {
  unit_idr: 990000,
  unit_usd: 55,
  profit_idr: 90000,
  profit_usd: 5,
});
assert.equal(isResellerQuoteAccepted(396000, 396000), true);
assert.equal(isResellerQuoteAccepted(396000, 390000), true);
assert.equal(isResellerQuoteAccepted(396000, 396001), false);
assert.equal(isResellerQuoteAccepted(undefined, 396000), false);
assert.equal(normalizeProductGameName("  Pubg M "), "PUBG Mobile");
assert.equal(normalizeProductGameName("8Ball   Pool"), "8 Ball Pool");
assert.equal(normalizeProductGameName("Game Baru"), "Game Baru");
assert.equal(normalizeProductDuration("1hari"), "1 Hari");
assert.equal(normalizeProductDuration(" 30   HARI "), "30 Hari");

const server = fs.readFileSync("server.js", "utf8");
const html = fs.readFileSync("public/index.html", "utf8");
const script = fs.readFileSync("public/script.js", "utf8");
const admin = fs.readFileSync("views/admin.html", "utf8");
assert.match(server, /enabled_payments: \["other_qris"\]/);
assert.doesNotMatch(server, /midtrans_card|MIDTRANS_CARD/);
assert.doesNotMatch(html, /data-payment-method="midtrans_card"|International Cards/);
assert.match(html, /id="paymentFeeLabel"/);
assert.match(script, /window\.snap\.pay\(state\.currentSnapToken, callbacks\)/);
assert.doesNotMatch(script, /window\.snap\.embed\(/);
assert.match(server, /price_usdt NUMERIC\(12,2\)/);
assert.match(server, /price_usdt_recommended/);
assert.match(script, /price_usdt_effective/);
assert.match(server, /VIPSTORE RATE: endpoint rate tidak tersedia, memakai rate aman/);
assert.doesNotMatch(server, /VIPSTORE_EXCHANGE_RATE_UNAVAILABLE/);
assert.match(admin, /Harga manual \$\{formatUsdt\(price_usdt\)\} tersimpan/);
assert.match(admin, /if \(!isEditMode\) \{\s*resetProductForm\(\)/);
assert.match(admin, /role="combobox"/);
assert.match(admin, /role="listbox"/);
assert.match(admin, /function setupProductCombobox\(inputId, listId\)/);
assert.match(admin, /function populateProductSuggestions\(products\)/);
assert.doesNotMatch(admin, /<datalist/);
assert.match(admin, /function setupAdminSelect\(select\)/);
assert.match(admin, /select\.multiple \|\| select\.hidden/);
assert.match(admin, /document\.querySelectorAll\("body select"\)\.forEach\(setupAdminSelect\)/);
assert.match(admin, /className = "admin-select-list"/);
assert.match(admin, /new MutationObserver\(render\)\.observe\(select/);
assert.match(admin, /product-panel-content product-filter-grid/);
assert.match(admin, /product-panel-content product-editor-grid/);
assert.match(admin, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);

console.log("Payment pricing check passed.");
