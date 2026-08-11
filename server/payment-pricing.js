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

module.exports = { grossUpPaymentPrice, toUsd };
