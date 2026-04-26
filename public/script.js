let allProducts = [];

const gameImages = {
    "PUBG Mobile": "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
    "Pubg M": "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
    "Mobile Legends": "https://play-lh.googleusercontent.com/7oS5oPpR2z6kV1U1vVZrXW6Y7n4Zs3l7J9v0V0p0m8V0Q0h3R0Z0J0U0R0I0M0Y=s512",
    "Free Fire": "https://cdn2.unrealengine.com/egs-garena-freefire-garena-s1-2560x1440-0d1cfd2e3c8d.jpg",
    "Delta Force": "https://cdn.cloudflare.steamstatic.com/steam/apps/2507950/header.jpg"
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
    buyBtn.innerText = isLoading ? "Memproses..." : "Beli Sekarang 🌊";
}

async function loadAllProducts() {
    try {
        const res = await fetch("/public-products");
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            Swal.fire({ icon: 'info', title: 'Stok Kosong', text: 'Produk belum tersedia saat ini.', confirmButtonColor: '#0ea5e9' });
            return;
        }

        allProducts = data;

        const uniqueGames = [...new Set(allProducts.map(item => item.game))];
        selectedGame = uniqueGames[0] || "";

        renderGames();
        loadBrands();
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'Gagal memuat daftar produk dari server.', confirmButtonColor: '#fb7185' });
    }
}

function renderGames() {
    gameGrid.innerHTML = "";

    const uniqueGames = [...new Set(allProducts.map(item => item.game))];

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
            selectedGame = game;
            renderGames();
            loadBrands();
        };

        gameGrid.appendChild(card);
    });
}

function loadBrands() {
    const brands = [
        ...new Set(
            allProducts
                .filter(item => item.game === selectedGame)
                .map(item => item.brand)
        )
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
        item => item.game === selectedGame && item.brand === brandSelect.value
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
        item => String(item.id) === String(productSelect.value)
    );

    if (!selectedProduct) {
        document.getElementById("previewGame").innerText = "Produk belum dipilih";
        document.getElementById("previewProduct").innerText = "Silakan pilih brand dan durasi";
        document.getElementById("previewPrice").innerText = "Rp 0";
        return;
    }

    document.getElementById("previewGame").innerText = selectedProduct.game;
    document.getElementById("previewProduct").innerText = `${selectedProduct.brand} - ${selectedProduct.duration}`;
    document.getElementById("previewPrice").innerText = formatRupiah(selectedProduct.price);
}

brandSelect.addEventListener("change", loadDurations);
productSelect.addEventListener("change", updatePreview);

async function buy() {
    const name = document.getElementById("name").value.trim();
    const contact = document.getElementById("contact").value.trim();

    const selectedProduct = allProducts.find(
        item => String(item.id) === String(productSelect.value)
    );

    if (!name || !contact) {
        Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Isi nama player dan kontak kamu dulu ya!', confirmButtonColor: '#0ea5e9' });
        return;
    }
    if (!selectedProduct) {
        Swal.fire({ icon: 'info', title: 'Pilih Produk', text: 'Pilih game dan durasi produknya dulu.', confirmButtonColor: '#0ea5e9' });
        return;
    }

    setLoading(true);

    try {
        const res = await fetch("/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                product_id: selectedProduct.id,
                name,
                contact
            })
        });

        const data = await res.json();

        if (data.paymentUrl) {
            window.location.href = data.paymentUrl;
            return;
        }

        if (data.resultUrl) {
            window.location.href = data.resultUrl;
            return;
        }

        Swal.fire({ icon: 'error', title: 'Gagal', text: data.message || "Gagal membuat pembayaran", confirmButtonColor: '#fb7185' });
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Terjadi error server', confirmButtonColor: '#fb7185' });
    }

    setLoading(false);
}

loadAllProducts();