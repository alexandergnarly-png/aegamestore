const crypto = require("crypto");

const ENCRYPTED_PREFIX = "enc:v1:";

function encryptSecret(value, key) {
  const text = String(value || "");
  if (!text || text.startsWith(ENCRYPTED_PREFIX)) return text;
  if (!key) throw new Error("GAME_KEY_ENCRYPTION_KEY belum dikonfigurasi");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return `${ENCRYPTED_PREFIX}${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${encrypted.toString("base64url")}`;
}

function decryptSecret(value, key) {
  const text = String(value || "");
  if (!text.startsWith(ENCRYPTED_PREFIX)) return text;
  if (!key) throw new Error("GAME_KEY_ENCRYPTION_KEY dibutuhkan untuk membaca key terenkripsi");
  const [iv, tag, encrypted] = text.slice(ENCRYPTED_PREFIX.length).split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function decryptSecretWithKeys(value, keys) {
  const candidates = [...new Set((keys || []).filter(Boolean))];
  let lastError;
  for (const key of candidates) {
    try {
      return decryptSecret(value, key);
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) throw lastError;
  return decryptSecret(value, null);
}

function rotateEncryptedSecret(value, primaryKey, fallbackKeys = []) {
  const text = String(value || "");
  if (!text) return text;
  if (text.startsWith(ENCRYPTED_PREFIX)) {
    try {
      decryptSecret(text, primaryKey);
      return text;
    } catch (_) {}
  }
  const plaintext = decryptSecretWithKeys(text, [primaryKey, ...fallbackKeys]);
  return encryptSecret(plaintext, primaryKey);
}

function timingSafeTextEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return (
    leftBuffer.length > 0 &&
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function isTrustedMutationOrigin({ fetchSite, sourceOrigin, targetOrigin }) {
  if (String(fetchSite || "").toLowerCase() === "cross-site") return false;
  if (!sourceOrigin) return true;
  try {
    return new URL(sourceOrigin).origin === new URL(targetOrigin).origin;
  } catch (_) {
    return false;
  }
}

function escapeCsvFormula(value) {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (/^[\t\r ]*[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

module.exports = {
  decryptSecret,
  decryptSecretWithKeys,
  encryptSecret,
  escapeCsvFormula,
  isTrustedMutationOrigin,
  rotateEncryptedSecret,
  timingSafeTextEqual,
};
