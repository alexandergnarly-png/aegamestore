const assert = require("node:assert/strict");
const fs = require("node:fs");
const { getAutoPromoPeriod, selectAutoPromo } = require("../server/auto-promo");

const products = [
  { id: 1, active: 1, price: 20000, available_keys: 0, play_status: "safe" },
  { id: 2, active: 1, price: 25000, available_keys: 4, play_status: "risk" },
  { id: 3, active: 1, price: 30000, available_keys: 2, play_status: "safe" },
];

assert.equal(getAutoPromoPeriod(12 * 60 * 60 * 1000), 1);
assert.equal(selectAutoPromo(products, 0).id, 3, "safe ready product should win");
assert.equal(selectAutoPromo(products, 999).id, 3, "selection must stay valid");
assert.equal(selectAutoPromo([], 0), null);

const server = fs.readFileSync("server.js", "utf8");
const html = fs.readFileSync("public/index.html", "utf8");
const script = fs.readFileSync("public/script.js", "utf8");
assert.match(server, /app\.get\("\/auto-promo"/);
assert.match(server, /AUTO_PROMO_ENABLED/);
assert.match(server, /notifyTelegram\(/);
assert.match(html, /id="autoPromoSlide"/);
assert.match(script, /fetch\("\/auto-promo"\)/);

console.log("Auto promo checks passed.");
