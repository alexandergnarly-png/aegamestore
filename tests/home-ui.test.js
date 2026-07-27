const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("public/index.html", "utf8");
const script = fs.readFileSync("public/script.js", "utf8");
const css = fs.readFileSync("public/style.css", "utf8");

assert.match(html, /href="#main-content"/);
assert.match(html, /id="main-content"[^>]*tabindex="-1"/);
assert.doesNotMatch(html, /id="preloader"/);
assert.doesNotMatch(script, /showTelegramPopup/);
assert.doesNotMatch(script, /Gagal memuat daftar produk dari server/);
assert.ok(
  html.indexOf('id="store-section"') < html.indexOf('id="review-section"'),
  "Catalog should appear before buyer reviews",
);
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
assert.match(script, /class="ae-guide-list"/);
assert.match(script, /popup: "ae-guide-popup"/);
assert.match(css, /\.swal2-close \{[\s\S]*?width: 44px/);
assert.match(css, /\.review-popup-stars button \{[\s\S]*?min-width: 44px/);
assert.match(script, /function updateCheckoutStickyVisibility\(\)/);
assert.match(script, /quantity\.offsetTop \+ quantity\.offsetHeight - 16/);
assert.match(css, /\.checkout-sticky-bar\.is-visible \{/);
assert.match(css, /Compact mobile game cards/);
assert.match(css, /grid-template-areas:[\s\S]*?"meta cta"/);
assert.match(css, /\.game-card-cta::after \{[\s\S]*?content: "→"/);
assert.match(html, /class="account-orbit-icon"/);
assert.match(script, /class="account-orbit-icon"/);
assert.match(css, /@keyframes accountIconFloat/);
assert.match(css, /prefers-reduced-motion: reduce[\s\S]*?account-orbit-icon/);

console.log("Homepage UI/UX accessibility check passed.");
