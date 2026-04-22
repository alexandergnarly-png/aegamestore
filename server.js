const db = require("./database");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
require("dotenv").config();
const rateLimit = require("express-rate-limit");

const app = express();
app.set("trust proxy", 1);
const port = process.env.PORT || 3000;

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
        await query(
            "DELETE FROM admin_sessions WHERE expires_at <= $1",
            [new Date().toISOString()]
        );
    } catch (err) {
        console.error("ERROR DELETE EXPIRED ADMIN SESSIONS:", err);
    }
}

db.query(`
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    game TEXT NOT NULL,
    brand TEXT NOT NULL,
    duration TEXT NOT NULL,
    price INTEGER NOT NULL,
    active INTEGER DEFAULT 1,
    created_at TEXT
  )
`, (err) => {
    if (err) {
        console.error("CREATE TABLE products ERROR:", err);
    } else {
        console.log("Table products ready");
    }
});

db.query(`
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
`, (err) => {
    if (err) {
        console.error("CREATE TABLE orders ERROR:", err);
    } else {
        console.log("Table orders ready");
    }
});

db.query(`
  CREATE TABLE IF NOT EXISTS keys (
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    key TEXT,
    used INTEGER DEFAULT 0
  )
`, (err) => {
    if (err) {
        console.error("CREATE TABLE keys ERROR:", err);
    } else {
        console.log("Table keys ready");
    }
});

db.query(`
  CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    session_token TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )
`, (err) => {
    if (err) {
        console.error("CREATE TABLE admin_sessions ERROR:", err);
    } else {
        console.log("Table admin_sessions ready");
    }
});

// limit umum (global)
const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 100, // max 100 request per menit per IP
    message: {
        message: "Terlalu banyak request, coba lagi nanti"
    }
});

// limit login admin (ketat)
const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Terlalu banyak percobaan login, coba lagi nanti"
        });
    }
});

// limit create order
const orderLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10, // max 10 order per menit
    message: {
        message: "Terlalu banyak order, coba lagi nanti"
    }
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
            [sessionToken, new Date().toISOString()]
        );

        return result.rows.length > 0;
    } catch (err) {
        console.error("ERROR CHECK ADMIN SESSION:", err);
        return false;
    }
}

function requireAdminCsrf(req, res, next) {
    const csrfFromCookie = String(req.cookies.admin_csrf || "").trim();
    const csrfFromHeader = String(req.headers["x-csrf-token"] || "").trim();

    if (!csrfFromCookie || !csrfFromHeader || csrfFromCookie !== csrfFromHeader) {
        return res.status(403).json({
            message: "Invalid CSRF token"
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
            message: "Unauthorized"
        });
    }

    next();
}

app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(globalLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/result", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "result.html"));
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
            message: "Username dan password wajib diisi"
        });
    }

    if (!envUsername || !envPasswordHash) {
        return res.status(500).json({
            message: "Konfigurasi admin belum lengkap"
        });
    }

    try {
        await deleteExpiredAdminSessions();

        const cleanUsername = String(username).trim();
        const isUsernameMatch = cleanUsername === envUsername;
        const isPasswordMatch = await bcrypt.compare(String(password), envPasswordHash);

        if (isUsernameMatch && isPasswordMatch) {
            const sessionToken = crypto.randomBytes(48).toString("hex");
            const createdAt = new Date();
            const expiresAt = new Date(createdAt.getTime() + (1000 * 60 * 60 * 8));

            await query(
                `INSERT INTO admin_sessions (session_token, username, created_at, expires_at)
                 VALUES ($1, $2, $3, $4)`,
                [
                    sessionToken,
                    cleanUsername,
                    createdAt.toISOString(),
                    expiresAt.toISOString()
                ]
            );

            res.cookie("admin_auth", sessionToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60 * 8,
                path: "/"
            });

            const csrfToken = generateCsrfToken();

            res.cookie("admin_csrf", csrfToken, {
                httpOnly: false,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60 * 8,
                path: "/"
            });

            return res.json({
                message: "Login berhasil"
            });
        }

        return res.status(401).json({
            message: "Username atau password salah"
        });
    } catch (err) {
        console.error("ERROR LOGIN ADMIN:", err);
        return res.status(500).json({
            message: "Terjadi error server"
        });
    }
});

app.post("/admin-logout", requireAdminAuth, requireAdminCsrf, async (req, res) => {
    const sessionToken = String(req.cookies.admin_auth || "").trim();

    try {
        if (sessionToken) {
            await query(
                "DELETE FROM admin_sessions WHERE session_token = $1",
                [sessionToken]
            );
        }

        res.clearCookie("admin_auth", { path: "/" });
        res.clearCookie("admin_csrf", { path: "/" });
        return res.json({
            message: "Logout berhasil"
        });
    } catch (err) {
        console.error("ERROR LOGOUT ADMIN:", err);
        return res.status(500).json({
            message: "Gagal logout admin"
        });
    }
});

app.get("/ae-control", requireAdminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// buat order + invoice Xendit
app.post("/create-order", orderLimiter, async (req, res) => {
    const { product_id, name, contact } = req.body;

    const cleanName = String(name || "").trim();
    const cleanContact = String(contact || "").trim();
    const cleanProductId = Number(product_id);

    if (!Number.isInteger(cleanProductId) || cleanProductId <= 0) {
        return res.status(400).json({
            message: "Produk tidak valid"
        });
    }

    if (!cleanName || cleanName.length < 2 || cleanName.length > 60) {
        return res.status(400).json({
            message: "Nama harus 2 sampai 60 karakter"
        });
    }

    const safeNameRegex = /^[a-zA-Z0-9 .,_'’-]+$/;
    if (!safeNameRegex.test(cleanName)) {
        return res.status(400).json({
            message: "Nama mengandung karakter yang tidak diizinkan"
        });
    }

    if (!cleanContact || cleanContact.length < 5 || cleanContact.length > 100) {
        return res.status(400).json({
            message: "Kontak harus 5 sampai 100 karakter"
        });
    }

    const safeContactRegex = /^[a-zA-Z0-9@+._\- ]+$/;
    if (!safeContactRegex.test(cleanContact)) {
        return res.status(400).json({
            message: "Kontak mengandung karakter yang tidak diizinkan"
        });
    }

    try {
        const productResult = await query(
            "SELECT * FROM products WHERE id = $1 AND active = 1 LIMIT 1",
            [cleanProductId]
        );

        const productRow = productResult.rows[0];

        if (!productRow) {
            return res.status(404).json({
                message: "Produk tidak ditemukan atau tidak aktif"
            });
        }

        const keyCheck = await query(
            "SELECT id FROM keys WHERE product_id = $1 AND used = 0 LIMIT 1",
            [cleanProductId]
        );

        if (keyCheck.rows.length === 0) {
            return res.status(400).json({
                message: "Stok key habis"
            });
        }

        const orderId = "ORDER-" + crypto.randomUUID();
        const accessToken = crypto.randomBytes(24).toString("hex");

        res.cookie(`order_token_${orderId}`, accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 2,
            path: "/"
        });

        const createdAt = new Date().toISOString();
        const productName = `${productRow.brand} - ${productRow.duration}`;
        const price = Number(productRow.price);
        const game = productRow.game;

        const newOrder = {
            id: orderId,
            product_id: cleanProductId,
            access_token: accessToken,
            name: cleanName,
            contact: cleanContact,
            game,
            product: productName,
            price,
            payment_status: "pending",
            delivery_status: "waiting_payment"
        };

        await query(
            `INSERT INTO orders
            (id, product_id, access_token, name, contact, game, product, price, payment_status, delivery_status, created_at)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
                orderId,
                cleanProductId,
                accessToken,
                cleanName,
                cleanContact,
                game,
                productName,
                price,
                "pending",
                "waiting_payment",
                createdAt
            ]
        );

        try {
            const auth = Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString("base64");
            const baseUrl = process.env.APP_BASE_URL || `http://localhost:${port}`;
            const fetch = require("node-fetch");

            const xenditResponse = await fetch("https://api.xendit.co/v2/invoices", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic " + auth
                },
                body: JSON.stringify({
                    external_id: orderId,
                    amount: price,
                    payer_email: cleanContact.includes("@") ? cleanContact : "no-reply@aestore.com",
                    description: `Pembayaran untuk ${game} - ${productName}`,
                    success_redirect_url: `${baseUrl}/result?order_id=${orderId}`,
                    failure_redirect_url: `${baseUrl}/result?order_id=${orderId}`
                })
            });

            const rawText = await xenditResponse.text();


            let data;
            try {
                data = JSON.parse(rawText);
            } catch (error) {
                return res.status(500).json({
                    message: "Response Xendit bukan JSON"
                });
            }

            if (!xenditResponse.ok) {
                return res.status(500).json({
                    message: data.message || "Gagal membuat invoice di Xendit"
                });
            }

            if (!data.invoice_url) {
                return res.status(500).json({
                    message: "invoice_url tidak ada dari Xendit"
                });
            }

            return res.json({
                message: "Invoice berhasil dibuat!",
                invoiceUrl: data.invoice_url
            });
        } catch (error) {
            console.error("ERROR SERVER:", error);
            return res.status(500).json({
                message: "Server gagal menghubungi Xendit"
            });
        }
    } catch (err) {
        console.error("ERROR CREATE ORDER:", err);
        return res.status(500).json({
            message: "Gagal membuat order"
        });
    }
});

app.post("/xendit-webhook", async (req, res) => {
    const callbackToken = String(req.headers["x-callback-token"] || "").trim();

    if (callbackToken !== String(process.env.XENDIT_CALLBACK_TOKEN || "").trim()) {
        return res.status(403).send("Forbidden");
    }

    const data = req.body;
    const status = String(data?.status || "").toUpperCase();
    const orderId = String(data?.external_id || "").trim();

    if (!orderId) {
        return res.status(400).send("ORDER ID TIDAK VALID");
    }

    const client = await db.connect();

    try {
        if (status === "PAID") {
            await client.query("BEGIN");

            const orderResult = await client.query(
                "SELECT * FROM orders WHERE id = $1 LIMIT 1",
                [orderId]
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
                 LIMIT 1`,
                [order.product_id]
            );

            const keyRow = keyResult.rows[0];

            if (keyRow) {
                const lockResult = await client.query(
                    "UPDATE keys SET used = 1 WHERE id = $1 AND used = 0 RETURNING id",
                    [keyRow.id]
                );

                if (lockResult.rows.length === 0) {
                    throw new Error("Key gagal dikunci untuk order ini");
                }

                await client.query(
                    `UPDATE orders
                     SET payment_status = $1, delivery_status = $2, gameKey = $3
                     WHERE id = $4`,
                    ["paid", "delivered", keyRow.key, orderId]
                );

                await client.query("COMMIT");
                return res.status(200).send("OK");
            }

            await client.query(
                `UPDATE orders
                 SET payment_status = $1, delivery_status = $2, gameKey = $3
                 WHERE id = $4`,
                ["paid", "manual", "STOK HABIS - CEK ADMIN", orderId]
            );

            await client.query("COMMIT");
            return res.status(200).send("OK");
        }

        if (status === "EXPIRED") {
            await client.query(
                `UPDATE orders
                 SET payment_status = $1, delivery_status = $2
                 WHERE id = $3 AND payment_status <> $4`,
                ["expired", "cancelled", orderId, "paid"]
            );

            return res.status(200).send("OK");
        }

        return res.status(200).send("IGNORED");
    } catch (err) {
        try {
            await client.query("ROLLBACK");
        } catch (_) { }

        console.error("ERROR WEBHOOK XENDIT:", err.message);
        return res.status(500).send("ERROR");
    } finally {
        client.release();
    }
});

app.get("/order/:id", async (req, res) => {
    const orderId = String(req.params.id || "").trim();
    const token = String(req.cookies[`order_token_${orderId}`] || "").trim();

    if (!orderId || !token) {
        return res.status(403).json({
            message: "Akses tidak valid"
        });
    }

    try {
        const result = await query(
            "SELECT * FROM orders WHERE id = $1 AND access_token = $2 LIMIT 1",
            [orderId, token]
        );

        const order = result.rows[0];

        if (!order) {
            return res.status(403).json({
                message: "Akses ditolak"
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
            created_at: order.created_at
        });
    } catch (err) {
        console.error("ERROR GET ORDER:", err);
        return res.status(500).json({
            message: "Gagal mengambil data order"
        });
    }
});

app.get("/orders", requireAdminAuth, async (req, res) => {
    try {
        const result = await query(
            "SELECT * FROM orders ORDER BY created_at DESC, id DESC"
        );

        return res.json(result.rows);
    } catch (err) {
        console.error("ERROR GET ORDERS:", err);
        return res.status(500).json({
            message: "Gagal mengambil daftar order"
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
            message: "Gagal ambil stok"
        });
    }
});

app.delete("/orders/:id", requireAdminAuth, requireAdminCsrf, async (req, res) => {
    const orderId = String(req.params.id || "").trim();

    if (!orderId) {
        return res.status(400).json({
            message: "ID order tidak valid"
        });
    }

    try {
        const result = await query(
            "SELECT id, payment_status, delivery_status FROM orders WHERE id = $1 LIMIT 1",
            [orderId]
        );

        const order = result.rows[0];

        if (!order) {
            return res.status(404).json({
                message: "Order tidak ditemukan"
            });
        }

        const paymentStatus = String(order.payment_status || "").toLowerCase();
        const deliveryStatus = String(order.delivery_status || "").toLowerCase();

        if (paymentStatus === "paid" || deliveryStatus === "delivered") {
            return res.status(400).json({
                message: "Order yang sudah dibayar / terkirim tidak boleh dihapus"
            });
        }

        await query(
            "DELETE FROM orders WHERE id = $1",
            [orderId]
        );

        return res.json({
            message: "Order berhasil dihapus"
        });
    } catch (err) {
        console.error("ERROR DELETE ORDER:", err);
        return res.status(500).json({
            message: "Gagal menghapus order: " + err.message
        });
    }
});

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
            message: "Gagal mengambil daftar key"
        });
    }
});

app.post("/keys", requireAdminAuth, requireAdminCsrf, async (req, res) => {
    const { product_id, key } = req.body;
    const cleanProductId = Number(product_id);
    const cleanKey = String(key || "").trim();

    if (!Number.isInteger(cleanProductId) || cleanProductId <= 0) {
        return res.status(400).json({
            message: "Produk tidak valid"
        });
    }

    if (!cleanKey || cleanKey.length < 3 || cleanKey.length > 255) {
        return res.status(400).json({
            message: "Key tidak valid"
        });
    }

    try {
        const productCheck = await query(
            "SELECT id FROM products WHERE id = $1",
            [cleanProductId]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        const result = await query(
            "INSERT INTO keys (product_id, key, used) VALUES ($1, $2, 0) RETURNING id",
            [cleanProductId, cleanKey]
        );

        return res.json({
            message: "Key berhasil ditambahkan",
            id: result.rows[0].id
        });
    } catch (err) {
        console.error("ERROR ADD KEY:", err);
        return res.status(500).json({
            message: "Gagal menambahkan key: " + err.message
        });
    }
});

app.post("/keys/bulk", requireAdminAuth, requireAdminCsrf, async (req, res) => {
    const { product_id, keys } = req.body;
    const cleanProductId = Number(product_id);

    if (!Number.isInteger(cleanProductId) || cleanProductId <= 0) {
        return res.status(400).json({
            message: "Produk tidak valid"
        });
    }

    if (!Array.isArray(keys) || keys.length === 0) {
        return res.status(400).json({
            message: "Daftar key tidak valid"
        });
    }

    const cleanKeys = [...new Set(
        keys
            .map(item => String(item || "").trim())
            .filter(item => item.length >= 3 && item.length <= 255)
    )];

    if (cleanKeys.length === 0) {
        return res.status(400).json({
            message: "Tidak ada key valid untuk disimpan"
        });
    }

    try {
        const productCheck = await query(
            "SELECT id FROM products WHERE id = $1",
            [cleanProductId]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        const values = [];
        const placeholders = cleanKeys.map((key, index) => {
            const base = index * 2;
            values.push(cleanProductId, key);
            return `($${base + 1}, $${base + 2}, 0)`;
        }).join(", ");

        const result = await query(
            `INSERT INTO keys (product_id, key, used)
             VALUES ${placeholders}
             RETURNING id`,
            values
        );

        return res.json({
            message: `${result.rows.length} key berhasil ditambahkan`,
            total: result.rows.length
        });
    } catch (err) {
        console.error("ERROR BULK ADD KEY:", err);
        return res.status(500).json({
            message: "Gagal menambahkan bulk key: " + err.message
        });
    }
});

app.get("/products", requireAdminAuth, async (req, res) => {
    try {
        const result = await query(
            "SELECT * FROM products ORDER BY id DESC"
        );

        return res.json(result.rows);
    } catch (err) {
        console.error("ERROR GET PRODUCTS:", err);
        return res.status(500).json({
            message: "Gagal mengambil daftar produk"
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
            message: "Data produk belum lengkap"
        });
    }

    if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) {
        return res.status(400).json({
            message: "Harga produk tidak valid"
        });
    }

    const createdAt = new Date().toISOString();

    console.log("ADD PRODUCT REQUEST:", {
        game: cleanGame,
        brand: cleanBrand,
        duration: cleanDuration,
        price: cleanPrice
    });

    try {
        const result = await query(
            "INSERT INTO products (game, brand, duration, price, active, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [cleanGame, cleanBrand, cleanDuration, cleanPrice, 1, createdAt]
        );

        console.log("INSERT SUCCESS:", result.rows);

        return res.json({
            message: "Produk berhasil ditambahkan",
            id: result.rows[0].id
        });
    } catch (err) {
        console.error("ERROR ADD PRODUCT:", err);
        return res.status(500).json({
            message: "Gagal menambahkan produk: " + err.message
        });
    }
});

app.put("/products/:id", requireAdminAuth, requireAdminCsrf, async (req, res) => {
    const productId = Number(req.params.id);
    const { game, brand, duration, price } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
            message: "ID produk tidak valid"
        });
    }

    const cleanGame = String(game || "").trim();
    const cleanBrand = String(brand || "").trim();
    const cleanDuration = String(duration || "").trim();
    const cleanPrice = Number(price);

    if (!cleanGame || !cleanBrand || !cleanDuration) {
        return res.status(400).json({
            message: "Data produk belum lengkap"
        });
    }

    if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) {
        return res.status(400).json({
            message: "Harga produk tidak valid"
        });
    }

    try {
        const result = await query(
            "UPDATE products SET game = $1, brand = $2, duration = $3, price = $4 WHERE id = $5 RETURNING id",
            [cleanGame, cleanBrand, cleanDuration, cleanPrice, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        return res.json({
            message: "Produk berhasil diupdate"
        });
    } catch (err) {
        console.error("ERROR UPDATE PRODUCT:", err);
        return res.status(500).json({
            message: "Gagal update produk: " + err.message
        });
    }
});

app.delete("/products/:id", requireAdminAuth, requireAdminCsrf, async (req, res) => {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
            message: "ID produk tidak valid"
        });
    }

    try {
        const orderCheck = await query(
            "SELECT COUNT(*)::int AS total_orders FROM orders WHERE product_id = $1",
            [productId]
        );

        const keyCheck = await query(
            "SELECT COUNT(*)::int AS total_keys FROM keys WHERE product_id = $1",
            [productId]
        );

        const totalOrders = Number(orderCheck.rows[0]?.total_orders || 0);
        const totalKeys = Number(keyCheck.rows[0]?.total_keys || 0);

        if (totalOrders > 0 || totalKeys > 0) {
            const updateResult = await query(
                "UPDATE products SET active = 0 WHERE id = $1 RETURNING id",
                [productId]
            );

            if (updateResult.rows.length === 0) {
                return res.status(404).json({
                    message: "Produk tidak ditemukan"
                });
            }

            return res.json({
                message: "Produk dipakai oleh order/key, jadi dinonaktifkan saja"
            });
        }

        const deleteResult = await query(
            "DELETE FROM products WHERE id = $1 RETURNING id",
            [productId]
        );

        if (deleteResult.rows.length === 0) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        return res.json({
            message: "Produk berhasil dihapus"
        });
    } catch (err) {
        console.error("ERROR DELETE PRODUCT:", err);
        return res.status(500).json({
            message: "Gagal menghapus produk: " + err.message
        });
    }
});

app.patch("/products/:id/toggle-active", requireAdminAuth, requireAdminCsrf, async (req, res) => {
    const productId = Number(req.params.id);
    let { active } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
            message: "ID produk tidak valid"
        });
    }

    if (active === true || active === "true" || active === 1 || active === "1") {
        active = 1;
    } else if (active === false || active === "false" || active === 0 || active === "0") {
        active = 0;
    } else {
        return res.status(400).json({
            message: "Nilai active harus 0/1 atau true/false"
        });
    }

    try {
        const result = await query(
            "UPDATE products SET active = $1 WHERE id = $2 RETURNING id, active",
            [active, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        return res.json({
            message: active === 1 ? "Produk diaktifkan" : "Produk dinonaktifkan",
            product: result.rows[0]
        });
    } catch (err) {
        console.error("ERROR TOGGLE PRODUCT:", err);
        return res.status(500).json({
            message: "Gagal mengubah status produk: " + err.message
        });
    }
});

app.get("/public-products", async (req, res) => {
    try {
        const result = await query(
            "SELECT * FROM products WHERE active = 1 ORDER BY game ASC, brand ASC, duration ASC"
        );

        return res.json(result.rows);
    } catch (err) {
        console.error("ERROR PUBLIC PRODUCTS:", err);
        return res.status(500).json({
            message: "Gagal mengambil produk publik"
        });
    }
});

app.delete("/keys/:id", requireAdminAuth, requireAdminCsrf, async (req, res) => {
    const keyId = Number(req.params.id);

    if (!Number.isInteger(keyId) || keyId <= 0) {
        return res.status(400).json({
            message: "ID key tidak valid"
        });
    }

    try {
        const keyCheck = await query(
            "SELECT id, used FROM keys WHERE id = $1",
            [keyId]
        );

        if (keyCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Key tidak ditemukan"
            });
        }

        const keyRow = keyCheck.rows[0];

        if (Number(keyRow.used) === 1) {
            return res.status(400).json({
                message: "Key yang sudah dipakai tidak bisa dihapus"
            });
        }

        const result = await query(
            "DELETE FROM keys WHERE id = $1 RETURNING id",
            [keyId]
        );

        return res.json({
            message: "Key berhasil dihapus",
            id: result.rows[0].id
        });
    } catch (err) {
        console.error("ERROR DELETE KEY:", err);
        return res.status(500).json({
            message: "Gagal menghapus key: " + err.message
        });
    }
});

app.get("/admin", (req, res) => {
    return res.status(404).send("Not Found");
});

app.get("/admin-login", (req, res) => {
    return res.status(404).send("Not Found");
});

app.listen(port, () => {
    console.log("Server jalan di port", port);
});
