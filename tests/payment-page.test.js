const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/payment.js', 'utf8');
async function run(statusCode = 200, overrides = {}, search = '?order_id=ORDER-test') {
  const nodes = Object.fromEntries(['status', 'pay', 'detail', 'amount', 'product', 'orderId'].map(id => [id, {
    disabled: id === 'pay', addEventListener(event, handler) { this[event] = handler; }, focus() {},
  }]));
  const calls = [], payments = [], navigation = [];
  const data = { snapToken: 'test-token', midtransClientKey: 'test-client', midtransIsProduction: true, price: 12345, game: 'Game', product: 'One day', ...overrides };
  await vm.runInNewContext(source, {
    URLSearchParams, Intl, Number, AbortSignal, encodeURIComponent, setTimeout, clearTimeout,
    location: { search, assign: url => navigation.push(url), replace: url => navigation.push(url) },
    document: { getElementById: id => nodes[id], createElement: () => ({ dataset: {} }), head: { appendChild: script => { calls.push(script.src); script.onload(); } } },
    fetch: async (url, options) => { calls.push(url); assert.equal(options.cache, 'no-store'); return { status: statusCode, ok: statusCode === 200, json: async () => data }; },
    window: { snap: { pay: (token, callbacks) => payments.push({ token, callbacks }) } },
  });
  return { nodes, calls, payments, navigation };
}
(async () => {
  const normal = await run();
  assert.equal(normal.payments.length, 1);
  assert.equal(normal.payments[0].token, 'test-token');
  assert.deepEqual(normal.calls, ['/order/ORDER-test/resume', 'https://app.midtrans.com/snap/snap.js']);
  normal.payments[0].callbacks.onClose();
  assert.equal(normal.nodes.pay.disabled, false);
  normal.nodes.pay.click();
  assert.equal(normal.payments.length, 2);
  assert.equal(normal.calls.length, 2, 'Reopening reuses token without another request');
  normal.payments[1].callbacks.onSuccess();
  assert.deepEqual(normal.navigation, ['/result?order_id=ORDER-test']);
  for (const code of [401, 403, 404, 410, 500]) {
    const denied = await run(code);
    assert.equal(denied.payments.length, 0);
    assert.equal(denied.nodes.pay.disabled, true);
  }
  const paid = await run(409, { code: 'ALREADY_PAID' });
  assert.equal(paid.payments.length, 0);
  assert.equal(paid.navigation[0], '/result?order_id=ORDER-test');
  assert.equal((await run(200, {}, '')).calls.length, 0);
  assert.match((await run(200, { midtransIsProduction: false })).calls[1], /app\.sandbox\.midtrans\.com/);
  const checkout = fs.readFileSync('public/script.js', 'utf8');
  assert.match(checkout, /window\.location\.assign\("\/payment\.html\?order_id=" \+ encodeURIComponent\(opts\.orderId\)\)/);
  console.log('Payment page token reuse, authorization errors and callbacks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
