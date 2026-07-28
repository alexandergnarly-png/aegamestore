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
assert.match(css, /\.game-card-fav > span \{[\s\S]*?width: 20px/);
assert.match(css, /\.game-card \.game-card-fav,[\s\S]*?width: 28px !important/);
assert.match(css, /\.game-card \.game-card-fav\.is-active \{[\s\S]*?background: transparent !important/);
assert.match(script, /ph:heart-fill/);
assert.match(script, /ph:heart-bold/);
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
assert.match(css, /\.game-card-cta::after \{[\s\S]*?width: 24px/);
assert.match(css, /\.game-card:hover \.game-card-cta,[\s\S]*?box-shadow: none !important/);
assert.match(css, /\.game-card-body \{[\s\S]*?position: static !important/);
assert.match(css, /\.game-card-body \{[\s\S]*?flex: 0 0 auto !important/);
assert.match(css, /\.game-card \.game-card-price \{[\s\S]*?background: transparent !important/);
assert.match(html, /class="account-orbit-icon"/);
assert.match(html, /keysystem-ui\.css\?v=/);
assert.match(html, /<body class="keysystem-ui dark-theme">/);
assert.match(html, /id="keysystemFeatured"/);
assert.match(html, /class="keysystem-marquee"/);
assert.match(script, /function updateKeysystemFeatured\(\)/);
assert.match(css, /Compact mobile game cards/);
assert.match(
  fs.readFileSync("public/keysystem-ui.css", "utf8"),
  /body\.keysystem-ui \.game-grid/,
);
assert.match(
  fs.readFileSync("public/keysystem-ui.css", "utf8"),
  /hero-trust li \{[\s\S]*?grid-column: auto !important/,
);
assert.match(
  fs.readFileSync("public/keysystem-ui.css", "utf8"),
  /html:has\(body\.keysystem-ui\) \{[\s\S]*?overflow-x: clip/,
);
assert.match(script, /class="account-orbit-icon"/);
assert.match(css, /@keyframes accountIconFloat/);
assert.match(css, /prefers-reduced-motion: reduce[\s\S]*?account-orbit-icon/);

console.log("Homepage UI/UX accessibility check passed.");
