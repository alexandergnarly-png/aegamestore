"use strict";

const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9.,$]+/g, " ").trim();
const contains = (text, phrase) => (` ${normalize(text).replace(/[.,]/g, " ").replace(/\s+/g, " ")} `).includes(` ${normalize(phrase).replace(/[.,]/g, " ").replace(/\s+/g, " ")} `);
const durationHours = (value) => {
  const match = normalize(value).match(/(\d+)\s*(jam|hours?|hari|days?|minggu|weeks?|bulan|months?)/);
  return match ? Number(match[1]) * (/jam|hour/.test(match[2]) ? 1 : /hari|day/.test(match[2]) ? 24 : /minggu|week/.test(match[2]) ? 168 : 720) : null;
};
function readBudget(text) {
  const match = text.match(/(?:budget|maksimal|max|under|dibawah|di bawah|sampai|limit)\s*(?:rp\s*)?(\d[\d.,]*)\s*(rb|ribu|k|juta|jt)?\b/)
    || text.match(/^(?:rp\s*)?(\d[\d.,]*)\s*(rb|ribu|k|juta|jt)$/);
  if (!match) return null;
  const numeric = /[.,]\d{3}(?:\D|$)/.test(match[1]) && !match[2]
    ? Number(match[1].replace(/[.,]/g, "")) : Number(match[1].replace(",", "."));
  return numeric * (/juta|jt/.test(match[2] || "") ? 1e6 : match[2] ? 1000 : 1);
}

// History is conversational context only, never evidence of payment or entitlement.
function buildAssistantPlan(message, catalog = [], history = [], language = "id") {
  const text = normalize(message);
  const en = language === "en";
  const reply = (id, english, kind = "support", extra = {}) => ({ answer: en ? english : id, kind, ...extra });
  if (/\b(admin|human|manusia|operator|cs)\b/.test(text)) return reply(
    "Bisa, ketuk Hubungi admin di bawah untuk lanjut di Telegram. Kalau soal pesanan, sertakan Order ID dan kendalanya ya.",
    "Tap Contact admin below to continue on Telegram. For an order issue, include your Order ID and what went wrong.");
  if (/\b(refund|pengembalian|uang kembali)\b/.test(text)) return reply(
    "Untuk permintaan refund, admin perlu meninjau transaksi dan pengiriman key dulu. Kirim Order ID lewat tombol Hubungi admin; aku tidak bisa menyetujui atau memproses refund di chat ini.",
    "The admin needs to review payment and key delivery before deciding on a refund. Share your Order ID through Contact admin; I can't check or approve refunds here.");
  if (/\b(sudah bayar|udah bayar|sudah transfer|paid|terpotong|deducted|belum masuk|not received)\b/.test(text)) return reply(
    "Kalau pembayaran sudah terpotong, cek status di Akun → Riwayat Order dulu dan jangan bayar ulang. Jika masih belum sesuai, hubungi admin dengan Order ID; status pembayaran belum bisa aku verifikasi dari chat ini.",
    "If you've been charged, check Account → Order History first and don't pay again. If the status is still wrong, contact the admin with your Order ID; I can't verify payments in this chat.");
  if (/\b(key|kode|activation)\b/.test(text) && /\b(gagal|invalid|error|tidak bisa|ga bisa|gak bisa|not working|belum sampai|missing)\b/.test(text)) return reply(
    "Cek dulu apakah game, platform, dan durasi key sesuai pesanan. Kalau tetap gagal, kirim Order ID dan pesan error ke admin, bukan key lengkap atau password ya.",
    "Check that the key's game, platform, and duration match your order. If it still fails, send the admin your Order ID and error message, not the full key or your password.");
  if (/\b(order|pesanan|transaksi)\b/.test(text) && /\b(status|cek|check|saya|my)\b/.test(text)) return reply(
    "Status pesanan bisa kamu lihat di Akun → Riwayat Order. Kalau ada yang tidak cocok, hubungi admin dengan Order ID; aku tidak punya akses ke transaksi pribadi.",
    "You can check your order in Account → Order History. If something looks wrong, contact the admin with your Order ID; I don't have access to private transactions.");
  if (/\b(voucher|promo|diskon|discount|coupon)\b/.test(text)) return reply(
    "Cek voucher yang tersedia di checkout untuk produk pilihanmu. Nilai diskon dan syaratnya perlu divalidasi di sana, jadi aku belum bisa menjanjikan potongan tertentu.",
    "Check the available vouchers at checkout for your selected product. Eligibility and the discount are validated there, so I can't promise a specific saving here.");
  if (/\b(reseller|deposit|top up|saldo|balance)\b/.test(text)) return reply(
    "Kalau untuk reseller, gunakan Reseller Desk untuk melihat harga dan menambah saldo. Kamu ingin tanya cara deposit, akses reseller, atau deposit yang belum masuk?",
    "For reseller pricing and deposits, use Reseller Desk. Do you need help adding funds, getting reseller access, or checking a missing deposit?");
  if (/\b(password|otp|api key|system prompt|supplier cost|modal supplier)\b/.test(text)) return reply(
    "Aku tidak bisa membagikan data internal atau rahasia akun. Jangan kirim password atau OTP; kalau ada kendala akun, hubungi admin melalui tombol di bawah.",
    "I can't share internal data or account secrets. Don't send passwords or OTPs; use Contact admin for account issues.");
  if (/^(hai|halo|hi|hello|hey|pagi|siang|malam)[ .!]*$/.test(text)) return reply(
    "Hai! Mau cari key untuk game apa, atau lagi ada kendala pesanan?",
    "Hey! Which game are you shopping for, or do you need help with an order?");
  if (/^(makasih|terima kasih|thanks|thank you|ok|oke|sip)[ .!]*$/.test(text)) return reply(
    "Sama-sama! Kalau ada yang mau dicek lagi, tinggal bilang ya.", "You're welcome! Let me know if there's anything else you'd like to check.");

  const games = [...new Set(catalog.map((p) => p.game))];
  const brands = [...new Set(catalog.map((p) => p.brand))];
  const aliases = { "free fire": ["ff"], "mobile legends": ["ml", "mlbb"], "delta force": ["df"], "call of duty mobile": ["codm"], "pubg mobile": ["pubg"] };
  const namesIn = (value, names) => names.filter((name) => name && (contains(value, name) || (aliases[normalize(name)] || []).some((alias) => contains(value, alias))));
  let filters = { games: [], brands: [], platform: null, duration: null, budget: null };
  const turns = [...history.filter((item) => item?.role === "user").slice(-6), { content: message }];
  for (const turn of turns) {
    const value = normalize(turn.content);
    if (/\b(mulai lagi|reset|start over)\b/.test(value)) filters = { games: [], brands: [], platform: null, duration: null, budget: null };
    const mentionedGames = namesIn(value, games);
    if (mentionedGames.length) {
      if (filters.games.join() !== mentionedGames.join()) filters = { games: mentionedGames, brands: [], platform: null, duration: null, budget: null };
      filters.games = mentionedGames;
    }
    const mentionedBrands = namesIn(value, brands);
    if (mentionedBrands.length) filters.brands = mentionedBrands;
    const platforms = value.match(/\b(android|ios|iphone|ipad|pc|windows)\b/g);
    if (platforms) filters.platform = /ios|iphone|ipad/.test(platforms.at(-1)) ? "ios" : /pc|windows/.test(platforms.at(-1)) ? "pc" : "android";
    const hours = durationHours(value);
    if (hours !== null) filters.duration = hours;
    const budget = readBudget(value);
    if (budget !== null) filters.budget = budget;
    if (/\b(bebas budget|tanpa batas|no budget|any budget)\b/.test(value)) filters.budget = null;
    if (/\b(brand bebas|any brand|yang lain|another|alternatif)\b/.test(value)) filters.brands = [];
  }
  if (/\$|\busd\b/.test(text) && /budget|max|under|bawah/.test(text)) return reply(
    "Boleh sebutkan batas budget dalam rupiah? Harga katalog yang bisa aku cocokkan di sini memakai rupiah.",
    "Could you give your budget in rupiah? The catalog prices I can compare here are in IDR.", "clarify");
  if (!filters.games.length && !filters.brands.length) return reply(
    "Biar pilihannya tepat, kamu cari untuk game apa?", "Which game is this for? That'll help me narrow it down.", "clarify");
  const productQuestion = namesIn(text, [...games, ...brands]).length || durationHours(text) !== null || readBudget(text) !== null ||
    /\b(harga|price|stok|stock|ready|murah|cheapest|hemat|bandingkan|compare|vs|android|ios|iphone|pc|alternatif|another|yang lain|berapa|how much|aman|safe|ban|itu|it|that|rekomendasi|recommend|bebas|budget)\b/.test(text);
  if (!productQuestion) return reply("Aku bisa bantu soal katalog dan pesanan AE. Kamu mau cek produk yang tadi, atau cari game lain?",
    "I can help with AE's catalog and orders. Do you want to check the previous product or a different game?", "clarify");
  if (!filters.platform) {
    const platforms = new Set(catalog.filter((p) => !filters.games.length || filters.games.includes(p.game)).map((p) => p.platform));
    if (platforms.size > 1) return reply("Kamu pakai Android, iOS, atau PC?", "Are you using Android, iOS, or PC?", "clarify");
  }
  let candidates = catalog.filter((p) => (!filters.games.length || filters.games.includes(p.game))
    && (!filters.brands.length || filters.brands.includes(p.brand))
    && (!filters.platform || normalize(p.platform) === filters.platform)
    && (filters.duration === null || durationHours(p.duration) === filters.duration)
    && Number.isFinite(Number(p.price_idr)) && Number(p.price_idr) > 0);
  if (!candidates.length) return reply(
    "Kombinasi game, platform, brand, dan durasi itu belum ada di katalog. Mau ubah durasi atau brandnya?",
    "That game, platform, brand, and duration combination isn't in the catalog. Would you like a different duration or brand?", "clarify");
  const ready = candidates.filter((p) => p.stock > 0);
  if (!ready.length) return reply("Pilihan itu ada di katalog, tapi stoknya sedang kosong. Mau cari brand lain untuk game yang sama?",
    "That option is listed, but it's out of stock right now. Want to try another brand for the same game?", "catalog");
  candidates = ready.filter((p) => filters.budget === null || p.price_idr <= filters.budget);
  const money = (value) => `Rp${Number(value).toLocaleString("id-ID")}`;
  if (!candidates.length) {
    const minimum = Math.min(...ready.map((p) => p.price_idr));
    return reply(`Belum ada yang masuk budget itu; pilihan ready yang sesuai mulai ${money(minimum)}. Mau ubah durasi atau batas budget?`,
      `Nothing fits that budget; matching in-stock options start at ${money(minimum)}. Want to change the duration or budget?`, "catalog");
  }
  const compare = /banding|compare|versus|\bvs\b/.test(text);
  const alternative = /yang lain|alternatif|another|alternative/.test(text);
  const stock = /stok.*banyak|stock.*most|stok.*aman/.test(text);
  candidates.sort((a, b) => (stock ? b.stock - a.stock : a.price_idr - b.price_idr) || a.price_idr - b.price_idr);
  if (alternative) {
    const previous = normalize([...history].reverse().find((item) => item.role === "assistant")?.content);
    const unseen = candidates.filter((p) => !contains(previous, p.game) || !contains(previous, p.brand) || !contains(previous, p.duration));
    if (!unseen.length) return reply("Untuk kriteria yang sama, belum ada alternatif ready lainnya. Mau coba durasi lain?",
      "There isn't another in-stock match for those same criteria. Want to try a different duration?", "catalog");
    candidates = unseen;
  }
  const p = candidates[0];
  const availability = p.manual
    ? (en ? "Manual fulfillment; confirm availability before paying" : "Diproses manual; konfirmasi ketersediaan sebelum bayar")
    : (en ? `${p.stock} currently in stock` : `Stok ${p.stock}`);
  const label = (item) => `${item.game} ${item.brand}, ${item.duration} (${item.platform})`;
  let answer;
  if (compare && candidates.length > 1) {
    const sorted = [...candidates].sort((a, b) => a.price_idr - b.price_idr);
    const a = sorted[0];
    const b = sorted.find((item) => item.brand !== a.brand) || sorted[1];
    const difference = b.price_idr - a.price_idr;
    answer = en
      ? `${label(a)} is ${money(a.price_idr)}; ${label(b)} is ${money(b.price_idr)}. ${difference ? `${a.brand} costs ${money(difference)} less` : "Their prices are equal"}; this compares price, not quality or ban risk.`
      : `${label(a)} ${money(a.price_idr)}; ${label(b)} ${money(b.price_idr)}. ${difference ? `${a.brand} lebih hemat, selisih ${money(difference)}` : "Harganya sama"}; ini perbandingan harga, bukan jaminan kualitas atau bebas ban.`;
  } else if (compare) return reply("Baru satu pilihan ready yang cocok, jadi belum ada pasangan untuk dibandingkan. Mau longgarkan brand atau durasinya?",
    "Only one matching option is in stock, so I can't compare a pair yet. Want to broaden the brand or duration?", "catalog");
  else if (!stock && /\b(aman|safe|ban)\b/.test(text)) answer = en ? `${label(p)} is ${money(p.price_idr)}. I can't guarantee it is ban-free; catalog labels aren't a safety guarantee.`
    : `${label(p)} harganya ${money(p.price_idr)}. Aku tidak bisa menjamin bebas ban; label katalog bukan jaminan keamanan.`;
  else answer = en ? `${alternative ? "Another option is" : stock ? "The best-stocked match is" : "The lowest-priced match is"} ${label(p)} at ${money(p.price_idr)}. ${availability}; the final total is confirmed at checkout.`
    : `${alternative ? "Alternatif lainnya" : stock ? "Stok paling aman saat ini" : "Yang paling hemat"} ${label(p)}, ${money(p.price_idr)}. ${availability}; total akhir dikonfirmasi saat checkout.`;
  return { answer, kind: "catalog", filters, candidates: candidates.slice(0, 5) };
}

function isGroundedCatalogReply(answer, plan, catalog) {
  if (typeof answer !== "string" || !answer.trim() || answer.length > 1200 || !plan.candidates?.length) return false;
  const numbers = (value) => new Set(String(value).match(/\d+(?:[.,]\d+)*/g) || []);
  const expected = numbers(plan.answer);
  const actual = numbers(answer);
  if ([...actual].some((number) => !expected.has(number)) || [...expected].some((number) => !actual.has(number))) return false;
  const normalized = normalize(answer);
  const first = plan.candidates[0];
  if (!contains(normalized, first.game) || !contains(normalized, first.brand)) return false;
  if (/https?:|<|guarantee|guaranteed|dijamin|pasti aman|free key|gratis|refund approved/i.test(answer)) return false;
  for (const product of catalog) {
    for (const field of ["game", "brand", "platform"]) {
      if (contains(normalized, product[field]) && !contains(normalize(plan.answer), product[field])) return false;
    }
  }
  return true;
}

module.exports = { buildAssistantPlan, durationHours, readBudget, isGroundedCatalogReply };
