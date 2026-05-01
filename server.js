const db = require("./database");
const express = require("express");
const midtransClient = require("midtrans-client");
const path = require("path");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const app = express();
app.set("trust proxy", 1);
const port = process.env.PORT || 3000;
const isMidtransProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const jwtSecret = String(process.env.JWT_SECRET || "").trim();

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET wajib diisi minimal 32 karakter");
}

const snap = new midtransClient.Snap({
  isProduction: isMidtransProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

db.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("DB ERROR:", err);
  } else {
    console.log("DB Connected:", res.rows[0]);
  }
});

async function query(sql, params = []) {
  return db.query(sql, params);
}

function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function deleteExpiredAdminSessions() {
  try {
    await query("DELETE FROM admin_sessions WHERE expires_at <= $1", [
      new Date().toISOString(),
    ]);
  } catch (err) {
    console.error("ERROR DELETE EXPIRED ADMIN SESSIONS:", err);
  }
}

db.query(
  `
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    game TEXT NOT NULL,
    brand TEXT NOT NULL,
    duration TEXT NOT NULL,
    price INTEGER NOT NULL,
    active INTEGER DEFAULT 1,
    created_at TEXT
  )
`,
  (err) => {
    if (err) {
      console.error("CREATE TABLE products ERROR:", err);
    } else {
      console.log("Table products ready");
    }
  },
);

db.query(
  `
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    product_id INTEGER,
    access_token TEXT,
    name TEXT,
    contact TEXT,
    game TEXT,
    product TEXT,
    price INTEGER,
    payment_status TEXT,
    delivery_status TEXT,
    gameKey TEXT,
    created_at TEXT
  )
`,
  (err) => {
    if (err) {
      console.error("CREATE TABLE orders ERROR:", err);
    } else {
      console.log("Table orders ready");
    }
  },
);

db.query(
  `
  CREATE TABLE IF NOT EXISTS keys (
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    key TEXT,
    used INTEGER DEFAULT 0
  )
`,
  (err) => {
    if (err) {
      console.error("CREATE TABLE keys ERROR:", err);
    } else {
      console.log("Table keys ready");
    }
  },
);

db.query(
  `
  CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    session_token TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )
    
`,
  (err) => {
    if (err) {
      console.error("CREATE TABLE admin_sessions ERROR:", err);
    } else {
      console.log("Table admin_sessions ready");
    }
  },
);

db.query(
  `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`,
  (err) => {
    if (err) {
      console.error("CREATE TABLE users ERROR:", err);
    } else {
      console.log("Table users ready");
    }
  },
);

db.query(`CREATE INDEX IF NOT EXISTS idx_orders_id ON orders(id)`);
db.query(
  `CREATE INDEX IF NOT EXISTS idx_keys_product_used ON keys(product_id, used)`,
);
db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER`);
db.query(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`);
db.query(
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_price INTEGER DEFAULT 0`,
);
db.query(
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0`,
);
db.query(
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_fee INTEGER DEFAULT 0`,
);
db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code TEXT`);

db.query(
  `
  CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    game_name TEXT,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    active INTEGER DEFAULT 1,
    expires_at TEXT,
    created_at TEXT NOT NULL
  )
`,
  (err) => {
    if (err) {
      console.error("CREATE TABLE vouchers ERROR:", err);
    } else {
      console.log("Table vouchers ready");
    }
  },
);

// limit umum (global)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 100, // max 100 request per menit per IP
  message: {
    message: "Terlalu banyak request, coba lagi nanti",
  },
});

// limit login admin (ketat)
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Terlalu banyak percobaan login, coba lagi nanti",
    });
  },
});

// limit create order
const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // max 10 order per menit
  message: {
    message: "Terlalu banyak order, coba lagi nanti",
  },
});

const orderCheckLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    message: "Terlalu banyak cek order, coba lagi nanti",
  },
});

const userAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    message: "Terlalu banyak percobaan, coba lagi 15 menit nanti",
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    message: "Terlalu banyak daftar akun dari koneksi ini, coba lagi nanti",
  },
});

async function isAdminLoggedIn(req) {
  const sessionToken = String(req.cookies.admin_auth || "").trim();

  if (!sessionToken) {
    return false;
  }

  try {
    const result = await query(
      `SELECT * FROM admin_sessions
             WHERE session_token = $1
             AND expires_at > $2
             LIMIT 1`,
      [sessionToken, new Date().toISOString()],
    );

    return result.rows.length > 0;
  } catch (err) {
    console.error("ERROR CHECK ADMIN SESSION:", err);
    return false;
  }
}
function getLoggedInUserFromRequest(req) {
  const token = req.cookies.user_auth;

  if (!token) return null;

  try {
    return jwt.verify(token, jwtSecret);
  } catch (err) {
    return null;
  }
}
function calculateQrisGrossPrice(netPrice) {
  const qrisFeeRate = 0.007;
  const ppnRate = 0.11;
  const totalFeeRate = qrisFeeRate * (1 + ppnRate);

  return Math.ceil(Number(netPrice) / (1 - totalFeeRate));
}

function normalizeVoucherCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase();
}

async function getVoucherDiscount({ gameName, voucherCode, productPrice }) {
  const cleanCode = normalizeVoucherCode(voucherCode);

  if (!cleanCode) {
    return {
      valid: true,
      code: "",
      discountAmount: 0,
      message: "",
    };
  }

  if (!/^[A-Z0-9_-]{3,30}$/.test(cleanCode)) {
    return {
      valid: false,
      message: "Format kode voucher tidak valid",
    };
  }

  const voucherResult = await query(
    `SELECT *
     FROM vouchers
     WHERE code = $1
       AND active = 1
     LIMIT 1`,
    [cleanCode],
  );

  const voucher = voucherResult.rows[0];

  if (!voucher) {
    return {
      valid: false,
      message: "Kode voucher tidak ditemukan atau tidak aktif",
    };
  }

  const targetGame = String(voucher.game_name || "")
    .trim()
    .toLowerCase();
  const currentGame = String(gameName || "")
    .trim()
    .toLowerCase();

  if (targetGame && targetGame !== currentGame) {
    return {
      valid: false,
      message: "Voucher ini tidak berlaku untuk game ini",
    };
  }

  if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
    return {
      valid: false,
      message: "Voucher sudah expired",
    };
  }

  const rawDiscount = Number(voucher.discount_amount || 0);
  const maxDiscount = Math.max(Number(productPrice) - 1000, 0);
  const discountAmount = Math.min(rawDiscount, maxDiscount);

  if (discountAmount <= 0) {
    return {
      valid: false,
      message: "Nominal voucher tidak valid",
    };
  }

  return {
    valid: true,
    code: cleanCode,
    discountAmount,
    message: "Voucher berhasil digunakan",
  };
}

function requireAdminCsrf(req, res, next) {
  const csrfFromCookie = String(req.cookies.admin_csrf || "").trim();
  const csrfFromHeader = String(req.headers["x-csrf-token"] || "").trim();

  if (!csrfFromCookie || !csrfFromHeader || csrfFromCookie !== csrfFromHeader) {
    return res.status(403).json({
      message: "Invalid CSRF token",
    });
  }

  next();
}

async function requireAdminAuth(req, res, next) {
  const isLoggedIn = await isAdminLoggedIn(req);

  if (!isLoggedIn) {
    // kalau akses dari browser
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect("/ae-auth");
    }

    // kalau akses dari API (fetch)
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  next();
}

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        "script-src-attr": ["'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "style-src-attr": ["'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'"],
        "font-src": ["'self'", "data:"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'self'"],
      },
    },
  }),
);

app.use(globalLimiter);
app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/result", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "result.html"));
});

app.get("/auth", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "user-auth.html"));
});

app.get("/ae-auth", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-login.html"));
});

app.post("/admin-login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  const envUsername = String(process.env.ADMIN_USERNAME || "").trim();
  const envPasswordHash = String(process.env.ADMIN_PASSWORD_HASH || "").trim();

  if (!username || !password) {
    return res.status(400).json({
      message: "Username dan password wajib diisi",
    });
  }

  if (!envUsername || !envPasswordHash) {
    return res.status(500).json({
      message: "Konfigurasi admin belum lengkap",
    });
  }

  try {
    await deleteExpiredAdminSessions();

    const cleanUsername = String(username).trim();
    const isUsernameMatch = cleanUsername === envUsername;
    const isPasswordMatch = await bcrypt.compare(
      String(password),
      envPasswordHash,
    );

    if (isUsernameMatch && isPasswordMatch) {
      const sessionToken = crypto.randomBytes(48).toString("hex");
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * 8);

      await query(
        `INSERT INTO admin_sessions (session_token, username, created_at, expires_at)
                 VALUES ($1, $2, $3, $4)`,
        [
          sessionToken,
          cleanUsername,
          createdAt.toISOString(),
          expiresAt.toISOString(),
        ],
      );

      res.cookie("admin_auth", sessionToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 8,
        path: "/",
      });

      const csrfToken = generateCsrfToken();

      res.cookie("admin_csrf", csrfToken, {
        httpOnly: false,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 8,
        path: "/",
      });

      return res.json({
        message: "Login berhasil",
      });
    }

    return res.status(401).json({
      message: "Username atau password salah",
    });
  } catch (err) {
    console.error("ERROR LOGIN ADMIN:", err);
    return res.status(500).json({
      message: "Terjadi error server",
    });
  }
});

app.post(
  "/admin-logout",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const sessionToken = String(req.cookies.admin_auth || "").trim();

    try {
      if (sessionToken) {
        await query("DELETE FROM admin_sessions WHERE session_token = $1", [
          sessionToken,
        ]);
      }

      res.clearCookie("admin_auth", { path: "/" });
      res.clearCookie("admin_csrf", { path: "/" });
      return res.json({
        message: "Logout berhasil",
      });
    } catch (err) {
      console.error("ERROR LOGOUT ADMIN:", err);
      return res.status(500).json({
        message: "Gagal logout admin",
      });
    }
  },
);

app.get("/ae-control", requireAdminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

app.post("/vouchers", requireAdminAuth, requireAdminCsrf, async (req, res) => {
  const { code, game_name, discount_amount, expires_at } = req.body;

  const cleanCode = normalizeVoucherCode(code);
  const cleanGameName = String(game_name || "").trim();
  const discountAmount = Number(discount_amount);
  const expiresAt = expires_at ? String(expires_at).trim() : null;

  if (!/^[A-Z0-9_-]{3,30}$/.test(cleanCode)) {
    return res.status(400).json({
      message:
        "Kode voucher hanya boleh huruf, angka, underscore, strip, 3-30 karakter",
    });
  }

  if (!cleanGameName || cleanGameName.length < 2 || cleanGameName.length > 80) {
    return res.status(400).json({
      message: "Nama game voucher tidak valid",
    });
  }

  if (!Number.isInteger(discountAmount) || discountAmount <= 0) {
    return res.status(400).json({
      message: "Diskon tidak valid",
    });
  }

  try {
    await query(
      `INSERT INTO vouchers
        (code, game_name, discount_amount, active, expires_at, created_at)
       VALUES
        ($1, $2, $3, 1, $4, $5)
       ON CONFLICT (code)
       DO UPDATE SET
        game_name = EXCLUDED.game_name,
        discount_amount = EXCLUDED.discount_amount,
        active = 1,
        expires_at = EXCLUDED.expires_at`,
      [
        cleanCode,
        cleanGameName,
        discountAmount,
        expiresAt,
        new Date().toISOString(),
      ],
    );

    return res.json({
      message: "Voucher berhasil disimpan",
    });
  } catch (err) {
    console.error("ERROR SAVE VOUCHER:", err);
    return res.status(500).json({
      message: "Gagal menyimpan voucher",
    });
  }
});

// buat order + pembayaran Midtrans
app.post("/create-order", orderLimiter, async (req, res) => {
  const loggedInUser = getLoggedInUserFromRequest(req);

  if (!loggedInUser) {
    return res.status(401).json({
      message: "Kamu harus login dulu sebelum order",
      redirectUrl: "/auth",
    });
  }
  const { product_id, name, contact, voucher_code } = req.body;

  const cleanName = String(name || "").trim();
  const cleanContact = String(contact || "").trim();
  const cleanProductId = Number(product_id);

  if (!Number.isInteger(cleanProductId) || cleanProductId <= 0) {
    return res.status(400).json({ message: "Produk tidak valid" });
  }

  if (!cleanName || cleanName.length < 2 || cleanName.length > 60) {
    return res.status(400).json({ message: "Nama harus 2 sampai 60 karakter" });
  }

  const safeNameRegex = /^[a-zA-Z0-9 .,_'’-]+$/;
  if (!safeNameRegex.test(cleanName)) {
    return res
      .status(400)
      .json({ message: "Nama mengandung karakter yang tidak diizinkan" });
  }

  if (!cleanContact || cleanContact.length < 5 || cleanContact.length > 100) {
    return res
      .status(400)
      .json({ message: "Kontak harus 5 sampai 100 karakter" });
  }

  const safeContactRegex = /^[a-zA-Z0-9@+._\- ]+$/;
  if (!safeContactRegex.test(cleanContact)) {
    return res
      .status(400)
      .json({ message: "Kontak mengandung karakter yang tidak diizinkan" });
  }

  try {
    const productResult = await query(
      "SELECT * FROM products WHERE id = $1 AND active = 1 LIMIT 1",
      [cleanProductId],
    );

    const productRow = productResult.rows[0];

    if (!productRow) {
      return res
        .status(404)
        .json({ message: "Produk tidak ditemukan atau tidak aktif" });
    }

    const keyCheck = await query(
      "SELECT id FROM keys WHERE product_id = $1 AND used = 0 LIMIT 1",
      [cleanProductId],
    );

    if (keyCheck.rows.length === 0) {
      return res.status(400).json({ message: "Stok key habis" });
    }

    const orderId = "ORDER-" + crypto.randomUUID();
    const accessToken = crypto.randomBytes(24).toString("hex");
    const createdAt = new Date().toISOString();
    const productName = `${productRow.brand} - ${productRow.duration}`;
    const game = productRow.game;
    const originalPrice = Number(productRow.price);

    const voucherCheck = await getVoucherDiscount({
      gameName: game,
      voucherCode: voucher_code,
      productPrice: originalPrice,
    });

    if (!voucherCheck.valid) {
      return res.status(400).json({
        message: voucherCheck.message,
      });
    }

    const discountAmount = voucherCheck.discountAmount;
    const netPrice = Math.max(originalPrice - discountAmount, 1000);
    const price = calculateQrisGrossPrice(netPrice);
    const paymentFee = price - netPrice;
    const appliedVoucherCode = voucherCheck.code || null;

    const baseUrl = process.env.APP_BASE_URL || `http://localhost:${port}`;
    const userId = loggedInUser.id;

    res.cookie(`order_token_${orderId}`, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 2,
      path: "/",
    });

    await query(
      `INSERT INTO orders
      (id, product_id, user_id, access_token, name, contact, game, product, price, original_price, discount_amount, payment_fee, voucher_code, payment_status, delivery_status, created_at)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        orderId,
        cleanProductId,
        userId,
        accessToken,
        cleanName,
        cleanContact,
        game,
        productName,
        price,
        originalPrice,
        discountAmount,
        paymentFee,
        appliedVoucherCode,
        "pending",
        "waiting_payment",
        createdAt,
      ],
    );

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContact);
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      enabled_payments: ["qris"],
      customer_details: {
        first_name: cleanName,
        email: isValidEmail ? cleanContact : "customer@example.com",
        phone: isValidEmail ? "" : cleanContact.replace(/[^0-9+]/g, ""),
      },
      item_details: [
        {
          id: String(cleanProductId),
          price: price,
          quantity: 1,
          name: `${game} - ${productName}`,
        },
      ],
      callbacks: {
        finish: `${baseUrl}/result?order_id=${orderId}`,
        error: `${baseUrl}/result?order_id=${orderId}`,
        pending: `${baseUrl}/result?order_id=${orderId}`,
      },
    });

    return res.json({
      message: "Transaksi Midtrans berhasil dibuat",
      paymentUrl: transaction.redirect_url,
      resultUrl: `${baseUrl}/result?order_id=${orderId}`,
    });
  } catch (err) {
    console.error(
      "ERROR CREATE MIDTRANS ORDER:",
      err.response?.data || err.message || err,
    );
    return res.status(500).json({
      message: "Gagal membuat pembayaran Midtrans",
    });
  }
});

app.post("/midtrans-notification", async (req, res) => {
  try {
    const notification = await snap.transaction.notification(req.body);

    const orderId = String(notification.order_id || "").trim();
    const transactionStatus = String(
      notification.transaction_status || "",
    ).toLowerCase();
    const fraudStatus = String(notification.fraud_status || "").toLowerCase();

    if (!orderId) {
      return res.status(400).send("ORDER ID TIDAK VALID");
    }

    const isPaid =
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus === "accept");

    const isExpiredOrFailed =
      transactionStatus === "expire" ||
      transactionStatus === "cancel" ||
      transactionStatus === "deny";

    if (isPaid) {
      const client = await db.connect();

      try {
        await client.query("BEGIN");

        const orderResult = await client.query(
          "SELECT * FROM orders WHERE id = $1 LIMIT 1",
          [orderId],
        );

        const order = orderResult.rows[0];

        if (!order) {
          await client.query("ROLLBACK");
          return res.status(404).send("ORDER TIDAK DITEMUKAN");
        }

        if (String(order.payment_status).toLowerCase() === "paid") {
          await client.query("COMMIT");
          return res.status(200).send("OK");
        }

        const keyResult = await client.query(
          `SELECT * FROM keys
   WHERE product_id = $1 AND used = 0
   ORDER BY id ASC
   LIMIT 1
   FOR UPDATE SKIP LOCKED`,
          [order.product_id],
        );

        const keyRow = keyResult.rows[0];

        if (!keyRow) {
          await client.query(
            `UPDATE orders
                         SET payment_status = $1, delivery_status = $2, gameKey = $3
                         WHERE id = $4`,
            ["paid", "manual", "STOK HABIS - CEK ADMIN", orderId],
          );

          await client.query("COMMIT");
          return res.status(200).send("OK");
        }

        const lockResult = await client.query(
          "UPDATE keys SET used = 1 WHERE id = $1 AND used = 0 RETURNING id",
          [keyRow.id],
        );

        if (lockResult.rows.length === 0) {
          throw new Error("Key gagal dikunci");
        }

        await client.query(
          `UPDATE orders
                     SET payment_status = $1, delivery_status = $2, gameKey = $3
                     WHERE id = $4`,
          ["paid", "delivered", keyRow.key, orderId],
        );

        await client.query("COMMIT");
        return res.status(200).send("OK");
      } catch (err) {
        try {
          await client.query("ROLLBACK");
        } catch (_) {}

        console.error("ERROR MIDTRANS PAID:", err.message);
        return res.status(500).send("ERROR");
      } finally {
        client.release();
      }
    }

    if (isExpiredOrFailed) {
      await query(
        `UPDATE orders
                 SET payment_status = $1, delivery_status = $2
                 WHERE id = $3 AND payment_status <> $4`,
        ["expired", "cancelled", orderId, "paid"],
      );
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("ERROR MIDTRANS NOTIFICATION:", err.message);
    return res.status(500).send("ERROR");
  }
});

app.get("/order/:id", orderCheckLimiter, async (req, res) => {
  const orderId = String(req.params.id || "").trim();
  const token = String(req.cookies[`order_token_${orderId}`] || "").trim();

  if (!orderId || !token) {
    return res.status(403).json({
      message: "Akses tidak valid",
    });
  }

  try {
    const result = await query(
      "SELECT * FROM orders WHERE id = $1 AND access_token = $2 LIMIT 1",
      [orderId, token],
    );

    const order = result.rows[0];

    if (!order) {
      return res.status(403).json({
        message: "Akses ditolak",
      });
    }

    return res.json({
      id: order.id,
      name: order.name,
      contact: order.contact,
      game: order.game,
      product: order.product,
      price: order.price,
      payment_status: order.payment_status,
      delivery_status: order.delivery_status,
      gameKey: order.gamekey,
      created_at: order.created_at,
    });
  } catch (err) {
    console.error("ERROR GET ORDER:", err);
    return res.status(500).json({
      message: "Gagal mengambil data order",
    });
  }
});

app.post(
  "/orders/:id/confirm-payment",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const orderId = String(req.params.id || "").trim();

    if (!orderId) {
      return res.status(400).json({ message: "ID order tidak valid" });
    }

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const orderResult = await client.query(
        "SELECT * FROM orders WHERE id = $1 LIMIT 1",
        [orderId],
      );

      const order = orderResult.rows[0];

      if (!order) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Order tidak ditemukan" });
      }

      if (String(order.payment_status).toLowerCase() === "paid") {
        await client.query("COMMIT");
        return res.json({ message: "Order sudah dibayar sebelumnya" });
      }

      const keyResult = await client.query(
        `SELECT * FROM keys
   WHERE product_id = $1 AND used = 0
   ORDER BY id ASC
   LIMIT 1
   FOR UPDATE SKIP LOCKED`,
        [order.product_id],
      );

      const keyRow = keyResult.rows[0];

      if (!keyRow) {
        await client.query(
          `UPDATE orders
                 SET payment_status = $1, delivery_status = $2, gameKey = $3
                 WHERE id = $4`,
          ["paid", "manual", "STOK HABIS - CEK ADMIN", orderId],
        );

        await client.query("COMMIT");
        return res.json({
          message: "Pembayaran dikonfirmasi, tapi stok key habis",
        });
      }

      await client.query(
        "UPDATE keys SET used = 1 WHERE id = $1 AND used = 0",
        [keyRow.id],
      );

      await client.query(
        `UPDATE orders
             SET payment_status = $1, delivery_status = $2, gameKey = $3
             WHERE id = $4`,
        ["paid", "delivered", keyRow.key, orderId],
      );

      await client.query("COMMIT");

      return res.json({
        message: "Pembayaran dikonfirmasi dan key berhasil dikirim",
      });
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch (_) {}

      return res.status(500).json({
        message: "Gagal konfirmasi pembayaran: " + err.message,
      });
    } finally {
      client.release();
    }
  },
);

app.get("/users", requireAdminAuth, async (req, res) => {
  try {
    const result = await query(
      "SELECT id, username, created_at FROM users ORDER BY created_at DESC",
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("ERROR GET USERS:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar user",
    });
  }
});

app.post(
  "/users/:id/reset-password",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "ID user tidak valid" });
    }

    const newPassword = crypto.randomBytes(5).toString("hex");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      const result = await query(
        "UPDATE users SET password = $1 WHERE id = $2 RETURNING id, username",
        [hashedPassword, userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      return res.json({
        message: "Password user berhasil direset",
        username: result.rows[0].username,
        newPassword,
      });
    } catch (err) {
      console.error("ERROR RESET USER PASSWORD:", err);
      return res.status(500).json({ message: "Gagal reset password user" });
    }
  },
);

app.delete(
  "/users/:id",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "ID user tidak valid" });
    }

    try {
      const result = await query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      return res.json({ message: "User berhasil dihapus" });
    } catch (err) {
      console.error("ERROR DELETE USER:", err);
      return res.status(500).json({ message: "Gagal hapus user" });
    }
  },
);

app.get("/orders", requireAdminAuth, async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM orders ORDER BY created_at DESC, id DESC",
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("ERROR GET ORDERS:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar order",
    });
  }
});

app.get("/stock-summary", requireAdminAuth, async (req, res) => {
  try {
    const result = await query(`
            SELECT 
                p.id,
                p.game,
                p.brand,
                p.duration,
                COUNT(k.id) FILTER (WHERE k.used = 0) AS available_keys
            FROM products p
            LEFT JOIN keys k ON p.id = k.product_id
            GROUP BY p.id
            ORDER BY p.id DESC
        `);

    return res.json(result.rows);
  } catch (err) {
    console.error("ERROR STOCK SUMMARY:", err);
    return res.status(500).json({
      message: "Gagal ambil stok",
    });
  }
});

app.delete(
  "/orders/:id",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const orderId = String(req.params.id || "").trim();

    if (!orderId) {
      return res.status(400).json({
        message: "ID order tidak valid",
      });
    }

    try {
      const result = await query(
        "SELECT id, payment_status, delivery_status FROM orders WHERE id = $1 LIMIT 1",
        [orderId],
      );

      const order = result.rows[0];

      if (!order) {
        return res.status(404).json({
          message: "Order tidak ditemukan",
        });
      }

      const paymentStatus = String(order.payment_status || "").toLowerCase();
      const deliveryStatus = String(order.delivery_status || "").toLowerCase();

      if (paymentStatus === "paid" || deliveryStatus === "delivered") {
        return res.status(400).json({
          message: "Order yang sudah dibayar / terkirim tidak boleh dihapus",
        });
      }

      await query("DELETE FROM orders WHERE id = $1", [orderId]);

      return res.json({
        message: "Order berhasil dihapus",
      });
    } catch (err) {
      console.error("ERROR DELETE ORDER:", err);
      return res.status(500).json({
        message: "Gagal menghapus order: " + err.message,
      });
    }
  },
);

app.get("/keys", requireAdminAuth, async (req, res) => {
  try {
    const result = await query(`
            SELECT
                keys.*,
                products.game,
                products.brand,
                products.duration
            FROM keys
            LEFT JOIN products ON keys.product_id = products.id
            ORDER BY keys.id DESC
        `);

    return res.json(result.rows);
  } catch (err) {
    console.error("ERROR GET KEYS:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar key",
    });
  }
});

app.post("/keys", requireAdminAuth, requireAdminCsrf, async (req, res) => {
  const { product_id, key } = req.body;
  const cleanProductId = Number(product_id);
  const cleanKey = String(key || "").trim();

  if (!Number.isInteger(cleanProductId) || cleanProductId <= 0) {
    return res.status(400).json({
      message: "Produk tidak valid",
    });
  }

  if (!cleanKey || cleanKey.length < 3 || cleanKey.length > 255) {
    return res.status(400).json({
      message: "Key tidak valid",
    });
  }

  try {
    const productCheck = await query("SELECT id FROM products WHERE id = $1", [
      cleanProductId,
    ]);

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    const result = await query(
      "INSERT INTO keys (product_id, key, used) VALUES ($1, $2, 0) RETURNING id",
      [cleanProductId, cleanKey],
    );

    return res.json({
      message: "Key berhasil ditambahkan",
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error("ERROR ADD KEY:", err);
    return res.status(500).json({
      message: "Gagal menambahkan key: " + err.message,
    });
  }
});

app.post("/keys/bulk", requireAdminAuth, requireAdminCsrf, async (req, res) => {
  const { product_id, keys } = req.body;
  const cleanProductId = Number(product_id);

  if (!Number.isInteger(cleanProductId) || cleanProductId <= 0) {
    return res.status(400).json({
      message: "Produk tidak valid",
    });
  }

  if (!Array.isArray(keys) || keys.length === 0) {
    return res.status(400).json({
      message: "Daftar key tidak valid",
    });
  }
  if (keys.length > 500) {
    return res.status(400).json({
      message: "Maksimal 500 key sekali upload",
    });
  }

  const cleanKeys = [
    ...new Set(
      keys
        .map((item) => String(item || "").trim())
        .filter((item) => item.length >= 3 && item.length <= 255),
    ),
  ];

  if (cleanKeys.length === 0) {
    return res.status(400).json({
      message: "Tidak ada key valid untuk disimpan",
    });
  }

  try {
    const productCheck = await query("SELECT id FROM products WHERE id = $1", [
      cleanProductId,
    ]);

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    const values = [];
    const placeholders = cleanKeys
      .map((key, index) => {
        const base = index * 2;
        values.push(cleanProductId, key);
        return `($${base + 1}, $${base + 2}, 0)`;
      })
      .join(", ");

    const result = await query(
      `INSERT INTO keys (product_id, key, used)
             VALUES ${placeholders}
             RETURNING id`,
      values,
    );

    return res.json({
      message: `${result.rows.length} key berhasil ditambahkan`,
      total: result.rows.length,
    });
  } catch (err) {
    console.error("ERROR BULK ADD KEY:", err);
    return res.status(500).json({
      message: "Gagal menambahkan bulk key: " + err.message,
    });
  }
});

app.get("/products", requireAdminAuth, async (req, res) => {
  try {
    const result = await query("SELECT * FROM products ORDER BY id DESC");

    return res.json(result.rows);
  } catch (err) {
    console.error("ERROR GET PRODUCTS:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar produk",
    });
  }
});

app.post("/products", requireAdminAuth, requireAdminCsrf, async (req, res) => {
  const { game, brand, duration, price } = req.body;

  const cleanGame = String(game || "").trim();
  const cleanBrand = String(brand || "").trim();
  const cleanDuration = String(duration || "").trim();
  const cleanPrice = Number(price);

  if (!cleanGame || !cleanBrand || !cleanDuration) {
    return res.status(400).json({
      message: "Data produk belum lengkap",
    });
  }

  if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) {
    return res.status(400).json({
      message: "Harga produk tidak valid",
    });
  }

  const createdAt = new Date().toISOString();

  console.log("ADD PRODUCT REQUEST:", {
    game: cleanGame,
    brand: cleanBrand,
    duration: cleanDuration,
    price: cleanPrice,
  });

  try {
    const result = await query(
      "INSERT INTO products (game, brand, duration, price, active, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [cleanGame, cleanBrand, cleanDuration, cleanPrice, 1, createdAt],
    );

    console.log("INSERT SUCCESS:", result.rows);

    return res.json({
      message: "Produk berhasil ditambahkan",
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error("ERROR ADD PRODUCT:", err);
    return res.status(500).json({
      message: "Gagal menambahkan produk: " + err.message,
    });
  }
});

app.put(
  "/products/:id",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const productId = Number(req.params.id);
    const { game, brand, duration, price } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "ID produk tidak valid",
      });
    }

    const cleanGame = String(game || "").trim();
    const cleanBrand = String(brand || "").trim();
    const cleanDuration = String(duration || "").trim();
    const cleanPrice = Number(price);

    if (!cleanGame || !cleanBrand || !cleanDuration) {
      return res.status(400).json({
        message: "Data produk belum lengkap",
      });
    }

    if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) {
      return res.status(400).json({
        message: "Harga produk tidak valid",
      });
    }

    try {
      const result = await query(
        "UPDATE products SET game = $1, brand = $2, duration = $3, price = $4 WHERE id = $5 RETURNING id",
        [cleanGame, cleanBrand, cleanDuration, cleanPrice, productId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Produk tidak ditemukan",
        });
      }

      return res.json({
        message: "Produk berhasil diupdate",
      });
    } catch (err) {
      console.error("ERROR UPDATE PRODUCT:", err);
      return res.status(500).json({
        message: "Gagal update produk: " + err.message,
      });
    }
  },
);

app.delete(
  "/products/:id",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "ID produk tidak valid",
      });
    }

    try {
      const orderCheck = await query(
        "SELECT COUNT(*)::int AS total_orders FROM orders WHERE product_id = $1",
        [productId],
      );

      const keyCheck = await query(
        "SELECT COUNT(*)::int AS total_keys FROM keys WHERE product_id = $1",
        [productId],
      );

      const totalOrders = Number(orderCheck.rows[0]?.total_orders || 0);
      const totalKeys = Number(keyCheck.rows[0]?.total_keys || 0);

      if (totalOrders > 0 || totalKeys > 0) {
        const updateResult = await query(
          "UPDATE products SET active = 0 WHERE id = $1 RETURNING id",
          [productId],
        );

        if (updateResult.rows.length === 0) {
          return res.status(404).json({
            message: "Produk tidak ditemukan",
          });
        }

        return res.json({
          message: "Produk dipakai oleh order/key, jadi dinonaktifkan saja",
        });
      }

      const deleteResult = await query(
        "DELETE FROM products WHERE id = $1 RETURNING id",
        [productId],
      );

      if (deleteResult.rows.length === 0) {
        return res.status(404).json({
          message: "Produk tidak ditemukan",
        });
      }

      return res.json({
        message: "Produk berhasil dihapus",
      });
    } catch (err) {
      console.error("ERROR DELETE PRODUCT:", err);
      return res.status(500).json({
        message: "Gagal menghapus produk: " + err.message,
      });
    }
  },
);

app.patch(
  "/products/:id/toggle-active",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const productId = Number(req.params.id);
    let { active } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "ID produk tidak valid",
      });
    }

    if (
      active === true ||
      active === "true" ||
      active === 1 ||
      active === "1"
    ) {
      active = 1;
    } else if (
      active === false ||
      active === "false" ||
      active === 0 ||
      active === "0"
    ) {
      active = 0;
    } else {
      return res.status(400).json({
        message: "Nilai active harus 0/1 atau true/false",
      });
    }

    try {
      const result = await query(
        "UPDATE products SET active = $1 WHERE id = $2 RETURNING id, active",
        [active, productId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Produk tidak ditemukan",
        });
      }

      return res.json({
        message: active === 1 ? "Produk diaktifkan" : "Produk dinonaktifkan",
        product: result.rows[0],
      });
    } catch (err) {
      console.error("ERROR TOGGLE PRODUCT:", err);
      return res.status(500).json({
        message: "Gagal mengubah status produk: " + err.message,
      });
    }
  },
);

app.get("/public-products", async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM products WHERE active = 1 ORDER BY game ASC, brand ASC, duration ASC",
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("ERROR PUBLIC PRODUCTS:", err);
    return res.status(500).json({
      message: "Gagal mengambil produk publik",
    });
  }
});

app.delete(
  "/keys/:id",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const keyId = Number(req.params.id);

    if (!Number.isInteger(keyId) || keyId <= 0) {
      return res.status(400).json({
        message: "ID key tidak valid",
      });
    }

    try {
      const keyCheck = await query("SELECT id, used FROM keys WHERE id = $1", [
        keyId,
      ]);

      if (keyCheck.rows.length === 0) {
        return res.status(404).json({
          message: "Key tidak ditemukan",
        });
      }

      const keyRow = keyCheck.rows[0];

      if (Number(keyRow.used) === 1) {
        return res.status(400).json({
          message: "Key yang sudah dipakai tidak bisa dihapus",
        });
      }

      const result = await query(
        "DELETE FROM keys WHERE id = $1 RETURNING id",
        [keyId],
      );

      return res.json({
        message: "Key berhasil dihapus",
        id: result.rows[0].id,
      });
    } catch (err) {
      console.error("ERROR DELETE KEY:", err);
      return res.status(500).json({
        message: "Gagal menghapus key: " + err.message,
      });
    }
  },
);

app.get("/admin", (req, res) => {
  return res.status(404).send("Not Found");
});

app.get("/admin-login", (req, res) => {
  return res.status(404).send("Not Found");
});

// --- API USER REGISTER & LOGIN ---
app.post("/register", registerLimiter, async (req, res) => {
  const { username, password } = req.body;
  const cleanUsername = String(username || "").trim();
  const cleanPassword = String(password || "");
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  if (!usernameRegex.test(cleanUsername)) {
    return res.status(400).json({
      message: "Username hanya boleh huruf, angka, underscore, 3-20 karakter",
    });
  }

  if (cleanPassword.length < 6 || cleanPassword.length > 72) {
    return res.status(400).json({
      message: "Password harus 6 sampai 72 karakter",
    });
  }

  try {
    // Enkripsi password biar aman kalau database bocor
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPassword, salt);

    await query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      cleanUsername,
      hashedPassword,
    ]);
    return res.json({ message: "Pendaftaran berhasil! Silakan login." });
  } catch (err) {
    if (err.code === "23505") {
      // Kode error unik PostgreSQL
      return res
        .status(400)
        .json({ message: "Username sudah dipakai, pilih yang lain" });
    }
    return res.status(500).json({ message: "Terjadi error server" });
  }
});

app.post("/user-login", userAuthLimiter, async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await query(
      "SELECT * FROM users WHERE username = $1 LIMIT 1",
      [username],
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Username atau password salah" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Username atau password salah" });
    }

    // Buat "tiket masuk" (Token) untuk user
    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret,
      { expiresIn: "7d" },
    );

    // Simpan tiket di cookie browser
    res.cookie("user_auth", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });

    return res.json({ message: "Login berhasil!" });
  } catch (err) {
    return res.status(500).json({ message: "Terjadi error server" });
  }
});

app.get("/user/orders", async (req, res) => {
  const loggedInUser = getLoggedInUserFromRequest(req);

  if (!loggedInUser) {
    return res.status(401).json({ message: "Kamu harus login dulu" });
  }

  try {
    const result = await query(
      `SELECT id, game, product, price, payment_status, delivery_status, gameKey, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC`,
      [loggedInUser.id],
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("ERROR GET USER ORDERS:", err);
    return res.status(500).json({ message: "Gagal mengambil riwayat order" });
  }
});

app.post("/user/change-password", async (req, res) => {
  const token = req.cookies.user_auth;
  const { oldPassword, newPassword } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Kamu harus login dulu" });
  }

  const cleanOldPassword = String(oldPassword || "").trim();
  const cleanNewPassword = String(newPassword || "").trim();

  if (cleanNewPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password baru minimal 6 karakter" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    const result = await query("SELECT * FROM users WHERE id = $1 LIMIT 1", [
      decoded.id,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const isOldPasswordCorrect = await bcrypt.compare(
      cleanOldPassword,
      user.password,
    );

    if (!isOldPasswordCorrect) {
      return res.status(400).json({ message: "Password lama salah" });
    }

    const hashedPassword = await bcrypt.hash(cleanNewPassword, 10);

    await query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      decoded.id,
    ]);

    return res.json({ message: "Password berhasil diganti" });
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Sesi login tidak valid, silakan login ulang" });
  }
});

app.post("/user-logout", (req, res) => {
  res.clearCookie("user_auth");
  return res.json({ message: "Logout berhasil" });
});
// ----------------------------------

// --- FITUR BARU: Cek User yang sedang Login ---
app.get("/api/user/me", (req, res) => {
  const token = req.cookies.user_auth;

  // Kalau tidak ada token/belum login
  if (!token) return res.json({ loggedIn: false });

  try {
    // Cek apakah tokennya valid dan cocok dengan JWT_SECRET
    const decoded = jwt.verify(token, jwtSecret);
    return res.json({ loggedIn: true, username: decoded.username });
  } catch (err) {
    // Kalau token kadaluarsa atau error
    return res.json({ loggedIn: false });
  }
});
// ----------------------------------------------

app.listen(port, () => {
  console.log("Server jalan di port", port);
});
