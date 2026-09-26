const assert = require('node:assert/strict');
const fs = require('node:fs');
const { normalizeBrand, validateChannelUrl, channelForOrder } = require('../server/brand-channels');
assert.equal(normalizeBrand(' Dragon '), 'dragon');
for (const url of ['https://t.me/+Private_123', 'https://t.me/joinchat/Private-123', 'https://t.me/channel_name']) {
  assert.equal(validateChannelUrl(url), url);
}
assert.equal(validateChannelUrl(''), '');
for (const url of ['javascript:alert(1)', 'http://t.me/channel', 'https://t.me.evil.com/channel', 'https://evil.com', 'https://user@t.me/channel', 'https://t.me/channel?redirect=evil']) {
  assert.throws(() => validateChannelUrl(url));
}
(async () => {
  let calls = 0;
  const query = async (sql, params) => {
    calls++;
    assert.match(sql, /JOIN products/);
    assert.deepEqual(params, [7]);
    return { rows: [{ channel_url: 'https://t.me/+Private_123' }] };
  };
  const order = { product_id: 7, payment_status: 'paid', delivery_status: 'delivered' };
  for (const payment_status of ['pending', 'expired', 'cancelled', 'refunded']) {
    assert.equal(await channelForOrder(query, { ...order, payment_status }, ['key']), null);
  }
  assert.equal(await channelForOrder(query, { ...order, delivery_status: 'pending' }, ['key']), null);
  assert.equal(await channelForOrder(query, order, []), null);
  assert.equal(calls, 0, 'No private channel lookup for unpaid/undelivered orders');
  assert.equal(await channelForOrder(query, order, ['key']), 'https://t.me/+Private_123');
  assert.equal(await channelForOrder(async () => ({ rows: [] }), order, ['key']), null);
  const server = fs.readFileSync('server.js', 'utf8');
  assert.match(server, /app\.post\("\/api\/admin\/brand-channels", requireAdminAuth, requireAdminCsrf/);
  assert.match(server, /brand_channel_url: await channelForOrder\(query, order, gameKeys\)/);
  const result = fs.readFileSync('public/result.html', 'utf8');
  assert.match(result, /brandChannelLink\.removeAttribute\("href"\)/);
  assert.match(result, /paymentStatus === "paid" && data.brand_channel_url/);
  console.log('Brand channel URL validation and paid-key access checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
