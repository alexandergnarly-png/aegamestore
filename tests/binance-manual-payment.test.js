const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
const html = fs.readFileSync(path.join(root, "public", "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "public", "script.js"), "utf8");
const admin = fs.readFileSync(path.join(root, "views", "admin.html"), "utf8");

assert.match(server, /BINANCE_USDT_ADDRESS/);
assert.match(server, /TELEGRAM_BOT_TOKEN/);
assert.match(server, /payment_method === "binance_manual"/);
assert.match(server, /calculateUsdtAmount/);
assert.match(server, /Math\.ceil\(\(Number\(idrAmount \|\| 0\) \/ usdIdrRate\) \* 100\) \/ 100/);
assert.match(server, /\/orders\/:id\/binance-payment/);
assert.match(server, /delivery_status = 'payment_review'/);
assert.match(server, /idx_orders_payment_reference_unique/);
assert.match(server, /notifyTelegram\(telegramText\)/);
assert.match(server, /Buyer belum mengirim TXID pembayaran USDT/);

assert.match(html, /data-payment-method="binance_manual"/);
assert.match(html, /id="binancePaymentOption"[^>]*disabled/);
assert.match(script, /showBinancePaymentModal/);
assert.match(script, /payment_reference: cleanReference/);
assert.match(script, /binance_manual_enabled/);
assert.match(admin, /TXID \/ Payment Reference/);
assert.match(admin, /payment_amount_usd/);

console.log("binance manual payment tests passed");
