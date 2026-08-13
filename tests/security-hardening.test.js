const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const {
  decryptSecret,
  decryptSecretWithKeys,
  encryptSecret,
  escapeCsvFormula,
  rotateEncryptedSecret,
  totp,
  verifyTotp,
} = require("../server/security-utils");
const { PostgresRateLimitStore } = require("../server/postgres-rate-limit-store");

const root = path.join(__dirname, "..");
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
const admin = fs.readFileSync(path.join(root, "views", "admin.html"), "utf8");

const key = Buffer.alloc(32, 7);
const encrypted = encryptSecret("GAME-KEY-123", key);
assert.match(encrypted, /^enc:v1:/);
assert.strictEqual(decryptSecret(encrypted, key), "GAME-KEY-123");
assert.notStrictEqual(encrypted, "GAME-KEY-123");

const oldKey = Buffer.alloc(32, 8);
const newKey = Buffer.alloc(32, 9);
const oldEncrypted = encryptSecret("LEGACY-KEY", oldKey);
assert.strictEqual(
  decryptSecretWithKeys(oldEncrypted, [newKey, oldKey]),
  "LEGACY-KEY",
);
const rotated = rotateEncryptedSecret(oldEncrypted, newKey, [oldKey]);
assert.notStrictEqual(rotated, oldEncrypted);
assert.strictEqual(decryptSecret(rotated, newKey), "LEGACY-KEY");

const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
assert.strictEqual(totp(secret, 59000), "287082");
assert.ok(verifyTotp(secret, "287082", 59000));
assert.ok(!verifyTotp(secret, "000000", 59000));

assert.strictEqual(escapeCsvFormula("=1+1"), "'=1+1");
assert.strictEqual(escapeCsvFormula("safe"), "safe");
assert.ok(server.includes("cleanPassword.length < 6"));
assert.ok(server.includes("cleanNewPassword.length < 12"));
assert.ok(server.includes("verifyTotp(adminTotpSecret, otp)"));
assert.ok(server.includes('code: "ADMIN_AUTH_UNAVAILABLE"'));
assert.ok(server.includes('code: "ADMIN_AUTH_REQUIRED"'));
assert.ok(!server.includes("result.ok ? 200 : result.http_code || 502"));
assert.ok(!/"script-src": \[[\s\S]{0,120}"'unsafe-inline'"/.test(server));
assert.ok(!server.includes('"script-src-attr": ["\'unsafe-inline\'"]'));
assert.ok(server.includes('"script-src-attr": ["\'unsafe-hashes\'", ...inlineEventHandlerHashes]'));
assert.ok(server.includes('"frame-ancestors": ["\'none\'"]'));
assert.ok(server.includes('"form-action": ["\'self\'"]'));
assert.ok(server.includes("GAME_KEY_ENCRYPTION_SECRET"));
assert.ok(server.includes("rotateGameKeyEncryption(row.value)"));
assert.ok(server.includes("hashToken(sessionToken)"));
assert.ok(server.includes('persistentRateLimit("admin-login"'));
assert.ok(!admin.includes("copyOrderDetail(${safeId}, ${safeName}"));
assert.ok(admin.includes('data-copy-order="${escapeHtml(item.id)}"'));
for (const match of admin.matchAll(/\bon(?:click|change|input)=(['"])(.*?)\1/gs)) {
  assert.ok(!match[2].includes("${"), `Dynamic inline handler: ${match[0]}`);
}
const adminSessionCheck = server.slice(
  server.indexOf("async function isAdminLoggedIn"),
  server.indexOf("async function getLoggedInUserFromRequest"),
);
assert.ok(!adminSessionCheck.includes("user_agent = $3"));
assert.ok(server.includes("ip_address, user_agent"));

(async () => {
  const calls = [];
  const pool = {
    async query(sql, params) {
      calls.push({ sql, params });
      return { rows: [{ hit_count: 2, reset_at: new Date(Date.now() + 5000) }] };
    },
  };
  const store = new PostgresRateLimitStore({
    pool,
    prefix: "test",
    ready: Promise.resolve(),
  });
  store.init({ windowMs: 5000 });
  const result = await store.increment("127.0.0.1");
  assert.strictEqual(result.totalHits, 2);
  assert.match(calls[0].params[0], /^[a-f0-9]{64}$/);
  assert.notStrictEqual(calls[0].params[0], "test:127.0.0.1");
  console.log("security-hardening tests passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
