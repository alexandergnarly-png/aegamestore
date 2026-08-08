const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const {
  decryptSecret,
  encryptSecret,
  escapeCsvFormula,
  totp,
  verifyTotp,
} = require("../server/security-utils");

const root = path.join(__dirname, "..");
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
const admin = fs.readFileSync(path.join(root, "views", "admin.html"), "utf8");

const key = Buffer.alloc(32, 7);
const encrypted = encryptSecret("GAME-KEY-123", key);
assert.match(encrypted, /^enc:v1:/);
assert.strictEqual(decryptSecret(encrypted, key), "GAME-KEY-123");
assert.notStrictEqual(encrypted, "GAME-KEY-123");

const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
assert.strictEqual(totp(secret, 59000), "287082");
assert.ok(verifyTotp(secret, "287082", 59000));
assert.ok(!verifyTotp(secret, "000000", 59000));

assert.strictEqual(escapeCsvFormula("=1+1"), "'=1+1");
assert.strictEqual(escapeCsvFormula("safe"), "safe");
assert.ok(server.includes("cleanPassword.length < 12"));
assert.ok(server.includes("verifyTotp(adminTotpSecret, otp)"));
assert.ok(!/"script-src": \[[\s\S]{0,120}"'unsafe-inline'"/.test(server));
assert.ok(!admin.includes("copyOrderDetail(${safeId}, ${safeName}"));
assert.ok(admin.includes('data-copy-order="${escapeHtml(item.id)}"'));

console.log("security-hardening tests passed");
