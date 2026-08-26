function grossUpPaymentPrice(netPrice, percentageRate = 0, vatRate = 0) {
  const net = Math.max(0, Number(netPrice) || 0);
  const rate = Math.max(0, Number(percentageRate) || 0);
  const vat = Math.max(0, Number(vatRate) || 0);
  const denominator = 1 - rate * (1 + vat);

  if (denominator <= 0) throw new Error("Konfigurasi biaya pembayaran tidak valid");
  return Math.ceil(net / denominator);
}

function toUsd(idrAmount, usdIdrRate = 18000) {
  const rate = Math.max(1, Number(usdIdrRate) || 18000);
  return Number((Math.max(0, Number(idrAmount) || 0) / rate).toFixed(2));
}

function recommendUsdtPrice(idrAmount, usdIdrRate = 18000) {
  const rate = Math.max(1, Number(usdIdrRate) || 18000);
  const buffered = (Math.max(0, Number(idrAmount) || 0) / rate) * 1.05;
  return Math.ceil(buffered * 10) / 10;
}

function calculateUsdtPayment(idrAmount, manualUnitUsdt, unitPriceIdr, usdIdrRate = 18000) {
  const manual = Number(manualUnitUsdt);
  const unitPrice = Number(unitPriceIdr);
  if (Number.isFinite(manual) && manual > 0 && unitPrice > 0) {
    return Math.ceil(manual * (Math.max(0, Number(idrAmount) || 0) / unitPrice) * 10) / 10;
  }
  return recommendUsdtPrice(idrAmount, usdIdrRate);
}

function getSafeUsdtIdrRate(...rates) {
  return Math.max(
    18000,
    ...rates.map(Number).filter((rate) => Number.isFinite(rate) && rate > 0),
  );
}

function calculateResellerPrice(supplierCostIdr, usdIdrRate = 18000) {
  const cost = Math.max(0, Math.round(Number(supplierCostIdr) || 0));
  if (!cost) {
    return { unit_idr: 0, unit_usd: 0, profit_idr: 0, profit_usd: 0 };
  }

  const rate = Math.max(1, Number(usdIdrRate) || 18000);
  const profitUsd = Math.min(0.8, Math.max(0.3, (cost / rate) * 0.1));
  const profitIdr = Math.round(profitUsd * rate);
  const unitIdr = cost + profitIdr;

  return {
    unit_idr: unitIdr,
    unit_usd: Math.ceil((unitIdr / rate) * 100) / 100,
    profit_idr: profitIdr,
    profit_usd: Math.round((profitIdr / rate) * 100) / 100,
  };
}

module.exports = {
  calculateResellerPrice,
  calculateUsdtPayment,
  getSafeUsdtIdrRate,
  grossUpPaymentPrice,
  recommendUsdtPrice,
  toUsd,
};
