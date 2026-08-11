const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
const html = fs.readFileSync(path.join(root, "public", "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "public", "script.js"), "utf8");
const style = fs.readFileSync(path.join(root, "public", "style.css"), "utf8");
const admin = fs.readFileSync(path.join(root, "views", "admin.html"), "utf8");

assert.match(server, /BINANCE_PAY_UID/);
assert.match(server, /TELEGRAM_BOT_TOKEN/);
assert.match(server, /payment_method === "binance_manual"/);
assert.match(server, /calculateUsdtAmount/);
assert.match(server, /Math\.ceil\(\(Number\(idrAmount \|\| 0\) \/ usdIdrRate\) \* 100\) \/ 100/);
assert.match(server, /\/orders\/:id\/binance-payment/);
assert.match(server, /delivery_status = 'payment_review'/);
assert.match(server, /idx_orders_payment_reference_unique/);
assert.match(server, /notifyTelegram\(telegramText\)/);
assert.match(server, /BINANCE_PAYMENT_EXPIRY_MS = 30 \* 60 \* 1000/);
assert.match(server, /BINANCE_ORDER_COOLDOWN_MS = 5 \* 60 \* 1000/);
assert.match(server, /MAX_ACTIVE_BINANCE_ORDERS_PER_USER = 2/);
assert.match(server, /startBinanceOrderCleanup/);
assert.match(server, /delivery_status IN \('waiting_payment', 'payment_review'\)/);
assert.match(server, /berstatus payment review dan memiliki Transaction ID/);
assert.match(server, /Account: \$\{order\.username/);

assert.match(html, /data-payment-method="binance_manual"/);
assert.match(html, /id="binancePaymentOption"[^>]*disabled/);
assert.match(script, /showBinancePaymentModal/);
assert.match(script, /payment_reference: cleanReference/);
assert.match(script, /binance_manual_enabled/);
assert.match(script, /Swal\.getInput\(\)\?\.blur\(\)/);
assert.match(script, /showCloseButton: true/);
assert.match(script, /usdt-payment-actions/);
assert.match(script, /Pay within 30 minutes/);
assert.match(script, /popup: "usdt-success-popup"/);
assert.match(script, /usdt-success-mark/);
assert.doesNotMatch(script, /icon: "success",\s*title: english \? "Payment submitted"/);
assert.match(style, /\.usdt-success-popup\.swal2-popup/);
assert.match(style, /\.usdt-success-confirm\.swal2-confirm:focus-visible/);
assert.match(admin, /Binance Pay Transaction ID/);
assert.match(admin, /payment_amount_usd/);
assert.match(admin, /confirmUsdtVerified/);
assert.match(admin, /Swal\.showValidationMessage/);

console.log("binance manual payment tests passed");
