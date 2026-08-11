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

- Isi `ADMIN_TOTP_SECRET` dengan secret Base32, lalu tambahkan secret yang sama ke Google/Microsoft Authenticator. Buat secret dengan:

  ```bash
  node -e "let b=require('crypto').randomBytes(20),a='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',x=0,n=0,o='';for(const c of b){x=x*256+c;n+=8;while(n>=5){n-=5;o+=a[(x>>n)&31];x&=(1<<n)-1}}if(n)o+=a[(x<<(5-n))&31];console.log(o)"
  ```

- Pertahankan `APP_BASE_URL=https://aegamestore.com`.
- Gunakan Internal Database URL Render. Untuk URL eksternal, jangan set `DATABASE_SSL_REJECT_UNAUTHORIZED=false`.
- Jangan rotasi `JWT_SECRET` tanpa migrasi key game; secret itu juga menurunkan kunci enkripsi data game key.

### Harga pembayaran internasional

Nilai berikut memiliki default aman di aplikasi, tetapi bisa diubah di Environment Render bila tarif kontrak Midtrans berbeda:

```text
USD_IDR_RATE=18000
PAYMENT_VAT_RATE=0.11
MIDTRANS_QRIS_FEE_RATE=0.007
MIDTRANS_CARD_FEE_RATE=0.029
MIDTRANS_CARD_FIXED_FEE=2000
```

Harga USD hanya estimasi tampilan. Charge Midtrans tetap dalam IDR. Fee dan pajaknya dihitung dengan gross-up agar nilai bersih produk tidak berkurang.

### Supplier CHEATGAME

Tambahkan ke environment lokal dan Render:

```text
CHEATGAME_API_KEY=key_baru_yang_tidak_pernah_dikirim_ke_chat
CHEATGAME_WEBHOOK_SECRET=secret_webhook_dari_dashboard
CHEATGAME_CUSTOMER_EMAIL=email_fallback_jika_kontak_buyer_bukan_email
```

Atur Webhook URL ke `https://aegamestore.com/api/webhooks/cheatgame`, aktifkan event
`order.success`, lalu gunakan **Send Test**. API key yang pernah terkirim melalui chat
harus di-revoke dan tidak boleh dipakai kembali.
