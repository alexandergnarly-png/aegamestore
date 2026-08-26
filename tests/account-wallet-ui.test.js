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
  'src="/qris.png" alt="QRIS AE Game Store" loading="lazy" decoding="async" fetchpriority="low"',
  'class="skip-link" data-account-i18n="skipToContent" href="#account-main"',
  'id="account-main" tabindex="-1"',
  'aria-controls="panel-wallet"',
  'aria-pressed="false" class="wallet-amount-chip"',
  'class="account-orbit-icon" icon="mdi:account-outline"',
  'padding: max(12px, env(safe-area-inset-top, 0px)) 22px 12px',
  'min-height: 60px;',
  'width: 44px;',
  'border-radius: 13px;',
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none">',
  'class="btn btn-primary" href="/reseller-login"',
  'flex-wrap: nowrap;',
  'minlength="6"',
  'newPassword.length < 6 || newPassword.length > 72',
].forEach((marker) => assert.ok(html.includes(marker), `Missing wallet UI marker: ${marker}`));

console.log("AE Credit account UI check passed.");
