const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("server.js", "utf8");

[
  "token_version INTEGER NOT NULL DEFAULT 0",
  "token_version: Number(user.token_version || 0)",
  "decoded.token_version !== Number(user.token_version || 0)",
  "SET password = $1, token_version = token_version + 1",
  "UPDATE users SET token_version = token_version + 1 WHERE id = $1",
].forEach((marker) =>
  assert.ok(source.includes(marker), `Missing session security marker: ${marker}`),
);

const helperCalls = source.match(/getLoggedInUserFromRequest\(req\)/g) || [];
const awaitedCalls = source.match(/await getLoggedInUserFromRequest\(req\)/g) || [];
assert.equal(awaitedCalls.length, helperCalls.length - 1, "Every user auth check must await token revocation lookup");
assert.equal((source.match(/jwt\.verify\(token, jwtSecret\)/g) || []).length, 1, "JWT verification must stay centralized");

console.log("User JWT revocation check passed.");
