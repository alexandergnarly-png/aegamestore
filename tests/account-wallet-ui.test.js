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
  'walletSubmitAmount: "Bayar {amount} via Midtrans"',
  'onclick="createWalletMidtransTopup()"',
  'class="wallet-optional wallet-manual-fallback"',
  'class="skip-link" data-account-i18n="skipToContent" href="#account-main"',
  'id="account-main" tabindex="-1"',
  'aria-controls="panel-wallet"',
  'aria-pressed="false" class="wallet-amount-chip"',
  'class="account-orbit-icon" icon="mdi:account-outline"',
].forEach((marker) => assert.ok(html.includes(marker), `Missing wallet UI marker: ${marker}`));

console.log("AE Credit account UI check passed.");
