const MAX_OFFER_AGE_MS = 15 * 60 * 1000;

function extractIdrRate(payload) {
  const data = payload?.data || payload || {};
  const exchangeRate = data.exchange_rate || {};
  const candidates = [data.rate, exchangeRate.rate, data.exchange_rate, payload?.rate];
  const rate = candidates.map(Number).find((value) => Number.isFinite(value) && value > 0);
  return rate || null;
}

function convertUsdToIdr(usd, rate) {
  const amount = Number(usd);
  const idrRate = Number(rate);
  return Number.isFinite(amount) && amount >= 0 && Number.isFinite(idrRate) && idrRate > 0
    ? Math.round(amount * idrRate)
    : null;
}

function buildSupplierComparison(salePrice, offers, now = Date.now()) {
  const cleanSalePrice = Number(salePrice || 0);
  const normalized = offers.map((offer) => {
    const price = Number(offer.price_idr);
    const stock = Math.max(0, Number(offer.stock || 0));
    const lastSync = Date.parse(offer.last_sync || "");
    const fresh = Number.isFinite(lastSync) && Math.abs(now - lastSync) <= MAX_OFFER_AGE_MS;
    const eligible = String(offer.status || "").toLowerCase() === "ready"
      && stock > 0
      && Number.isFinite(price)
      && price > 0
      && fresh;
    return {
      ...offer,
      price_idr: Number.isFinite(price) ? price : null,
      stock,
      fresh,
      eligible,
      profit: Number.isFinite(price) ? cleanSalePrice - price : null,
    };
  });
  const cheapestPrice = Math.min(...normalized.filter((offer) => offer.eligible).map((offer) => offer.price_idr));
  return normalized.map((offer) => ({
    ...offer,
    cheapest: offer.eligible && offer.price_idr === cheapestPrice,
    difference_from_cheapest: offer.eligible && Number.isFinite(cheapestPrice)
      ? offer.price_idr - cheapestPrice
      : null,
  }));
}

module.exports = { buildSupplierComparison, convertUsdToIdr, extractIdrRate, MAX_OFFER_AGE_MS };
