const assert = require("node:assert/strict");
const { grossUpPaymentPrice, toUsd } = require("../server/payment-pricing");
const fs = require("node:fs");

const cardGross = grossUpPaymentPrice(100000, 0.029, 2000, 0.11);
const cardFeeWithVat = (cardGross * 0.029 + 2000) * 1.11;
assert.ok(cardGross - cardFeeWithVat >= 100000, "Card gross-up must preserve net revenue");
assert.ok(cardGross - 1 - ((cardGross - 1) * 0.029 + 2000) * 1.11 < 100000);
assert.equal(grossUpPaymentPrice(100000, 0.007, 0, 0.11), 100784);
assert.equal(toUsd(18000), 1);
assert.equal(toUsd(27000), 1.5);

const server = fs.readFileSync("server.js", "utf8");
const html = fs.readFileSync("public/index.html", "utf8");
assert.match(server, /enabled_payments: \["credit_card"\]/);
assert.match(server, /credit_card: \{ secure: true \}/);
assert.match(server, /enabled_payments: \["other_qris"\]/);
assert.match(html, /data-payment-method="midtrans_card"/);
assert.match(html, /id="paymentFeeLabel"/);

console.log("Payment pricing check passed.");
