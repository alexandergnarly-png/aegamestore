const BUYER_BADGE_TIERS = [
  { code: "entry", minOrders: 0, minSpend: 0 },
  { code: "verified", minOrders: 1, minSpend: 0 },
  { code: "prime", minOrders: 5, minSpend: 300000 },
  { code: "prestige", minOrders: 15, minSpend: 1000000 },
  { code: "sovereign", minOrders: 30, minSpend: 2500000 },
];

function getBuyerBadgeCode(paidOrderCount = 0, totalSpend = 0) {
  const orders = Math.max(Number(paidOrderCount || 0), 0);
  const spend = Math.max(Number(totalSpend || 0), 0);
  return [...BUYER_BADGE_TIERS]
    .reverse()
    .find((tier) => tier.code === "entry"
      || orders >= tier.minOrders
      || (tier.minSpend > 0 && spend >= tier.minSpend))?.code || "entry";
}

module.exports = { BUYER_BADGE_TIERS, getBuyerBadgeCode };
