# AE Game Store

AE Game Store adalah toko digital key berbasis Express, PostgreSQL, dan Midtrans.
Render menjalankan entrypoint `server.js` dari root repository.

## Struktur utama

```text
.
├─ server.js                 # Entry point Express dan route API
├─ server/                   # Modul backend pendukung
│  ├─ database.js            # PostgreSQL pool
│  ├─ database-migrations.js # Migrasi schema saat startup
│  └─ order-utils.js          # Kalkulasi quantity, bulk, dan harga order
├─ public/                   # Halaman dan asset yang disajikan Express
│  ├─ index.html              # Storefront
│  ├─ account.html            # Akun, badge, dan AE Credit
│  ├─ user-auth.html          # Login/register buyer
│  ├─ admin-login.html        # Login admin
│  ├─ script.js               # Interaksi storefront dan checkout
│  ├─ style.css               # Style storefront
│  ├─ images/games/           # Cover game
│  └─ qris.png                # QRIS top up AE Credit
├─ views/
│  └─ admin.html               # Admin Panel
├─ frontend/                  # Prototype Next.js terpisah; belum dipakai Render production
├─ package.json               # Dependency dan command backend
└─ .env                       # Secret lokal (tidak boleh di-commit)
```

## Alur kerja singkat

- Backend: `npm start` atau `node server.js`
- Frontend production saat ini: Express menyajikan folder `public/`
- Database: PostgreSQL melalui `DATABASE_URL`
- Deploy: push ke branch `main`, lalu Render melakukan deploy otomatis

## Catatan keamanan

Secret seperti `.env`, backup code, API key, dan credential database harus tetap berada di environment lokal/Render dan tidak dimasukkan ke Git.
