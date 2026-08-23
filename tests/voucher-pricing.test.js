const assert = require("assert");
const {
  calculateVoucherDiscount,
  getVoucherProfitVerdict,
  validateVoucherDefinition,
} = require("../server/voucher-pricing");

assert.equal(calculateVoucherDiscount({ discountType: "fixed", discountAmount: 5000, subtotal: 50000 }), 5000);
assert.equal(calculateVoucherDiscount({ discountType: "percent", discountPercent: 10, subtotal: 53500 }), 5300);
assert.equal(calculateVoucherDiscount({ discountType: "percent", discountPercent: 20, maxDiscountAmount: 4000, subtotal: 50000 }), 4000);
assert.equal(calculateVoucherDiscount({ discountType: "percent", discountPercent: 90, subtotal: 1500 }), 500);
assert.equal(calculateVoucherDiscount({ discountType: "fixed", discountAmount: 5000, subtotal: 100000 }), 5000);
assert.equal(validateVoucherDefinition({ discountType: "percent", discountPercent: 91 }).valid, false);
assert.equal(getVoucherProfitVerdict({ buyerPays: 45000, supplierCost: 30000 }).code, "safe");
assert.equal(getVoucherProfitVerdict({ buyerPays: 45000, supplierCost: 46000 }).code, "loss");
assert.equal(getVoucherProfitVerdict({ buyerPays: 45000, supplierCost: 0 }).code, "unknown");

console.log("voucher-pricing tests passed");
