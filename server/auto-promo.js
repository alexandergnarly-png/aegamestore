function getAutoPromoPeriod(now = Date.now(), hours = 12) {
  return Math.floor(Number(now) / (hours * 60 * 60 * 1000));
}

function selectAutoPromo(products, period = getAutoPromoPeriod()) {
  const ready = (Array.isArray(products) ? products : []).filter(
    (product) =>
      Number(product.active ?? 1) === 1 &&
      Number(product.available_keys || 0) > 0 &&
      Number(product.price || 0) > 0 &&
      String(product.play_status || "safe").toLowerCase() !== "maintenance",
  );
  const safe = ready.filter(
    (product) => String(product.play_status || "safe").toLowerCase() === "safe",
  );
  const pool = safe.length ? safe : ready;
  if (!pool.length) return null;
  return pool[Math.abs(Number(period) || 0) % pool.length];
}

module.exports = { getAutoPromoPeriod, selectAutoPromo };
