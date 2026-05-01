const translations = {
  id: {
    selectProduct: "Pilih Produk",
    fillDetails: "Lengkapi data di bawah ini untuk memulai pesanan.",
    selectGame: "1. Pilih Game",
    buyNow: "Beli Sekarang 🌊",
    processing: "Memproses...",
    loadingWebsite: "Memuat Website...",
    howToBuy: "Cara Beli 📖",
    searchGamePlaceholder: "Cari nama game (contoh: PUBG)...",
    processingOrder: "Memproses pesanan...",
    heroTitle: "Arungi petualangan barumu dengan top-up yang lebih mudah",
    heroDesc:
      "Temukan game favoritmu, pilih produk, dan selesaikan pembayaran setenang ombak di lautan.",
    totalPayment: "Total Pembayaran",
    previewEmpty: "Produk belum dipilih",
    previewWait: "Silakan pilih platform dan produk",
    guideTitle: "Panduan Top-Up ⛩️",
    guideStep1: "Pilih Game: Cari dan klik game yang kamu inginkan.",
    guideStep2:
      "Tentukan Produk: Pilih tipe device (iOS/Android) dan produknya.",
    guideStep3: "Isi Data: Masukkan nickname/ID dan nomor kontak dengan benar.",
    guideStep4: "Checkout: Klik 'Beli Sekarang' dan selesaikan pembayaran.",
    guideStep5: "Selesai! Game akan langsung dikirim setelah sukses.",
    guideOk: "Mengerti! 🌊",
    loginBtn: "Masuk / Daftar",
    navHome: "Beranda",
    navStore: "Katalog Game",
    navGuide: "Cara Beli",
    filterAll: "Semua",
    filterMobile: "Mobile",
    filterPC: "PC Games",
    filterVoucher: "Voucher",
  },
  en: {
    selectProduct: "Select Product",
    fillDetails: "Fill in the details below to start your order.",
    selectGame: "1. Select Game",
    buyNow: "Buy Now 🌊",
    processing: "Processing...",
    loadingWebsite: "Loading Website...",
    howToBuy: "How to Buy 📖",
    searchGamePlaceholder: "Search game name (e.g. PUBG)...",
    processingOrder: "Processing order...",
    heroTitle: "Start your new adventure with easier top-ups",
    heroDesc:
      "Find your favorite game, choose a product, and complete payment smoothly like ocean waves.",
    totalPayment: "Total Payment",
    previewEmpty: "No product selected",
    previewWait: "Please select platform and product",
    guideTitle: "Top-Up Guide ⛩️",
    guideStep1: "Select Game: Find and choose your desired game.",
    guideStep2: "Choose Product: Select device type (iOS/Android) and product.",
    guideStep3: "Fill Data: Enter your nickname/ID and contact correctly.",
    guideStep4: "Checkout: Click 'Buy Now' and complete the payment.",
    guideStep5: "Done! Your game will be delivered instantly after success.",
    guideOk: "Got it! 🌊",
    loginBtn: "Login / Register",
    navHome: "Home",
    navStore: "Game Catalog",
    navGuide: "How to Buy",
    filterAll: "All",
    filterMobile: "Mobile",
    filterPC: "PC Games",
    filterVoucher: "Voucher",
  },
};

let currentLanguage = localStorage.getItem("language") || "id";

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("language", lang);

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
  const btnId = document.getElementById("btn-id");
  const btnEn = document.getElementById("btn-en");

  if (btnId && btnEn) {
    btnId.classList.remove("active");
    btnEn.classList.remove("active");
    document.getElementById("btn-" + lang).classList.add("active");
  }
}
let allProducts = [];

const gameImages = {
  "PUBG Mobile":
    "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
  "Pubg M":
    "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
  "Mobile Legends":
    "https://play-lh.googleusercontent.com/7oS5oPpR2z6kV1U1vVZrXW6Y7n4Zs3l7J9v0V0p0m8V0Q0h3R0Z0J0U0R0I0M0Y=s512",
  "Free Fire":
    "https://cdn2.unrealengine.com/egs-garena-freefire-garena-s1-2560x1440-0d1cfd2e3c8d.jpg",
  "Delta Force":
    "https://cdn.cloudflare.steamstatic.com/steam/apps/2507950/header.jpg",
};

const fallbackImage = "https://via.placeholder.com/400x220?text=Game";

let selectedGame = "";

const gameGrid = document.getElementById("gameGrid");
const brandSelect = document.getElementById("brand");
const productSelect = document.getElementById("product");
const buyBtn = document.getElementById("buyBtn");
const loadingText = document.getElementById("loading");

function formatRupiah(num) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

function setLoading(isLoading) {
  loadingText.style.display = isLoading ? "block" : "none";
  buyBtn.disabled = isLoading;
  buyBtn.innerText = isLoading
    ? translations[currentLanguage].processing
    : translations[currentLanguage].buyNow;
}

async function loadAllProducts() {
  try {
    const res = await fetch("/public-products");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Stok Kosong",
        text: "Produk belum tersedia saat ini.",
        confirmButtonColor: "#0ea5e9",
      });
      return;
    }

    allProducts = data;

    const uniqueGames = [...new Set(allProducts.map((item) => item.game))];
    selectedGame = uniqueGames[0] || "";

    renderGames();
    loadBrands();
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Gagal memuat daftar produk dari server.",
      confirmButtonColor: "#fb7185",
    });
  }
}

function renderGames() {
  gameGrid.innerHTML = "";

  const uniqueGames = [...new Set(allProducts.map((item) => item.game))];

  uniqueGames.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";

    const imageUrl = gameImages[game] || fallbackImage;

    card.innerHTML = `
            <img src="${imageUrl}" alt="${game}" onerror="this.src='${fallbackImage}'">
            <span>${game}</span>
        `;

    if (game === selectedGame) {
      card.classList.add("active");
    }

    card.onclick = () => {
      openOrderModal(game);
    };

    gameGrid.appendChild(card);
  });
}
function openOrderModal(game) {
  selectedGame = game;
  renderGames();
  loadBrands();

  const modal = document.getElementById("orderModal");
  const title = document.getElementById("modalGameTitle");

  if (title) {
    title.innerText = game;
  }

  if (modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
}

function closeOrderModal() {
  const modal = document.getElementById("orderModal");

  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }
}
function loadBrands() {
  const brands = [
    ...new Set(
      allProducts
        .filter((item) => item.game === selectedGame)
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

  loadDurations();
}

function loadDurations() {
  const filteredProducts = allProducts.filter(
    (item) => item.game === selectedGame && item.brand === brandSelect.value,
  );

  productSelect.innerHTML = "";

  filteredProducts.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.duration} - ${formatRupiah(item.price)}`;
    productSelect.appendChild(option);
  });

  updatePreview();
}

function updatePreview() {
  const selectedProduct = allProducts.find(
    (item) => String(item.id) === String(productSelect.value),
  );

  if (!selectedProduct) {
    document.getElementById("previewGame").innerText =
      translations[currentLanguage].previewEmpty;
    document.getElementById("previewProduct").innerText =
      translations[currentLanguage].previewWait;
    document.getElementById("previewPrice").innerText = "Rp 0";
    return;
  }

  document.getElementById("previewGame").innerText = selectedProduct.game;
  document.getElementById("previewProduct").innerText =
    `${selectedProduct.brand} - ${selectedProduct.duration}`;
  document.getElementById("previewPrice").innerText = formatRupiah(
    selectedProduct.price,
  );
}

brandSelect.addEventListener("change", loadDurations);
productSelect.addEventListener("change", updatePreview);

async function buy() {
  const name = document.getElementById("name").value.trim();
  const contact = document.getElementById("contact").value.trim();

  const selectedProduct = allProducts.find(
    (item) => String(item.id) === String(productSelect.value),
  );

  if (!name || !contact) {
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Isi nama player dan kontak kamu dulu ya!",
      confirmButtonColor: "#0ea5e9",
    });
    return;
  }
  if (!selectedProduct) {
    Swal.fire({
      icon: "info",
      title: "Pilih Produk",
      text: "Pilih game dan durasi produknya dulu.",
      confirmButtonColor: "#0ea5e9",
    });
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: selectedProduct.id,
        name,
        contact,
      }),
    });

    const data = await res.json();
    if (res.status === 401) {
      Swal.fire({
        icon: "warning",
        title: "Login Dulu",
        text: data.message || "Kamu harus login dulu sebelum order",
        confirmButtonColor: "#0ea5e9",
      }).then(() => {
        window.location.href = data.redirectUrl || "/auth";
      });
      return;
    }

    if (data.paymentUrl) {
      window.location.href = data.paymentUrl;
      return;
    }

    if (data.resultUrl) {
      window.location.href = data.resultUrl;
      return;
    }

    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: data.message || "Gagal membuat pembayaran",
      confirmButtonColor: "#fb7185",
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Terjadi error server",
      confirmButtonColor: "#fb7185",
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
      userMenu.innerHTML = `
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <div class="auth-btn" style="background: rgba(255,255,255,0.8); color: #0284c7; cursor: default; box-shadow: none; border: 1px solid #bae6fd;">
            👤 Halo, <strong style="margin-left: 4px;">${data.username}</strong>
        </div>
        <a href="/account.html" class="auth-btn" style="background: rgba(255,255,255,0.9); color: #0284c7; border: 1px solid #bae6fd; padding: 8px 12px; text-decoration: none;">
            Akun Saya
        </a>
        <button onclick="logoutUser()" class="auth-btn" style="background: linear-gradient(135deg, #fb7185, #e11d48); border: none; padding: 8px 12px;">
            Keluar
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
    confirmButtonColor: "#fb7185",
    cancelButtonColor: "#475569",
    confirmButtonText: "Ya, Keluar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await fetch("/user-logout", { method: "POST" });
      window.location.reload(); // Refresh halaman agar kembali jadi tombol Masuk
    }
  });
}

// Jalankan fungsi saat halaman beranda pertama kali dibuka
document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
});
// --------------------------------

// --- AUTO SLIDER BANNER ---
let currentSlide = 0;
function nextSlide() {
  const slides = document.querySelectorAll(".promo-slide");
  if (slides.length === 0) return;
  slides[currentSlide].classList.remove("active");
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add("active");
}
setInterval(nextSlide, 5000);

// --- SOCIAL PROOF SIMULATOR ---
const buyerNames = ["Budi", "Andi", "Siska", "Rian", "Wati", "Reza", "Dewi"];
const purchaseGames = [
  "PUBG Mobile",
  "Mobile Legends",
  "Free Fire",
  "Delta Force",
];

function showSocialProof() {
  const sp = document.getElementById("social-proof");
  if (!sp) return;

  const name = buyerNames[Math.floor(Math.random() * buyerNames.length)];
  const game = purchaseGames[Math.floor(Math.random() * purchaseGames.length)];

  sp.innerHTML = `🚀 <div style="font-size: 13px;"><b>${name}</b> baru saja membeli <b>${game}</b></div>`;
  sp.classList.add("show");

  setTimeout(() => sp.classList.remove("show"), 5000);
}
// Munculkan setiap 20 detik
setInterval(showSocialProof, 20000);

// --- FILTER CATEGORY ---
// --- FILTER CATEGORY ---
function filterCategory(cat, btnElement) {
  document
    .querySelectorAll(".pill")
    .forEach((btn) => btn.classList.remove("active"));

  if (btnElement) btnElement.classList.add("active");

  const cards = document.querySelectorAll(".game-card");

  cards.forEach((card) => {
    const name = card.querySelector("span").innerText.toLowerCase();

    if (cat === "all") {
      card.style.display = "flex";
      return;
    }

    card.style.display = name.includes(cat.toLowerCase()) ? "flex" : "none";
  });
}
setLanguage(currentLanguage);
loadAllProducts();
