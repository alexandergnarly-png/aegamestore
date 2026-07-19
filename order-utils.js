const MAX_ORDER_QUANTITY = 5;

function parseOrderQuantity(value) {
  const quantity = Number(value ?? 1);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ORDER_QUANTITY) {
    return null;
  }

  return quantity;
}

function getOrderQuantity(value) {
  return parseOrderQuantity(value) || 1;
}

function calculateBulkTotals({ unitPrice, quantity, discountAmount = 0 }) {
  const cleanUnitPrice = Number(unitPrice || 0);
  const cleanQuantity = parseOrderQuantity(quantity);

  if (!Number.isInteger(cleanUnitPrice) || cleanUnitPrice <= 0 || !cleanQuantity) {
    throw new Error("Data harga bulk tidak valid");
  }

  const originalPrice = cleanUnitPrice * cleanQuantity;
  const cleanDiscount = Math.max(Number(discountAmount || 0), 0);
  const maxDiscount = Math.max(originalPrice - 1000 * cleanQuantity, 0);
  const appliedDiscount = Math.min(cleanDiscount, maxDiscount);
  const netPrice = Math.max(
    originalPrice - appliedDiscount,
    1000 * cleanQuantity,
  );

  return {
    quantity: cleanQuantity,
    unitPrice: cleanUnitPrice,
    originalPrice,
    discountAmount: appliedDiscount,
    netPrice,
  };
}

function splitOrderKeys(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

module.exports = {
  MAX_ORDER_QUANTITY,
  calculateBulkTotals,
  getOrderQuantity,
  parseOrderQuantity,
  splitOrderKeys,
};
