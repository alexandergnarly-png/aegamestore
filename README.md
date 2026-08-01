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
