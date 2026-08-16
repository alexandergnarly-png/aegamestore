const assert = require("node:assert/strict");
const {
  calculateUsdtPayment,
  getSafeUsdtIdrRate,
  grossUpPaymentPrice,
  recommendUsdtPrice,
  toUsd,
} = require("../server/payment-pricing");
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

const server = fs.readFileSync("server.js", "utf8");
const html = fs.readFileSync("public/index.html", "utf8");
const script = fs.readFileSync("public/script.js", "utf8");
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

console.log("Payment pricing check passed.");
