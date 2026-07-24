const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("public/index.html", "utf8");
const script = fs.readFileSync("public/script.js", "utf8");
const css = fs.readFileSync("public/style.css", "utf8");

assert.match(html, /href="#main-content"/);
assert.match(html, /id="main-content"[^>]*tabindex="-1"/);
assert.match(html, /role="tab" aria-selected="true"/);
assert.match(html, /icon="ph:moon-stars-bold"/);
assert.match(script, /card\.setAttribute\("role", "button"\)/);
assert.match(script, /event\.key !== "Enter" && event\.key !== " "/);
assert.match(script, /setAttribute\("aria-selected", "true"\)/);
assert.match(css, /\.game-card-fav[\s\S]*?min-width: 44px/);
assert.match(css, /\.promo-dot,[\s\S]*?min-width: 44px/);
assert.match(html, /aria-describedby="modalOrderDescription"/);
assert.match(css, /\.order-modal-card \{[\s\S]*?scroll-padding-bottom: 156px/);
assert.match(css, /\.checkout-payment-option \{[\s\S]*?min-height: 64px/);

console.log("Homepage UI/UX accessibility check passed.");
