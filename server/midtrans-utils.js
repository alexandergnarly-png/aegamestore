const crypto = require("node:crypto");

function verifyMidtransSignature(notification, serverKey) {
  const orderId = String(notification?.order_id || "");
  const statusCode = String(notification?.status_code || "");
  const grossAmount = String(notification?.gross_amount || "");
  const signatureKey = String(notification?.signature_key || "");
  const secret = String(serverKey || "");

  if (!orderId || !statusCode || !grossAmount || !signatureKey || !secret) return false;

  const expected = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + secret)
    .digest("hex");
  const actualBuffer = Buffer.from(signatureKey, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function parseMidtransAmount(value) {
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : 0;
}

module.exports = { parseMidtransAmount, verifyMidtransSignature };
