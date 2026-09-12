# AE Game Store

Toko digital key berbasis Express, PostgreSQL, dan Midtrans. Render menjalankan
`server.js` dari root repository.

## Struktur

```text
.
|-- server.js                     # Entry point Express dan route API
|-- server/                       # Database, migrasi, dan utilitas backend
|-- public/                       # Frontend production yang disajikan Express
|-- views/                        # Halaman admin
|-- tests/                        # Test backend
|-- docs/integrations/            # Dokumentasi layanan pihak ketiga
|-- prototypes/next-storefront/   # Eksperimen Next.js, tidak dipakai Render
|-- private/                      # Credential/data lokal, diabaikan Git
|-- package.json                  # Dependency dan command production
`-- .env                          # Environment lokal, diabaikan Git
```

## Menjalankan production

```bash
npm install
npm start
```

Frontend production berada di `public/`. Database memakai `DATABASE_URL`, dan
push ke branch `main` memicu deploy Render.

## Prototype Next.js

```bash
cd prototypes/next-storefront
npm install
npm run dev
```

## Keamanan

Jangan commit `.env`, backup code, API key, database lokal, atau private key.
File lokal tersebut disimpan di `private/` yang diabaikan Git.

### Wajib di Render

- Pertahankan `APP_BASE_URL=https://aegamestore.com`.
- Isi `GAME_KEY_ENCRYPTION_SECRET` dengan nilai acak minimal 32 karakter yang berbeda dari `JWT_SECRET`. Setelah deploy, server akan memigrasikan key lama ke kunci khusus ini.
- Gunakan Internal Database URL Render. Untuk URL eksternal, jangan set `DATABASE_SSL_REJECT_UNAUTHORIZED=false`.
- Jangan rotasi `JWT_SECRET` tanpa migrasi key game; secret itu juga menurunkan kunci enkripsi data game key.
- Jalankan `npm audit --omit=dev` setelah mengubah dependency dan sebelum deploy.
- Jika secret pernah tampil di chat, log, atau commit, revoke dan ganti dari dashboard penyedia; jangan hanya menghapus teksnya.

### Tampilan harga IDR / USD

Nilai berikut memiliki default aman di aplikasi, tetapi bisa diubah di Environment Render bila tarif kontrak Midtrans berbeda:

```text
USD_IDR_RATE=18000
PAYMENT_VAT_RATE=0.11
MIDTRANS_QRIS_FEE_RATE=0.007
```

Harga USD hanya estimasi tampilan. Pembayaran QRIS Midtrans tetap dalam IDR. Fee dan pajaknya dihitung dengan gross-up agar nilai bersih produk tidak berkurang.

### Pembayaran USDT internasional

Jalur ini khusus buyer internasional dan diverifikasi manual oleh owner sebelum key
dikirim. Tambahkan ke Environment Render:

```text
BINANCE_PAY_UID=uid_binance_milik_toko
TELEGRAM_BOT_TOKEN=token_dari_BotFather
TELEGRAM_CHAT_ID=chat_id_owner
```

Jika `BINANCE_PAY_UID` kosong, opsi USDT otomatis nonaktif. Buyer mengirim USDT
antar-akun melalui Binance Pay lalu memasukkan Transaction ID. Bot Telegram hanya
memberi notifikasi; admin tetap wajib memeriksa nominal dan Transaction ID di
Binance lalu menekan **Konfirmasi Bayar** di halaman Order. Jangan pernah memberi
bot izin withdrawal atau menyimpan private key/seed phrase di Render.

### Supplier VIPStore

Tambahkan ke environment lokal dan Render:

```text
VIPSTORE_API_BASE_URL=https://vipstore.web.id/backend/api/reseller
VIPSTORE_API_KEY=isi_di_environment_server
VIPSTORE_API_SECRET=isi_di_environment_server
VIPSTORE_USD_IDR_RATE=17566
```

Kurs di atas hanya contoh, sesuaikan dengan kebijakan toko. Client VIPStore menggunakan
HMAC-SHA256 sesuai dokumentasi. Pembelian memakai `product_id` dan `qty`;
POST tidak diulang otomatis ketika hasilnya belum diketahui. Tidak ada webhook supplier.

Jalankan `node scripts/check-vipstore.js` dari Render Shell untuk memeriksa balance dan
catalog tanpa melakukan pembelian atau mencetak secret. Jika muncul
`VIPSTORE_SECURITY_CHALLENGE`, kirim hasil diagnosis ke admin VIPStore agar path
`/backend/api/reseller/*` dapat diakses server dengan autentikasi API tanpa browser challenge.
Cache admin hanya untuk pencarian, tidak dipakai sebagai bukti sinkronisasi berhasil.
