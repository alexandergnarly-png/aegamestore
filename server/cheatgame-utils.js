const crypto = require("crypto");

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

// Only delivery fields count as keys, never metadata or status messages.
function extractCheatGameClaimKeys(payload) {
  const keys = new Set();
  function collect(value, direct = false) {
    if (typeof value === "string") {
      if (direct && value.trim()) keys.add(value.trim());
      return;
    }
    if (Array.isArray(value)) { value.forEach(item => collect(item, direct)); return; }
    if (!value || typeof value !== "object") return;
    for (const [field, item] of Object.entries(value)) {
      if (["key", "keys", "code", "codes", "license_key", "game_key", "download_link", "download_url"].includes(field)) collect(item, true);
      else if (["data", "order", "result", "items", "delivery"].includes(field)) collect(item);
    }
  }
  collect(payload);
  return [...keys];
}
module.exports = { verifyCheatGameWebhook, extractCheatGameClaimKeys };
