function normalizeBrand(value) {
  return String(value || "").trim().toLowerCase();
}

function validateChannelUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length > 300) throw new Error("Link terlalu panjang");
  const url = new URL(text);
  if (url.protocol !== "https:" || url.hostname !== "t.me" || url.port ||
      url.username || url.password || url.search || url.hash ||
      !/^\/(?:\+[A-Za-z0-9_-]+|joinchat\/[A-Za-z0-9_-]+|[A-Za-z][A-Za-z0-9_]{3,})\/?$/.test(url.pathname)) {
    throw new Error("Gunakan link channel Telegram https://t.me/...");
  }
  return url.href;
}

async function channelForOrder(query, order, keys) {
  if (order.payment_status !== "paid" || order.delivery_status !== "delivered" || !keys.length) return null;
  const result = await query(`SELECT c.channel_url FROM brand_channels c
    JOIN products p ON LOWER(TRIM(p.brand)) = c.brand
    WHERE p.id = $1`, [order.product_id]);
  return result.rows[0]?.channel_url || null;
}

module.exports = { normalizeBrand, validateChannelUrl, channelForOrder };
