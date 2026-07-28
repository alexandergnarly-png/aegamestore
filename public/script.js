// Safe DOM ready helper: tetap jalan walau script.js telat dimuat oleh dynamic script injection
function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  } else {
    callback();
  }
}
const translations = {
  id: {
    selectProduct: "Pilih Game",
    fillDetails: "Klik game yang kamu mau, lalu pilih brand dan durasi.",
    selectGame: "1. Pilih Game",
    buyNow: "Beli Sekarang",
    processing: "Memproses...",
    loadingWebsite: "Memuat Website...",
    howToBuy: "Cara Beli",
    searchGamePlaceholder: "Cari nama game (contoh: PUBG)...",
    processingOrder: "Memproses pesanan...",
    heroTitle: "Key game, simpel dan cepat.",
    heroLine1: "DUNIA BARUMU",
    heroLine2: "TINGGAL SATU",
    heroLine3: "KEY LAGI.",
    heroDesc: "Pilih game, bayar aman, dan key dikirim otomatis.",
    totalPayment: "Total Pembayaran",
    previewEmpty: "Produk belum dipilih",
    previewWait: "Silakan pilih platform dan produk",
    guideTitle: "Panduan Top-Up",
    guideStep1: "Pilih Game: Cari dan klik game yang kamu inginkan.",
    guideStep2:
      "Tentukan Produk: Pilih tipe device (iOS/Android) dan produknya.",
    guideStep3: "Isi Data: Nama player otomatis dari akun login.",
    guideStep4: "Checkout: Klik 'Beli Sekarang' dan selesaikan pembayaran.",
    guideStep5: "Selesai! Game akan langsung dikirim setelah sukses.",
    guideOk: "Mengerti",
    loginBtn: "Masuk / Daftar",
    navHome: "Beranda",
    navStore: "Katalog Game",
    navGuide: "Cara Beli",
    filterAll: "Semua",
    filterMobile: "Mobile",
    filterPC: "PC Games",
    filterVoucher: "Voucher",
    orderGameBadge: "Order Game",
    modalOrderDesc: "Pilih produk, cek total, lalu lanjut bayar.",
    platformLabel: "Platform",
    brandLabel: "Brand",
    durationLabel: "Nominal / Durasi",
    quantityLabel: "Jumlah Key",
    quantityLimit: "Maks. 5 per order",
    playerNameLabel: "Nama Player",
    contactLabel: "Kontak",
    voucherCodeLabel: "Kode Voucher",
    playerNamePlaceholder: "Masukkan nama kamu",
    contactPlaceholder: "Support utama via Telegram admin",
    voucherPlaceholder: "Contoh: DELTA5K",
    checkVoucherBtn: "Cek",
    summaryGame: "Game",
    summaryProduct: "Produk",
    summaryQuantity: "Jumlah",
    summaryTotalPayment: "Total Pembayaran",
    trustText: "Pembayaran aman via QRIS GoPay Merchant • Pengiriman instan",
    originalPriceLabel: "Harga Produk",
    voucherDiscountLabel: "Diskon Voucher",
    qrisFeeLabel: "Fee QRIS",
    finalPriceLabel: "Total Bayar",
    selectProductFirstMsg: "Pilih produk dulu.",
    emptyVoucherMsg: "Kode voucher kosong.",
    invalidVoucherMsg: "Voucher tidak valid.",
    voucherCheckFailedMsg: "Gagal cek voucher. Coba lagi.",
    voucherSuccessMsg: "Voucher berhasil digunakan.",
    safePaymentTitle: "Metode Pembayaran Aman",
    privacyPolicyLink: "Kebijakan Privasi",
    termsPolicyLink: "Syarat & Ketentuan",
    privacyTitle: "Kebijakan Privasi",
    privacyContent:
      "AE Game Store menjaga data pengguna seperti username, kontak order, dan riwayat transaksi hanya untuk keperluan pemrosesan pesanan, pengiriman produk, dan bantuan pelanggan. Kami tidak menjual data pengguna kepada pihak lain.",
    termsTitle: "Syarat & Ketentuan",
    termsContent:
      "Dengan menggunakan AE Game Store, buyer wajib mengisi data order dengan benar. Produk digital yang sudah berhasil dikirim tidak dapat dibatalkan kecuali ada kesalahan dari sistem. Pembayaran diproses melalui payment gateway yang tersedia.",
    policyOk: "Mengerti",
    stockLabel: "Stok",
    outOfStockLabel: "Habis",
    outOfStockTitle: "Stok Habis",
    outOfStockText:
      "Stok key untuk produk ini sedang habis. Silakan pilih produk lain atau hubungi admin.",
    skipToContent: "Lewati ke konten",
    brandTagline: "Premium Digital Keys",
    navReviews: "Review Buyer",
    heroBadge: "AE GAME STORE",
    heroCtaPrimary: "Browse Games",
    heroCtaGuide: "Cara Beli",
    trustInstantTitle: "Kirim Cepat",
    trustInstantDesc: "Key otomatis setelah pembayaran",
    trustSecureTitle: "Pembayaran Aman",
    trustSecureDesc: "QRIS GoPay Merchant resmi",
    trustSupportTitle: "Admin Siaga",
    trustSupportDesc: "Bantu order & kendala transaksi",
    filterTools: "Tools / GBox",
    testiTitle: "Kepercayaan Gamers",
    testiDesc:
      "Review asli dari buyer yang sudah pernah bertransaksi di AE Game Store.",
    giveReviewBtn: "Kasih Review",
    reviewNote:
      "Review hanya bisa dikirim oleh buyer yang sudah pernah berhasil order.",
    chatAdminTitle: "AE Help",
    chatAdminSub: "Support center",
    footerTagline:
      "Top up game key cepat, aman, dan terpercaya bersama AE Game Store.",
    metaGames: "Game tersedia",
    metaStock: "Stok ready",
    filterFavorites: "Favorit",
    sortLabel: "Urutkan",
    sortDefault: "Rekomendasi",
    sortCheapest: "Termurah",
    sortAZ: "A–Z",
    sortStock: "Stok Terbanyak",
    recentTitle: "Terakhir dilihat",
    recentClear: "Bersihkan",
    cardFromPrice: "Mulai",
    cardChooseProduct: "Pilih Produk",
    cardBadgeHot: "HOT",
    cardBadgeBest: "BEST SELLER",
    cardBadgeNew: "NEW",
    cardCategoryMobile: "Mobile",
    cardCategoryTools: "Tools",
    cardFavoriteAdd: "Tambah ke favorit",
    cardFavoriteRemove: "Hapus dari favorit",
    toastFavoriteAdded: "Ditambahkan ke favorit",
    toastFavoriteRemoved: "Dihapus dari favorit",
    toastVoucherCopied: "Kode voucher disalin",
    toastFiltersReset: "Filter direset",
    toastRecentCleared: "Riwayat dibersihkan",
    resetFilterBtn: "Reset filter",
    emptyFavoritesTitle: "Belum ada game favorit",
    emptyFavoritesDesc:
      "Klik ikon ♡️ di kartu game untuk menyimpannya di sini.",
    orderStep1: "Produk",
    orderStep2: "Data",
    orderStep3: "Bayar",
    promoEndsIn: "Refresh in",
    catalogStockReady: "stok ready",
    trendingTitle: "Trending",
    trendingSub: "Top game minggu ini",
    trendingEmpty: "Belum ada data trending",
    quickBuyTitle: "Beli Lagi",
    quickBuySub: "Order terakhir kamu — 1 klik checkout",
    quickBuyAction: "Beli lagi",
    recommendationTitle: "Mungkin Kamu Suka",
    searchHistoryTitle: "Pencarian terakhir",
    searchHistoryClear: "Hapus",
    searchEmptyHint: "Mulai ketik untuk cari game",
    genreLabel: "Genre",
    genreAll: "Semua genre",
    genreMOBA: "MOBA",
    genreBR: "Battle Royale",
    genreFPS: "FPS",
    genreMMORPG: "MMORPG",
    genreSandbox: "Sandbox",
    genreCasual: "Casual",
    genreSimulation: "Simulation",
    genreCardGame: "Card Game",
    genreTools: "Tools",
    contactValidWA: "Nomor WhatsApp terdeteksi",
    contactValidEmail: "Email terdeteksi",
    contactInvalid: "Isi nomor WA atau email",
    deliveryAutoLabel: "Auto",
    deliveryAutoDesc: "Kirim otomatis ≤ 1 menit setelah bayar",
    deliveryManualLabel: "Manual",
    deliveryManualDesc: "Admin proses manual ≤ 30 menit",
    autoVoucherApplied: "otomatis terpasang",
    autoVoucherSavings: "Hemat",
    paymentPreviewLabel: "Bayar pakai:",
    resumeCartTitle: "Pesananmu masih ada",
    resumeCartAction: "Lanjut Beli",
    bottomNavHome: "Beranda",
    bottomNavCatalog: "Katalog",
    bottomNavHistory: "Riwayat",
    bottomNavAccount: "Akun",
    pullReleaseHint: "Lepas untuk refresh",
    pullToRefreshHint: "Tarik untuk refresh",
    pullRefreshingHint: "Memuat ulang...",
    installAppTitle: "Install AE Game Store",
    installAppDesc: "Akses cepat, notif promo, hemat data",
    installAppBtn: "Install",
    detailRatingLabel: "Rating",
    detailViewBtn: "Lihat Detail",
    adminChatHelpTitle: "Butuh bantuan?",
    adminChatHelpDesc: "Support cepat untuk order, pembayaran, dan key.",
    adminChatOnline: "Online sekarang",
    adminChatEstimate: "Estimasi balasan 1–5 menit",
    adminChatHistoryTitle: "Cek Order",
    adminChatHistoryDesc: "Status & riwayat",
    adminChatGuideTitle: "Cara Beli",
    adminChatGuideDesc: "Panduan singkat",
    adminChatStatusTitle: "Support tersedia",
    adminChatStatusDesc: "Biasanya membalas dalam 1–5 menit.",
    adminChatQuestionTitle: "Tanya Admin",
    adminChatQuestionDesc: "Chat admin via Telegram untuk bantuan cepat.",
    adminChatTermsTitle: "Terms",
    adminChatTermsDesc: "Refund & ketentuan",
    adminChatNote: "Sertakan Order ID kalau bertanya soal transaksi.",
    voucherToggleTitle: "Punya voucher?",
    voucherToggleDesc: "Masukkan kode jika ada",
  },
  en: {
    selectProduct: "Choose Game",
    fillDetails: "Choose a game first, then pick brand and duration.",
    selectGame: "1. Select Game",
    buyNow: "Buy Now",
    processing: "Processing...",
    loadingWebsite: "Loading Website...",
    howToBuy: "How it works",
    searchGamePlaceholder: "Search game name (e.g. PUBG)...",
    processingOrder: "Processing order...",
    heroTitle: "Game keys, simple and fast.",
    heroLine1: "YOUR NEXT WORLD",
    heroLine2: "IS ONE KEY",
    heroLine3: "AWAY.",
    heroDesc: "Choose a game, pay securely, and get your key automatically.",
    totalPayment: "Total Payment",
    previewEmpty: "No product selected",
    previewWait: "Please select platform and product",
    guideTitle: "Top-Up Guide",
    guideStep1: "Select Game: Find and choose your desired game.",
    guideStep2: "Choose Product: Select device type (iOS/Android) and product.",
    guideStep3: "Fill Data: Player name is filled from your logged-in account.",
    guideStep4: "Checkout: Click 'Buy Now' and complete the payment.",
    guideStep5: "Done! Your game will be delivered instantly after success.",
    guideOk: "Got it",
    loginBtn: "Login / Register",
    navHome: "Home",
    navStore: "Game Catalog",
    navGuide: "How to Buy",
    filterAll: "All",
    filterMobile: "Mobile",
    filterPC: "PC Games",
    filterVoucher: "Voucher",
    orderGameBadge: "Order Game",
    modalOrderDesc: "Choose product, review total, then continue payment.",
    platformLabel: "Platform",
    brandLabel: "Brand",
    durationLabel: "Nominal / Duration",
    quantityLabel: "Key Quantity",
    quantityLimit: "Max. 5 per order",
    playerNameLabel: "Player Name",
    contactLabel: "Contact",
    voucherCodeLabel: "Voucher Code",
    playerNamePlaceholder: "Enter your player name",
    contactPlaceholder: "Main support is via Telegram admin",
    voucherPlaceholder: "Example: DELTA5K",
    checkVoucherBtn: "Check",
    summaryGame: "Game",
    summaryProduct: "Product",
    summaryQuantity: "Quantity",
    summaryTotalPayment: "Total Payment",
    trustText: "Secure payment via QRIS GoPay Merchant • Instant delivery",
    originalPriceLabel: "Product Price",
    voucherDiscountLabel: "Voucher Discount",
    qrisFeeLabel: "QRIS Fee",
    finalPriceLabel: "Final Payment",
    selectProductFirstMsg: "Please select a product first.",
    emptyVoucherMsg: "Voucher code is empty.",
    invalidVoucherMsg: "Invalid voucher.",
    voucherCheckFailedMsg: "Failed to check voucher. Please try again.",
    voucherSuccessMsg: "Voucher applied successfully.",
    safePaymentTitle: "Secure Payment Methods",
    privacyPolicyLink: "Privacy Policy",
    termsPolicyLink: "Terms & Conditions",
    privacyTitle: "Privacy Policy",
    privacyContent:
      "AE Game Store protects user data such as username, order contact, and transaction history only for order processing, product delivery, and customer support. We do not sell user data to third parties.",
    termsTitle: "Terms & Conditions",
    termsContent:
      "By using AE Game Store, buyers must provide correct order information. Digital products that have been successfully delivered cannot be cancelled unless there is a system error. Payments are processed through the available payment gateway.",
    policyOk: "Got it",
    stockLabel: "Stock",
    outOfStockLabel: "Out of stock",
    outOfStockTitle: "Out of Stock",
    outOfStockText:
      "The key stock for this product is currently empty. Please choose another product or contact admin.",
    skipToContent: "Skip to content",
    brandTagline: "Premium Digital Keys",
    navReviews: "Buyer Reviews",
    heroBadge: "AE GAME STORE",
    heroCtaPrimary: "Browse Games",
    heroCtaGuide: "How it works",
    trustInstantTitle: "Instant Delivery",
    trustInstantDesc: "Key delivered automatically after payment",
    trustSecureTitle: "Secure Payment",
    trustSecureDesc: "Official QRIS GoPay Merchant",
    trustSupportTitle: "24/7 Support",
    trustSupportDesc: "Admin standby anytime",
    filterTools: "Tools / GBox",
    testiTitle: "Trusted by Gamers",
    testiDesc:
      "Real reviews from buyers who have completed orders on AE Game Store.",
    giveReviewBtn: "Leave a Review",
    reviewNote:
      "Reviews can only be submitted by buyers who have completed an order.",
    chatAdminTitle: "AE Help",
    chatAdminSub: "Support center",
    voucherToggleTitle: "Have a voucher?",
    voucherToggleDesc: "Enter code if you have one",
    footerTagline:
      "Fast, secure, and trusted game key top-up with AE Game Store.",
    metaGames: "Games available",
    metaStock: "Stock ready",
    filterFavorites: "Favorites",
    sortLabel: "Sort by",
    sortDefault: "Recommended",
    sortCheapest: "Cheapest",
    sortAZ: "A–Z",
    sortStock: "Most Stock",
    recentTitle: "Recently viewed",
    recentClear: "Clear",
    cardFromPrice: "From",
    cardChooseProduct: "Choose Product",
    cardBadgeHot: "HOT",
    cardBadgeBest: "BEST SELLER",
    cardBadgeNew: "NEW",
    cardCategoryMobile: "Mobile",
    cardCategoryTools: "Tools",
    cardFavoriteAdd: "Add to favorites",
    cardFavoriteRemove: "Remove from favorites",
    toastFavoriteAdded: "Added to favorites",
    toastFavoriteRemoved: "Removed from favorites",
    toastVoucherCopied: "Voucher code copied",
    toastFiltersReset: "Filters reset",
    toastRecentCleared: "History cleared",
    resetFilterBtn: "Reset filter",
    emptyFavoritesTitle: "No favorite games yet",
    emptyFavoritesDesc: "Tap the ♡️ icon on a game card to save it here.",
    orderStep1: "Product",
    orderStep2: "Data",
    orderStep3: "Pay",
    promoEndsIn: "Refresh in",
    catalogStockReady: "stock ready",
    trendingTitle: "Trending",
    trendingSub: "Top games this week",
    trendingEmpty: "No trending data yet",
    quickBuyTitle: "Buy Again",
    quickBuySub: "Your recent orders — 1-click checkout",
    quickBuyAction: "Buy again",
    recommendationTitle: "You Might Also Like",
    searchHistoryTitle: "Recent searches",
    searchHistoryClear: "Clear",
    searchEmptyHint: "Start typing to search games",
    genreLabel: "Genre",
    genreAll: "All genres",
    genreMOBA: "MOBA",
    genreBR: "Battle Royale",
    genreFPS: "FPS",
    genreMMORPG: "MMORPG",
    genreSandbox: "Sandbox",
    genreCasual: "Casual",
    genreSimulation: "Simulation",
    genreCardGame: "Card Game",
    genreTools: "Tools",
    contactValidWA: "WhatsApp number detected",
    contactValidEmail: "Email detected",
    contactInvalid: "Enter WA number or email",
    deliveryAutoLabel: "Auto",
    deliveryAutoDesc: "Delivered automatically ≤ 1 minute after payment",
    deliveryManualLabel: "Manual",
    deliveryManualDesc: "Admin processes manually ≤ 30 minutes",
    autoVoucherApplied: "auto-applied",
    autoVoucherSavings: "You save",
    paymentPreviewLabel: "Pay with:",
    resumeCartTitle: "Your order is saved",
    resumeCartAction: "Resume",
    bottomNavHome: "Home",
    bottomNavCatalog: "Catalog",
    bottomNavHistory: "History",
    bottomNavAccount: "Account",
    pullReleaseHint: "Release to refresh",
    pullToRefreshHint: "Pull to refresh",
    pullRefreshingHint: "Refreshing...",
    installAppTitle: "Install AE Game Store",
    installAppDesc: "Quick access, promo alerts, save data",
    installAppBtn: "Install",
    detailRatingLabel: "Rating",
    detailViewBtn: "View Details",
    adminChatHelpTitle: "Need help?",
    adminChatHelpDesc: "Fast support for orders, payments, and keys.",
    adminChatOnline: "Online now",
    adminChatEstimate: "Estimated reply 1–5 minutes",
    adminChatHistoryTitle: "Check Order",
    adminChatHistoryDesc: "Status & history",
    adminChatGuideTitle: "How to Buy",
    adminChatGuideDesc: "Quick guide",
    adminChatStatusTitle: "Support available",
    adminChatStatusDesc: "Usually replies within 1–5 minutes.",
    adminChatQuestionTitle: "Ask a question",
    adminChatQuestionDesc: "Chat admin via Telegram for quick support.",
    adminChatTermsTitle: "Terms",
    adminChatTermsDesc: "Refund & policy",
    adminChatNote: "Include your Order ID when asking about a transaction.",
  },
};

function detectBrowserLanguage() {
  const savedLanguage = localStorage.getItem("ae_language");

  if (savedLanguage === "id" || savedLanguage === "en") {
    return savedLanguage;
  }

  const browserLanguage = String(
    navigator.language || navigator.userLanguage || "id",
  ).toLowerCase();

  if (browserLanguage.startsWith("id")) {
    return "id";
  }

  return "en";
}

let currentLanguage = detectBrowserLanguage();

function setupBackgroundMusic() {
  const audio = document.getElementById("backgroundMusic");
  const toggle = document.getElementById("musicToggle");
  if (!audio || !toggle) return;

  const storageKey = "ae_music_enabled";
  audio.volume = 0.35;

  const syncToggle = () => {
    const playing = !audio.paused;
    toggle.classList.toggle("is-playing", playing);
    toggle.setAttribute("aria-pressed", String(playing));
    toggle.setAttribute(
      "aria-label",
      playing
        ? currentLanguage === "en"
          ? "Pause music"
          : "Jeda musik"
        : currentLanguage === "en"
          ? "Play music"
          : "Nyalakan musik",
    );
  };

  toggle.addEventListener("click", () => {
    if (audio.paused) {
      localStorage.setItem(storageKey, "on");
      audio.play().catch(syncToggle);
    } else {
      localStorage.setItem(storageKey, "off");
      audio.pause();
    }
  });

  audio.addEventListener("play", syncToggle);
  audio.addEventListener("pause", syncToggle);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      audio.pause();
    } else if (localStorage.getItem(storageKey) === "on") {
      audio.play().catch(syncToggle);
    }
  });

  if (localStorage.getItem(storageKey) === "on") {
    audio.play().catch(syncToggle);
  }
  syncToggle();
}

onReady(setupBackgroundMusic);

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("ae_language", lang);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");

    if (translations[lang] && translations[lang][key]) {
      element.innerText = translations[lang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");

    if (translations[lang][key]) {
      element.placeholder = translations[lang][key];
    }
  });

  if (
    typeof renderGames === "function" &&
    Array.isArray(allProducts) &&
    allProducts.length
  ) {
    try {
      renderGames();
    } catch (e) { }
  }
  const btnId = document.getElementById("btn-id");
  const btnEn = document.getElementById("btn-en");

  if (btnId && btnEn) {
    btnId.classList.remove("active");
    btnEn.classList.remove("active");
    btnId.setAttribute("aria-pressed", lang === "id" ? "true" : "false");
    btnEn.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
    document.getElementById("btn-" + lang).classList.add("active");
  }

  document.documentElement.setAttribute("lang", lang);

  // Re-render localized user menu (if present) so labels follow language
  if (typeof checkLoginStatus === "function") {
    try {
      checkLoginStatus();
    } catch (e) { }
  }
}
let allProducts = [];

const gameImages = {
  pubgmobile: "/images/games/pubg.webp",
  pubgm: "/images/games/pubg.webp",

  mobilelegends: "/images/games/mlbb.webp",
  mobilelegend: "/images/games/mlbb.webp",
  mlbb: "/images/games/mlbb.webp",

  freefire: "/images/games/free-fire.webp",
  ff: "/images/games/free-fire.webp",

  codm: "/images/games/codm.webp",
  callofdutymobile: "/images/games/codm.webp",
  callofduty: "/images/games/codm.webp",

  bloodstrike: "/images/games/blood-strike.webp",

  deltaforce: "/images/games/delta-force.webp",
  arenabreakout: "/images/games/arena-breakout.webp",
  valorant: "/images/games/valorant.webp",
};

const fallbackImage = "/og-ae-game-store.jpg";

function normalizeGameImageKey(gameName) {
  return String(gameName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getGameImage(gameName) {
  return gameImages[normalizeGameImageKey(gameName)] || fallbackImage;
}

let keysystemFeaturedGames = [];
let keysystemFeaturedIndex = 0;
let keysystemFeaturedTimer = null;

function renderKeysystemFeatured(index) {
  const card = document.getElementById("keysystemFeatured");
  if (!card || !keysystemFeaturedGames.length) return;

  keysystemFeaturedIndex =
    ((index % keysystemFeaturedGames.length) + keysystemFeaturedGames.length) %
    keysystemFeaturedGames.length;
  const game = keysystemFeaturedGames[keysystemFeaturedIndex];
  const gameProducts = allProducts.filter((item) => item.game === game);
  const stock = gameProducts.reduce(
    (total, item) => total + Number(item.available_keys || 0),
    0,
  );
  const minPrice = Math.min(
    ...gameProducts.map((item) => Number(item.price || 0)).filter(Boolean),
  );

  card.dataset.game = game;
  document.getElementById("keysystemFeaturedImage").src = getGameImage(game);
  document.getElementById("keysystemFeaturedImage").alt = game;
  document.getElementById("keysystemFeaturedName").textContent = game;
  document.getElementById("keysystemFeaturedPrice").textContent =
    Number.isFinite(minPrice) ? formatRupiah(minPrice) : "—";
  document.getElementById("keysystemFeaturedStock").textContent =
    `${stock.toLocaleString("id-ID")} KEYS READY`;
  document.getElementById("keysystemFeaturedCode").textContent =
    `AE // DROP ${String(keysystemFeaturedIndex + 1).padStart(2, "0")}`;
  card.setAttribute("aria-label", `${game} — buka produk unggulan`);
}

function restartKeysystemFeaturedRotation() {
  clearInterval(keysystemFeaturedTimer);
  if (
    keysystemFeaturedGames.length < 2 ||
    document.hidden ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  keysystemFeaturedTimer = setInterval(() => {
    const card = document.getElementById("keysystemFeatured");
    if (!card) return;
    const nextIndex =
      (keysystemFeaturedIndex + 1) % keysystemFeaturedGames.length;
    const nextImage = new Image();
    nextImage.src = getGameImage(keysystemFeaturedGames[nextIndex]);
    card.classList.add("is-switching");
    setTimeout(() => renderKeysystemFeatured(nextIndex), 260);
    setTimeout(() => card.classList.remove("is-switching"), 580);
  }, 3200);
}

function updateKeysystemFeatured() {
  keysystemFeaturedGames = [
    ...new Set(
      allProducts
        .filter((item) => Number(item.available_keys || 0) > 0)
        .map((item) => String(item.game || ""))
        .filter(Boolean),
    ),
  ];
  if (!keysystemFeaturedGames.length) {
    keysystemFeaturedGames = [
      ...new Set(
        allProducts.map((item) => String(item.game || "")).filter(Boolean),
      ),
    ];
  }
  renderKeysystemFeatured(0);
  restartKeysystemFeaturedRotation();
}

const keysystemFeaturedCard = document.getElementById("keysystemFeatured");
keysystemFeaturedCard?.addEventListener("click", () => {
  const game = keysystemFeaturedCard.dataset.game;
  if (game) openOrderModal(game);
});
keysystemFeaturedCard?.addEventListener("mouseenter", () =>
  clearInterval(keysystemFeaturedTimer),
);
keysystemFeaturedCard?.addEventListener(
  "mouseleave",
  restartKeysystemFeaturedRotation,
);
keysystemFeaturedCard?.addEventListener("focusin", () =>
  clearInterval(keysystemFeaturedTimer),
);
keysystemFeaturedCard?.addEventListener(
  "focusout",
  restartKeysystemFeaturedRotation,
);
document.addEventListener("visibilitychange", restartKeysystemFeaturedRotation);

let selectedGame = "";
let currentCategory = "all";
let selectedProductId = null;
let appliedVoucherCode = "";
let selectedProductBasePrice = 0;
const MAX_ORDER_QUANTITY = 5;
let selectedOrderQuantity = 1;
let selectedCheckoutPaymentMethod = "midtrans";
let checkoutWalletBalance = 0;
let lastCheckoutPricing = null;
let selectedReviewRating = 5;
let currentSort = localStorage.getItem("ae_sort") || "default";

const FAVORITES_STORAGE_KEY = "ae_favorite_games";
const RECENT_STORAGE_KEY = "ae_recent_games";
const RECENT_MAX = 6;

function readJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (err) {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) { }
}

let favoriteGames = readJsonStorage(FAVORITES_STORAGE_KEY, []);
let recentGames = readJsonStorage(RECENT_STORAGE_KEY, []);

function isFavorite(game) {
  return favoriteGames.includes(game);
}

function toggleFavorite(game) {
  if (!game) return false;
  const wasFavorite = isFavorite(game);
  if (wasFavorite) {
    favoriteGames = favoriteGames.filter((entry) => entry !== game);
  } else {
    favoriteGames = [game, ...favoriteGames.filter((entry) => entry !== game)];
  }
  writeJsonStorage(FAVORITES_STORAGE_KEY, favoriteGames);
  return !wasFavorite;
}

function pushRecentGame(game) {
  if (!game) return;
  recentGames = [game, ...recentGames.filter((entry) => entry !== game)].slice(
    0,
    RECENT_MAX,
  );
  writeJsonStorage(RECENT_STORAGE_KEY, recentGames);
}

function clearRecentGames() {
  recentGames = [];
  writeJsonStorage(RECENT_STORAGE_KEY, recentGames);
}

function showToast(message, options = {}) {
  const stack = document.getElementById("toastStack");
  if (!stack || !message) return;

  const toast = document.createElement("div");
  toast.className = "toast" + (options.tone ? " toast-" + options.tone : "");
  toast.setAttribute("role", "status");

  const icon = options.icon || "•";
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${icon}</span>
    <span class="toast-text">${escapeHtml(message)}</span>
  `;

  stack.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  const duration = Number(options.duration || 2400);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 280);
  }, duration);
}

const gameGrid = document.getElementById("gameGrid");
const platformSelect = document.getElementById("platform");
const brandSelect = document.getElementById("brand");
const productSelect = document.getElementById("product");
const buyBtn = document.getElementById("buyBtn");
const loadingText = document.getElementById("loading");

function formatRupiah(num) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

function normalizePlayStatus(status) {
  const value = String(status || "safe")
    .trim()
    .toLowerCase();

  if (value === "maintenance") return "maintenance";
  if (value === "risk") return "risk";
  return "safe";
}

function normalizePlatform(platform) {
  const value = String(platform || "android")
    .trim()
    .toLowerCase();

  if (value === "ios" || value === "iphone" || value === "ipad") return "ios";
  return "android";
}

function getPlatformLabel(platform) {
  return normalizePlatform(platform) === "ios" ? "iOS" : "Android";
}

function getProductPlatform(product) {
  return normalizePlatform(product?.platform || product?.device || "android");
}

function getPlayStatusMeta(status) {
  const value = normalizePlayStatus(status);

  if (value === "maintenance") {
    return {
      value,
      label: "MAINTENANCE",
      text: "Produk sedang maintenance dan belum bisa dibeli.",
    };
  }

  if (value === "risk") {
    return {
      value,
      label: "USE AT YOUR OWN RISK",
      text: "Produk bisa dibeli, tapi gunakan dengan risiko sendiri.",
    };
  }

  return {
    value,
    label: "SAFE TO PLAY",
    text: "Produk aman digunakan saat ini.",
  };
}

function setLoading(isLoading) {
  const selectedProduct = allProducts.find(
    (item) => String(item.id) === String(productSelect.value),
  );

  const availableKeys = Number(selectedProduct?.available_keys || 0);
  const playStatus = normalizePlayStatus(selectedProduct?.play_status);
  const isMaintenance = selectedProduct && playStatus === "maintenance";
  const isOutOfStock = selectedProduct && availableKeys <= 0;

  loadingText.style.display = isLoading ? "block" : "none";

  if (isLoading) {
    buyBtn.disabled = true;
    buyBtn.innerText = translations[currentLanguage].processing;
    return;
  }

  buyBtn.disabled = Boolean(isOutOfStock || isMaintenance);
  buyBtn.innerText = isMaintenance
    ? "Maintenance"
    : isOutOfStock
      ? translations[currentLanguage].outOfStockLabel
      : translations[currentLanguage].buyNow;
}

async function loadAllProducts() {
  const skeletonCard = `<div class="game-skeleton"><div class="game-skeleton-body"><div class="game-skeleton-line title"></div><div class="game-skeleton-line price"></div><div class="game-skeleton-line badge"></div></div></div>`;
  gameGrid.innerHTML = skeletonCard.repeat(6);

  try {
    const res = await fetch("/public-products");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      allProducts = [];
      gameGrid.innerHTML = `
    <div class="empty-category-card">
      <div class="empty-category-icon"></div>
      <h3>Produk belum tersedia</h3>
      <p>Belum ada produk aktif saat ini. Silakan hubungi admin untuk info stok.</p>
      <a href="https://t.me/aegamestore" target="_blank">Chat Admin</a>
    </div>
  `;

      return;
    }

    allProducts = data;

    const uniqueGames = [...new Set(allProducts.map((item) => item.game))];
    selectedGame = uniqueGames[0] || "";

    updateKeysystemFeatured();
    renderGames();
    loadBrands();
    await openOrderFromCheckoutQuery();
  } catch (err) {
    gameGrid.innerHTML = `
  <div class="empty-category-card">
    <div class="empty-category-icon">!</div>
    <h3>Gagal memuat produk</h3>
    <p>Coba refresh halaman atau hubungi admin jika masalah masih terjadi.</p>
    <a href="https://t.me/aegamestore" target="_blank">Chat Admin</a>
  </div>
`;
  }
}

function isToolsGame(gameName) {
  const name = String(gameName || "").toLowerCase();

  return (
    name.includes("gbox") ||
    name.includes("g box") ||
    name.includes("tools") ||
    name.includes("tool")
  );
}

function getGameProducts(game) {
  return allProducts.filter((item) => item.game === game);
}

function getGameStock(game) {
  return getGameProducts(game).reduce(
    (total, item) => total + Number(item.available_keys || 0),
    0,
  );
}

function getGameMinPrice(game) {
  const prices = getGameProducts(game)
    .map((item) => Number(item.price || 0))
    .filter((price) => price > 0);
  return prices.length ? Math.min(...prices) : 0;
}

function getGameBrandCount(game) {
  return new Set(getGameProducts(game).map((item) => item.brand)).size;
}

function getGamePlayStatusSummary(game) {
  const products = getGameProducts(game);

  if (!products.length) {
    return {
      value: "safe",
      label: "SAFE",
      text: "Safe to Play",
    };
  }

  const statuses = products.map((item) =>
    normalizePlayStatus(item.play_status),
  );

  const total = statuses.length;
  const maintenanceCount = statuses.filter(
    (status) => status === "maintenance",
  ).length;
  const riskCount = statuses.filter((status) => status === "risk").length;

  if (maintenanceCount === total) {
    return {
      value: "maintenance",
      label: "MAINTENANCE",
      text: "Maintenance",
    };
  }

  if (maintenanceCount > 0 && maintenanceCount < total) {
    return {
      value: "mixed",
      label: "MIXED",
      text: "Mixed Status",
    };
  }

  if (riskCount > 0) {
    return {
      value: "risk",
      label: "RISK",
      text: "Use at Your Own Risk",
    };
  }

  return {
    value: "safe",
    label: "SAFE",
    text: "Safe to Play",
  };
}

function getGameCreatedAt(game) {
  const dates = getGameProducts(game)
    .map((item) => Date.parse(item.created_at || ""))
    .filter((value) => Number.isFinite(value));
  return dates.length ? Math.max(...dates) : 0;
}

function getGameBadgeKey(game) {
  if (!game) return "";
  const stock = getGameStock(game);
  const brandCount = getGameBrandCount(game);
  const createdAt = getGameCreatedAt(game);
  const now = Date.now();
  const isNew = createdAt && now - createdAt < 1000 * 60 * 60 * 24 * 30;

  if (brandCount >= 2 && stock >= 30) return "cardBadgeBest";
  if (stock >= 50) return "cardBadgeHot";
  if (isNew) return "cardBadgeNew";
  return "";
}

function getGameCategoryLabel(game) {
  return isToolsGame(game)
    ? translations[currentLanguage].cardCategoryTools
    : translations[currentLanguage].cardCategoryMobile;
}

function getCategoryGames(category) {
  const uniqueGames = [...new Set(allProducts.map((item) => item.game))];
  if (category === "Tools") return uniqueGames.filter(isToolsGame);
  if (category === "Mobile")
    return uniqueGames.filter((game) => !isToolsGame(game));
  if (category === "Favorites")
    return uniqueGames.filter((game) => isFavorite(game));
  return uniqueGames;
}

function getVisibleGames() {
  const baseGames = getCategoryGames(currentCategory);
  const sorted = [...baseGames];

  if (currentSort === "price-asc") {
    sorted.sort((a, b) => {
      const priceA = getGameMinPrice(a) || Number.POSITIVE_INFINITY;
      const priceB = getGameMinPrice(b) || Number.POSITIVE_INFINITY;
      return priceA - priceB;
    });
  } else if (currentSort === "az") {
    sorted.sort((a, b) => String(a).localeCompare(String(b)));
  } else if (currentSort === "stock") {
    sorted.sort((a, b) => getGameStock(b) - getGameStock(a));
  } else {
    sorted.sort((a, b) => {
      const stockA = getGameStock(a);
      const stockB = getGameStock(b);
      if (stockA > 0 && stockB <= 0) return -1;
      if (stockB > 0 && stockA <= 0) return 1;
      const favA = isFavorite(a) ? 1 : 0;
      const favB = isFavorite(b) ? 1 : 0;
      if (favA !== favB) return favB - favA;
      return String(a).localeCompare(String(b));
    });
  }

  return sorted;
}

function normalizeImageId(game) {
  return (
    String(game || "game")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8) || "game"
  );
}

function getGameInitials(game) {
  const cleaned = String(game || "")
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .trim();
  if (!cleaned) return "AE";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

function normalizeCheckoutValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getCheckoutQueryParams() {
  const params = new URLSearchParams(window.location.search);

  const productId = Number(
    params.get("productId") || params.get("product_id") || 0,
  );

  return {
    game: String(params.get("game") || "").trim(),
    platform: String(params.get("platform") || "").trim(),
    brand: String(params.get("brand") || "").trim(),
    duration: String(params.get("duration") || "").trim(),
    productId: Number.isInteger(productId) && productId > 0 ? productId : null,
  };
}

function findProductFromCheckoutQuery(query) {
  if (!Array.isArray(allProducts) || allProducts.length === 0) {
    return null;
  }

  if (query.productId) {
    const byId = allProducts.find(
      (item) => Number(item.id) === Number(query.productId),
    );

    if (byId) return byId;
  }

  const targetGame = normalizeCheckoutValue(query.game);
  const targetPlatform = normalizeCheckoutValue(query.platform);
  const targetBrand = normalizeCheckoutValue(query.brand);
  const targetDuration = normalizeCheckoutValue(query.duration);

  return (
    allProducts.find((item) => {
      const sameGame =
        !targetGame || normalizeCheckoutValue(item.game) === targetGame;
      const samePlatform =
        !targetPlatform || normalizeCheckoutValue(getProductPlatform(item)) === targetPlatform;
      const sameBrand =
        !targetBrand || normalizeCheckoutValue(item.brand) === targetBrand;
      const sameDuration =
        !targetDuration ||
        normalizeCheckoutValue(item.duration) === targetDuration;

      return sameGame && samePlatform && sameBrand && sameDuration;
    }) || null
  );
}

function cleanCheckoutQueryFromUrl() {
  const url = new URL(window.location.href);

  url.searchParams.delete("game");
  url.searchParams.delete("platform");
  url.searchParams.delete("brand");
  url.searchParams.delete("duration");
  url.searchParams.delete("productId");
  url.searchParams.delete("product_id");

  const cleanUrl =
    url.pathname +
    (url.searchParams.toString() ? `?${url.searchParams}` : "") +
    url.hash;

  window.history.replaceState({}, document.title, cleanUrl);
}

async function openOrderFromCheckoutQuery() {
  const query = getCheckoutQueryParams();

  if (!query.game && !query.productId) {
    return;
  }

  if (!Array.isArray(allProducts) || allProducts.length === 0) {
    return;
  }

  const targetProduct = findProductFromCheckoutQuery(query);
  const targetGame = targetProduct?.game || query.game;

  if (!targetGame) {
    return;
  }

  await openOrderModal(targetGame);

  setTimeout(() => {
    if (targetProduct) {
      if (platformSelect && targetProduct.platform) {
        platformSelect.value = getProductPlatform(targetProduct);
        platformSelect.dispatchEvent(new Event("change"));
      }

      if (brandSelect && targetProduct.brand) {
        brandSelect.value = targetProduct.brand;
        brandSelect.dispatchEvent(new Event("change"));
      }

      if (productSelect && targetProduct.id) {
        productSelect.value = targetProduct.id;
        updatePreview();
      }

      cleanCheckoutQueryFromUrl();
      return;
    }

    if (query.platform && platformSelect) {
      platformSelect.value = normalizePlatform(query.platform);
      platformSelect.dispatchEvent(new Event("change"));
    }

    if (query.brand && brandSelect) {
      brandSelect.value = query.brand;
      brandSelect.dispatchEvent(new Event("change"));
    }

    if (query.duration && productSelect) {
      const matchedProduct = allProducts.find(
        (item) =>
          normalizeCheckoutValue(item.game) ===
          normalizeCheckoutValue(targetGame) &&
          (!query.platform ||
            normalizeCheckoutValue(getProductPlatform(item)) ===
            normalizeCheckoutValue(normalizePlatform(query.platform))) &&
          (!query.brand ||
            normalizeCheckoutValue(item.brand) ===
            normalizeCheckoutValue(query.brand)) &&
          normalizeCheckoutValue(item.duration) ===
          normalizeCheckoutValue(query.duration),
      );

      if (matchedProduct) {
        productSelect.value = matchedProduct.id;
        updatePreview();
      }
    }

    cleanCheckoutQueryFromUrl();
  }, 250);
}

function renderGameCardThumb(game) {
  const imageUrl = getGameImage(game);
  const initials = getGameInitials(game);
  const id = normalizeImageId(game);
  return `
    <div class="game-card-thumb">
      <div class="game-card-thumb-fallback" data-game-key="${escapeHtml(id)}">
        <span>${escapeHtml(initials)}</span>
      </div>
      <img
        loading="lazy"
        decoding="async"
        src="${escapeHtml(imageUrl)}"
        alt="${escapeHtml(game)}"
        onerror="this.style.display='none'; this.previousElementSibling?.classList.add('show');"
        onload="this.previousElementSibling?.classList.remove('show');"
      >
      <div class="game-card-thumb-overlay">
        <strong>${escapeHtml(game)}</strong>
      </div>
    </div>
  `;
}

function updateCatalogMeta() {
  const uniqueGames = [...new Set(allProducts.map((item) => item.game))];
  const totalStock = allProducts.reduce(
    (total, item) => total + Number(item.available_keys || 0),
    0,
  );

  const gameCount = document.getElementById("catalogGameCount");
  const stockCount = document.getElementById("catalogStockCount");
  if (gameCount) gameCount.textContent = String(uniqueGames.length);
  if (stockCount) stockCount.textContent = totalStock.toLocaleString("id-ID");

  document.querySelectorAll(".pill-count").forEach((node) => {
    const target = node.getAttribute("data-count-for");
    if (!target) return;
    const count = getCategoryGames(target).length;
    node.textContent = count > 0 ? String(count) : "";
    node.classList.toggle("has-count", count > 0);
  });
}

function renderRecentViewed() {
  const rail = document.getElementById("recentViewedRail");
  const track = document.getElementById("recentViewedTrack");
  if (!rail || !track) return;

  const available = recentGames.filter((game) =>
    allProducts.some((item) => item.game === game),
  );

  if (available.length === 0) {
    rail.hidden = true;
    track.innerHTML = "";
    return;
  }

  rail.hidden = false;
  track.innerHTML = available
    .map(
      (game) => `
      <button
        type="button"
        class="recent-viewed-card"
        data-recent-game="${escapeHtml(game)}"
      >
        ${renderGameCardThumb(game)}
      </button>
    `,
    )
    .join("");

  track.querySelectorAll("[data-recent-game]").forEach((node) => {
    node.addEventListener("click", () => {
      const game = node.getAttribute("data-recent-game");
      if (game) openOrderModal(game);
    });
  });
}

function renderEmptyCatalog() {
  const t = translations[currentLanguage];
  const isFavoritesView = currentCategory === "Favorites";

  const emptyTitle = isFavoritesView
    ? t.emptyFavoritesTitle
    : currentLanguage === "en"
      ? "No products in this category yet"
      : "Belum ada produk di kategori ini";

  const emptyDesc = isFavoritesView
    ? t.emptyFavoritesDesc
    : currentLanguage === "en"
      ? "Try another category or contact admin for product availability."
      : "Coba kategori lain atau hubungi admin untuk cek ketersediaan produk.";

  const cta = isFavoritesView
    ? `<button type="button" class="empty-cta-btn" onclick="resetCatalogFilters()">${escapeHtml(t.resetFilterBtn)}</button>`
    : `<a href="https://t.me/aegamestore" target="_blank" rel="noopener noreferrer">Chat Admin</a>`;

  gameGrid.innerHTML = `
    <div class="empty-category-card">
      <div class="empty-category-icon">${isFavoritesView ? "\u2764\ufe0f" : "\ud83c\udf0a"}</div>
      <h3>${escapeHtml(emptyTitle)}</h3>
      <p>${escapeHtml(emptyDesc)}</p>
      ${cta}
    </div>
  `;
}

function renderGames() {
  if (!gameGrid) return;
  gameGrid.innerHTML = "";
  updateCatalogMeta();
  renderRecentViewed();

  const visibleGames = getVisibleGames();

  if (visibleGames.length === 0) {
    renderEmptyCatalog();
    return;
  }

  const t = translations[currentLanguage];

  visibleGames.forEach((game) => {
  const card = document.createElement("div");

  const totalStock = getGameStock(game);
  const minPrice = getGameMinPrice(game);
  const stockReady = totalStock > 0;
  const stockLabel = stockReady
    ? `${totalStock.toLocaleString("id-ID")} ${t.catalogStockReady}`
    : t.outOfStockLabel;

  const badgeKey = stockReady ? getGameBadgeKey(game) : "";
  const badgeLabel = badgeKey ? t[badgeKey] : "";
  const categoryLabel = getGameCategoryLabel(game);
  const brandCount = getGameBrandCount(game);
  const playSummary = getGamePlayStatusSummary(game);
  const fav = isFavorite(game);

  card.className = `game-card game-card-status-${playSummary.value}`;
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", `${game} — ${t.cardChooseProduct}`);
  card.setAttribute("data-game", game);

    card.innerHTML = `
      ${renderGameCardThumb(game)}
      <div class="game-card-top">
        <span class="game-card-chip">${escapeHtml(categoryLabel)}</span>
        ${badgeKey
        ? `<span class="game-card-ribbon ribbon-${badgeKey}">${escapeHtml(badgeLabel)}</span>`
        : ""
      }
      </div>
      <button
        type="button"
        class="game-card-fav ${fav ? "is-active" : ""}"
        aria-pressed="${fav ? "true" : "false"}"
        aria-label="${escapeHtml(fav ? t.cardFavoriteRemove : t.cardFavoriteAdd)}"
      >
        <span aria-hidden="true">
          <iconify-icon icon="${fav ? "ph:heart-fill" : "ph:heart-bold"}"></iconify-icon>
        </span>
      </button>
      <div class="game-card-body">
  <div class="game-card-status-row">
    <span class="game-status-badge game-status-${playSummary.value}">
      ${escapeHtml(playSummary.label)}
    </span>
    <span class="game-card-brand-count">
      ${brandCount} ${brandCount > 1 ? "Brands" : "Brand"}
    </span>
  </div>

  <span class="game-card-title">${escapeHtml(game)}</span>

  <div class="game-card-meta">
    <span class="game-card-price">
      ${minPrice > 0
        ? `<small>${escapeHtml(t.cardFromPrice)}</small><b>${formatRupiah(minPrice)}</b>`
        : `<b>${escapeHtml(stockReady ? "—" : t.outOfStockLabel)}</b>`
      }
    </span>
    <span class="game-card-stock ${stockReady ? "ready" : "empty"}">
      <span class="game-card-stock-dot" aria-hidden="true"></span>
      ${escapeHtml(stockLabel)}
    </span>
  </div>

  <span class="game-card-cta">
    ${escapeHtml(t.cardChooseProduct)} →
  </span>
</div>
    `;

    if (game === selectedGame) {
      card.classList.add("active");
    }

    if (!stockReady) {
      card.classList.add("is-out-of-stock");
    }

    const favButton = card.querySelector(".game-card-fav");
    if (favButton) {
      favButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const nowFavorite = toggleFavorite(game);
        showToast(
          nowFavorite
            ? translations[currentLanguage].toastFavoriteAdded
            : translations[currentLanguage].toastFavoriteRemoved,
          { icon: nowFavorite ? "\u2764\ufe0f" : "\ud83d\udc94" },
        );
        renderGames();
      });
    }

    card.addEventListener("click", async () => {
      card.style.pointerEvents = "none";
      try {
        await openOrderModal(game);
      } finally {
        card.style.pointerEvents = "auto";
      }
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      card.click();
    });

    gameGrid.appendChild(card);
  });
}

function resetCatalogFilters() {
  currentCategory = "all";
  document.querySelectorAll(".filter-pills .pill").forEach((pill) => {
    const isActive = pill.getAttribute("data-category") === "all";
    pill.classList.toggle("active", isActive);
    pill.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  const search = document.getElementById("gameSearch");
  if (search) search.value = "";
  renderGames();
  showToast(translations[currentLanguage].toastFiltersReset, {
    icon: "\ud83d\udd04",
  });
}
window.resetCatalogFilters = resetCatalogFilters;

function updateOrderModalBanner(game) {
  const banner = document.getElementById("modalGameBanner");
  const bannerImg = document.getElementById("modalGameBannerImg");
  const bannerTitle = document.getElementById("modalGameBannerTitle");

  if (!banner || !game) return;

  const gameName = String(game || "").trim();
  const imageUrl =
    typeof getGameImage === "function" ? getGameImage(gameName) : "";

  banner.hidden = false;
  banner.classList.toggle("has-image", Boolean(imageUrl));

  if (bannerTitle) {
    bannerTitle.textContent = gameName || "Pilih Game";
  }

  if (bannerImg) {
    bannerImg.alt = gameName ? `${gameName} cover` : "Game cover";

    if (imageUrl) {
      bannerImg.src = imageUrl;
      bannerImg.style.display = "";
    } else {
      bannerImg.removeAttribute("src");
      bannerImg.style.display = "none";
    }
  }
}

async function openOrderModal(game) {
  document.getElementById("checkoutStickyBar")?.classList.remove("is-visible");
  selectedOrderQuantity = 1;
  selectedCheckoutPaymentMethod = "midtrans";
  updateOrderQuantityUI(null);
  const voucherInput = document.getElementById("voucherCodeInput");
  if (voucherInput) voucherInput.value = "";
  const voucherPanel = document.getElementById("voucherPanel");
  if (voucherPanel) {
    voucherPanel.open = window.matchMedia("(max-width: 640px)").matches;
  }

  const nameInput = document.getElementById("name");
  const contactInput = document.getElementById("contact");

  resetVoucherPreview();

  try {
    const res = await fetch("/api/user/me");
    const data = await res.json();

    if (!data.loggedIn) {
      Swal.fire({
        icon: "warning",
        title: "Login Dulu",
        text: "Kamu harus login dulu sebelum order.",
        confirmButtonColor: "#0a0a0a",
        confirmButtonText: "Login Sekarang",
      }).then(() => {
        window.location.href = "/auth";
      });
      return;
    }

    if (nameInput) {
      nameInput.value = data.username || "";
      nameInput.readOnly = true;
    }

    if (contactInput && data.contact && !contactInput.value.trim()) {
      contactInput.value = data.contact;
    }
    checkoutWalletBalance = Number(data.wallet?.balance || 0);
    const walletBalance = document.getElementById("checkoutWalletBalance");
    if (walletBalance) walletBalance.innerText = `Saldo: ${formatRupiah(checkoutWalletBalance)}`;
    document.querySelectorAll(".checkout-payment-option").forEach((btn) => btn.classList.toggle("active", btn.dataset.paymentMethod === "midtrans"));
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Gagal Cek Login",
      text: "Coba refresh halaman lalu login ulang.",
      confirmButtonColor: "#ffe135",
    });
    return;
  }

  selectedGame = game;
  updateOrderModalBanner(game);
  pushRecentGame(game);
  renderGames();
  loadPlatforms();
  setOrderStep(1);

  const modal = document.getElementById("orderModal");
  const title = document.getElementById("modalGameTitle");

  if (title) {
    title.innerText = game;
  }

  if (modal) {
    modal.classList.add("show");
    document.body.classList.add("order-modal-open");
    document.body.style.overflow = "hidden";
  }

  setTimeout(() => {
    const card = modal?.querySelector(".order-modal-card");
    if (card) {
      card.scrollTop = 0;
      updateCheckoutStickyVisibility();
    }
  }, 80);
}

function updateCheckoutStickyVisibility() {
  const card = document.querySelector("#orderModal .order-modal-card");
  const quantity = document.querySelector(".bulk-quantity-field");
  const bar = document.getElementById("checkoutStickyBar");
  if (!card || !quantity || !bar) return;

  const revealAt = quantity.offsetTop + quantity.offsetHeight - 16;
  bar.classList.toggle("is-visible", card.scrollTop >= revealAt);
}

function setOrderStep(step) {
  const steps = document.querySelectorAll("#orderSteps .order-step");
  if (!steps.length) return;
  steps.forEach((node, index) => {
    const stepNumber = index + 1;
    node.classList.toggle("is-active", stepNumber === step);
    node.classList.toggle("is-done", stepNumber < step);
  });
}

function updateOrderStepFromForm() {
  const name = document.getElementById("name")?.value.trim() || "";
  const productEl = document.getElementById("product");
  const hasProduct = Boolean(productEl?.value);

  if (name && hasProduct) {
    setOrderStep(3);
  } else if (hasProduct) {
    setOrderStep(2);
  } else {
    setOrderStep(1);
  }
}

function closeOrderModal() {
  const modal = document.getElementById("orderModal");

  if (modal) {
    modal.classList.remove("show");
    document.body.classList.remove("order-modal-open");
    document.body.style.overflow = "";
  }

  const voucherInput = document.getElementById("voucherCodeInput");
  if (voucherInput) voucherInput.value = "";
  const voucherPanel = document.getElementById("voucherPanel");
  if (voucherPanel) voucherPanel.open = false;

  resetVoucherPreview();
}

function renderOrderPlatformPills(platforms) {
  const wrap = document.getElementById("platformPills");
  if (!wrap) return;

  wrap.innerHTML = "";

  platforms.forEach((platform) => {
    const normalizedPlatform = normalizePlatform(platform);
    const products = allProducts.filter(
      (item) => item.game === selectedGame && getProductPlatform(item) === normalizedPlatform,
    );
    const readyCount = products.reduce(
      (sum, item) => sum + Number(item.available_keys || 0),
      0,
    );

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "order-platform-pill";
    btn.setAttribute("role", "radio");
    btn.setAttribute(
      "aria-checked",
      normalizePlatform(platformSelect?.value) === normalizedPlatform ? "true" : "false",
    );
    btn.dataset.platform = normalizedPlatform;
    btn.innerHTML = `
      <span>${getPlatformLabel(normalizedPlatform)}</span>
      <small>${readyCount} ready</small>
    `;

    if (normalizePlatform(platformSelect?.value) === normalizedPlatform) btn.classList.add("active");

    btn.addEventListener("click", () => {
      if (!platformSelect || platformSelect.value === normalizedPlatform) return;
      platformSelect.value = normalizedPlatform;
      loadBrands();
    });

    wrap.appendChild(btn);
  });
}

function syncOrderPlatformPillsActive() {
  document.querySelectorAll(".order-platform-pill").forEach((btn) => {
    const active = btn.dataset.platform === normalizePlatform(platformSelect?.value);
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-checked", active ? "true" : "false");
  });
}

function renderOrderBrandPills(brands) {
  const wrap = document.getElementById("brandPills");
  if (!wrap) return;

  wrap.innerHTML = "";

  brands.forEach((brand) => {
    const products = allProducts.filter(
      (item) =>
        item.game === selectedGame &&
        getProductPlatform(item) === normalizePlatform(platformSelect?.value) &&
        item.brand === brand,
    );
    const readyCount = products.reduce(
      (sum, item) => sum + Number(item.available_keys || 0),
      0,
    );

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "order-brand-pill";
    btn.setAttribute("role", "radio");
    btn.setAttribute(
      "aria-checked",
      brandSelect.value === brand ? "true" : "false",
    );
    btn.dataset.brand = brand;
    btn.innerHTML = `
      <span>${escapeHtml(brand)}</span>
      <small>${readyCount} ready</small>
    `;

    if (brandSelect.value === brand) btn.classList.add("active");

    btn.addEventListener("click", () => {
      if (brandSelect.value === brand) return;
      brandSelect.value = brand;
      loadDurations();
    });

    wrap.appendChild(btn);
  });
}

function syncOrderBrandPillsActive() {
  document.querySelectorAll(".order-brand-pill").forEach((btn) => {
    const active = btn.dataset.brand === brandSelect.value;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-checked", active ? "true" : "false");
  });
}

function renderOrderProductCards(products) {
  const wrap = document.getElementById("productCards");
  if (!wrap) return;

  wrap.innerHTML = "";

  products.forEach((item) => {
    const availableKeys = Number(item.available_keys || 0);
    const playMeta = getPlayStatusMeta(item.play_status);
    const isMaintenance = playMeta.value === "maintenance";
    const isOutOfStock = availableKeys <= 0;
    const isDisabled = isOutOfStock || isMaintenance;
    const deliveryType = String(item.delivery_type || "auto").toLowerCase();
    const deliveryLabel = deliveryType === "manual" ? "Manual" : "Auto";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "order-product-card";
    btn.setAttribute("role", "radio");
    btn.setAttribute(
      "aria-checked",
      String(item.id) === String(productSelect.value) ? "true" : "false",
    );
    btn.dataset.productId = String(item.id);
    btn.disabled = isDisabled;

    if (String(item.id) === String(productSelect.value))
      btn.classList.add("active");
    if (isOutOfStock) btn.classList.add("is-empty");
    if (isMaintenance) btn.classList.add("is-maintenance");
    if (playMeta.value === "risk") btn.classList.add("is-risk");
    if (playMeta.value === "safe") btn.classList.add("is-safe");

    const stockText = isMaintenance
      ? "MAINTENANCE"
      : isOutOfStock
        ? "OUT OF STOCK"
        : `${availableKeys} READY`;

    btn.innerHTML = `
      <div class="order-product-main">
        <strong>${escapeHtml(item.duration)}</strong>
        <b>${formatRupiah(item.price)}</b>
        <small>${escapeHtml(item.brand)} • ${deliveryLabel}</small>
      </div>
      <span class="order-product-status order-product-status-${playMeta.value}">
  ${playMeta.label}
</span>
<span class="order-product-stock">${stockText}</span>
    `;

    btn.addEventListener("click", () => {
      if (isMaintenance) {
        Swal.fire({
          icon: "info",
          title: "Maintenance",
          text: playMeta.text,
          confirmButtonColor: "#0a0a0a",
        });
        return;
      }

      if (isOutOfStock) return;
      productSelect.value = item.id;
      productSelect.dispatchEvent(new Event("change", { bubbles: true }));
      syncOrderProductCardsActive();
    });

    wrap.appendChild(btn);
  });
}

function syncOrderProductCardsActive() {
  document.querySelectorAll(".order-product-card").forEach((btn) => {
    const active = btn.dataset.productId === String(productSelect.value);
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-checked", active ? "true" : "false");
  });
}

function loadPlatforms() {
  if (!platformSelect) {
    loadBrands();
    return;
  }

  const platforms = [
    ...new Set(
      allProducts
        .filter((item) => item.game === selectedGame)
        .map((item) => getProductPlatform(item)),
    ),
  ].filter(Boolean);

  if (!platforms.length) platforms.push("android");

  platformSelect.innerHTML = "";

  platforms.forEach((platform) => {
    const normalizedPlatform = normalizePlatform(platform);
    const option = document.createElement("option");
    option.value = normalizedPlatform;
    option.textContent = getPlatformLabel(normalizedPlatform);
    platformSelect.appendChild(option);
  });

  if (!platforms.includes(normalizePlatform(platformSelect.value))) {
    platformSelect.value = platforms[0];
  }

  renderOrderPlatformPills(platforms);
  syncOrderPlatformPillsActive();
  loadBrands();
}

function loadBrands() {
  const currentPlatform = normalizePlatform(platformSelect?.value);
  const brands = [
    ...new Set(
      allProducts
        .filter(
          (item) =>
            item.game === selectedGame &&
            getProductPlatform(item) === currentPlatform,
        )
        .map((item) => item.brand),
    ),
  ];

  brandSelect.innerHTML = "";

  brands.forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandSelect.appendChild(option);
  });

  renderOrderBrandPills(brands);
  syncOrderPlatformPillsActive();
  syncOrderBrandPillsActive();
  loadDurations();
}

function loadDurations() {
  const currentPlatform = normalizePlatform(platformSelect?.value);
  const filteredProducts = allProducts.filter(
    (item) =>
      item.game === selectedGame &&
      getProductPlatform(item) === currentPlatform &&
      item.brand === brandSelect.value,
  );

  productSelect.innerHTML = "";

  filteredProducts.forEach((item) => {
    const availableKeys = Number(item.available_keys || 0);
    const playMeta = getPlayStatusMeta(item.play_status);
    const isMaintenance = playMeta.value === "maintenance";
    const isOutOfStock = availableKeys <= 0;
    const isDisabled = isOutOfStock || isMaintenance;

    const stockText = isOutOfStock
      ? translations[currentLanguage].outOfStockLabel
      : `${translations[currentLanguage].stockLabel} ${availableKeys}`;

    const option = document.createElement("option");
    option.value = item.id;
    option.disabled = isDisabled;
    option.textContent = `${item.duration} - ${formatRupiah(item.price)} - ${playMeta.label} - ${stockText}`;
    productSelect.appendChild(option);
  });

  const firstAvailable = filteredProducts.find((item) => {
    const availableKeys = Number(item.available_keys || 0);
    const playStatus = normalizePlayStatus(item.play_status);
    return availableKeys > 0 && playStatus !== "maintenance";
  });

  if (firstAvailable) {
    productSelect.value = firstAvailable.id;
  } else if (filteredProducts[0]) {
    productSelect.value = filteredProducts[0].id;
  }

  syncOrderBrandPillsActive();
  renderOrderProductCards(filteredProducts);
  syncOrderProductCardsActive();
  updatePreview();
}

function getOrderQuantityLimit(product) {
  if (!product) return 1;
  if (String(product.delivery_type || "auto").toLowerCase() === "manual") {
    return 1;
  }

  const availableKeys = Math.max(Math.floor(Number(product.available_keys || 0)), 0);
  return Math.max(1, Math.min(MAX_ORDER_QUANTITY, availableKeys));
}

function updateOrderQuantityUI(product) {
  const quantityOutput = document.getElementById("orderQuantity");
  const decreaseButton = document.getElementById("quantityDecrease");
  const increaseButton = document.getElementById("quantityIncrease");
  const stockHint = document.getElementById("quantityStockHint");
  const previewQuantity = document.getElementById("previewQuantity");
  const limit = getOrderQuantityLimit(product);
  const isManual = String(product?.delivery_type || "auto").toLowerCase() === "manual";

  selectedOrderQuantity = Math.max(1, Math.min(selectedOrderQuantity, limit));

  if (quantityOutput) quantityOutput.textContent = String(selectedOrderQuantity);
  if (previewQuantity) previewQuantity.textContent = `${selectedOrderQuantity} key`;
  if (decreaseButton) decreaseButton.disabled = selectedOrderQuantity <= 1;
  if (increaseButton) increaseButton.disabled = !product || selectedOrderQuantity >= limit;

  if (stockHint) {
    if (!product) {
      stockHint.textContent = "Pilih produk terlebih dahulu";
    } else if (isManual) {
      stockHint.textContent = "Produk manual hanya tersedia 1 key per order";
    } else {
      stockHint.textContent = `${selectedOrderQuantity} key dipilih | tersedia ${Number(product.available_keys || 0)}`;
    }
  }
}

function changeOrderQuantity(delta) {
  const selectedProduct = allProducts.find(
    (item) => String(item.id) === String(productSelect.value),
  );
  const nextQuantity = selectedOrderQuantity + Number(delta || 0);
  const limit = getOrderQuantityLimit(selectedProduct);
  const clampedQuantity = Math.max(1, Math.min(nextQuantity, limit));

  if (clampedQuantity === selectedOrderQuantity) return;

  selectedOrderQuantity = clampedQuantity;
  updateOrderQuantityUI(selectedProduct);
  resetVoucherPreview();
  refreshCheckoutDiscountPreview();
}

function updatePreview() {
  const selectedProduct = allProducts.find(
    (item) => String(item.id) === String(productSelect.value),
  );

  if (!selectedProduct) {
    selectedProductId = null;
    selectedProductBasePrice = 0;

    document.getElementById("previewGame").innerText =
      translations[currentLanguage].previewEmpty;
    document.getElementById("previewProduct").innerText =
      translations[currentLanguage].previewWait;
    document.getElementById("previewPrice").innerText = "Rp 0";
    updateOrderQuantityUI(null);
    resetVoucherPreview();
    return;
  }

  selectedProductId = selectedProduct.id;
  syncOrderProductCardsActive();
  selectedProductBasePrice = Number(selectedProduct.price || 0);

  const availableKeys = Number(selectedProduct.available_keys || 0);
  const playMeta = getPlayStatusMeta(selectedProduct.play_status);
  const isMaintenance = playMeta.value === "maintenance";
  const isOutOfStock = availableKeys <= 0;
  updateOrderQuantityUI(selectedProduct);
  const statusHint = document.getElementById("productStatusHint");
  if (statusHint) {
    statusHint.className = `product-status-hint product-status-${playMeta.value}`;
    statusHint.innerText = playMeta.text;
  }

  document.getElementById("previewGame").innerText = selectedProduct.game;
  document.getElementById("previewProduct").innerText =
    `${getPlatformLabel(getProductPlatform(selectedProduct))} • ${selectedProduct.brand} - ${selectedProduct.duration}`;
  showDefaultPriceBreakdown(selectedProduct.price, selectedOrderQuantity);

  buyBtn.disabled = Boolean(isOutOfStock || isMaintenance);
  buyBtn.innerText = isMaintenance
    ? "Maintenance"
    : isOutOfStock
      ? translations[currentLanguage].outOfStockLabel
      : translations[currentLanguage].buyNow;

  resetVoucherPreview();
  refreshCheckoutDiscountPreview();
}

if (platformSelect) platformSelect.addEventListener("change", loadBrands);
brandSelect.addEventListener("change", loadDurations);
productSelect.addEventListener("change", updatePreview);

async function buy() {
  const name = document.getElementById("name").value.trim();
  const contact = "Telegram Admin";

  const selectedProduct = allProducts.find(
    (item) => String(item.id) === String(productSelect.value),
  );

  if (!name) {
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Nama player belum terisi.",
      confirmButtonColor: "#0a0a0a",
    });
    return;
  }
  if (!selectedProduct) {
    Swal.fire({
      icon: "info",
      title: "Pilih Produk",
      text: "Pilih game dan durasi produknya dulu.",
      confirmButtonColor: "#0a0a0a",
    });
    return;
  }

  const availableKeys = Number(selectedProduct.available_keys || 0);
  const playMeta = getPlayStatusMeta(selectedProduct.play_status);

  if (playMeta.value === "maintenance") {
    Swal.fire({
      icon: "info",
      title: "Maintenance",
      text: playMeta.text,
      confirmButtonColor: "#0a0a0a",
    });
    return;
  }

  if (availableKeys < selectedOrderQuantity) {
    closeOrderModal();
    loadAllProducts();

    Swal.fire({
      icon: "error",
      title: translations[currentLanguage].outOfStockTitle,
      text: `Stok tidak cukup untuk ${selectedOrderQuantity} key. Silakan kurangi jumlah atau pilih produk lain.`,
      confirmButtonColor: "#ffe135",
    });

    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-csrf-token": getCookie("user_csrf"),
      },
      body: JSON.stringify({
        product_id: selectedProduct.id,
        name,
        contact,
        quantity: selectedOrderQuantity,
        voucher_code:
          appliedVoucherCode ||
          document.getElementById("voucherCodeInput")?.value ||
          "",
        payment_method: selectedCheckoutPaymentMethod,
      }),
    });

    const data = await res.json();
    if (res.status === 401) {
      Swal.fire({
        icon: "warning",
        title: "Login Dulu",
        text: data.message || "Kamu harus login dulu sebelum order",
        confirmButtonColor: "#0a0a0a",
      }).then(() => {
        window.location.href = data.redirectUrl || "/auth";
      });
      return;
    }

    if (
      data.snapToken &&
      window.AEPaymentModal &&
      typeof window.AEPaymentModal.open === "function"
    ) {
      const finalPriceText =
        document.getElementById("finalPriceText")?.innerText || "";
      const totalPrice = Number(
        String(finalPriceText).replace(/[^0-9]/g, "") ||
        selectedProductBasePrice ||
        0,
      );
      const gameNameForModal =
        document.getElementById("previewGame")?.innerText ||
        selectedProduct?.game ||
        "";
      const productNameForModal =
        document.getElementById("previewProduct")?.innerText ||
        `${selectedProduct?.brand || ""} - ${selectedProduct?.duration || ""}`.trim();
      const bulkProductName = selectedOrderQuantity > 1
        ? `${productNameForModal} (${selectedOrderQuantity} key)`
        : productNameForModal;

      closeOrderModal();
      setLoading(false);

      try {
        await window.AEPaymentModal.open({
          orderId: data.orderId,
          snapToken: data.snapToken,
          clientKey: data.midtransClientKey,
          isProduction: !!data.midtransIsProduction,
          paymentUrl: data.paymentUrl,
          resultUrl: data.resultUrl,
          gameName: gameNameForModal,
          productName: bulkProductName,
          totalPrice: totalPrice,
        });
      } catch (snapErr) {
        console.error("[AEPay] Modal open error:", snapErr);
        // Show explicit error with manual fallback (NO auto-redirect)
        Swal.fire({
          icon: "error",
          title: "Popup gagal terbuka",
          html:
            "Detail error: <code>" +
            String(snapErr?.message || snapErr || "Unknown") +
            "</code><br><br>Buka pembayaran di tab Midtrans?",
          showCancelButton: true,
          confirmButtonColor: "#0a0a0a",
          cancelButtonColor: "#fafaf5",
          confirmButtonText: "Buka di Midtrans",
          cancelButtonText: "Batal",
        }).then((res) => {
          if (res.isConfirmed && data.paymentUrl) {
            window.location.href = data.paymentUrl;
          }
        });
      }
      return;
    }

    if (data.paidWithBalance) {
      closeOrderModal();
      setLoading(false);
      await Swal.fire({ icon: "success", title: "Pembayaran berhasil", text: "Saldo AE Credit sudah terpakai. Order kamu sedang diproses.", confirmButtonColor: "#0a0a0a" });
      window.location.href = data.resultUrl || `/result?order_id=${encodeURIComponent(data.orderId || "")}`;
      return;
    }

    if (!data.snapToken) {
      console.warn(
        "[AEPay] /create-order did not return snapToken; using legacy redirect. Update server.js to expose snapToken.",
      );
    }
    if (data.snapToken && !window.AEPaymentModal) {
      console.warn(
        "[AEPay] snapToken received but window.AEPaymentModal missing. Likely stale script.js cache. Hard reload or unregister SW.",
      );
    }

    if (data.paymentUrl) {
      window.location.href = data.paymentUrl;
      return;
    }

    if (data.resultUrl) {
      window.location.href = data.resultUrl;
      return;
    }

    const errorMessage = data.message || "Gagal membuat pembayaran";
    const normalizedError = errorMessage.toLowerCase();
    const isOutOfStock =
      normalizedError.includes("stok key habis") ||
      normalizedError.includes("stok tidak cukup") ||
      normalizedError.includes("stok supplier tidak cukup");

    if (isOutOfStock) {
      closeOrderModal();
      loadAllProducts();

      Swal.fire({
        icon: "error",
        title: translations[currentLanguage].outOfStockTitle,
        text: errorMessage,
        confirmButtonColor: "#ffe135",
      });

      return;
    }

    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: errorMessage,
      confirmButtonColor: "#ffe135",
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Terjadi error server",
      confirmButtonColor: "#ffe135",
    });
  }

  setLoading(false);
}
// --- FITUR USER LOGIN STATUS ---
async function checkLoginStatus() {
  try {
    const res = await fetch("/api/user/me");
    const data = await res.json();
    const userMenu = document.getElementById("userMenu");

    // Kalau user sudah login dan elemen userMenu ditemukan
    if (data.loggedIn && userMenu) {
      const accountLabel = currentLanguage === "en" ? "Account" : "Akun";
      const logoutLabel = currentLanguage === "en" ? "Logout" : "Keluar";
      userMenu.innerHTML = `
    <div class="user-menu">
      <span class="user-greeting">
        <span aria-hidden="true">M</span>
        <strong>${escapeHtml(data.username || "")}</strong>
      </span>
      <a href="/account.html" class="user-action-btn">
        <iconify-icon class="account-orbit-icon" icon="mdi:account-circle-outline" aria-hidden="true"></iconify-icon>
        <span>${escapeHtml(accountLabel)}</span>
      </a>
      <button type="button" onclick="logoutUser()" class="user-action-btn user-action-danger">
        <iconify-icon icon="mdi:logout" aria-hidden="true"></iconify-icon>
        <span>${escapeHtml(logoutLabel)}</span>
      </button>
    </div>
`;
    }
  } catch (err) {
    console.error("Gagal mengecek status login");
  }
}

async function logoutUser() {
  Swal.fire({
    title: "Keluar Akun?",
    text: "Kamu akan keluar dari sesi ini.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#ffe135",
    cancelButtonColor: "#fafaf5",
    confirmButtonText: "Ya, Keluar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await fetch("/user-logout", {
        method: "POST",
        headers: {
          "x-user-csrf-token": getCookie("user_csrf"),
        },
      });
      window.location.reload(); // Refresh halaman agar kembali jadi tombol Masuk
    }
  });
}

// Jalankan fungsi saat halaman beranda pertama kali dibuka
document.addEventListener("DOMContentLoaded", () => {
  setLanguage(currentLanguage);
  checkLoginStatus();
});
// --------------------------------

// --- AUTO SLIDER BANNER (with prev/next + dots) ---
let currentSlide = 0;
let promoTimer = null;

function goToSlide(index) {
  const slides = document.querySelectorAll(".promo-slide");
  if (slides.length === 0) return;
  slides[currentSlide]?.classList.remove("active");
  currentSlide = ((index % slides.length) + slides.length) % slides.length;
  slides[currentSlide]?.classList.add("active");
  updatePromoDots();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

function updatePromoDots() {
  document.querySelectorAll("#promoDots .promo-dot").forEach((dot, idx) => {
    dot.classList.toggle("active", idx === currentSlide);
    dot.setAttribute("aria-selected", idx === currentSlide ? "true" : "false");
  });
}

function renderPromoDots() {
  const dotsBox = document.getElementById("promoDots");
  const slides = document.querySelectorAll(".promo-slide");
  if (!dotsBox || slides.length === 0) return;
  dotsBox.innerHTML = "";
  slides.forEach((_, idx) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "promo-dot" + (idx === currentSlide ? " active" : "");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Promo ${idx + 1}`);
    dot.setAttribute("aria-selected", idx === currentSlide ? "true" : "false");
    dot.addEventListener("click", () => {
      goToSlide(idx);
      restartPromoAutoplay();
    });
    dotsBox.appendChild(dot);
  });
}

function restartPromoAutoplay() {
  if (promoTimer) clearInterval(promoTimer);
  promoTimer = setInterval(nextSlide, 5500);
}

document.addEventListener("DOMContentLoaded", () => {
  renderPromoDots();
  restartPromoAutoplay();
  document.getElementById("promoPrevBtn")?.addEventListener("click", () => {
    prevSlide();
    restartPromoAutoplay();
  });
  document.getElementById("promoNextBtn")?.addEventListener("click", () => {
    nextSlide();
    restartPromoAutoplay();
  });
  const slider = document.getElementById("promoSlider");
  if (slider) {
    slider.addEventListener("mouseenter", () => {
      if (promoTimer) clearInterval(promoTimer);
    });
    slider.addEventListener("mouseleave", restartPromoAutoplay);
  }
});

// --- SOCIAL PROOF SIMULATOR ---
let recentPurchases = [];

async function loadRecentPurchases() {
  try {
    const res = await fetch("/recent-purchases");
    const data = await res.json();

    if (Array.isArray(data)) {
      recentPurchases = data;
    }
  } catch (err) {
    recentPurchases = [];
  }
}

function showSocialProof() {
  const sp = document.getElementById("social-proof");
  if (!sp) return;

  if (!Array.isArray(recentPurchases) || recentPurchases.length === 0) {
    return;
  }

  const item =
    recentPurchases[Math.floor(Math.random() * recentPurchases.length)];

  const socialText =
    currentLanguage === "en"
      ? `<b>${item.name}</b> just bought <b>${item.game}</b>`
      : `<b>${item.name}</b> baru saja membeli <b>${item.game}</b>`;

  sp.innerHTML = `
  Go
  <div style="font-size: 13px;">
    ${socialText}
  </div>
`;

  sp.classList.add("show");

  setTimeout(() => sp.classList.remove("show"), 5000);
}

function showPrivacyPolicy() {
  const t = translations[currentLanguage];

  Swal.fire({
    title: t.privacyTitle,
    text: t.privacyContent,
    icon: "info",
    confirmButtonText: t.policyOk,
    confirmButtonColor: "#0a0a0a",
    customClass: { popup: "ae-policy-popup" },
  });
}

function showTermsPolicy() {
  const t = translations[currentLanguage];

  Swal.fire({
    title: t.termsTitle,
    text: t.termsContent,
    icon: "info",
    confirmButtonText: t.policyOk,
    confirmButtonColor: "#0a0a0a",
    customClass: { popup: "ae-policy-popup" },
  });
}

const footerPaymentDetails = {
  QRIS: {
    icon: "mdi:qrcode-scan",
    id: "Scan satu kode QR dari aplikasi bank atau e-wallet yang mendukung QRIS.",
    en: "Scan one QR code from any supported banking or e-wallet app.",
  },
  GoPay: {
    icon: "mdi:wallet",
    id: "Bayar langsung menggunakan saldo atau metode pembayaran di aplikasi GoPay.",
    en: "Pay directly with your balance or payment method in the GoPay app.",
  },
  OVO: {
    icon: "mdi:credit-card-outline",
    id: "Selesaikan pembayaran dengan saldo OVO melalui halaman pembayaran aman.",
    en: "Complete payment with your OVO balance through the secure payment page.",
  },
  DANA: {
    icon: "mdi:cash-fast",
    id: "Gunakan saldo DANA untuk pembayaran cepat melalui gateway resmi.",
    en: "Use your DANA balance for a fast payment through the official gateway.",
  },
  ShopeePay: {
    icon: "mdi:shopping-outline",
    id: "Bayar memakai saldo ShopeePay melalui alur pembayaran yang terenkripsi.",
    en: "Pay with your ShopeePay balance through the encrypted checkout flow.",
  },
};

function showPaymentMethodInfo(method) {
  const detail = footerPaymentDetails[method];
  if (!detail) return;

  Swal.fire({
    html: `
      <div class="ae-payment-info">
        <span class="ae-payment-info-icon" aria-hidden="true">
          <iconify-icon icon="${detail.icon}"></iconify-icon>
        </span>
        <small>SECURE PAYMENT</small>
        <h3>${method}</h3>
        <p>${detail[currentLanguage] || detail.id}</p>
      </div>
    `,
    confirmButtonText: currentLanguage === "en" ? "Got it" : "Mengerti",
    showCloseButton: true,
    customClass: {
      popup: "ae-payment-info-popup",
      htmlContainer: "ae-payment-info-content",
      confirmButton: "ae-payment-info-confirm",
    },
  });
}

document.querySelector(".footer-payments")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-payment-info]");
  if (button) showPaymentMethodInfo(button.dataset.paymentInfo);
});

loadRecentPurchases();
setInterval(loadRecentPurchases, 60000);
if (window.innerWidth > 768) {
  setInterval(showSocialProof, 20000);
}

// --- FILTER CATEGORY ---
function filterCategory(cat, btnElement) {
  currentCategory = cat || "all";

  document
    .querySelectorAll(".filter-pills .pill")
    .forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });

  if (btnElement) {
    btnElement.classList.add("active");
    btnElement.setAttribute("aria-selected", "true");
  } else {
    document
      .querySelectorAll(
        `.filter-pills .pill[data-category="${currentCategory}"]`,
      )
      .forEach((btn) => {
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
      });
  }

  renderGames();
}

function formatRupiah(value) {
  return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

function calculateQrisGrossPrice(netPrice) {
  const qrisFeeRate = 0.007;
  const ppnRate = 0.11;
  const totalFeeRate = qrisFeeRate * (1 + ppnRate);

  return Math.ceil(Number(netPrice || 0) / (1 - totalFeeRate));
}

function showPriceBreakdown({
  originalPrice = 0,
  discountAmount = 0,
  paymentFee = 0,
  finalPrice = 0,
}) {
  const netPrice = Math.max(0, Number(finalPrice || 0) - Number(paymentFee || 0));
  lastCheckoutPricing = { originalPrice, discountAmount, paymentFee, finalPrice, netPrice };
  if (selectedCheckoutPaymentMethod === "ae_credit") {
    paymentFee = 0;
    finalPrice = netPrice;
  }
  const priceBreakdown = document.getElementById("priceBreakdown");
  const originalPriceText = document.getElementById("originalPriceText");
  const discountText = document.getElementById("discountText");
  const paymentFeeText = document.getElementById("paymentFeeText");
  const finalPriceText = document.getElementById("finalPriceText");
  const stickyFinalPrice = document.getElementById("stickyFinalPrice");
  const previewPrice = document.getElementById("previewPrice");

  if (!priceBreakdown) return;

  if (originalPriceText)
    originalPriceText.innerText = formatRupiah(originalPrice);
  if (discountText)
    discountText.innerText = "- " + formatRupiah(discountAmount);
  if (paymentFeeText) paymentFeeText.innerText = formatRupiah(paymentFee);
  if (finalPriceText) finalPriceText.innerText = formatRupiah(finalPrice);
  if (stickyFinalPrice) stickyFinalPrice.innerText = formatRupiah(finalPrice);
  if (previewPrice) previewPrice.innerText = formatRupiah(finalPrice);

  priceBreakdown.style.display = "block";
}

function selectCheckoutPaymentMethod(method, button) {
  selectedCheckoutPaymentMethod = method === "ae_credit" ? "ae_credit" : "midtrans";
  document.querySelectorAll(".checkout-payment-option").forEach((item) => item.classList.toggle("active", item === button || item.dataset.paymentMethod === selectedCheckoutPaymentMethod));
  if (lastCheckoutPricing) {
    showPriceBreakdown(lastCheckoutPricing);
  } else if (selectedProductBasePrice > 0) {
    showDefaultPriceBreakdown(selectedProductBasePrice, selectedOrderQuantity);
  }
}

function showDefaultPriceBreakdown(productPrice, quantity = selectedOrderQuantity) {
  const cleanQuantity = Math.max(1, Math.min(Number(quantity || 1), MAX_ORDER_QUANTITY));
  const originalPrice = Number(productPrice || 0) * cleanQuantity;
  const netPrice = Math.max(originalPrice, 1000 * cleanQuantity);
  const finalPrice = calculateQrisGrossPrice(netPrice);
  const paymentFee = finalPrice - netPrice;

  showPriceBreakdown({
    originalPrice,
    discountAmount: 0,
    paymentFee,
    finalPrice,
  });
}

function getCheckoutDiscountMessage(data) {
  if (data?.discount_type !== "vip") {
    return data?.message || translations[currentLanguage].voucherSuccessMsg;
  }

  const quantity = Math.max(Number(data.quantity || selectedOrderQuantity || 1), 1);
  const perKeyDiscount = Number(data.discount_per_key || 0);
  const totalDiscount = Number(data.discount_amount || 0);

  if (currentLanguage === "en") {
    return `VIP discount ${formatRupiah(perKeyDiscount)}/key x ${quantity} = ${formatRupiah(totalDiscount)}`;
  }

  return `Diskon VIP ${formatRupiah(perKeyDiscount)}/key x ${quantity} = ${formatRupiah(totalDiscount)}`;
}

async function refreshCheckoutDiscountPreview() {
  if (!selectedProductId) return;

  const voucherInput = document.getElementById("voucherCodeInput");
  const voucherMessage = document.getElementById("voucherMessage");
  const voucherCode = String(voucherInput?.value || "").trim();

  try {
    const res = await fetch("/voucher-preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: selectedProductId,
        quantity: selectedOrderQuantity,
        voucher_code: voucherCode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (voucherCode && voucherMessage) {
        appliedVoucherCode = "";
        voucherMessage.innerText =
          data.message || translations[currentLanguage].invalidVoucherMsg;
        voucherMessage.className = "voucher-message error";
      }
      return;
    }

    appliedVoucherCode = data.voucher_code || "";

    showPriceBreakdown({
      originalPrice: data.original_price,
      discountAmount: data.discount_amount,
      paymentFee: data.payment_fee,
      finalPrice: data.final_price,
    });

    if (voucherMessage) {
      if (Number(data.discount_amount || 0) > 0) {
        voucherMessage.innerText = getCheckoutDiscountMessage(data);
        voucherMessage.className = "voucher-message success";
      } else {
        voucherMessage.innerText = "";
        voucherMessage.className = "voucher-message";
      }
    }
  } catch (err) { }
}

function resetVoucherPreview() {
  appliedVoucherCode = "";

  const voucherMessage = document.getElementById("voucherMessage");
  const priceBreakdown = document.getElementById("priceBreakdown");

  if (voucherMessage) {
    voucherMessage.innerText = "";
    voucherMessage.className = "voucher-message";
  }

  if (selectedProductBasePrice > 0) {
    showDefaultPriceBreakdown(selectedProductBasePrice, selectedOrderQuantity);
  } else if (priceBreakdown) {
    priceBreakdown.style.display = "none";
  }
}

async function checkVoucher() {
  const voucherInput = document.getElementById("voucherCodeInput");
  const voucherMessage = document.getElementById("voucherMessage");
  const priceBreakdown = document.getElementById("priceBreakdown");

  const voucherCode = String(voucherInput?.value || "").trim();

  if (!selectedProductId) {
    voucherMessage.innerText =
      translations[currentLanguage].selectProductFirstMsg;
    voucherMessage.className = "voucher-message error";
    return;
  }

  if (!voucherCode) {
    resetVoucherPreview();
    voucherMessage.innerText = translations[currentLanguage].emptyVoucherMsg;
    voucherMessage.className = "voucher-message error";
    return;
  }

  try {
    const res = await fetch("/voucher-preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: selectedProductId,
        quantity: selectedOrderQuantity,
        voucher_code: voucherCode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      appliedVoucherCode = "";
      resetVoucherPreview();

      voucherMessage.innerText =
        data.message || translations[currentLanguage].invalidVoucherMsg;
      voucherMessage.className = "voucher-message error";
      return;
    }

    appliedVoucherCode = data.voucher_code || "";

    showPriceBreakdown({
      originalPrice: data.original_price,
      discountAmount: data.discount_amount,
      paymentFee: data.payment_fee,
      finalPrice: data.final_price,
    });

    voucherMessage.innerText = getCheckoutDiscountMessage(data);
    voucherMessage.className = "voucher-message success";
  } catch (err) {
    appliedVoucherCode = "";
    voucherMessage.innerText =
      translations[currentLanguage].voucherCheckFailedMsg;
    voucherMessage.className = "voucher-message error";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("closeOrderModalBtn");
  const modal = document.getElementById("orderModal");
  const modalCard = modal?.querySelector(".order-modal-card");

  modalCard?.addEventListener("scroll", updateCheckoutStickyVisibility, {
    passive: true,
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeOrderModal();
    });

    closeBtn.addEventListener("touchend", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeOrderModal();
    });
  }

  document.addEventListener("click", (e) => {
    const pill = e.target.closest(".pill");

    if (!pill) return;

    filterCategory(pill.dataset.category, pill);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("show")) {
      closeOrderModal();
      resetVoucherPreview();
    }
  });
});

// --- FITUR DARK MODE ---
// Mengganti ikon Bulan ke Matahari saat diklik
function toggleTheme() {
  const body = document.body;
  const themeBtn = document.getElementById("theme-toggle");

  body.classList.toggle("dark-theme");

  if (body.classList.contains("dark-theme")) {
    localStorage.setItem("ae_theme", "dark");
    if (themeBtn) {
      themeBtn.innerHTML =
        '<iconify-icon icon="ph:sun-bold" aria-hidden="true"></iconify-icon>';
      themeBtn.setAttribute("aria-label", "Aktifkan mode terang");
    }
  } else {
    localStorage.setItem("ae_theme", "light");
    if (themeBtn) {
      themeBtn.innerHTML =
        '<iconify-icon icon="ph:moon-stars-bold" aria-hidden="true"></iconify-icon>';
      themeBtn.setAttribute("aria-label", "Aktifkan mode gelap");
    }
  }
}

// Cek tema saat halaman pertama kali dimuat
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("ae_theme");
  const themeToggleBtn = document.getElementById("theme-toggle");

  if (savedTheme === "light") {
    document.body.classList.remove("dark-theme");
  } else {
    document.body.classList.add("dark-theme");
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML =
        '<iconify-icon icon="ph:sun-bold" aria-hidden="true"></iconify-icon>';
      themeToggleBtn.setAttribute("aria-label", "Aktifkan mode terang");
    }
  }
});

// ===== SMOOTH SCROLL WITH STICKY HEADER OFFSET =====
document.addEventListener("click", (event) => {
  const anchor = event.target.closest('a[href^="#"]');

  if (!anchor) return;

  const targetId = anchor.getAttribute("href");

  if (!targetId || targetId === "#") return;

  const targetElement = document.querySelector(targetId);

  if (!targetElement) return;

  event.preventDefault();

  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.offsetHeight : 0;
  const extraGap = 14;

  const targetTop =
    targetElement.getBoundingClientRect().top +
    window.pageYOffset -
    headerHeight -
    extraGap;

  window.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });

  if (typeof closeMobileNav === "function") {
    closeMobileNav();
  }
});
// ===== TESTIMONI SCROLL HINT =====
document.addEventListener("DOMContentLoaded", () => {
  const testiContainer = document.querySelector(".testi-scroll-container");

  if (testiContainer) {
    // Tunggu 2 detik setelah halaman dimuat
    setTimeout(() => {
      // Geser 100px ke kanan secara halus
      testiContainer.scrollBy({ left: 100, behavior: "smooth" });

      // Kembalikan ke posisi awal setelah 600ms
      setTimeout(() => {
        testiContainer.scrollBy({ left: -100, behavior: "smooth" });
      }, 600);
    }, 2000);
  }
});
function getCookie(name) {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1] || ""
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderStars(rating) {
  const total = Math.max(1, Math.min(Number(rating || 0), 5));
  return "⭐".repeat(total);
}

function updateRatingPicker() {
  document.querySelectorAll("#ratingPicker button").forEach((button) => {
    const rating = Number(button.dataset.rating || 0);
    button.classList.toggle("active", rating <= selectedReviewRating);
  });
}

async function loadReviews() {
  const reviewTrack = document.getElementById("reviewTrack");
  const reviewSummary = document.getElementById("reviewSummary");

  if (!reviewTrack) return;

  try {
    const res = await fetch("/reviews", { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Gagal mengambil review: ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      reviewTrack.innerHTML = `
        <div class="testi-card">
          <div class="testi-header">
            <div class="testi-avatar">A</div>
            <div>
              <strong>AE Buyer</strong>
              <span class="testi-game">Review Buyer</span>
            </div>
            <div class="testi-rating">⭐⭐⭐⭐⭐</div>
          </div>
          <p>Jadilah buyer pertama yang kasih review setelah order berhasil.</p>
        </div>
      `;

      if (reviewSummary) {
        reviewSummary.innerHTML = `
          <strong>⭐ 0.0</strong>
          <span>Belum ada review buyer.</span>
        `;
      }

      return;
    }

    const average =
      data.reduce((total, item) => total + Number(item.rating || 0), 0) /
      data.length;

    if (reviewSummary) {
      reviewSummary.innerHTML = `
        <strong>⭐ ${average.toFixed(1)}</strong>
        <span>Dari ${data.length} review buyer.</span>
      `;
    }

    reviewTrack.innerHTML = data
      .map((item) => {
        const initial = String(item.username || "B")
          .charAt(0)
          .toUpperCase();

        return `
          <div class="testi-card">
            <div class="testi-header">
              <div class="testi-avatar">${escapeHtml(initial)}</div>
              <div>
                <strong>${escapeHtml(item.username || "Buyer")}</strong>
                <span class="testi-game">
  ${escapeHtml(item.badge?.emoji || "Done")} ${escapeHtml(item.badge?.label || "Verified Buyer")}
</span>
              </div>
              <div class="testi-rating">${renderStars(item.rating)}</div>
            </div>
            <p>${escapeHtml(item.comment || "-")}</p>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    reviewTrack.innerHTML = `
      <div class="testi-card">
        <div class="testi-header">
          <div class="testi-avatar">!</div>
          <div>
            <strong>Review</strong>
            <span class="testi-game">Gagal dimuat</span>
          </div>
          <div class="testi-rating">⭐⭐⭐⭐⭐</div>
        </div>
        <p>Review belum bisa dimuat. Coba refresh halaman.</p>
      </div>
    `;
  }
}

async function loadMyReview() {
  try {
    const res = await fetch("/reviews/me");

    if (res.status === 401) return;

    const data = await res.json();

    if (data.review) {
      selectedReviewRating = Number(data.review.rating || 5);
      const commentInput = document.getElementById("reviewComment");

      if (commentInput) {
        commentInput.value = data.review.comment || "";
      }

      updateRatingPicker();
    }
  } catch (err) { }
}

async function openReviewPopup() {
  let popupRating = selectedReviewRating || 5;
  let existingComment = "";

  try {
    const res = await fetch("/reviews/me");

    if (res.status === 401) {
      Swal.fire({
        icon: "warning",
        title: "Login dulu",
        text: "Kamu harus login dan pernah berhasil order untuk kasih review.",
        confirmButtonText: "Login Sekarang",
        confirmButtonColor: "#0a0a0a",
      }).then(() => {
        window.location.href = "/auth";
      });
      return;
    }

    const data = await res.json();

    if (data.review) {
      popupRating = Number(data.review.rating || 5);
      existingComment = data.review.comment || "";
    }
  } catch (err) { }

  const renderPopupStars = () =>
    [1, 2, 3, 4, 5]
      .map(
        (rating) => `
          <button
            type="button"
            class="${rating <= popupRating ? "active" : ""}"
            data-popup-rating="${rating}"
            aria-label="${rating} ${currentLanguage === "en" ? "stars" : "bintang"}"
            aria-pressed="${rating <= popupRating ? "true" : "false"}"
          >
            <iconify-icon aria-hidden="true" icon="mdi:star"></iconify-icon>
          </button>
        `,
      )
      .join("");

  const result = await Swal.fire({
    title: "Kasih Review ⭐",
    html: `
      <div class="review-popup-stars" id="reviewPopupStars">
        ${renderPopupStars()}
      </div>

      <label class="review-popup-label" for="reviewPopupComment">${currentLanguage === "en" ? "Your experience" : "Pengalaman kamu"}</label>
      <textarea
        id="reviewPopupComment"
        class="review-popup-textarea"
        maxlength="240"
        placeholder="Tulis pengalaman kamu belanja di AE Game Store..."
      >${escapeHtml(existingComment)}</textarea>

      <div class="review-popup-note">
        Review hanya bisa dikirim oleh akun yang sudah pernah berhasil order.
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Kirim Review",
    cancelButtonText: "Batal",
    confirmButtonColor: "#0a0a0a",
    cancelButtonColor: "#fafaf5",
    didOpen: () => {
      const starsBox = document.getElementById("reviewPopupStars");

      if (!starsBox) return;

      starsBox.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          popupRating = Number(button.dataset.popupRating || 5);

          starsBox.querySelectorAll("button").forEach((starButton) => {
            const rating = Number(starButton.dataset.popupRating || 0);
            starButton.classList.toggle("active", rating <= popupRating);
            starButton.setAttribute(
              "aria-pressed",
              rating <= popupRating ? "true" : "false",
            );
          });
        });
      });
    },
    preConfirm: () => {
      const comment =
        document.getElementById("reviewPopupComment")?.value || "";

      if (String(comment).trim().length < 8) {
        Swal.showValidationMessage("Review minimal 8 karakter.");
        return false;
      }

      return {
        rating: popupRating,
        comment,
      };
    },
  });

  if (!result.isConfirmed) return;

  selectedReviewRating = popupRating;
  await submitReview(result.value);
}

async function submitReview({ rating, comment }) {
  const cleanComment = String(comment || "").trim();

  if (cleanComment.length < 8) {
    Swal.fire({
      icon: "warning",
      title: "Komentar terlalu pendek",
      text: "Tulis review minimal 8 karakter.",
      confirmButtonColor: "#0a0a0a",
    });
    return false;
  }

  try {
    const res = await fetch("/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-csrf-token": getCookie("user_csrf"),
      },
      body: JSON.stringify({
        rating,
        comment: cleanComment,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: data.message || "Gagal menyimpan review",
        confirmButtonColor: "#ffe135",
      });
      return false;
    }

    Swal.fire({
      icon: "success",
      title: "Review Tersimpan",
      text: data.message || "Terima kasih untuk review kamu!",
      confirmButtonColor: "#0a0a0a",
    });

    return true;
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Terjadi error server saat menyimpan review.",
      confirmButtonColor: "#ffe135",
    });
    return false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadReviews();
  loadMyReview();
});

document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.getElementById("theme-toggle");
  if (document.body.classList.contains("dark-theme") && themeBtn) {
    themeBtn.innerHTML =
      '<iconify-icon icon="ph:sun-bold" aria-hidden="true"></iconify-icon>';
    themeBtn.setAttribute("aria-label", "Aktifkan mode terang");
  }
});
setLanguage(currentLanguage);
loadAllProducts();
// ===== HOMEPAGE INLINE SCRIPT CLEANUP =====

// --- MOBILE NAV TOGGLE ---
function toggleMobileNav() {
  const nav = document.getElementById("mainNav");
  const toggle = document.getElementById("navToggle");
  if (!nav || !toggle) return;
  const isOpen = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  toggle.setAttribute(
    "aria-label",
    isOpen ? "Tutup menu navigasi" : "Buka menu navigasi",
  );
}

function closeMobileNav() {
  const nav = document.getElementById("mainNav");
  const toggle = document.getElementById("navToggle");
  if (!nav || !toggle) return;
  nav.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Buka menu navigasi");
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("navToggle");
  if (toggle) {
    toggle.addEventListener("click", toggleMobileNav);
  }

  document.addEventListener("click", (event) => {
    const nav = document.getElementById("mainNav");
    const navToggle = document.getElementById("navToggle");
    if (!nav || !navToggle) return;
    if (
      nav.classList.contains("open") &&
      !nav.contains(event.target) &&
      !navToggle.contains(event.target)
    ) {
      closeMobileNav();
    }
  });
});

// --- BACK TO TOP BUTTON ---
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  let lastScrollY = window.scrollY;
  const onScroll = () => {
    const currentScrollY = window.scrollY;
    btn.classList.toggle(
      "show",
      currentScrollY > 700 && currentScrollY < lastScrollY,
    );
    lastScrollY = currentScrollY;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// --- ACTIVE NAV LINK HIGHLIGHT ---
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll('.main-nav .nav-link[href^="#"]');
  if (!links.length || !("IntersectionObserver" in window)) return;

  const sectionMap = new Map();
  links.forEach((link) => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const section = document.querySelector(id);
    if (section) sectionMap.set(section, link);
  });

  if (sectionMap.size === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = sectionMap.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
  );

  sectionMap.forEach((_, section) => observer.observe(section));
});

// --- CATALOG ENHANCEMENTS (sort, shortcuts, recent rail, modal step tracking) ---
document.addEventListener("DOMContentLoaded", () => {
  const sortSelect = document.getElementById("sortSelect");
  const sortChips = Array.from(
    document.querySelectorAll(".sort-chip[data-sort-value]"),
  );

  function syncSortControls(value = currentSort) {
    if (sortSelect) {
      sortSelect.value = value;
    }

    sortChips.forEach((chip) => {
      const isActive = chip.dataset.sortValue === value;
      chip.classList.toggle("active", isActive);
      chip.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  function applySort(value) {
    currentSort = value || "default";
    localStorage.setItem("ae_sort", currentSort);
    syncSortControls(currentSort);
    renderGames();
  }

  syncSortControls(currentSort);

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      applySort(sortSelect.value || "default");
    });
  }

  sortChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      applySort(chip.dataset.sortValue || "default");
    });
  });

  const recentClearBtn = document.getElementById("recentViewedClear");
  if (recentClearBtn) {
    recentClearBtn.addEventListener("click", () => {
      clearRecentGames();
      renderGames();
      showToast(translations[currentLanguage].toastRecentCleared, {
        icon: "\ud83e\uddf9",
      });
    });
  }

  const searchInput = document.getElementById("gameSearch");
  document.addEventListener("keydown", (event) => {
    if (!searchInput) return;
    const target = event.target;
    const tag = target?.tagName?.toLowerCase();
    const isTyping =
      tag === "input" || tag === "textarea" || target?.isContentEditable;

    if (event.key === "/" && !isTyping) {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
      return;
    }

    if (event.key === "Escape" && target === searchInput) {
      searchInput.value = "";
      searchGame();
    }
  });

  const productEl = document.getElementById("product");
  const brandEl = document.getElementById("brand");
  const nameEl = document.getElementById("name");
  [productEl, brandEl, nameEl].forEach((node) => {
    if (!node) return;
    const evt = node.tagName === "SELECT" ? "change" : "input";
    node.addEventListener(evt, updateOrderStepFromForm);
  });

  startPromoCountdown();
});

function startPromoCountdown() {
  const node = document.getElementById("promoCountdownTime");
  if (!node) return;

  let endTime = Number(localStorage.getItem("ae_promo_end") || 0);
  const now = Date.now();
  if (!endTime || endTime <= now) {
    endTime = now + 24 * 60 * 60 * 1000;
    localStorage.setItem("ae_promo_end", String(endTime));
  }

  const tick = () => {
    const diff = Math.max(0, endTime - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = (n) => String(n).padStart(2, "0");
    node.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    if (diff <= 0) {
      endTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem("ae_promo_end", String(endTime));
    }
  };

  tick();
  setInterval(tick, 1000);
}

function searchGame() {
  const input =
    document.getElementById("gameSearch")?.value.toLowerCase() || "";
  const cards = document.querySelectorAll(".game-card");
  let visibleCount = 0;

  cards.forEach((card) => {
    const gameName = (
      card.getAttribute("data-game") ||
      card.querySelector(".game-card-title")?.innerText ||
      ""
    ).toLowerCase();

    const matches = gameName.includes(input);
    card.style.display = matches ? "flex" : "none";

    if (matches) {
      visibleCount += 1;
    }
  });

  const emptyHint = document.getElementById("searchEmptyHint");

  if (emptyHint) {
    emptyHint.hidden = visibleCount !== 0 || !input;
  }
}

function createSakura() {
  const sakura = document.createElement("div");
  sakura.classList.add("sakura");

  const size = Math.random() * 10 + 5;
  sakura.style.width = size + "px";
  sakura.style.height = size + "px";
  sakura.style.left = Math.random() * 100 + "vw";
  sakura.style.animationDuration =
    Math.random() * 3 + 4 + "s, " + (Math.random() * 2 + 2) + "s";

  document.body.appendChild(sakura);

  setTimeout(() => {
    sakura.remove();
  }, 7000);
}

function showGuide() {
  const t = translations[currentLanguage];

  Swal.fire({
    title: t.guideTitle,
    html: `
      <ol class="ae-guide-list">
        ${[
          t.guideStep1,
          t.guideStep2,
          t.guideStep3,
          t.guideStep4,
          t.guideStep5,
        ]
          .map(
            (step, index) =>
              `<li><span aria-hidden="true">${index + 1}</span><p>${escapeHtml(step)}</p></li>`,
          )
          .join("")}
      </ol>
    `,
    showCloseButton: true,
    confirmButtonText: t.guideOk,
    buttonsStyling: false,
    customClass: {
      popup: "ae-guide-popup",
      title: "ae-guide-title",
      htmlContainer: "ae-guide-content",
      actions: "ae-guide-actions",
      confirmButton: "ae-guide-confirm",
    },
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 768) {
    setInterval(createSakura, 700);
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (window.__aeSwRefreshing) return;
      window.__aeSwRefreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("/service-worker.js?v=20260719-support-popup-v1", {
        updateViaCache: "none",
      })
      .then((registration) => {
        registration.update();

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  }
});

// ============================================================
// AE Game Store v2 — Batch B / D / F feature module
// All features are additive and isolated. Existing flows untouched.
// ============================================================
(function aeStoreV2Features() {
  const STORAGE_KEYS = {
    searchHistory: "ae_search_history",
    pendingCart: "ae_pending_cart",
    lastContact: "ae_last_contact",
    lastName: "ae_last_name",
    installDismissed: "ae_install_dismissed_at",
    activeGenre: "ae_active_genre",
  };

  const GAME_GENRE_MAP = [
    { match: /mobile legends|mlbb|ml/i, genre: "MOBA" },
    {
      match: /pubg|free fire|ff|cod ?mobile|codm|battleground|fortnite/i,
      genre: "BR",
    },
    { match: /valorant|csgo|cs2|apex|overwatch|fps/i, genre: "FPS" },
    {
      match: /genshin|wuthering|honkai|tower of fantasy|punishing/i,
      genre: "MMORPG",
    },
    { match: /minecraft|roblox|sandbox/i, genre: "Sandbox" },
    { match: /clash|brawl|stumble|coin master|casual/i, genre: "Casual" },
    { match: /sims|sim ?city|simulation/i, genre: "Simulation" },
    {
      match: /yu-?gi-?oh|hearthstone|magic the gathering|card/i,
      genre: "CardGame",
    },
    { match: /gbox|g ?box|tools|tool|key|premium/i, genre: "Tools" },
  ];

  const GENRE_LIST = [
    { key: "all", labelKey: "genreAll" },
    { key: "MOBA", labelKey: "genreMOBA" },
    { key: "BR", labelKey: "genreBR" },
    { key: "FPS", labelKey: "genreFPS" },
    { key: "MMORPG", labelKey: "genreMMORPG" },
    { key: "Sandbox", labelKey: "genreSandbox" },
    { key: "Casual", labelKey: "genreCasual" },
    { key: "Simulation", labelKey: "genreSimulation" },
    { key: "CardGame", labelKey: "genreCardGame" },
    { key: "Tools", labelKey: "genreTools" },
  ];

  const state = {
    publicVouchers: [],
    trendingGames: [],
    lastOrders: [],
    activeGenre: localStorage.getItem(STORAGE_KEYS.activeGenre) || "all",
    pendingCart: null,
    deferredInstallPrompt: null,
    pullToRefresh: { startY: 0, dy: 0, active: false, refreshing: false },
  };

  function safeT(key, fallback) {
    try {
      return translations[currentLanguage]?.[key] || fallback || key;
    } catch (err) {
      return fallback || key;
    }
  }

  function safeEscape(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function vibrate(pattern) {
    if (window.matchMedia && window.matchMedia("(max-width: 640px)").matches) {
      try {
        if (navigator.vibrate) navigator.vibrate(pattern);
      } catch (err) { }
    }
  }

  function getGenreForGame(gameName) {
    const name = String(gameName || "");
    for (const rule of GAME_GENRE_MAP) {
      if (rule.match.test(name)) return rule.genre;
    }
    return "";
  }

  function getActiveGenre() {
    return state.activeGenre || "all";
  }

  function setActiveGenre(genre) {
    state.activeGenre = genre || "all";
    localStorage.setItem(STORAGE_KEYS.activeGenre, state.activeGenre);
    document.querySelectorAll(".genre-pill").forEach((pill) => {
      pill.classList.toggle(
        "is-active",
        pill.getAttribute("data-genre") === state.activeGenre,
      );
    });
    if (typeof renderGames === "function") renderGames();
  }

  // ------------------------------------------------------------
  // Genre filter: hook into getCategoryGames to also filter by genre
  // ------------------------------------------------------------
  function applyGenreFilter() {
    if (typeof window.getCategoryGames !== "function") return;
    const original = window.getCategoryGames;
    window.getCategoryGames = function (category) {
      const base = original(category);
      const genre = getActiveGenre();
      if (genre === "all") return base;
      return base.filter((game) => getGenreForGame(game) === genre);
    };
  }

  function renderGenrePills() {
    const container = document.getElementById("genrePills");
    if (!container) return;
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      container.hidden = true;
      return;
    }

    const presentGenres = new Set(["all"]);
    allProducts.forEach((p) => {
      const g = getGenreForGame(p.game);
      if (g) presentGenres.add(g);
    });

    const items = GENRE_LIST.filter((g) => presentGenres.has(g.key));
    if (items.length <= 2) {
      container.hidden = true;
      return;
    }

    container.hidden = false;
    container.innerHTML = items
      .map((g) => {
        const isActive = g.key === getActiveGenre();
        const label = safeT(g.labelKey, g.key);
        return `<button type="button" class="genre-pill ${isActive ? "is-active" : ""}" data-genre="${safeEscape(g.key)}" role="tab" aria-selected="${isActive ? "true" : "false"}">${safeEscape(label)}</button>`;
      })
      .join("");

    container.querySelectorAll(".genre-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        vibrate(8);
        setActiveGenre(pill.getAttribute("data-genre"));
      });
    });
  }

  // ------------------------------------------------------------
  // D1: Trending strip
  // ------------------------------------------------------------
  async function loadTrending() {
    try {
      const res = await fetch("/trending-products");
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      state.trendingGames = data;
      renderTrending();
    } catch (err) { }
  }

  function renderTrending() {
    const rail = document.getElementById("trendingRail");
    const track = document.getElementById("trendingRailTrack");
    if (!rail || !track) return;

    const knownGames = new Set(
      Array.isArray(allProducts) ? allProducts.map((p) => p.game) : [],
    );
    const items = state.trendingGames
      .map((row) => row.game)
      .filter((g) => knownGames.has(g))
      .slice(0, 8);

    if (items.length === 0) {
      rail.hidden = true;
      return;
    }

    rail.hidden = false;
    track.innerHTML = items
      .map((game, idx) => {
        const initials =
          typeof getGameInitials === "function" ? getGameInitials(game) : "AE";
        const stock =
          typeof getGameStock === "function" ? getGameStock(game) : 0;
        const minPrice =
          typeof getGameMinPrice === "function" ? getGameMinPrice(game) : 0;
        const rankBadge =
          idx < 3
            ? `<span class="trending-rank trending-rank-${idx + 1}">#${idx + 1}</span>`
            : "";
        return `
          <button type="button" class="trending-card" data-game="${safeEscape(game)}">
            ${rankBadge}
            <div class="trending-card-thumb">${safeEscape(initials)}</div>
            <div class="trending-card-info">
              <strong>${safeEscape(game)}</strong>
              <small>${stock > 0 ? (typeof formatRupiah === "function" ? formatRupiah(minPrice) : "Rp " + minPrice) : safeT("outOfStockLabel", "Habis")}</small>
            </div>
          </button>
        `;
      })
      .join("");

    track.querySelectorAll(".trending-card").forEach((card) => {
      card.addEventListener("click", () => {
        const game = card.getAttribute("data-game");
        vibrate(8);
        if (game && typeof openOrderModal === "function") {
          openOrderModal(game);
        }
      });
    });
  }

  // ------------------------------------------------------------
  // B1: Quick buy — recent paid orders
  // ------------------------------------------------------------
  async function loadLastOrders() {
    try {
      const res = await fetch("/user/orders");
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const paidOrders = data.filter(
        (o) => String(o.payment_status) === "paid",
      );
      const seen = new Set();
      const unique = [];
      for (const order of paidOrders) {
        const key = `${order.game}|${order.product}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(order);
        if (unique.length >= 3) break;
      }
      state.lastOrders = unique;
      renderQuickBuy();
    } catch (err) { }
  }

  function renderQuickBuy() {
    const banner = document.getElementById("quickBuyBanner");
    const track = document.getElementById("quickBuyTrack");
    if (!banner || !track) return;

    const knownGames = new Set(
      Array.isArray(allProducts) ? allProducts.map((p) => p.game) : [],
    );
    const orders = state.lastOrders.filter((o) => knownGames.has(o.game));

    if (orders.length === 0) {
      banner.hidden = true;
      return;
    }

    banner.hidden = false;
    const actionLabel = safeT("quickBuyAction", "Beli lagi");
    track.innerHTML = orders
      .map((order) => {
        return `
          <button type="button" class="quick-buy-card" data-game="${safeEscape(order.game)}">
            <div class="quick-buy-card-info">
              <strong>${safeEscape(order.game)}</strong>
              <small>${safeEscape(order.product || "")}</small>
            </div>
            <span class="quick-buy-card-cta">${safeEscape(actionLabel)} \u2192</span>
          </button>
        `;
      })
      .join("");

    track.querySelectorAll(".quick-buy-card").forEach((card) => {
      card.addEventListener("click", () => {
        const game = card.getAttribute("data-game");
        vibrate(10);
        if (game && typeof openOrderModal === "function") {
          openOrderModal(game);
        }
      });
    });
  }

  // ------------------------------------------------------------
  // B4: Auto-apply voucher
  // ------------------------------------------------------------
  async function loadPublicVouchers() {
    try {
      const res = await fetch("/public-vouchers");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) state.publicVouchers = data;
    } catch (err) { }
  }

  function findBestVoucherForProduct(product) {
    if (
      !product ||
      !Array.isArray(state.publicVouchers) ||
      !state.publicVouchers.length
    ) {
      return null;
    }
    const productId = Number(product.id || 0);
    const game = String(product.game || "").toLowerCase();
    const brand = String(product.brand || "").toLowerCase();
    const duration = String(product.duration || "").toLowerCase();

    let best = null;
    for (const v of state.publicVouchers) {
      const productIds = Array.isArray(v.product_ids)
        ? v.product_ids
            .map((entry) => Number(entry))
            .filter((entry) => Number.isInteger(entry) && entry > 0)
        : [];
      const vGame = String(v.game_name || "").toLowerCase();
      const vBrand = String(v.brand_name || "").toLowerCase();
      const vDuration = String(v.duration_name || "").toLowerCase();

      if (productIds.length) {
        if (!productId || !productIds.includes(productId)) continue;
      } else {
        if (
          v.scope === "duration" &&
          (vGame !== game || vBrand !== brand || vDuration !== duration)
        )
          continue;
        if (v.scope === "brand" && (vGame !== game || vBrand !== brand)) continue;
        if (v.scope === "game" && vGame !== game) continue;
      }

      const disc = Number(v.discount_amount || 0);
      if (disc <= 0) continue;
      if (disc >= Number(product.price || 0)) continue;
      if (!best || disc > Number(best.discount_amount || 0)) best = v;
    }
    return best;
  }

  function renderAutoVoucherBanner(product) {
    const banner = document.getElementById("autoVoucherBanner");
    if (!banner) return;
    if (!product) {
      banner.hidden = true;
      banner.innerHTML = "";
      return;
    }
    const best = findBestVoucherForProduct(product);
    if (!best) {
      banner.hidden = true;
      banner.innerHTML = "";
      return;
    }
    const applied = safeT("autoVoucherApplied", "otomatis terpasang");
    const savings = safeT("autoVoucherSavings", "Hemat");
    const rupiah =
      typeof formatRupiah === "function"
        ? formatRupiah(best.discount_amount)
        : "Rp " + best.discount_amount;

    banner.hidden = false;
    banner.innerHTML = `
      <span class="auto-voucher-emoji" aria-hidden="true">\ud83c\udf81</span>
      <div class="auto-voucher-text">
        <strong>${safeEscape(best.code)}</strong>
        <small>${safeEscape(applied)} \u2014 ${safeEscape(savings)} <b>${rupiah}</b></small>
      </div>
      <button type="button" class="auto-voucher-apply" data-code="${safeEscape(best.code)}">
        ${safeT("checkVoucherBtn", "Apply")}
      </button>
    `;
    const applyBtn = banner.querySelector(".auto-voucher-apply");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        vibrate(10);
        const input = document.getElementById("voucherCodeInput");
        if (input) {
          const voucherPanel = document.getElementById("voucherPanel");
          if (voucherPanel) voucherPanel.open = true;

          input.value = best.code;
          if (typeof checkVoucher === "function") checkVoucher();
        }
      });
    }
  }

  // ------------------------------------------------------------
  // B5: Delivery time estimate
  // ------------------------------------------------------------
  function renderDeliveryEstimate(product) {
    const el = document.getElementById("deliveryEstimate");
    if (!el) return;
    if (!product) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    const type = String(product.delivery_type || "auto").toLowerCase();
    const isManual = type === "manual";
    const label = isManual
      ? safeT("deliveryManualLabel", "Manual")
      : safeT("deliveryAutoLabel", "Auto");
    const desc = isManual
      ? safeT("deliveryManualDesc", "Admin proses manual \u2264 30 menit")
      : safeT(
        "deliveryAutoDesc",
        "Kirim otomatis \u2264 1 menit setelah bayar",
      );
    const icon = isManual ? "M" : "A";

    el.hidden = false;
    el.className = `delivery-estimate ${isManual ? "is-manual" : "is-auto"}`;
    el.innerHTML = `
      <span class="delivery-estimate-icon" aria-hidden="true">${icon}</span>
      <div class="delivery-estimate-text">
        <strong>${safeEscape(label)}</strong>
        <small>${safeEscape(desc)}</small>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // B2: Smart-fill contact (WA/Email detection)
  // ------------------------------------------------------------
  function classifyContact(value) {
    const v = String(value || "").trim();
    if (!v) return "";
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return "email";
    const digits = v.replace(/\D/g, "");
    if (
      /^(\+?62|0)8\d{7,12}$/.test(v) ||
      (digits.length >= 9 && digits.length <= 15)
    ) {
      return "wa";
    }
    return "invalid";
  }

  function attachContactSmartFill() {
    const input = document.getElementById("contact");
    if (!input || input.dataset.smartFillBound === "1") return;
    input.dataset.smartFillBound = "1";

    const field = input.closest(".field") || input.parentElement;
    if (!field) return;

    const lastContact = localStorage.getItem(STORAGE_KEYS.lastContact);
    if (lastContact && !input.value.trim()) input.value = lastContact;

    let hintEl = field.querySelector(".contact-hint");
    if (!hintEl) {
      hintEl = document.createElement("small");
      hintEl.className = "contact-hint";
      field.appendChild(hintEl);
    }

    function update() {
      const kind = classifyContact(input.value);
      hintEl.classList.remove("is-valid", "is-invalid");
      if (!input.value.trim()) {
        hintEl.textContent = "";
        return;
      }
      if (kind === "wa") {
        hintEl.textContent =
          "\u2705 " + safeT("contactValidWA", "Nomor WA terdeteksi");
        hintEl.classList.add("is-valid");
      } else if (kind === "email") {
        hintEl.textContent =
          "\u2705 " + safeT("contactValidEmail", "Email terdeteksi");
        hintEl.classList.add("is-valid");
      } else {
        hintEl.textContent =
          "\u26a0\ufe0f " + safeT("contactInvalid", "Isi nomor WA atau email");
        hintEl.classList.add("is-invalid");
      }
    }

    input.addEventListener("input", update);
    input.addEventListener("blur", () => {
      const val = input.value.trim();
      const kind = classifyContact(val);
      if (val && (kind === "wa" || kind === "email")) {
        localStorage.setItem(STORAGE_KEYS.lastContact, val);
      }
    });

    const nameInput = document.getElementById("name");
    if (nameInput) {
      const lastName = localStorage.getItem(STORAGE_KEYS.lastName);
      if (lastName && !nameInput.value.trim()) nameInput.value = lastName;
      nameInput.addEventListener("blur", () => {
        const val = nameInput.value.trim();
        if (val) localStorage.setItem(STORAGE_KEYS.lastName, val);
      });
    }

    update();
  }

  // ------------------------------------------------------------
  // B6 + B3 fusion: Resume cart bottom bar
  // ------------------------------------------------------------
  function savePendingCart() {
    const productSel = document.getElementById("product");
    const nameInput = document.getElementById("name");
    const contactInput = document.getElementById("contact");
    if (!productSel || !productSel.value) return;

    const product = Array.isArray(allProducts)
      ? allProducts.find((p) => String(p.id) === String(productSel.value))
      : null;
    if (!product) return;

    const payload = {
      game: product.game,
      product_id: product.id,
      platform: getProductPlatform(product),
      brand: product.brand,
      duration: product.duration,
      price: product.price,
      name: nameInput ? nameInput.value.trim() : "",
      contact: contactInput ? contactInput.value.trim() : "",
      ts: Date.now(),
    };
    try {
      sessionStorage.setItem(STORAGE_KEYS.pendingCart, JSON.stringify(payload));
      state.pendingCart = payload;
    } catch (err) { }
  }

  function clearPendingCart() {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.pendingCart);
    } catch (err) { }
    state.pendingCart = null;
  }

  function loadPendingCart() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.pendingCart);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.game) return null;
      if (Date.now() - Number(parsed.ts || 0) > 1000 * 60 * 60 * 6) return null;
      return parsed;
    } catch (err) {
      return null;
    }
  }

  function renderResumeBar() {
    const bar = document.getElementById("resumeCartBar");
    if (!bar) return;
    const cart = state.pendingCart;
    if (!cart || !cart.game) {
      bar.hidden = true;
      return;
    }
    const modal = document.getElementById("orderModal");
    if (modal && modal.classList.contains("show")) {
      bar.hidden = true;
      return;
    }
    const label = bar.querySelector("#resumeCartLabel");
    if (label) {
      const price =
        typeof formatRupiah === "function"
          ? formatRupiah(cart.price)
          : "Rp " + cart.price;
      label.textContent = `${cart.game} \u00b7 ${cart.brand || ""} ${cart.duration || ""} \u00b7 ${price}`;
    }
    bar.hidden = false;
  }

  function setupResumeBar() {
    state.pendingCart = loadPendingCart();
    renderResumeBar();
    const action = document.getElementById("resumeCartAction");
    const closeBtn = document.getElementById("resumeCartClose");
    if (action) {
      action.addEventListener("click", async () => {
        vibrate(10);
        const cart = state.pendingCart;
        if (!cart || !cart.game) return;
        if (typeof openOrderModal === "function") {
          await openOrderModal(cart.game);
        }
        setTimeout(() => {
          const platform = document.getElementById("platform");
          if (platform && cart.platform) {
            platform.value = normalizePlatform(cart.platform);
            platform.dispatchEvent(new Event("change"));
          }
          const brand = document.getElementById("brand");
          if (brand && cart.brand) {
            brand.value = cart.brand;
            brand.dispatchEvent(new Event("change"));
          }
          setTimeout(() => {
            const productSel = document.getElementById("product");
            if (productSel && cart.product_id) {
              productSel.value = String(cart.product_id);
              productSel.dispatchEvent(new Event("change"));
            }
            const nameInput = document.getElementById("name");
            const contactInput = document.getElementById("contact");
            if (nameInput && cart.name) nameInput.value = cart.name;
            if (contactInput && cart.contact) contactInput.value = cart.contact;
            if (typeof updateOrderStepFromForm === "function")
              updateOrderStepFromForm();
          }, 80);
        }, 300);
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        clearPendingCart();
      });
    }
  }

  // ------------------------------------------------------------
  // D2 + D5: Search autocomplete + history
  // ------------------------------------------------------------
  function readSearchHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.searchHistory);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.slice(0, 5) : [];
    } catch (err) {
      return [];
    }
  }

  function writeSearchHistory(arr) {
    try {
      localStorage.setItem(
        STORAGE_KEYS.searchHistory,
        JSON.stringify(arr.slice(0, 5)),
      );
    } catch (err) { }
  }

  function pushSearchHistory(query) {
    const q = String(query || "").trim();
    if (q.length < 2) return;
    const current = readSearchHistory().filter(
      (x) => x.toLowerCase() !== q.toLowerCase(),
    );
    current.unshift(q);
    writeSearchHistory(current);
  }

  function fuzzyMatchScore(query, target) {
    const q = String(query || "")
      .trim()
      .toLowerCase();
    const t = String(target || "").toLowerCase();
    if (!q) return 0;
    if (t.startsWith(q)) return 100;
    if (t.includes(q)) return 80;
    const tokens = t.split(/\s+/);
    if (tokens.some((tok) => tok.startsWith(q))) return 60;
    let qi = 0;
    for (let i = 0; i < t.length && qi < q.length; i++) {
      if (t[i] === q[qi]) qi++;
    }
    return qi === q.length ? 40 : 0;
  }

  function renderSearchDropdown() {
    const dropdown = document.getElementById("searchDropdown");
    const input = document.getElementById("gameSearch");
    if (!dropdown || !input) return;
    const q = input.value.trim();
    const games = Array.isArray(allProducts)
      ? [...new Set(allProducts.map((p) => p.game))]
      : [];

    if (!q) {
      const history = readSearchHistory();
      if (history.length === 0) {
        dropdown.hidden = true;
        dropdown.innerHTML = "";
        return;
      }
      dropdown.hidden = false;
      dropdown.innerHTML = `
        <div class="search-dropdown-head">
          <span>${safeEscape(safeT("searchHistoryTitle", "Pencarian terakhir"))}</span>
          <button type="button" class="search-dropdown-clear" id="searchHistoryClearBtn">${safeEscape(safeT("searchHistoryClear", "Hapus"))}</button>
        </div>
        ${history
          .map(
            (h) =>
              `<button type="button" class="search-dropdown-item is-history" data-q="${safeEscape(h)}"><span aria-hidden="true">\ud83d\udd52</span>${safeEscape(h)}</button>`,
          )
          .join("")}
      `;
      const clearBtn = dropdown.querySelector("#searchHistoryClearBtn");
      if (clearBtn) {
        clearBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          writeSearchHistory([]);
          renderSearchDropdown();
        });
      }
    } else {
      const scored = games
        .map((g) => ({ game: g, score: fuzzyMatchScore(q, g) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
      if (scored.length === 0) {
        dropdown.hidden = true;
        dropdown.innerHTML = "";
        return;
      }
      dropdown.hidden = false;
      dropdown.innerHTML = scored
        .map((s) => {
          const stock =
            typeof getGameStock === "function" ? getGameStock(s.game) : 0;
          return `
            <button type="button" class="search-dropdown-item" data-game="${safeEscape(s.game)}">
              <span class="search-dropdown-name">${safeEscape(s.game)}</span>
              <small class="search-dropdown-stock">${stock > 0 ? stock + " " + safeT("catalogStockReady", "stok") : safeT("outOfStockLabel", "Habis")}</small>
            </button>
          `;
        })
        .join("");
    }

    dropdown.querySelectorAll(".search-dropdown-item").forEach((item) => {
      item.addEventListener("click", () => {
        const isHistory = item.classList.contains("is-history");
        if (isHistory) {
          const q = item.getAttribute("data-q");
          input.value = q || "";
          if (typeof searchGame === "function") searchGame();
          renderSearchDropdown();
          input.focus();
          return;
        }
        const game = item.getAttribute("data-game");
        if (!game) return;
        pushSearchHistory(input.value.trim());
        input.value = "";
        if (typeof searchGame === "function") searchGame();
        dropdown.hidden = true;
        vibrate(8);
        if (typeof openOrderModal === "function") openOrderModal(game);
      });
    });
  }

  function setupSearchEnhancements() {
    const input = document.getElementById("gameSearch");
    const dropdown = document.getElementById("searchDropdown");
    if (!input || !dropdown) return;

    input.addEventListener("focus", renderSearchDropdown);
    input.addEventListener("input", renderSearchDropdown);
    input.addEventListener("keyup", () => {
      const q = input.value.trim();
      if (q.length >= 2) pushSearchHistory(q);
    });
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && e.target !== input) {
        dropdown.hidden = true;
      }
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") dropdown.hidden = true;
    });
  }

  // ------------------------------------------------------------
  // D4: Recommendations
  // ------------------------------------------------------------
  function renderRecommendations() {
    const section = document.getElementById("recommendationSection");
    const track = document.getElementById("recommendationTrack");
    if (!section || !track) return;
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      section.hidden = true;
      return;
    }

    let recents = [];
    try {
      recents = JSON.parse(localStorage.getItem("ae_recent_games") || "[]");
    } catch (err) { }
    if (!Array.isArray(recents)) recents = [];

    const allGames = [...new Set(allProducts.map((p) => p.game))];
    if (!recents.length) {
      const stockSorted = allGames
        .map((g) => ({
          game: g,
          stock: typeof getGameStock === "function" ? getGameStock(g) : 0,
        }))
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 6);
      paintRecommendations(stockSorted.map((x) => x.game));
      return;
    }

    const ref = recents[0];
    const refGenre = getGenreForGame(ref);
    const candidates = allGames
      .filter((g) => g !== ref && !recents.includes(g))
      .map((g) => {
        let score = 0;
        if (getGenreForGame(g) === refGenre) score += 50;
        const stock = typeof getGameStock === "function" ? getGameStock(g) : 0;
        if (stock > 0) score += 20;
        return { game: g, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    paintRecommendations(candidates.map((c) => c.game));
  }

  function paintRecommendations(games) {
    const section = document.getElementById("recommendationSection");
    const track = document.getElementById("recommendationTrack");
    if (!section || !track) return;
    if (!games || !games.length) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    track.innerHTML = games
      .map((game) => {
        const initials =
          typeof getGameInitials === "function" ? getGameInitials(game) : "AE";
        const stock =
          typeof getGameStock === "function" ? getGameStock(game) : 0;
        const minPrice =
          typeof getGameMinPrice === "function" ? getGameMinPrice(game) : 0;
        return `
          <button type="button" class="recommendation-card" data-game="${safeEscape(game)}">
            <div class="recommendation-card-thumb">${safeEscape(initials)}</div>
            <div class="recommendation-card-info">
              <strong>${safeEscape(game)}</strong>
              <small>${stock > 0 ? (typeof formatRupiah === "function" ? formatRupiah(minPrice) : "Rp " + minPrice) : safeT("outOfStockLabel", "Habis")}</small>
            </div>
          </button>
        `;
      })
      .join("");
    track.querySelectorAll(".recommendation-card").forEach((card) => {
      card.addEventListener("click", () => {
        const game = card.getAttribute("data-game");
        vibrate(8);
        if (game && typeof openOrderModal === "function") openOrderModal(game);
      });
    });
  }

  // ------------------------------------------------------------
  // D6: Detail mini popover (desktop only)
  // ------------------------------------------------------------
  function setupDetailPopover() {
    if (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) {
      return;
    }
    let popover = null;
    let hoverTimer = null;
    let currentCard = null;

    function createPopover() {
      const el = document.createElement("div");
      el.className = "game-detail-popover";
      el.setAttribute("role", "tooltip");
      document.body.appendChild(el);
      return el;
    }

    function showFor(card) {
      const game = card.getAttribute("data-game");
      if (!game) return;
      if (!popover) popover = createPopover();
      const stock = typeof getGameStock === "function" ? getGameStock(game) : 0;
      const minPrice =
        typeof getGameMinPrice === "function" ? getGameMinPrice(game) : 0;
      const brandCount =
        typeof getGameBrandCount === "function" ? getGameBrandCount(game) : 0;
      const genre = getGenreForGame(game) || "\u2014";
      popover.innerHTML = `
        <strong>${safeEscape(game)}</strong>
        <div class="game-detail-row"><span>Genre</span><b>${safeEscape(genre)}</b></div>
        <div class="game-detail-row"><span>Brand</span><b>${brandCount}</b></div>
        <div class="game-detail-row"><span>${safeT("catalogStockReady", "Stok")}</span><b>${stock}</b></div>
        ${minPrice > 0 ? `<div class="game-detail-row"><span>${safeT("cardFromPrice", "Mulai")}</span><b>${typeof formatRupiah === "function" ? formatRupiah(minPrice) : minPrice}</b></div>` : ""}
      `;
      const rect = card.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 8;
      const left = rect.left + window.scrollX;
      popover.style.top = top + "px";
      popover.style.left = left + "px";
      popover.classList.add("is-visible");
    }

    function hide() {
      if (popover) popover.classList.remove("is-visible");
    }

    document.addEventListener("mouseover", (e) => {
      const card = e.target.closest(".game-card");
      if (!card) return;
      if (card === currentCard) return;
      currentCard = card;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => showFor(card), 500);
    });
    document.addEventListener("mouseout", (e) => {
      const card = e.target.closest(".game-card");
      if (!card) return;
      if (card !== currentCard) return;
      clearTimeout(hoverTimer);
      currentCard = null;
      hide();
    });
    window.addEventListener("scroll", hide, { passive: true });
  }

  // ------------------------------------------------------------
  // F2: Pull-to-refresh (mobile)
  // ------------------------------------------------------------
  function setupPullToRefresh() {
    const indicator = document.getElementById("pullToRefresh");
    if (!indicator) return;
    if (!window.matchMedia || !window.matchMedia("(max-width: 640px)").matches)
      return;

    const THRESHOLD = 80;

    document.addEventListener(
      "touchstart",
      (e) => {
        if (window.scrollY > 5) return;
        const modal = document.getElementById("orderModal");
        if (modal && modal.classList.contains("show")) return;
        state.pullToRefresh.startY = e.touches[0].clientY;
        state.pullToRefresh.dy = 0;
        state.pullToRefresh.active = true;
      },
      { passive: true },
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        if (!state.pullToRefresh.active || state.pullToRefresh.refreshing)
          return;
        const dy = e.touches[0].clientY - state.pullToRefresh.startY;
        if (dy <= 0) {
          indicator.hidden = true;
          return;
        }
        state.pullToRefresh.dy = dy;
        const offset = Math.min(dy * 0.6, THRESHOLD + 20);
        indicator.hidden = false;
        indicator.style.transform = `translate(-50%, ${offset}px)`;
        indicator.classList.toggle("is-ready", dy >= THRESHOLD);
      },
      { passive: true },
    );

    document.addEventListener("touchend", async () => {
      if (!state.pullToRefresh.active) return;
      const triggered = state.pullToRefresh.dy >= THRESHOLD;
      state.pullToRefresh.active = false;
      if (!triggered) {
        indicator.hidden = true;
        indicator.style.transform = "translate(-50%, -100%)";
        return;
      }
      state.pullToRefresh.refreshing = true;
      indicator.classList.add("is-refreshing");
      vibrate(15);
      try {
        if (typeof loadAllProducts === "function") await loadAllProducts();
        if (typeof loadRecentPurchases === "function")
          await loadRecentPurchases();
        await loadTrending();
        await loadPublicVouchers();
      } catch (err) { }
      setTimeout(() => {
        indicator.classList.remove("is-refreshing", "is-ready");
        indicator.hidden = true;
        indicator.style.transform = "translate(-50%, -100%)";
        state.pullToRefresh.refreshing = false;
      }, 700);
    });
  }

  // ------------------------------------------------------------
  // F3: PWA install prompt
  // ------------------------------------------------------------
  function setupInstallPrompt() {
    const banner = document.getElementById("installPromptBanner");
    const action = document.getElementById("installPromptAction");
    const closeBtn = document.getElementById("installPromptClose");
    let showTimer = null;

    if (!banner || !action || !closeBtn) return;

    const dismissedAt = Number(
      localStorage.getItem(STORAGE_KEYS.installDismissed) || 0,
    );
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (dismissedAt && Date.now() - dismissedAt < sevenDays) return;

    function showInstallBanner() {
      banner.hidden = false;
      document.body.classList.add("install-prompt-open");
    }

    function scheduleInstallBanner() {
      if (showTimer) window.clearTimeout(showTimer);
      showTimer = window.setTimeout(() => {
        if (!state.deferredInstallPrompt) return;
        if (document.body.classList.contains("order-modal-open")) return;
        if (document.querySelector(".payment-modal.show")) return;
        showInstallBanner();
      }, 30 * 1000);
    }

    function hideInstallBanner() {
      if (showTimer) window.clearTimeout(showTimer);
      banner.hidden = true;
      document.body.classList.remove("install-prompt-open");
      localStorage.setItem(STORAGE_KEYS.installDismissed, String(Date.now()));
    }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      state.deferredInstallPrompt = event;
      scheduleInstallBanner();
    });

    action.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const prompt = state.deferredInstallPrompt;

      if (!prompt) {
        Swal.fire({
          icon: "info",
          title: "Install manual",
          text: "Kalau tombol install belum muncul, tekan menu browser lalu pilih Tambahkan ke layar utama.",
          confirmButtonColor: "#0a0a0a",
        });
        return;
      }

      vibrate(10);

      try {
        await prompt.prompt();
        await prompt.userChoice;
      } catch (err) { }

      state.deferredInstallPrompt = null;
      hideInstallBanner();
    });

    closeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      hideInstallBanner();
    });

    closeBtn.addEventListener(
      "touchend",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        hideInstallBanner();
      },
      { passive: false },
    );

    window.addEventListener("appinstalled", () => {
      state.deferredInstallPrompt = null;
      hideInstallBanner();
    });
  }

  // ------------------------------------------------------------
  // F1: Bottom nav active state + smooth hide on scroll up
  // ------------------------------------------------------------
  function setupBottomNav() {
    const nav = document.getElementById("bottomNav");
    if (!nav) return;
    const items = nav.querySelectorAll(".bottom-nav-item");

    function syncActive() {
      const scrollY = window.scrollY;
      const hero = document.getElementById("hero");
      const store = document.getElementById("store-section");
      let activeKey = "home";
      if (store) {
        const rect = store.getBoundingClientRect();
        if (rect.top <= 100) activeKey = "catalog";
      }
      if (hero) {
        const rect = hero.getBoundingClientRect();
        if (rect.bottom > window.innerHeight * 0.6) activeKey = "home";
      }
      items.forEach((item) => {
        item.classList.toggle(
          "is-active",
          item.getAttribute("data-nav") === activeKey,
        );
      });
    }
    syncActive();
    window.addEventListener("scroll", syncActive, { passive: true });

    items.forEach((item) => {
      item.addEventListener("click", () => vibrate(6));
    });
  }

  // ------------------------------------------------------------
  // F6: Haptic on favorite/buy/filter
  // ------------------------------------------------------------
  function setupGlobalHaptics() {
    document.addEventListener("click", (e) => {
      if (
        e.target.closest(".pill") ||
        e.target.closest(".game-card-fav") ||
        e.target.closest("#buyBtn")
      ) {
        vibrate(8);
      }
    });
  }

  // ------------------------------------------------------------
  // Hook into existing functions
  // ------------------------------------------------------------
  function installHooks() {
    if (
      typeof window.openOrderModal === "function" &&
      !window.openOrderModal.__aeWrapped
    ) {
      const orig = window.openOrderModal;
      window.openOrderModal = async function patchedOpenOrderModal(game) {
        const result = await orig.call(this, game);
        try {
          attachContactSmartFill();
          const productSel = document.getElementById("product");
          if (productSel) {
            productSel.addEventListener("change", onProductChange);
            onProductChange();
          }
        } catch (err) { }
        return result;
      };
      window.openOrderModal.__aeWrapped = true;
    }

    if (
      typeof window.closeOrderModal === "function" &&
      !window.closeOrderModal.__aeWrapped
    ) {
      const orig = window.closeOrderModal;
      window.closeOrderModal = function patchedCloseOrderModal() {
        const result = orig.call(this);

        try {
          sessionStorage.removeItem(STORAGE_KEYS.pendingCart);
          state.pendingCart = null;
        } catch (err) { }

        return result;
      };
      window.closeOrderModal.__aeWrapped = true;
    }

    if (
      typeof window.renderGames === "function" &&
      !window.renderGames.__aeWrapped
    ) {
      const orig = window.renderGames;
      window.renderGames = function patchedRenderGames() {
        const result = orig.apply(this, arguments);
        try {
          renderTrending();
          renderQuickBuy();
          renderGenrePills();
        } catch (err) { }
        return result;
      };
      window.renderGames.__aeWrapped = true;
    }

    if (typeof window.buy === "function" && !window.buy.__aeWrapped) {
      const orig = window.buy;
      window.buy = async function patchedBuy() {
        const result = await orig.apply(this, arguments);
        try {
          clearPendingCart();
        } catch (err) { }
        return result;
      };
      window.buy.__aeWrapped = true;
    }
  }

  function onProductChange() {
    const productSel = document.getElementById("product");
    if (!productSel) return;
    const product = Array.isArray(allProducts)
      ? allProducts.find((p) => String(p.id) === String(productSel.value))
      : null;
    renderDeliveryEstimate(product);
    renderAutoVoucherBanner(product);
  }

  // ------------------------------------------------------------
  // Init
  // ------------------------------------------------------------
  function init() {
    try {
      applyGenreFilter();
      installHooks();
      setupSearchEnhancements();
      setupDetailPopover();
      setupPullToRefresh();
      setupInstallPrompt();
      setupBottomNav();
      setupGlobalHaptics();
    } catch (err) {
      console.error("AE v2 features init error:", err);
    }

    setTimeout(() => {
      try {
        loadTrending();
        loadPublicVouchers();
        loadLastOrders();
      } catch (err) { }
    }, 800);

    setTimeout(() => {
      try {
        renderTrending();
        renderQuickBuy();
        renderGenrePills();
      } catch (err) { }
    }, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

function setupAdminChatPopup() {
  const btn = document.getElementById("chatAdminBtn");
  const sheet = document.getElementById("adminChatSheet");
  const closeBtn = document.getElementById("adminChatClose");
  const backdrop = document.getElementById("adminChatBackdrop");
  const guideBtn = document.getElementById("adminChatGuideBtn");
  const termsBtn = document.getElementById("adminChatTermsBtn");

  if (!btn || !sheet) return;
  sheet.setAttribute("inert", "");
  let lastAdminChatTrigger = null;

  function getAdminChatFocusable() {
    return Array.from(
      sheet.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.offsetParent !== null);
  }

  function openAdminChat() {
    lastAdminChatTrigger = document.activeElement;
    sheet.classList.add("show");
    sheet.removeAttribute("inert");
    sheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("admin-chat-open");

    setTimeout(() => {
      closeBtn?.focus();
    }, 50);
  }

  function closeAdminChat() {
    if (sheet.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    sheet.classList.remove("show");
    sheet.setAttribute("aria-hidden", "true");
    sheet.setAttribute("inert", "");
    document.body.classList.remove("admin-chat-open");

    setTimeout(() => {
      if (lastAdminChatTrigger?.isConnected) {
        lastAdminChatTrigger.focus();
      } else {
        btn?.focus();
      }
      lastAdminChatTrigger = null;
    }, 50);
  }

  btn.addEventListener("click", (event) => {
    event.preventDefault();
    openAdminChat();
  });

  closeBtn?.addEventListener("click", closeAdminChat);
  backdrop?.addEventListener("click", closeAdminChat);

  guideBtn?.addEventListener("click", () => {
    closeAdminChat();

    if (typeof showGuide === "function") {
      showGuide();
    }
  });

  termsBtn?.addEventListener("click", () => {
    closeAdminChat();

    if (typeof showTermsPolicy === "function") {
      showTermsPolicy();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!sheet.classList.contains("show")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeAdminChat();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = getAdminChatFocusable();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupAdminChatPopup();
});

// ============================================================
// AE Payment Modal — custom wrapper for Midtrans Snap.js embed
// ============================================================
(function setupAEPaymentModal() {
  console.info("[AEPay] AEPaymentModal module loading…");
  const SNAP_SANDBOX_URL = "https://app.sandbox.midtrans.com/snap/snap.js";
  const SNAP_PROD_URL = "https://app.midtrans.com/snap/snap.js";
  // Slower polling on mobile (6s) to reduce CPU/battery; desktop stays 4s.
  const IS_MOBILE_VIEWPORT =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 768px)").matches;
  const POLL_INTERVAL_MS = IS_MOBILE_VIEWPORT ? 6000 : 4000;
  const COUNTDOWN_SECONDS = 15 * 60;

  const state = {
    isOpen: false,
    orderId: null,
    resultUrl: null,
    paymentUrl: null,
    pollTimer: null,
    countdownTimer: null,
    countdownLeft: COUNTDOWN_SECONDS,
    snapLoaded: false,
    snapClientKey: null,
    finalStatusHandled: false,
  };

  const i18n = {
    id: {
      paymentModalTitle: "Selesaikan Pembayaran",
      paymentModalOrderLabel: "Order",
      paymentModalTotal: "Total Bayar",
      paymentModalGame: "Game",
      paymentModalProduct: "Produk",
      paymentModalCountdownLabel: "QR Aktif",
      paymentStatusPending: "Menunggu pembayaran…",
      paymentStatusPaid: "Pembayaran diterima!",
      paymentStatusExpired: "Waktu habis",
      paymentStatusCancelled: "Pembayaran dibatalkan",
      paymentStatusError: "Terjadi kesalahan",
      paymentLoadingSnap: "Memuat metode pembayaran…",
      paymentSecureHint:
        "Pembayaran aman via Midtrans (QRIS, GoPay, OVO, DANA, VA, dll)",
      paymentRefreshStatus: "Refresh Cek Status",
      paymentExitLater: "Bayar Nanti",
      paymentStateTitlePaid: "Pembayaran Berhasil Done",
      paymentStateDescPaid: "Game key sedang dikirim, sebentar lagi…",
      paymentStateTitleExpired: "Waktu Habis",
      paymentStateDescExpired: "QR kadaluwarsa. Silakan buat order baru.",
      paymentStateTitleError: "Pembayaran Gagal",
      paymentStateDescError: "Coba ulangi atau gunakan metode lain.",
      paymentActionDetail: "Lihat Detail Order",
      paymentActionRetry: "Coba Lagi",
      paymentActionOpenMidtrans: "Buka di Midtrans",
      paymentActionClose: "Tutup",
      paymentConfirmCloseTitle: "Batal Bayar?",
      paymentConfirmCloseText:
        "Order tetap pending. Kamu bisa lanjut bayar di halaman akun.",
      paymentConfirmCloseYes: "Ya, Tutup",
      paymentConfirmCloseNo: "Lanjut Bayar",
      paymentCheckingStatus: "Mengecek status…",
      paymentRefreshDone: "Status terupdate",
    },
    en: {
      paymentModalTitle: "Complete Payment",
      paymentModalOrderLabel: "Order",
      paymentModalTotal: "Total",
      paymentModalGame: "Game",
      paymentModalProduct: "Product",
      paymentModalCountdownLabel: "QR Active",
      paymentStatusPending: "Waiting for payment…",
      paymentStatusPaid: "Payment received!",
      paymentStatusExpired: "Time expired",
      paymentStatusCancelled: "Payment cancelled",
      paymentStatusError: "Something went wrong",
      paymentLoadingSnap: "Loading payment methods…",
      paymentSecureHint:
        "Secured by Midtrans (QRIS, GoPay, OVO, DANA, VA, etc)",
      paymentRefreshStatus: "Refresh Check Status",
      paymentExitLater: "Pay Later",
      paymentStateTitlePaid: "Payment Successful Done",
      paymentStateDescPaid: "Your game key is being delivered…",
      paymentStateTitleExpired: "Time Expired",
      paymentStateDescExpired: "QR code expired. Please create a new order.",
      paymentStateTitleError: "Payment Failed",
      paymentStateDescError: "Please try again or use a different method.",
      paymentActionDetail: "View Order Details",
      paymentActionRetry: "Try Again",
      paymentActionOpenMidtrans: "Open in Midtrans",
      paymentActionClose: "Close",
      paymentConfirmCloseTitle: "Cancel Payment?",
      paymentConfirmCloseText:
        "Order stays pending. You can continue paying from your account page.",
      paymentConfirmCloseYes: "Yes, Close",
      paymentConfirmCloseNo: "Continue Paying",
      paymentCheckingStatus: "Checking status…",
      paymentRefreshDone: "Status updated",
    },
  };

  function t(key) {
    const lang =
      (typeof currentLanguage !== "undefined" && currentLanguage) || "id";
    const dict = i18n[lang] || i18n.id;
    return dict[key] || i18n.id[key] || key;
  }

  function getElements() {
    return {
      modal: document.getElementById("paymentModal"),
      backdrop: document.getElementById("paymentModalBackdrop"),
      closeBtn: document.getElementById("paymentModalClose"),
      orderId: document.getElementById("paymentOrderId"),
      total: document.getElementById("paymentTotal"),
      gameName: document.getElementById("paymentGameName"),
      productName: document.getElementById("paymentProductName"),
      countdown: document.getElementById("paymentCountdownTime"),
      progressBar: document.getElementById("paymentProgressBar"),
      statusPill: document.getElementById("paymentStatusPill"),
      statusText: document.getElementById("paymentStatusText"),
      snapContainer: document.getElementById("snap-container"),
      snapLoading: document.getElementById("paymentSnapLoading"),
      stateOverlay: document.getElementById("paymentStateOverlay"),
      stateIcon: document.getElementById("paymentStateIcon"),
      stateTitle: document.getElementById("paymentStateTitle"),
      stateDesc: document.getElementById("paymentStateDesc"),
      statePrimary: document.getElementById("paymentStateActionPrimary"),
      stateSecondary: document.getElementById("paymentStateActionSecondary"),
      refreshBtn: document.getElementById("paymentRefreshStatus"),
      exitBtn: document.getElementById("paymentExitBtn"),
    };
  }

  function loadSnapJs(clientKey, isProduction) {
    return new Promise((resolve, reject) => {
      if (
        window.snap &&
        typeof window.snap.pay === "function" &&
        state.snapClientKey === clientKey
      ) {
        resolve();
        return;
      }
      const existing = document.getElementById("midtrans-snap-script");
      if (existing) existing.remove();

      const script = document.createElement("script");
      script.id = "midtrans-snap-script";
      script.src = isProduction ? SNAP_PROD_URL : SNAP_SANDBOX_URL;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      script.onload = () => {
        state.snapLoaded = true;
        state.snapClientKey = clientKey;
        resolve();
      };
      script.onerror = (err) => {
        reject(new Error("Snap.js failed to load"));
      };
      document.head.appendChild(script);
    });
  }

  function formatRupiahLocal(n) {
    const num = Number(n || 0);
    return num.toLocaleString("id-ID");
  }

  function setBodyScrollLock(lock) {
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function applyI18n() {
    const els = getElements();
    if (els.statusText && els.statusPill.dataset.state === "pending") {
      els.statusText.textContent = t("paymentStatusPending");
    }
    if (els.refreshBtn) els.refreshBtn.textContent = t("paymentRefreshStatus");
    if (els.exitBtn) els.exitBtn.textContent = t("paymentExitLater");
    if (els.snapLoading) {
      const small = els.snapLoading.querySelector("small");
      if (small) small.textContent = t("paymentLoadingSnap");
    }
  }

  function setStatus(status) {
    const els = getElements();
    if (!els.statusPill || !els.statusText) return;
    const map = {
      pending: t("paymentStatusPending"),
      paid: t("paymentStatusPaid"),
      expired: t("paymentStatusExpired"),
      cancelled: t("paymentStatusCancelled"),
      error: t("paymentStatusError"),
    };
    els.statusPill.dataset.state = status;
    els.statusText.textContent = map[status] || map.pending;
  }

  function showStateOverlay({ icon, title, desc, primary, secondary }) {
    const els = getElements();
    if (!els.stateOverlay) return;
    els.stateOverlay.hidden = false;
    els.stateOverlay.dataset.state = primary?.state || "info";
    if (els.stateIcon) els.stateIcon.textContent = icon || "✓";
    if (els.stateTitle) els.stateTitle.textContent = title || "";
    if (els.stateDesc) els.stateDesc.textContent = desc || "";
    if (primary) {
      els.statePrimary.hidden = false;
      els.statePrimary.textContent = primary.label;
      els.statePrimary.onclick = primary.onClick;
    } else {
      els.statePrimary.hidden = true;
    }
    if (secondary) {
      els.stateSecondary.hidden = false;
      els.stateSecondary.textContent = secondary.label;
      els.stateSecondary.onclick = secondary.onClick;
    } else {
      els.stateSecondary.hidden = true;
    }
    // Hide snap iframe behind overlay
    if (els.snapContainer) els.snapContainer.style.display = "none";
    if (els.snapLoading) els.snapLoading.hidden = true;
  }

  function hideStateOverlay() {
    const els = getElements();
    if (els.stateOverlay) els.stateOverlay.hidden = true;
    if (els.snapContainer) els.snapContainer.style.display = "";
  }

  function startCountdown() {
    stopCountdown();
    state.countdownLeft = COUNTDOWN_SECONDS;
    updateCountdownUI();
    state.countdownTimer = setInterval(() => {
      state.countdownLeft -= 1;
      if (state.countdownLeft <= 0) {
        stopCountdown();
        handleExpired();
        return;
      }
      updateCountdownUI();
    }, 1000);
  }

  function stopCountdown() {
    if (state.countdownTimer) {
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
  }

  function updateCountdownUI() {
    const els = getElements();
    const m = Math.floor(state.countdownLeft / 60);
    const s = state.countdownLeft % 60;
    const text = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    if (els.countdown) els.countdown.textContent = text;
    if (els.progressBar) {
      const pct = Math.max(
        0,
        Math.min(100, (state.countdownLeft / COUNTDOWN_SECONDS) * 100),
      );
      els.progressBar.style.width = `${pct}%`;
      if (pct < 25) {
        els.progressBar.dataset.danger = "true";
      } else {
        els.progressBar.dataset.danger = "false";
      }
    }
  }

  function startPolling() {
    stopPolling();
    if (typeof document !== "undefined" && document.hidden) {
      // Skip polling while tab hidden — save battery/CPU
      return;
    }
    state.pollTimer = setInterval(() => {
      pollOrderStatus();
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (state.pollTimer) {
      clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
  }

  function handleVisibilityChange() {
    if (!state.isOpen) return;
    if (document.hidden) {
      stopPolling();
    } else {
      // Re-sync immediately on return + restart interval
      pollOrderStatus();
      startPolling();
    }
  }

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  async function pollOrderStatus(silent = true) {
    if (!state.orderId) return null;
    try {
      const res = await fetch(`/order/${encodeURIComponent(state.orderId)}`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = await res.json();
      handleStatusUpdate(data, silent);
      return data;
    } catch (err) {
      if (!silent) {
        console.error("Poll order status failed:", err);
      }
      return null;
    }
  }

  function handleStatusUpdate(order, silent) {
    if (!order || state.finalStatusHandled) return;
    const paymentStatus = String(order.payment_status || "").toLowerCase();
    const deliveryStatus = String(order.delivery_status || "").toLowerCase();

    if (paymentStatus === "paid") {
      state.finalStatusHandled = true;
      handlePaid(order);
      return;
    }
    if (paymentStatus === "expired" || paymentStatus === "expire") {
      state.finalStatusHandled = true;
      handleExpired();
      return;
    }
    if (paymentStatus === "cancelled" || paymentStatus === "cancel") {
      state.finalStatusHandled = true;
      handleCancelled();
      return;
    }
    if (!silent) {
      setStatus("pending");
    }
  }

  function handlePaid(order) {
    stopPolling();
    stopCountdown();
    setStatus("paid");
    showStateOverlay({
      icon: "Done",
      title: t("paymentStateTitlePaid"),
      desc: t("paymentStateDescPaid"),
      primary: {
        label: t("paymentActionDetail"),
        state: "paid",
        onClick: () => {
          window.location.href =
            state.resultUrl ||
            `/result?order_id=${encodeURIComponent(state.orderId)}`;
        },
      },
    });
    // auto redirect after 2.5s
    setTimeout(() => {
      if (state.isOpen) {
        window.location.href =
          state.resultUrl ||
          `/result?order_id=${encodeURIComponent(state.orderId)}`;
      }
    }, 2500);
  }

  function handleExpired() {
    stopPolling();
    stopCountdown();
    setStatus("expired");
    showStateOverlay({
      icon: "⏰",
      title: t("paymentStateTitleExpired"),
      desc: t("paymentStateDescExpired"),
      primary: {
        label: t("paymentActionClose"),
        state: "expired",
        onClick: () => close(true),
      },
    });
  }

  function handleCancelled() {
    stopPolling();
    stopCountdown();
    setStatus("cancelled");
    showStateOverlay({
      icon: "✕",
      title: t("paymentStatusCancelled"),
      desc: t("paymentStateDescError"),
      primary: {
        label: t("paymentActionClose"),
        state: "cancelled",
        onClick: () => close(true),
      },
    });
  }

  function handleSnapError() {
    setStatus("error");
    showStateOverlay({
      icon: "!",
      title: t("paymentStateTitleError"),
      desc: t("paymentStateDescError"),
      primary: {
        label: t("paymentActionOpenMidtrans"),
        state: "error",
        onClick: () => {
          if (state.paymentUrl) {
            window.location.href = state.paymentUrl;
          } else {
            // No fallback URL — try reload embed instead
            hideStateOverlay();
            setStatus("pending");
            tryEmbedSnap();
          }
        },
      },
      secondary: {
        label: t("paymentActionClose"),
        onClick: () => close(true),
      },
    });
  }

  async function tryEmbedSnap() {
    const els = getElements();
    if (!els.snapContainer) return;
    els.snapContainer.innerHTML = "";
    if (els.snapLoading) els.snapLoading.hidden = false;
    try {
      // wait briefly for snap.js to be available
      let tries = 0;
      while (!window.snap && tries < 50) {
        await new Promise((r) => setTimeout(r, 100));
        tries += 1;
      }
      if (!window.snap || typeof window.snap.pay !== "function") {
        throw new Error("Snap unavailable on window object");
      }

      const callbacks = {
        onSuccess: () => {
          console.info("[AEPay] snap onSuccess");
          pollOrderStatus(false);
        },
        onPending: () => {
          console.info("[AEPay] snap onPending");
          pollOrderStatus(false);
        },
        onError: (err) => {
          console.error("[AEPay] snap onError:", err);
          handleSnapError();
        },
        onClose: () => {
          console.info(
            "[AEPay] snap onClose — user dismissed snap UI; our modal stays open",
          );
        },
      };

      // Prefer snap.embed() (newer API, true inline iframe).
      // Fallback to snap.pay(token, {embedId}) (older API that supports embedId).
      // Last resort: snap.pay(token, {}) — opens Midtrans popup overlay (NOT a redirect).
      const hasEmbed = typeof window.snap.embed === "function";
      console.info(
        "[AEPay] snap methods detected — embed:",
        hasEmbed,
        "pay:",
        typeof window.snap.pay,
      );

      if (hasEmbed) {
        window.snap.embed(state.currentSnapToken, {
          embedId: "snap-container",
          ...callbacks,
        });
      } else {
        // Try pay() with embedId (some snap.js versions support this)
        window.snap.pay(state.currentSnapToken, {
          embedId: "snap-container",
          ...callbacks,
        });
      }
      if (els.snapLoading) els.snapLoading.hidden = true;
    } catch (err) {
      console.error("[AEPay] Snap embed failed:", err);
      if (els.snapLoading) els.snapLoading.hidden = true;
      handleSnapError();
    }
  }

  function bindCloseHandlers() {
    const els = getElements();
    if (els.closeBtn && !els.closeBtn.__aeBound) {
      els.closeBtn.addEventListener("click", () => confirmAndClose());
      els.closeBtn.__aeBound = true;
    }
    if (els.exitBtn && !els.exitBtn.__aeBound) {
      els.exitBtn.addEventListener("click", () => confirmAndClose());
      els.exitBtn.__aeBound = true;
    }
    if (els.backdrop && !els.backdrop.__aeBound) {
      els.backdrop.addEventListener("click", () => confirmAndClose());
      els.backdrop.__aeBound = true;
    }
    if (els.refreshBtn && !els.refreshBtn.__aeBound) {
      els.refreshBtn.addEventListener("click", async () => {
        els.refreshBtn.disabled = true;
        const original = els.refreshBtn.textContent;
        els.refreshBtn.textContent = t("paymentCheckingStatus");
        await pollOrderStatus(false);
        els.refreshBtn.textContent = t("paymentRefreshDone");
        setTimeout(() => {
          els.refreshBtn.textContent = original;
          els.refreshBtn.disabled = false;
        }, 1500);
      });
      els.refreshBtn.__aeBound = true;
    }
    if (!window.__aePaymentEsc) {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && state.isOpen) {
          confirmAndClose();
        }
      });
      window.__aePaymentEsc = true;
    }
  }

  function confirmAndClose() {
    // If already final state, close directly
    if (state.finalStatusHandled) {
      close(true);
      return;
    }
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "question",
        title: t("paymentConfirmCloseTitle"),
        text: t("paymentConfirmCloseText"),
        showCancelButton: true,
        confirmButtonColor: "#ffe135",
        cancelButtonColor: "#fafaf5",
        confirmButtonText: t("paymentConfirmCloseYes"),
        cancelButtonText: t("paymentConfirmCloseNo"),
        backdrop: "rgba(12, 74, 110, 0.4)",
      }).then((res) => {
        if (res.isConfirmed) close(true);
      });
    } else {
      close(true);
    }
  }

  function close(force = false) {
    if (!state.isOpen && !force) return;
    state.isOpen = false;
    stopPolling();
    stopCountdown();
    const els = getElements();
    if (els.modal) {
      els.modal.classList.remove("show");
      els.modal.hidden = true;
    }
    if (els.snapContainer) els.snapContainer.innerHTML = "";
    setBodyScrollLock(false);
    hideStateOverlay();
  }

  async function open(opts) {
    if (state.isOpen) return;
    if (!opts || !opts.snapToken || !opts.clientKey) {
      throw new Error("Missing snap token / client key");
    }

    state.isOpen = true;
    state.orderId = opts.orderId;
    state.resultUrl = opts.resultUrl || null;
    state.paymentUrl = opts.paymentUrl || null;
    state.currentSnapToken = opts.snapToken;
    state.finalStatusHandled = false;
    state.countdownLeft = COUNTDOWN_SECONDS;

    const els = getElements();
    if (!els.modal) throw new Error("paymentModal element missing");

    // Populate fields
    if (els.orderId) els.orderId.textContent = opts.orderId || "—";
    if (els.total) els.total.textContent = formatRupiahLocal(opts.totalPrice);
    if (els.gameName) els.gameName.textContent = opts.gameName || "—";
    if (els.productName) els.productName.textContent = opts.productName || "—";

    applyI18n();
    setStatus("pending");
    hideStateOverlay();
    if (els.snapLoading) els.snapLoading.hidden = false;
    if (els.snapContainer) els.snapContainer.innerHTML = "";

    // Show modal
    els.modal.hidden = false;
    requestAnimationFrame(() => {
      els.modal.classList.add("show");
    });
    setBodyScrollLock(true);

    bindCloseHandlers();
    startCountdown();
    startPolling();

    // Load snap.js + embed
    try {
      await loadSnapJs(opts.clientKey, opts.isProduction);
      await tryEmbedSnap();
    } catch (err) {
      console.error("Failed to load/embed snap:", err);
      handleSnapError();
      throw err;
    }
  }

  window.AEPaymentModal = {
    open,
    close,
    refresh: () => pollOrderStatus(false),
  };
  console.info("[AEPay] AEPaymentModal ready ✓");
})();

(function setupResumeOrderHandler() {
  function cleanResumeParamFromUrl() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("resume_order");
      const qs = url.searchParams.toString();
      const cleaned =
        url.origin + url.pathname + (qs ? "?" + qs : "") + url.hash;
      window.history.replaceState({}, document.title, cleaned);
    } catch (_) {
      /* ignore */
    }
  }

  async function tryResume() {
    const params = new URLSearchParams(window.location.search);
    const orderId = (params.get("resume_order") || "").trim();
    if (!orderId) return;

    cleanResumeParamFromUrl();
    console.info("[AEPay] Resume order requested:", orderId);

    if (!window.AEPaymentModal) {
      console.warn(
        "[AEPay] Resume requested but AEPaymentModal missing. Aborting.",
      );
      return;
    }

    try {
      const res = await fetch(
        "/order/" + encodeURIComponent(orderId) + "/resume",
        {
          method: "GET",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        },
      );

      if (res.status === 401) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "warning",
            title: "Belum login",
            text: "Login dulu untuk lanjut bayar order.",
            confirmButtonColor: "#0a0a0a",
            confirmButtonText: "Login",
          }).then(() => {
            window.location.href = "/auth";
          });
        } else {
          window.location.href = "/auth";
        }
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const code = String(data?.code || "");
        const msg = String(data?.message || "Gagal memuat order");

        if (code === "ALREADY_PAID" && data?.resultUrl) {
          window.location.href = data.resultUrl;
          return;
        }

        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: code === "EXPIRED" ? "info" : "error",
            title: "Tidak bisa lanjut bayar",
            text: msg,
            confirmButtonColor: "#0a0a0a",
          });
        }
        return;
      }

      if (!data?.snapToken) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "error",
            title: "Token pembayaran tidak tersedia",
            text: "Server tidak menyertakan snapToken pada response. Coba refresh atau buat order baru.",
            confirmButtonColor: "#0a0a0a",
          });
        }
        return;
      }

      await window.AEPaymentModal.open({
        orderId: data.orderId,
        snapToken: data.snapToken,
        clientKey: data.midtransClientKey,
        isProduction: !!data.midtransIsProduction,
        paymentUrl: data.paymentUrl,
        resultUrl: data.resultUrl,
        gameName: data.game || "",
        productName: data.product || "",
        totalPrice: Number(data.price || 0),
      });
    } catch (err) {
      console.error("[AEPay] Resume order error:", err);
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "error",
          title: "Gagal lanjut bayar",
          text: "Terjadi kesalahan saat memuat order. Coba lagi atau buka dari halaman akun.",
          confirmButtonColor: "#0a0a0a",
        });
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryResume);
  } else {
    // Defer to next tick to ensure AEPaymentModal is ready
    setTimeout(tryResume, 0);
  }
})();

// ============================================================
// AE UI/UX Upgrade v49 — lightweight mobile helpers
// ============================================================
(function setupAEUiUxUpgradeV49() {
  const mqMobile = window.matchMedia
    ? window.matchMedia("(max-width: 640px)")
    : null;

  function isMobile() {
    return mqMobile ? mqMobile.matches : window.innerWidth <= 640;
  }

  function pulsePriceNode(node) {
    if (!node) return;
    node.classList.remove("ae-price-pulse");
    void node.offsetWidth;
    node.classList.add("ae-price-pulse");
    window.setTimeout(() => node.classList.remove("ae-price-pulse"), 420);
  }

  function setupPricePulse() {
    ["previewPrice", "finalPriceText"].forEach((id) => {
      const node = document.getElementById(id);
      if (!node || node.__aePricePulseReady) return;
      node.__aePricePulseReady = true;
      let last = node.textContent;
      const obs = new MutationObserver(() => {
        const next = node.textContent;
        if (next && next !== last) {
          last = next;
          pulsePriceNode(node);
        }
      });
      obs.observe(node, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    });
  }

  function setupStickyCatalogSearch() {
    const source = document.getElementById("gameSearch");
    const store = document.getElementById("store-section");
    if (!source || !store || document.getElementById("aeStickySearch")) return;

    const wrap = document.createElement("div");
    wrap.className = "ae-sticky-search";
    wrap.id = "aeStickySearch";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = `
      <span class="ae-sticky-search-icon" aria-hidden="true">Search</span>
      <input type="text" id="aeStickySearchInput" placeholder="Cari game cepat..." autocomplete="off" aria-label="Cari game cepat" />
      <button type="button" class="ae-sticky-search-clear" aria-label="Bersihkan pencarian">×</button>
    `;
    document.body.appendChild(wrap);

    const input = wrap.querySelector("input");
    const clear = wrap.querySelector("button");

    let quickSearchDismissed = false;

    const syncFromSource = () => {
      if (input && input.value !== source.value) input.value = source.value;
    };

    source.addEventListener("input", syncFromSource);
    input.addEventListener("input", () => {
      source.value = input.value;
      if (typeof window.searchGame === "function") window.searchGame();
      else source.dispatchEvent(new Event("keyup", { bubbles: true }));
    });
    clear.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      quickSearchDismissed = true;

      input.value = "";
      source.value = "";

      if (typeof window.searchGame === "function") {
        window.searchGame();
      } else {
        source.dispatchEvent(new Event("keyup", { bubbles: true }));
      }

      input.blur();
      source.blur();

      wrap.classList.remove("show");
      wrap.setAttribute("aria-hidden", "true");
    });

    const updateVisibility = () => {
      if (quickSearchDismissed) {
        wrap.classList.remove("show");
        wrap.setAttribute("aria-hidden", "true");
        return;
      }

      if (!isMobile()) {
        wrap.classList.remove("show");
        wrap.setAttribute("aria-hidden", "true");
        return;
      }

      const rect = store.getBoundingClientRect();
      const shouldShow = rect.top < 52 && rect.bottom > 220;
      wrap.classList.toggle("show", shouldShow);
      wrap.setAttribute("aria-hidden", shouldShow ? "false" : "true");

      if (shouldShow) syncFromSource();
    };

    let rafId = 0;
    const scheduleUpdateVisibility = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateVisibility();
      });
    };

    window.addEventListener("scroll", scheduleUpdateVisibility, {
      passive: true,
    });
    window.addEventListener("resize", scheduleUpdateVisibility, {
      passive: true,
    });
    updateVisibility();
  }

  function setupPromoSwipe() {
    const slider = document.getElementById("promoSlider");
    if (!slider || slider.__aeSwipeReady) return;
    slider.__aeSwipeReady = true;
    let startX = 0;
    let startY = 0;
    let tracking = false;

    slider.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.touches && event.touches[0];
        if (!touch) return;
        startX = touch.clientX;
        startY = touch.clientY;
        tracking = true;
      },
      { passive: true },
    );

    slider.addEventListener(
      "touchend",
      (event) => {
        if (!tracking) return;
        tracking = false;
        const touch = event.changedTouches && event.changedTouches[0];
        if (!touch) return;
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
        if (dx < 0 && typeof window.nextSlide === "function")
          window.nextSlide();
        if (dx > 0 && typeof window.prevSlide === "function")
          window.prevSlide();
      },
      { passive: true },
    );
  }

  function setupBottomNavIndicator() {
    const nav = document.getElementById("bottomNav");
    if (!nav) return;
    const setIndex = () => {
      const items = Array.from(nav.querySelectorAll(".bottom-nav-item"));
      const active =
        nav.querySelector(".bottom-nav-item.is-active") || items[0];
      const index = Math.max(0, items.indexOf(active));
      nav.style.setProperty("--ae-nav-index", String(index));
    };
    nav.addEventListener("click", () => window.setTimeout(setIndex, 80));
    const obs = new MutationObserver(setIndex);
    nav.querySelectorAll(".bottom-nav-item").forEach((item) => {
      obs.observe(item, { attributes: true, attributeFilter: ["class"] });
    });
    setIndex();
  }

  function setupOrderModalPolish() {
    const modal = document.getElementById("orderModal");
    if (!modal || modal.__aePolishReady) return;
    modal.__aePolishReady = true;
    const obs = new MutationObserver(() => {
      if (modal.classList.contains("show")) {
        const card = modal.querySelector(".order-modal-card");
        if (card) {
          card.classList.remove("ae-soft-enter");
          void card.offsetWidth;
          card.classList.add("ae-soft-enter");
        }
      }
    });
    obs.observe(modal, { attributes: true, attributeFilter: ["class"] });
  }

  function setupLightCardStagger() {
    if (isMobile()) return;
    const grid = document.getElementById("gameGrid");
    if (!grid || grid.__aeStaggerReady) return;
    grid.__aeStaggerReady = true;
    const obs = new MutationObserver(() => {
      if (isMobile()) return;
      Array.from(grid.querySelectorAll(".game-card"))
        .slice(0, 12)
        .forEach((card, index) => {
          if (card.__aeEntered) return;
          card.__aeEntered = true;
          card.style.animationDelay = `${Math.min(index * 18, 180)}ms`;
          card.classList.add("ae-soft-enter");
        });
    });
    obs.observe(grid, { childList: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupPricePulse();
    // Disabled in Nothing Bento BW v3: the floating search was covering catalog content on mobile.
    // The main catalog search inside the toolbar remains active.
    // setupStickyCatalogSearch();
    setupPromoSwipe();
    setupBottomNavIndicator();
    setupOrderModalPolish();
    setupLightCardStagger();
  });
})();
