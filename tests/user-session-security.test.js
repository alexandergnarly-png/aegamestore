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
assert.equal((source.match(/jwt\.verify\(token, jwtSecret, userJwtOptions\)/g) || []).length, 1, "JWT verification must stay centralized");
assert.ok(source.includes('{ algorithm: "HS256", expiresIn: "7d" }'));

console.log("User JWT revocation check passed.");

// The admin user list must never be served from service-worker Cache Storage.
const vm = require("node:vm");
const handlers = {};
vm.runInNewContext(fs.readFileSync("public/service-worker.js", "utf8"), {
  URL,
  self: {
    location: { origin: "https://aegamestore.com" },
    addEventListener: (name, handler) => { handlers[name] = handler; },
  },
});
for (const [path, cache] of [
  ["/users", "default"],
  ["/users?refresh=1", "default"],
  ["/users/19", "default"],
  ["/other-data", "no-store"],
  ["/other-data", "reload"],
]) {
  handlers.fetch({
    request: { method: "GET", url: `https://aegamestore.com${path}`, cache },
    respondWith: () => assert.fail(`${path} (${cache}) must use the network directly`),
  });
}
console.log("Admin user list service-worker bypass checks passed.");
