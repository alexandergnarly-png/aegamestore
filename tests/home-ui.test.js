const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("public/index.html", "utf8");
const script = fs.readFileSync("public/script.js", "utf8");
const css = fs.readFileSync("public/style.css", "utf8");
const keysystemCss = fs.readFileSync("public/keysystem-ui.css", "utf8");
const serviceWorker = fs.readFileSync("public/service-worker.js", "utf8");

assert.doesNotThrow(() => new Function(script));

assert.match(html, /href="#main-content"/);
assert.match(html, /id="main-content"[^>]*tabindex="-1"/);
assert.match(keysystemCss, /\.skip-link:focus:not\(:focus-visible\)[\s\S]*?top:\s*-100px/);
assert.match(keysystemCss, /\.skip-link:focus-visible[\s\S]*?top:\s*12px/);
assert.match(html, /hero-trust-proof">≤ 1 MIN/);
assert.match(html, /hero-trust-proof">VERIFIED/);
assert.match(html, /hero-trust-proof">24\/7/);
assert.match(html, /id="backgroundMusic"[\s\S]*?preload="none"[\s\S]*?loop/);
assert.match(html, /id="musicToggle"[\s\S]*?aria-controls="backgroundMusic"/);
assert.match(script, /localStorage\.setItem\(storageKey, "on"\)/);
assert.ok(fs.existsSync("public/assets/audio/romance.m4a"));
assert.match(html, /rel="icon" href="\/favicon\.svg"/);
assert.ok(fs.existsSync("public/favicon.svg"));
assert.match(script, /if \(!stockReady\) return;/);
assert.match(script, /card\.setAttribute\("aria-disabled", "true"\)/);
assert.match(keysystemCss, /\.game-card-body \{[\s\S]*?padding: 9px 8px 12px !important/);
assert.match(keysystemCss, /\.game-card\.is-out-of-stock \.game-card-cta::after \{[\s\S]*?content: attr\(data-label\)/);
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
assert.match(keysystemCss, /grid-template-rows: auto 48px/);
assert.match(keysystemCss, /body\.keysystem-ui \.promo-slider \{[\s\S]*?height: 190px !important/);
assert.match(keysystemCss, /body\.keysystem-ui \.promo-deco-icon \{[\s\S]*?font-family: var\(--ks-mono\)/);
assert.match(keysystemCss, /content: "PROMO \/\/ FEED"/);
assert.match(keysystemCss, /body\.keysystem-ui \.promo-slider \{[\s\S]*?height: 154px !important/);
assert.match(css, /body\.review-section-visible \.back-to-top,[\s\S]*?pointer-events: none !important/);
assert.match(script, /IntersectionObserver[\s\S]*?review-section-visible/);
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
assert.match(script, /function restartKeysystemFeaturedRotation\(\)/);
assert.match(script, /prefers-reduced-motion: reduce/);
assert.match(script, /setInterval\([\s\S]*?3200/);
assert.match(script, /currentScrollY > 700 && currentScrollY < lastScrollY/);
assert.doesNotMatch(script, /Hi bro/);
assert.match(css, /Compact mobile game cards/);
assert.match(
  keysystemCss,
  /body\.keysystem-ui \.game-grid/,
);
assert.match(
  keysystemCss,
  /@keyframes keysystemFeatureMediaSwap/,
);
assert.match(keysystemCss, /@keyframes keysystemFeatureInfoSwap/);
assert.doesNotMatch(
  keysystemCss,
  /\.keysystem-feature-card\.is-switching \{[^}]*animation:/,
);
assert.match(
  keysystemCss,
  /hero-trust li \{[\s\S]*?grid-column: auto !important/,
);
assert.match(
  keysystemCss,
  /html:has\(body\.keysystem-ui\) \{[\s\S]*?overflow-x: clip/,
);
assert.match(
  keysystemCss,
  /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\) !important/,
);
assert.match(keysystemCss, /admin-chat-open \.back-to-top/);
assert.match(
  keysystemCss,
  /\.keysystem-marquee-track \{[\s\S]*?keysystemMarquee 24s linear infinite !important/,
);
assert.match(
  keysystemCss,
  /prefers-reduced-motion: reduce[\s\S]*?\.keysystem-marquee-track \{[\s\S]*?animation: none !important/,
);
assert.match(html, /data-payment-info="QRIS"/);
assert.match(html, /data-payment-info="ShopeePay"/);
assert.match(script, /function showPaymentMethodInfo\(method\)/);
assert.match(script, /footerPaymentDetails\[method\]/);
assert.match(keysystemCss, /@keyframes keysystemPaymentIconIn/);
assert.match(
  keysystemCss,
  /prefers-reduced-motion: reduce[\s\S]*?\.ae-payment-info-icon \{[\s\S]*?animation: none !important/,
);
assert.match(script, /class="account-orbit-icon"/);
assert.match(css, /@keyframes accountIconFloat/);
assert.match(css, /prefers-reduced-motion: reduce[\s\S]*?account-orbit-icon/);
[
  "promoLimitedTitle",
  "promoBuyerTitle",
  "reviewLoading",
  "orderProductTitle",
  "orderBuyerTitle",
  "orderSummaryTitle",
  "gatewayPaymentDesc",
].forEach((key) => {
  assert.ok(html.includes(`data-i18n="${key}"`), `Missing homepage i18n marker: ${key}`);
  assert.ok(
    (script.match(new RegExp(`${key}:`, "g")) || []).length >= 2,
    `Missing Indonesian/English translations for: ${key}`,
  );
});
assert.match(html, /script\.js\?v=20260811-qris-usd-3/);
assert.match(html, /style\.css\?v=20260811-qris-usd-3/);
assert.match(html, /keysystem-ui\.css\?v=20260811-header-controls-2/);
assert.match(serviceWorker, /CACHE_VERSION = "20260811-qris-usd-v3"/);
assert.doesNotMatch(css, /body \{\s*padding-bottom: 92px !important;/);
assert.match(keysystemCss, /Mobile footer closes the page cleanly/);
assert.match(keysystemCss, /body\.keysystem-ui \{\s*padding-bottom: 0 !important;/);
assert.match(keysystemCss, /\.site-footer \{[\s\S]*?border-radius: 24px 24px 0 0 !important/);
assert.match(keysystemCss, /\.payment-icons \{[\s\S]*?grid-template-columns: repeat\(6, minmax\(0, 1fr\)\)/);
assert.match(keysystemCss, /\.payment-icons \{[\s\S]*?width: min\(100%, 220px\);[\s\S]*?margin-inline: auto/);
assert.match(keysystemCss, /\.payment-icons button \{[\s\S]*?min-height: 48px;[\s\S]*?aspect-ratio: 1/);
assert.match(keysystemCss, /\.payment-icons button:nth-child\(5\) \{[\s\S]*?grid-column: 4 \/ span 2/);
assert.match(html, /id="mobileNavLogout" hidden/);
assert.match(script, /mobileNavLogout\.hidden = !data\.loggedIn/);
assert.match(script, /class="auth-btn account-auth-btn"/);
assert.doesNotMatch(script, /class="user-action-btn user-action-danger"/);
assert.match(keysystemCss, /\.account-auth-btn,[\s\S]*?\.nav-toggle \{[\s\S]*?width: 44px !important;[\s\S]*?height: 44px !important/);
assert.match(keysystemCss, /\.nav-toggle::before \{[\s\S]*?inset: 4px;[\s\S]*?border-radius: 50%;[\s\S]*?background: #ffffff/);
assert.match(keysystemCss, /#userMenu \.account-auth-btn::before \{[\s\S]*?background: #000000/);
assert.match(html, /id="adminChatClose"[\s\S]*?icon="ph:x-bold"/);
assert.match(css, /\.ae-help-close \{[\s\S]*?width: 44px !important;[\s\S]*?height: 44px !important;/);
assert.match(html, /id="aeAiForm"/);
assert.match(html, /id="aeAiMessages"[\s\S]*?role="log"/);
assert.match(html, /data-ai-prompt/);
assert.match(script, /fetch\("\/api\/ai-assistant"/);
assert.match(script, /bubble\.textContent = content/);
assert.match(css, /\.ae-ai-assistant/);
assert.match(css, /\.sr-only \{[\s\S]*?clip: rect\(0, 0, 0, 0\)/);
assert.match(css, /grid-template-rows: auto minmax\(88px, 1fr\) auto auto auto/);
assert.match(script, /new CustomEvent\("ae:languagechange"\)/);
assert.match(script, /els\.modal\?\.querySelectorAll\("\[data-i18n\]"\)/);
assert.match(script, /if \(modal\?\.classList\.contains\("show"\)\) onProductChange\(\)/);
assert.match(script, /if \(!state\.publicVouchers\.length\) await loadPublicVouchers\(\)/);

console.log("Homepage UI/UX accessibility check passed.");
