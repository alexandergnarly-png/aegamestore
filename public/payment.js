/* Dedicated host for the official Snap popup; never confirms an order client-side. */
(async function () {
  const orderId = new URLSearchParams(location.search).get("order_id");
  const status = document.getElementById("status");
  const pay = document.getElementById("pay");
  const detail = document.getElementById("detail");
  if (!orderId) {
    status.textContent = "Order tidak ditemukan. Buka pembayaran dari halaman akun.";
    return;
  }
  const resultUrl = "/result?order_id=" + encodeURIComponent(orderId);
  detail.href = resultUrl;
  document.getElementById("orderId").textContent = orderId;
  try {
    const response = await fetch("/order/" + encodeURIComponent(orderId) + "/resume", {
      credentials: "same-origin", cache: "no-store", signal: AbortSignal.timeout(20000),
    });
    const data = await response.json();
    if (data.code === "ALREADY_PAID") { location.replace(resultUrl); return; }
    if (response.status === 401) {
      status.textContent = "Login kembali untuk melanjutkan pembayaran.";
      detail.href = "/auth";
      detail.textContent = "Login";
      return;
    }
    if (!response.ok || !data.snapToken || !data.midtransClientKey) {
      status.textContent = response.status === 410
        ? "Order sudah kedaluwarsa atau dibatalkan. Silakan buat order baru."
        : "Pembayaran belum dapat dibuka. Cek detail order atau coba lagi nanti.";
      return;
    }
    document.getElementById("amount").textContent = new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", maximumFractionDigits: 0,
    }).format(Number(data.price));
    document.getElementById("product").textContent = [data.game, data.product].filter(Boolean).join(" · ");
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = data.midtransIsProduction
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
      script.dataset.clientKey = data.midtransClientKey;
      const timer = setTimeout(() => reject(new Error("Payment script timeout")), 20000);
      script.onload = () => { clearTimeout(timer); resolve(); };
      script.onerror = () => { clearTimeout(timer); reject(new Error("Payment script unavailable")); };
      document.head.appendChild(script);
    });
    function openPayment() {
      pay.disabled = true;
      status.textContent = "Pembayaran terbuka di Midtrans.";
      try {
        window.snap.pay(data.snapToken, {
          // The result page verifies server state; callbacks are not proof of payment.
          onSuccess: () => location.assign(resultUrl),
          onPending: () => location.assign(resultUrl),
          onError: () => {
            pay.disabled = false;
            status.textContent = "Pembayaran belum berhasil. Cek detail order sebelum mencoba lagi.";
          },
          onClose: () => {
            pay.disabled = false;
            status.textContent = "Popup ditutup. Kamu bisa melanjutkan pembayaran order yang sama.";
            pay.focus();
          },
        });
      } catch (_) {
        pay.disabled = false;
        status.textContent = "Popup belum dapat dibuka. Silakan coba lagi.";
      }
    }
    pay.addEventListener("click", openPayment);
    openPayment();
  } catch (_) {
    status.textContent = "Koneksi pembayaran belum tersedia. Muat ulang halaman untuk mencoba lagi.";
  }
})();
