const crypto = require("crypto");

function normalizeCatalogLabel(value) {
  if (Array.isArray(value)) return value.map(normalizeCatalogLabel).filter(Boolean).join(" / ");
  if (value && typeof value === "object") {
    return normalizeCatalogLabel(value.name ?? value.title ?? value.label ?? value.value ?? "");
  }
  return String(value ?? "").trim();
}

function verifyCheatGameWebhook({ timestamp, eventId, rawBody, signature, secret, now = Date.now() }) {
  const cleanTimestamp = String(timestamp || "").trim();
  const time = Number(cleanTimestamp);
  const cleanEventId = String(eventId || "").trim();
  const cleanSignature = String(signature || "").trim().replace(/^sha256=/i, "");
  if (!secret || !cleanEventId || !/^\d+$/.test(cleanTimestamp) || !/^[a-f0-9]{64}$/i.test(cleanSignature)) return false;
  if (Math.abs(Math.floor(now / 1000) - time) > 300) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${cleanTimestamp}.${cleanEventId}.${String(rawBody || "")}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(cleanSignature, "hex"), Buffer.from(expected, "hex"));
}

module.exports = { normalizeCatalogLabel, verifyCheatGameWebhook };
