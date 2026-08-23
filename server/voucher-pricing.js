function normalizeVoucherDiscountType(value) {
  return String(value || "fixed").toLowerCase() === "percent"
    ? "percent"
    : "fixed";
}

function normalizeVoucherDefinition(input = {}) {
  return {
    discountType: normalizeVoucherDiscountType(input.discountType),
    discountAmount: Number(input.discountAmount || 0),
    discountPercent: Number(input.discountPercent || 0),
    maxDiscountAmount: Number(input.maxDiscountAmount || 0),
  };
}

function validateVoucherDefinition(input = {}) {
  const definition = normalizeVoucherDefinition(input);

  if (definition.discountType === "percent") {
    if (
      !Number.isFinite(definition.discountPercent) ||
      definition.discountPercent <= 0 ||
      definition.discountPercent > 90
    ) {
      return { valid: false, message: "Persentase diskon harus 1-90%" };
    }

    if (
      !Number.isInteger(definition.maxDiscountAmount) ||
      definition.maxDiscountAmount < 0
    ) {
      return { valid: false, message: "Batas maksimal diskon tidak valid" };
    }
  } else if (
    !Number.isInteger(definition.discountAmount) ||
    definition.discountAmount <= 0
  ) {
    return { valid: false, message: "Nominal diskon tidak valid" };
  }

  return { valid: true, definition };
}

function calculateVoucherDiscount(input = {}) {
  const subtotal = Math.max(Number(input.subtotal || 0), 0);
  const minimumPayable = Math.max(Number(input.minimumPayable ?? 1000), 0);
  const definition = normalizeVoucherDefinition(input);
  let discount = definition.discountAmount;

  if (definition.discountType === "percent") {
    discount = Math.floor((subtotal * definition.discountPercent) / 10000) * 100;
    if (definition.maxDiscountAmount > 0) {
      discount = Math.min(discount, definition.maxDiscountAmount);
    }
  }

  return Math.max(
    0,
    Math.min(Math.floor(discount), Math.max(subtotal - minimumPayable, 0)),
  );
}

function getVoucherProfitVerdict({ buyerPays, supplierCost }) {
  const revenue = Number(buyerPays || 0);
  const cost = Number(supplierCost || 0);

  if (!Number.isFinite(cost) || cost <= 0) {
    return { code: "unknown", label: "Modal belum tersedia", profit: null, margin: null };
  }

  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : -100;
  let code = "safe";
  let label = "Aman";

  if (profit < 0) {
    code = "loss";
    label = "Rugi";
  } else if (margin < 8) {
    code = "danger";
    label = "Berisiko";
  } else if (margin < 15) {
    code = "thin";
    label = "Untung tipis";
  }

  return { code, label, profit, margin };
}

module.exports = {
  calculateVoucherDiscount,
  getVoucherProfitVerdict,
  normalizeVoucherDefinition,
  normalizeVoucherDiscountType,
  validateVoucherDefinition,
};
