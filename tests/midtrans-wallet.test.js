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
].forEach((marker) => assert.ok(server.includes(marker), `Missing wallet webhook guard: ${marker}`));

console.log("Midtrans wallet security check passed.");
