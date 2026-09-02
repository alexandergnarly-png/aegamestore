const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "public", "result.html"), "utf8");
const css = fs.readFileSync(
  path.join(root, "public", "result-redesign.css"),
  "utf8",
);
const serviceWorker = fs.readFileSync(
  path.join(root, "public", "service-worker.js"),
  "utf8",
);

const inlineScripts = [
  ...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi),
].map((match) => match[1]);

assert.ok(
  inlineScripts.length > 0,
  "result page should keep its order renderer",
);
inlineScripts.forEach((source) => {
  assert.doesNotThrow(
    () => new Function(source),
    "inline result script must parse",
  );
});
const script = inlineScripts.join("\n");
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);

assert.strictEqual(
  new Set(ids).size,
  ids.length,
  "result page IDs must be unique",
);

assert.match(html, /<meta name="viewport"[^>]*width=device-width/);
assert.match(html, /class="skip-link" href="#main-content"/);
assert.match(html, /<main[^>]*id="main-content"[^>]*tabindex="-1"/);
assert.match(
  html,
  /id="statusText"[^>]*role="status"[^>]*aria-live="polite"[^>]*aria-atomic="true"/,
);
assert.match(
  html,
  /id="keyBox"[^>]*role="status"[^>]*aria-live="polite"[^>]*aria-atomic="true"/,
);
assert.match(html, /id="btn-id"[^>]*aria-pressed="true"/);
assert.match(html, /id="btn-en"[^>]*aria-pressed="false"/);
assert.match(html, /id="theme-toggle"[^>]*aria-pressed="false"/);
assert.match(html, /id="themeIcon"/);
assert.match(html, /href="\/result-redesign\.css\?v=20260902-result-v1"/);
assert.doesNotMatch(html, /id="statusRow"[^>]*aria-live/);

for (const status of [
  "delivered",
  "manual",
  "processing_supplier",
  "waiting_delivery",
  "payment_review",
  "problem",
  "pending",
  "expired",
  "cancelled",
  "failed",
  "refunded",
]) {
  assert.ok(script.includes(status), "result renderer must preserve " + status);
}

const paymentReviewIndex = script.indexOf(
  'deliveryStatus === "payment_review"',
);
const generalPendingIndex = script.indexOf('paymentStatus === "pending" ||');
const deliveredWithoutKeyIndex = script.indexOf(
  'paymentStatus === "paid" && deliveryStatus === "delivered"',
);
const fallbackIndex = script.indexOf('setOutcome("waiting")');
assert.ok(paymentReviewIndex >= 0 && paymentReviewIndex < generalPendingIndex);
assert.ok(
  deliveredWithoutKeyIndex >= 0 && deliveredWithoutKeyIndex < fallbackIndex,
);

assert.match(html, /async function refreshOrder\(\)/);
assert.match(
  script,
  /!options\.force\s*&&\s*lastOrderData\s*&&\s*nextSignature === lastOrderSignature/,
);
assert.match(html, /btn\.setAttribute\("aria-busy", "true"\)/);
assert.match(
  html,
  /finally\s*\{[\s\S]*btn\.setAttribute\("aria-busy", "false"\)/,
);
assert.match(html, /data\.id \|\| getOrderIdFromUrl\(\)/);
assert.match(html, /escapeHtml\(\s*data\.name/);
assert.match(html, /escapeHtml\(\s*data\.game/);
assert.match(html, /escapeHtml\(\s*data\.product/);
assert.match(html, /class="license-code">\$\{escapeHtml\(key\)\}/);
assert.ok(
  !html.includes("access_token"),
  "result page must not expose order access tokens",
);

for (const action of html.matchAll(
  /<(button|a)\b([^>]*data-result-i18n="[^"]+"[^>]*)>([\s\S]*?)<\/\1>/gi,
)) {
  assert.ok(
    !action[3].includes("<iconify-icon"),
    "translated icon actions must bind i18n to their text span, not the parent",
  );
}

assert.match(css, /\.lang-btn,\s*\n\.icon-btn\s*\{[\s\S]*?min-height:\s*44px/);
assert.match(css, /@media \(max-width:\s*640px\)/);
assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
assert.match(css, /body\[data-result-state="delivered"\]/);
assert.match(css, /body\[data-result-state="pending"\]/);
assert.match(css, /--result-on-accent:\s*#0e1117/);
assert.doesNotMatch(html, /mdi:(?:key-check-outline|shield-clock-outline)/);

const translationObject = script.match(
  /const resultTranslations = (\{[\s\S]*?\n\s*\});/,
);
assert.ok(translationObject, "result translations should be readable");
const translations = new Function("return (" + translationObject[1] + ")")();
assert.deepStrictEqual(
  Object.keys(translations.id).sort(),
  Object.keys(translations.en).sort(),
  "Indonesian and English result copy must stay in sync",
);

assert.ok(
  serviceWorker.includes('"/result-redesign.css?v=20260902-result-v1"'),
);
assert.ok(serviceWorker.includes('"/result-redesign.css"'));

console.log("Result UI tests passed.");
