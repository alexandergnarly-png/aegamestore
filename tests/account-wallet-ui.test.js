const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("public/account.html", "utf8");
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];

scripts.forEach(([, source]) => assert.doesNotThrow(() => new Function(source)));
[
  'id="walletTopupAmount"',
  'id="walletSubmitButton"',
  'id="walletActivityHistory"',
  'data-amount="100000"',
  'walletSubmitAmount: "Kirim top up {amount}"',
].forEach((marker) => assert.ok(html.includes(marker), `Missing wallet UI marker: ${marker}`));

console.log("AE Credit account UI check passed.");
