const db = require("./server/database");
const express = require("express");
const midtransClient = require("midtrans-client");
const path = require("path");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const {
  MAX_ORDER_QUANTITY,
  calculateBulkTotals,
  calculateVipOrderDiscount,
  getOrderQuantity,
  parseOrderQuantity,
  splitOrderKeys,
} = require("./server/order-utils");
const { ensureBulkOrderSchema, ensureWalletSchema } = require("./server/database-migrations");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
const port = process.env.PORT || 3000;
const isMidtransProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const jwtSecret = String(process.env.JWT_SECRET || "").trim();
let isShuttingDown = false;
const WALLET_MIN_TOPUP = 10000;
const WALLET_MAX_TOPUP = 2000000;
const WALLET_MAX_BALANCE = 10000000;

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

const ordersTableReady = db.query(
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
).then(() => {
  console.log("Table orders ready");
});

const keysTableReady = db.query(
  `
  CREATE TABLE IF NOT EXISTS keys (
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    key TEXT,
    used INTEGER DEFAULT 0
  )
`,
).then(() => {
  console.log("Table keys ready");
});

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

db.query(`ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS ip_address TEXT`);
db.query(`ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS user_agent TEXT`);

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
db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS badge_override TEXT`);
db.query(
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS badge_override_expires_at TEXT`,
);
db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS default_name TEXT`);
db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS default_contact TEXT`);
db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`);
db.query(
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified INTEGER DEFAULT 0`,
);
db.query(
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_hash TEXT`,
);
db.query(
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TEXT`,
);
db.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

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
db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT`);
db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TEXT`);
db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TEXT`);
db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT`);
db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS snap_token TEXT`);
db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS snap_redirect_url TEXT`);
db.query(
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS snap_token_created_at TEXT`,
);
const bulkOrderSchemaReady = Promise.all([ordersTableReady, keysTableReady])
  .then(() => ensureBulkOrderSchema(db))
  .then(() => ensureWalletSchema(db))
  .then(() => {
    console.log("Bulk order and wallet schema ready");
  });
db.query(
  `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`,
);
db.query(
  `CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)`,
);
db.query(
  `CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON orders(delivery_status)`,
);

db.query(
  `
  CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    game_name TEXT,
    brand_name TEXT,
    duration_name TEXT,
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
db.query(`ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS brand_name TEXT`);
db.query(`ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS duration_name TEXT`);
db.query(
  `ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public'`,
);
db.query(
  `ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS target_user_id INTEGER`,
);
db.query(`ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS product_id INTEGER`);
db.query(
  `CREATE INDEX IF NOT EXISTS idx_vouchers_product_id ON vouchers(product_id)`,
);

db.query(
  `
  CREATE TABLE IF NOT EXISTS voucher_products (
    id SERIAL PRIMARY KEY,
    voucher_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(voucher_id, product_id)
  )
`,
  (err) => {
    if (err) {
      console.error("CREATE TABLE voucher_products ERROR:", err);
    } else {
      console.log("Table voucher_products ready");
    }
  },
);
db.query(
  `CREATE INDEX IF NOT EXISTS idx_voucher_products_voucher_id ON voucher_products(voucher_id)`,
);
db.query(
  `CREATE INDEX IF NOT EXISTS idx_voucher_products_product_id ON voucher_products(product_id)`,
);
db.query(
  `
  CREATE TABLE IF NOT EXISTS vip_discounts (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL UNIQUE,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`,
  (err) => {
    if (err) {
      console.error("CREATE TABLE vip_discounts ERROR:", err);
    } else {
      console.log("Table vip_discounts ready");
    }
  },
);
db.query(
  `CREATE INDEX IF NOT EXISTS idx_vouchers_target_user_id ON vouchers(target_user_id)`,
);
db.query(
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'auto'`,
);
db.query(
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS play_status TEXT DEFAULT 'safe'`,
);
db.query(
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'android'`,
);
db.query(
  `UPDATE products
   SET platform = 'ios'
   WHERE LOWER(TRIM(COALESCE(platform, 'android'))) = 'android'
     AND (LOWER(TRIM(COALESCE(brand, ''))) LIKE '%ios%'
       OR LOWER(TRIM(COALESCE(game, ''))) LIKE '%ios%'
       OR LOWER(TRIM(COALESCE(duration, ''))) LIKE '%ios%')`,
);
db.query(
  `UPDATE products
   SET platform = 'android'
   WHERE LOWER(TRIM(COALESCE(platform, ''))) NOT IN ('android', 'ios')`,
);

// VIP Store product mapping columns — STEP 2 (20260625-vipstore-step2-product-mapping-v1)
db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_source TEXT DEFAULT ''`);
db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_product_id TEXT DEFAULT ''`);
db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_product_name TEXT DEFAULT ''`);
db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_price NUMERIC(12,2)`);
db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_stock INTEGER DEFAULT 0`);
db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_status TEXT DEFAULT 'unmapped'`);
db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_maintenance INTEGER DEFAULT 0`);
db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_maintenance_reason TEXT`);
db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_last_sync TEXT`);
db.query(`CREATE INDEX IF NOT EXISTS idx_products_supplier_source ON products(supplier_source)`);
db.query(`CREATE INDEX IF NOT EXISTS idx_products_supplier_product_id ON products(supplier_product_id)`);


// VIP Store claim logs — STEP 4.5 safety/recovery
db.query(
  `
  CREATE TABLE IF NOT EXISTS vipstore_claim_logs (
    id SERIAL PRIMARY KEY,
    order_id TEXT,
    product_id INTEGER,
    supplier_product_id TEXT,
    source TEXT,
    status TEXT NOT NULL,
    message TEXT,
    http_code INTEGER,
    key_count INTEGER DEFAULT 0,
    response_summary TEXT,
    created_at TEXT NOT NULL
  )
`,
  (err) => {
    if (err) {
      console.error("CREATE TABLE vipstore_claim_logs ERROR:", err);
    } else {
      console.log("Table vipstore_claim_logs ready");
    }
  },
);
db.query(
  `CREATE INDEX IF NOT EXISTS idx_vipstore_claim_logs_order_id ON vipstore_claim_logs(order_id)`,
);
db.query(
  `CREATE INDEX IF NOT EXISTS idx_vipstore_claim_logs_created_at ON vipstore_claim_logs(created_at)`,
);

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

function normalizePlayStatus(status) {
  const value = String(status || "safe")
    .trim()
    .toLowerCase();

  if (value === "maintenance") return "maintenance";
  if (value === "risk") return "risk";
  return "safe";
}

function normalizeProductDeliveryType(deliveryType) {
  const value = String(deliveryType || "auto")
    .trim()
    .toLowerCase();

  if (
    value === "vipstore_api" ||
    value === "vipstore" ||
    value === "supplier_api" ||
    value === "supplier"
  ) {
    return "vipstore_api";
  }

  if (value === "manual" || value === "manual_delivery") return "manual";

  // Existing AE Game Store auto/local key flow uses local keys table.
  return "auto";
}

const ORDER_RESERVATION_MS = 2 * 60 * 60 * 1000;

function getReservationExpiryIso(now = new Date()) {
  return new Date(now.getTime() + ORDER_RESERVATION_MS).toISOString();
}

async function releaseReservedKeysForOrder(dbClient, orderId) {
  if (!orderId) return;

  await dbClient.query(
    `UPDATE keys
     SET reserved_order_id = NULL, reserved_until = NULL
     WHERE reserved_order_id = $1 AND used = 0`,
    [orderId],
  );
}

async function reserveLocalKeysForOrder(
  dbClient,
  { productId, orderId, quantity, reservedUntil },
) {
  const nowIso = new Date().toISOString();

  await dbClient.query(
    `UPDATE keys
     SET reserved_order_id = NULL, reserved_until = NULL
     WHERE product_id = $1
       AND used = 0
       AND reserved_order_id IS NOT NULL
       AND reserved_until IS NOT NULL
       AND reserved_until <= $2`,
    [productId, nowIso],
  );

  const keyResult = await dbClient.query(
    `SELECT id
     FROM keys
     WHERE product_id = $1
       AND used = 0
       AND reserved_order_id IS NULL
     ORDER BY id ASC
     LIMIT $2
     FOR UPDATE SKIP LOCKED`,
    [productId, quantity],
  );

  if (keyResult.rows.length !== quantity) return false;

  const keyIds = keyResult.rows.map((row) => Number(row.id));
  const reservationResult = await dbClient.query(
    `UPDATE keys
     SET reserved_order_id = $1, reserved_until = $2
     WHERE id = ANY($3::int[])
       AND used = 0
       AND reserved_order_id IS NULL
     RETURNING id`,
    [orderId, reservedUntil, keyIds],
  );

  return reservationResult.rows.length === quantity;
}

async function persistOrderKeys(
  dbClient,
  { orderId, keys, keyIds = [], source },
) {
  const createdAt = new Date().toISOString();

  for (let index = 0; index < keys.length; index += 1) {
    await dbClient.query(
      `INSERT INTO order_keys
       (order_id, key_id, key_value, source, position, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (order_id, position) DO NOTHING`,
      [
        orderId,
        keyIds[index] || null,
        String(keys[index]),
        source,
        index + 1,
        createdAt,
      ],
    );
  }
}

async function allocateLocalKeysForOrder(dbClient, order) {
  const quantity = getOrderQuantity(order.quantity);
  const nowIso = new Date().toISOString();

  const keyResult = await dbClient.query(
    `SELECT id, key
     FROM keys
     WHERE product_id = $1
       AND used = 0
       AND (
         reserved_order_id = $2
         OR reserved_order_id IS NULL
         OR reserved_until IS NULL
         OR reserved_until <= $3
       )
     ORDER BY CASE WHEN reserved_order_id = $2 THEN 0 ELSE 1 END, id ASC
     LIMIT $4
     FOR UPDATE SKIP LOCKED`,
    [order.product_id, order.id, nowIso, quantity],
  );

  if (keyResult.rows.length !== quantity) {
    await releaseReservedKeysForOrder(dbClient, order.id);
    return null;
  }

  const keyIds = keyResult.rows.map((row) => Number(row.id));
  const keys = keyResult.rows.map((row) => String(row.key));
  const lockResult = await dbClient.query(
    `UPDATE keys
     SET used = 1, reserved_order_id = NULL, reserved_until = NULL
     WHERE id = ANY($1::int[]) AND used = 0
     RETURNING id`,
    [keyIds],
  );

  if (lockResult.rows.length !== quantity) {
    throw new Error("Sebagian key gagal dikunci");
  }

  await persistOrderKeys(dbClient, {
    orderId: order.id,
    keys,
    keyIds,
    source: "local",
  });

  return keys;
}

async function getStoredOrderKeys(orderId, fallbackValue = "") {
  const stored = await query(
    `SELECT key_value
     FROM order_keys
     WHERE order_id = $1
     ORDER BY position ASC, id ASC`,
    [orderId],
  ).catch(() => ({ rows: [] }));

  const keys = stored.rows.map((row) => String(row.key_value || "").trim()).filter(Boolean);
  return keys.length ? keys : splitOrderKeys(fallbackValue);
}

function normalizeSupplierProductId(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const numberValue = Number(text);
  if (!Number.isInteger(numberValue) || numberValue <= 0) return "";

  return String(numberValue);
}

function getSupplierSourceFromDelivery(deliveryType) {
  return normalizeProductDeliveryType(deliveryType) === "vipstore_api"
    ? "vipstore"
    : "";
}


// VIP Store reseller API integration — STEP 1 (20260625-vipstore-step1-api-client-v1)
// Only admin test endpoints are enabled here. Buyer checkout is not changed yet.
const VIPSTORE_DEFAULT_BASE_URL = "https://vipstore.web.id/backend/api/reseller";

function getVipStoreConfig() {
  const baseUrl = String(
    process.env.VIPSTORE_API_BASE_URL || VIPSTORE_DEFAULT_BASE_URL,
  )
    .trim()
    .replace(/\/+$/, "");

  return {
    baseUrl,
    apiKey: String(process.env.VIPSTORE_API_KEY || "").trim(),
    apiSecret: String(process.env.VIPSTORE_API_SECRET || "").trim(),
    userId: String(process.env.VIPSTORE_USER_ID || "").trim(),
  };
}

function isVipStoreConfigured() {
  const config = getVipStoreConfig();
  return Boolean(config.baseUrl && config.apiKey && config.apiSecret);
}

function maskSecret(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= 8) return "configured";
  return `${text.slice(0, 4)}...${text.slice(-4)}`;
}

function createVipStoreHeaders(rawBody = "") {
  const config = getVipStoreConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const bodyHash = crypto.createHash("sha256").update(rawBody).digest("hex");
  const payload = `${timestamp}.${nonce}.${bodyHash}`;
  const signature = crypto
    .createHmac("sha256", config.apiSecret)
    .update(payload)
    .digest("hex");

  return {
    "Content-Type": "application/json",
    "X-API-Key": config.apiKey,
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": signature,
  };
}

function normalizeVipStoreEndpoint(endpoint) {
  const cleanEndpoint = String(endpoint || "")
    .trim()
    .replace(/^\/+/, "");

  if (!cleanEndpoint) {
    throw new Error("VIP Store endpoint kosong");
  }

  return cleanEndpoint;
}

async function vipStoreRequest(endpoint, options = {}) {
  const config = getVipStoreConfig();

  if (!isVipStoreConfigured()) {
    const error = new Error(
      "VIP Store API belum dikonfigurasi. Isi VIPSTORE_API_KEY dan VIPSTORE_API_SECRET di env.",
    );
    error.code = "VIPSTORE_NOT_CONFIGURED";
    throw error;
  }

  const method = String(options.method || "GET").toUpperCase();
  const body = options.body && method !== "GET" ? options.body : null;
  const rawBody = method === "GET" ? "" : JSON.stringify(body || {});
  const url = `${config.baseUrl}/${normalizeVipStoreEndpoint(endpoint)}`;
  const controller = new AbortController();
  const timeoutMs = Number(options.timeoutMs || 30000);
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: createVipStoreHeaders(rawBody),
      body: method === "GET" ? undefined : rawBody,
      signal: controller.signal,
    });

    const rawResponse = await response.text();
    let data = null;

    try {
      data = rawResponse ? JSON.parse(rawResponse) : null;
    } catch (parseErr) {
      data = {
        success: false,
        message: "VIP Store mengembalikan response non-JSON",
        raw_response: rawResponse,
      };
    }

    return {
      ok: response.ok,
      http_code: response.status,
      data,
    };
  } catch (err) {
    const isTimeout = err && err.name === "AbortError";
    const error = new Error(
      isTimeout
        ? "Request VIP Store timeout"
        : `Gagal menghubungi VIP Store: ${err.message}`,
    );
    error.code = isTimeout ? "VIPSTORE_TIMEOUT" : "VIPSTORE_REQUEST_FAILED";
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getVipStoreCatalog() {
  return vipStoreRequest("catalog.php", { method: "GET" });
}

async function getVipStoreBalance() {
  return vipStoreRequest("balance.php", { method: "GET" });
}

async function claimVipStoreKey(productId, quantity = 1) {
  const cleanProductId = Number(productId);
  const cleanQuantity = Math.max(Number(quantity || 1), 1);

  if (!Number.isInteger(cleanProductId) || cleanProductId <= 0) {
    throw new Error("VIP Store product_id tidak valid");
  }

  if (!Number.isInteger(cleanQuantity) || cleanQuantity <= 0) {
    throw new Error("VIP Store quantity tidak valid");
  }

  return vipStoreRequest("claim.php", {
    method: "POST",
    body: { product_id: cleanProductId, quantity: cleanQuantity },
  });
}

function extractVipStoreCatalogItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.data,
    payload.products,
    payload.catalog,
    payload.items,
    payload.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === "object") {
      for (const value of Object.values(candidate)) {
        if (Array.isArray(value)) return value;
      }
    }
  }

  return [];
}

function getFirstDefinedValue(source, keys) {
  if (!source || typeof source !== "object") return undefined;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const value = source[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
  }

  return undefined;
}

function isTruthyApiValue(value) {
  if (value === true || value === 1) return true;
  const text = String(value || "").trim().toLowerCase();
  return ["1", "true", "yes", "on", "active", "maintenance"].includes(text);
}

function parseApiNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeVipStoreCatalogProduct(item) {
  const productId = String(
    getFirstDefinedValue(item, ["id", "product_id", "productId"]) || "",
  ).trim();

  const name = String(
    getFirstDefinedValue(item, ["name", "product_name", "title"]) || "",
  ).trim();

  const stock = Math.max(
    0,
    Math.floor(
      parseApiNumber(
        getFirstDefinedValue(item, [
          "stock",
          "available_stock",
          "availableCodes",
          "available_codes",
          "available_codes_count",
          "api_stock",
        ]),
        0,
      ),
    ),
  );

  const isHidden = isTruthyApiValue(
    getFirstDefinedValue(item, ["is_hidden", "hidden"]),
  );
  const isMaintenance = isTruthyApiValue(
    getFirstDefinedValue(item, [
      "is_maintenance",
      "maintenance_status",
      "is_maintenance_mode",
      "maintenance_mode",
    ]),
  );

  const rawStatus = String(getFirstDefinedValue(item, ["status"]) || "")
    .trim()
    .toLowerCase();

  const maintenanceReason = String(
    getFirstDefinedValue(item, ["maintenance_reason", "maintenance_note"])
      || "",
  ).trim();

  let status = "ready";
  if (isHidden) status = "hidden";
  else if (isMaintenance || rawStatus.includes("maintenance")) status = "maintenance";
  else if (stock <= 0) status = "out_of_stock";

  return {
    product_id: productId,
    name,
    price: parseApiNumber(getFirstDefinedValue(item, ["price", "reseller_price"]), null),
    stock,
    status,
    category: String(getFirstDefinedValue(item, ["category", "category_name"]) || "").trim(),
    duration: String(getFirstDefinedValue(item, ["duration", "variant_label", "variantLabel"]) || "").trim(),
    is_hidden: isHidden,
    is_maintenance: isMaintenance || rawStatus.includes("maintenance"),
    maintenance_reason: maintenanceReason,
    custom_link: String(getFirstDefinedValue(item, ["custom_link", "download_link", "downloadLink"]) || "").trim(),
    youtube_link: String(getFirstDefinedValue(item, ["youtube_link", "youtubeLink", "youtube_url"]) || "").trim(),
  };
}

async function findVipStoreProductById(productId) {
  const cleanSupplierProductId = normalizeSupplierProductId(productId);

  if (!cleanSupplierProductId) {
    return { found: false, product: null, raw: null, http_code: 400 };
  }

  const result = await getVipStoreCatalog();
  const items = extractVipStoreCatalogItems(result.data);
  const rawProduct = items.find((item) => {
    const itemId = String(
      getFirstDefinedValue(item, ["id", "product_id", "productId"]) || "",
    ).trim();
    return itemId === cleanSupplierProductId;
  });

  if (!rawProduct) {
    return {
      found: false,
      product: null,
      raw: null,
      http_code: result.http_code,
      total_detected_items: items.length,
    };
  }

  return {
    found: true,
    product: normalizeVipStoreCatalogProduct(rawProduct),
    raw: rawProduct,
    http_code: result.http_code,
    total_detected_items: items.length,
  };
}

async function buildVipStoreProductSnapshot(deliveryType, supplierProductId) {
  const cleanDeliveryType = normalizeProductDeliveryType(deliveryType);
  const cleanSupplierProductId = normalizeSupplierProductId(supplierProductId);

  const baseSnapshot = {
    supplier_source: getSupplierSourceFromDelivery(cleanDeliveryType),
    supplier_product_id: cleanSupplierProductId,
    supplier_product_name: "",
    supplier_price: null,
    supplier_stock: 0,
    supplier_status: cleanDeliveryType === "vipstore_api" ? "mapped_pending" : "local",
    supplier_maintenance: 0,
    supplier_maintenance_reason: "",
    supplier_last_sync: null,
  };

  if (cleanDeliveryType !== "vipstore_api" || !cleanSupplierProductId) {
    return baseSnapshot;
  }

  try {
    const lookup = await findVipStoreProductById(cleanSupplierProductId);

    if (!lookup.found || !lookup.product) {
      return {
        ...baseSnapshot,
        supplier_status: "not_found",
        supplier_last_sync: new Date().toISOString(),
      };
    }

    return {
      supplier_source: "vipstore",
      supplier_product_id: lookup.product.product_id,
      supplier_product_name: lookup.product.name,
      supplier_price: lookup.product.price,
      supplier_stock: lookup.product.stock,
      supplier_status: lookup.product.status,
      supplier_maintenance: lookup.product.is_maintenance || lookup.product.is_hidden ? 1 : 0,
      supplier_maintenance_reason: lookup.product.maintenance_reason,
      supplier_last_sync: new Date().toISOString(),
    };
  } catch (err) {
    console.error("WARN VIPSTORE PRODUCT LOOKUP:", err.message);
    return {
      ...baseSnapshot,
      supplier_status: err.code === "VIPSTORE_NOT_CONFIGURED" ? "not_configured" : "lookup_failed",
      supplier_maintenance_reason: err.message || "Gagal cek produk supplier",
      supplier_last_sync: new Date().toISOString(),
    };
  }
}





function redactVipStoreClaimResponse(value) {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((entry) => redactVipStoreClaimResponse(entry));
  }

  if (typeof value !== "object") return value;

  const redacted = {};
  const sensitiveKeys = new Set([
    "key",
    "keys",
    "code",
    "codes",
    "license",
    "licenses",
    "license_key",
    "licensekey",
    "serial",
    "pin",
    "voucher",
    "game_key",
    "gamekey",
    "activation_code",
    "activationcode",
    "generated_key",
    "generatedkey",
  ]);

  for (const [rawKey, entryValue] of Object.entries(value)) {
    const key = String(rawKey || "").toLowerCase();

    if (sensitiveKeys.has(key)) {
      if (Array.isArray(entryValue)) {
        redacted[rawKey] = `[REDACTED_${entryValue.length}_ITEMS]`;
      } else if (entryValue && typeof entryValue === "object") {
        redacted[rawKey] = "[REDACTED_OBJECT]";
      } else {
        redacted[rawKey] = "[REDACTED]";
      }
      continue;
    }

    redacted[rawKey] = redactVipStoreClaimResponse(entryValue);
  }

  return redacted;
}

function summarizeVipStoreClaimResponse(data) {
  try {
    const summary = JSON.stringify(redactVipStoreClaimResponse(data || {}));
    return summary.length > 2000 ? summary.slice(0, 2000) + "..." : summary;
  } catch (err) {
    return "";
  }
}

async function logVipStoreClaimAttempt({
  orderId,
  productId,
  supplierProductId,
  source,
  status,
  message,
  httpCode = null,
  keyCount = 0,
  responseSummary = "",
}) {
  try {
    await query(
      `
      INSERT INTO vipstore_claim_logs (
        order_id,
        product_id,
        supplier_product_id,
        source,
        status,
        message,
        http_code,
        key_count,
        response_summary,
        created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `,
      [
        String(orderId || ""),
        Number(productId || 0) || null,
        String(supplierProductId || ""),
        String(source || "unknown"),
        String(status || "unknown"),
        String(message || "").slice(0, 1000),
        httpCode === null || httpCode === undefined ? null : Number(httpCode),
        Number(keyCount || 0),
        String(responseSummary || "").slice(0, 2200),
        new Date().toISOString(),
      ],
    );
  } catch (err) {
    console.error("WARN LOG VIPSTORE CLAIM:", err.message);
  }
}

function extractVipStoreBalanceValue(payload) {
  const candidates = [
    payload?.balance,
    payload?.data?.balance,
    payload?.wallet?.balance,
    payload?.result?.balance,
  ];

  for (const candidate of candidates) {
    const numberValue = Number(candidate);
    if (Number.isFinite(numberValue)) return numberValue;
  }

  return null;
}

function extractVipStoreClaimKeys(payload) {
  const keys = [];
  const seen = new Set();

  function pushKey(value) {
    const text = String(value || "").trim();
    if (!text) return;
    if (text.length < 4) return;

    const blocked = [
      "success",
      "true",
      "false",
      "ready",
      "maintenance",
      "manual",
      "vipstore",
    ];

    if (blocked.includes(text.toLowerCase())) return;
    if (seen.has(text)) return;

    seen.add(text);
    keys.push(text);
  }

  function collect(value, forceString = false) {
    if (value === undefined || value === null) return;

    if (typeof value === "string" || typeof value === "number") {
      if (forceString) pushKey(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => collect(entry, forceString));
      return;
    }

    if (typeof value !== "object") return;

    for (const [rawKey, entryValue] of Object.entries(value)) {
      const key = String(rawKey || "").toLowerCase();

      const isDirectKeyField = [
        "key",
        "keys",
        "code",
        "codes",
        "license",
        "licenses",
        "license_key",
        "licensekey",
        "serial",
        "pin",
        "voucher",
        "game_key",
        "gamekey",
        "activation_code",
        "activationcode",
        "generated_key",
        "generatedkey",
      ].includes(key);

      const isLikelyContainer = [
        "data",
        "result",
        "results",
        "item",
        "items",
        "product",
        "products",
        "claimed",
        "claim",
        "generated",
        "orders",
      ].includes(key);

      if (isDirectKeyField) {
        collect(entryValue, true);
      } else if (isLikelyContainer) {
        collect(entryValue, forceString || key === "data" || key === "result");
      } else if (entryValue && typeof entryValue === "object") {
        collect(entryValue, forceString);
      }
    }
  }

  collect(payload, false);

  return keys;
}

async function claimVipStoreKeyForOrder(order, options = {}) {
  const supplierProductId = normalizeSupplierProductId(order.supplier_product_id);
  const source = String(options.source || "auto").trim() || "auto";
  const orderId = String(order.id || order.order_id || "");
  const productId = Number(order.product_id || 0) || null;
  const quantity = getOrderQuantity(order.quantity);

  if (!supplierProductId) {
    const message = "Produk belum punya VIP Store Product ID";
    await logVipStoreClaimAttempt({
      orderId,
      productId,
      supplierProductId,
      source,
      status: "failed",
      message,
    });
    throw new Error(message);
  }

  try {
    const claimResult = await claimVipStoreKey(supplierProductId, quantity);
    const claimData = claimResult.data || {};
    const responseSummary = summarizeVipStoreClaimResponse(claimData);

    if (!claimResult.ok || claimData.success === false) {
      const message =
        claimData.message ||
        claimData.error ||
        `VIP Store claim gagal. HTTP ${claimResult.http_code || "-"}`;

      await logVipStoreClaimAttempt({
        orderId,
        productId,
        supplierProductId,
        source,
        status: "failed",
        message,
        httpCode: claimResult.http_code,
        responseSummary,
      });

      throw new Error(message);
    }

    const claimedKeys = extractVipStoreClaimKeys(claimData);

    if (claimedKeys.length < quantity) {
      const message = `VIP Store hanya mengembalikan ${claimedKeys.length} dari ${quantity} key`;

      await logVipStoreClaimAttempt({
        orderId,
        productId,
        supplierProductId,
        source,
        status: "failed",
        message,
        httpCode: claimResult.http_code,
        responseSummary,
      });

      throw new Error(message);
    }

    const deliveredKeys = claimedKeys.slice(0, quantity);

    await logVipStoreClaimAttempt({
      orderId,
      productId,
      supplierProductId,
      source,
      status: "success",
      message: `Claim success, ${deliveredKeys.length} key diterima`,
      httpCode: claimResult.http_code,
      keyCount: deliveredKeys.length,
      responseSummary,
    });

    return {
      supplier_product_id: supplierProductId,
      key: deliveredKeys.join("\n"),
      keys: deliveredKeys,
      http_code: claimResult.http_code,
    };
  } catch (err) {
    if (
      err &&
      (err.code === "VIPSTORE_NOT_CONFIGURED" ||
        err.code === "VIPSTORE_TIMEOUT" ||
        err.code === "VIPSTORE_REQUEST_FAILED")
    ) {
      await logVipStoreClaimAttempt({
        orderId,
        productId,
        supplierProductId,
        source,
        status: "failed",
        message: err.message || "VIP Store claim gagal",
      });
    }

    throw err;
  }
}


async function syncVipStoreMappedProducts(options = {}) {
  const rawProductIds = Array.isArray(options.productIds)
    ? options.productIds
    : options.productId
      ? [options.productId]
      : [];

  const productIds = [
    ...new Set(
      rawProductIds
        .map((entry) => Number(entry))
        .filter((entry) => Number.isInteger(entry) && entry > 0),
    ),
  ];

  const params = [];
  let productFilter = "";

  if (productIds.length) {
    params.push(productIds);
    productFilter = ` AND id = ANY($${params.length}::int[])`;
  }

  const mappedProductsResult = await query(
    `
    SELECT id, supplier_product_id
    FROM products
    WHERE LOWER(COALESCE(delivery_type, 'auto')) = 'vipstore_api'
      AND COALESCE(NULLIF(supplier_product_id, ''), '') <> ''
      ${productFilter}
    ORDER BY id ASC
    `,
    params,
  );

  const mappedProducts = mappedProductsResult.rows || [];

  if (!mappedProducts.length) {
    return {
      synced: 0,
      total_mapped: 0,
      ready: 0,
      out_of_stock: 0,
      maintenance: 0,
      hidden: 0,
      not_found: 0,
      failed: 0,
      message: productIds.length
        ? "Produk ini belum dimapping ke VIP Store API."
        : "Belum ada produk yang dimapping ke VIP Store API.",
    };
  }

  const catalogResult = await getVipStoreCatalog();
  const rawCatalogItems = extractVipStoreCatalogItems(catalogResult.data);
  const normalizedCatalog = rawCatalogItems
    .map(normalizeVipStoreCatalogProduct)
    .filter((item) => item.product_id);

  const catalogById = new Map(
    normalizedCatalog.map((item) => [String(item.product_id), item]),
  );

  const syncedAt = new Date().toISOString();
  const summary = {
    synced: 0,
    total_mapped: mappedProducts.length,
    total_catalog_items: rawCatalogItems.length,
    ready: 0,
    out_of_stock: 0,
    maintenance: 0,
    hidden: 0,
    not_found: 0,
    failed: 0,
    synced_at: syncedAt,
  };

  for (const mappedProduct of mappedProducts) {
    const supplierProductId = String(mappedProduct.supplier_product_id || "").trim();
    const supplierProduct = catalogById.get(supplierProductId);

    try {
      if (!supplierProduct) {
        await query(
          `
          UPDATE products
          SET supplier_source = 'vipstore',
              supplier_product_name = '',
              supplier_price = NULL,
              supplier_stock = 0,
              supplier_status = 'not_found',
              supplier_maintenance = 1,
              supplier_maintenance_reason = 'Product ID tidak ditemukan di catalog VIP Store',
              supplier_last_sync = $1
          WHERE id = $2
          `,
          [syncedAt, mappedProduct.id],
        );

        summary.not_found += 1;
        summary.synced += 1;
        continue;
      }

      const status = String(supplierProduct.status || "ready").trim() || "ready";
      const maintenanceFlag =
        supplierProduct.is_maintenance ||
        supplierProduct.is_hidden ||
        status === "maintenance" ||
        status === "hidden"
          ? 1
          : 0;

      await query(
        `
        UPDATE products
        SET supplier_source = 'vipstore',
            supplier_product_id = $1,
            supplier_product_name = $2,
            supplier_price = $3,
            supplier_stock = $4,
            supplier_status = $5,
            supplier_maintenance = $6,
            supplier_maintenance_reason = $7,
            supplier_last_sync = $8
        WHERE id = $9
        `,
        [
          supplierProduct.product_id,
          supplierProduct.name,
          supplierProduct.price,
          supplierProduct.stock,
          status,
          maintenanceFlag,
          supplierProduct.maintenance_reason || "",
          syncedAt,
          mappedProduct.id,
        ],
      );

      if (status === "ready") summary.ready += 1;
      else if (status === "out_of_stock") summary.out_of_stock += 1;
      else if (status === "maintenance") summary.maintenance += 1;
      else if (status === "hidden") summary.hidden += 1;

      summary.synced += 1;
    } catch (err) {
      summary.failed += 1;
      console.error("ERROR SYNC VIPSTORE PRODUCT:", {
        product_id: mappedProduct.id,
        supplier_product_id: supplierProductId,
        error: err.message,
      });
    }
  }

  summary.message = `Sync VIP Store selesai: ${summary.synced}/${summary.total_mapped} produk diproses.`;
  return summary;
}

let vipStoreAutoSyncRunning = false;
let vipStoreStartupTimer = null;
let vipStoreIntervalTimer = null;

async function runVipStoreAutoSync(reason = "interval") {
  if (!isVipStoreConfigured() || vipStoreAutoSyncRunning) return;

  vipStoreAutoSyncRunning = true;
  try {
    const result = await syncVipStoreMappedProducts();
    if (Number(result.total_mapped || 0) > 0) {
      console.log("VIPSTORE AUTO SYNC:", reason, result.message);
    }
  } catch (err) {
    console.error("VIPSTORE AUTO SYNC ERROR:", err.message);
  } finally {
    vipStoreAutoSyncRunning = false;
  }
}

function startVipStoreAutoSync() {
  if (process.env.VIPSTORE_AUTO_SYNC === "false") {
    console.log("VIP Store auto sync disabled by VIPSTORE_AUTO_SYNC=false");
    return;
  }

  const intervalMs = Math.max(
    Number(process.env.VIPSTORE_SYNC_INTERVAL_MS || 5 * 60 * 1000),
    60 * 1000,
  );

  vipStoreStartupTimer = setTimeout(
    () => runVipStoreAutoSync("startup"),
    30 * 1000,
  );
  if (typeof vipStoreStartupTimer.unref === "function") {
    vipStoreStartupTimer.unref();
  }

  vipStoreIntervalTimer = setInterval(
    () => runVipStoreAutoSync("interval"),
    intervalMs,
  );
  if (typeof vipStoreIntervalTimer.unref === "function") {
    vipStoreIntervalTimer.unref();
  }

  console.log(`VIP Store auto sync ready every ${Math.round(intervalMs / 1000)}s`);
}

function stopVipStoreAutoSync() {
  if (vipStoreStartupTimer) {
    clearTimeout(vipStoreStartupTimer);
    vipStoreStartupTimer = null;
  }

  if (vipStoreIntervalTimer) {
    clearInterval(vipStoreIntervalTimer);
    vipStoreIntervalTimer = null;
  }
}


db.query(
  `
  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    username TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`,
  (err) => {
    if (err) {
      console.error("CREATE TABLE reviews ERROR:", err);
    } else {
      console.log("Table reviews ready");
    }
  },
);

db.query(`CREATE INDEX IF NOT EXISTS idx_reviews_active ON reviews(active)`);
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

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many webhook requests",
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

const reviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    message: "Terlalu banyak mengirim review, coba lagi nanti",
  },
});

const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Terlalu banyak percobaan ganti password, coba lagi 15 menit nanti",
  },
});

const voucherPreviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    message: "Terlalu banyak cek voucher, coba lagi nanti",
  },
});

const userProfileLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    message: "Terlalu banyak update data akun, coba lagi nanti",
  },
});

const emailVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Terlalu banyak request verifikasi email, coba lagi nanti",
  },
});

async function isAdminLoggedIn(req) {
  const sessionToken = String(req.cookies.admin_auth || "").trim();
  const userAgent = String(req.headers["user-agent"] || "").slice(0, 255);

  if (!sessionToken || !userAgent) {
    return false;
  }

  try {
    const result = await query(
      `SELECT id FROM admin_sessions
             WHERE session_token = $1
             AND expires_at > $2
             AND user_agent = $3
             LIMIT 1`,
      [sessionToken, new Date().toISOString(), userAgent],
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

function parseWalletAmount(value) {
  const amount = Number(String(value ?? "").replace(/[^0-9]/g, ""));
  if (!Number.isSafeInteger(amount)) return 0;
  return amount;
}

function formatWalletAmountForMessage(value) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

async function ensureWalletAccount(dbClient, userId) {
  const now = new Date().toISOString();
  await dbClient.query(
    `INSERT INTO wallet_accounts (user_id, balance, created_at, updated_at)
     VALUES ($1, 0, $2, $2)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId, now],
  );
}

async function getAdminSessionUsername(req) {
  const sessionToken = String(req.cookies.admin_auth || "").trim();
  if (!sessionToken) return "admin";
  const result = await query(
    `SELECT username FROM admin_sessions
     WHERE session_token = $1 AND expires_at > $2 LIMIT 1`,
    [sessionToken, new Date().toISOString()],
  );
  return String(result.rows[0]?.username || "admin").slice(0, 120);
}

async function settleWalletVipOrder(orderId) {
  try {
    const result = await query(`SELECT o.*, p.supplier_product_id FROM orders o LEFT JOIN products p ON p.id = o.product_id WHERE o.id = $1 LIMIT 1`, [orderId]);
    const order = result.rows[0];
    if (!order || order.delivery_status !== "processing_supplier") return;
    const claim = await claimVipStoreKeyForOrder(order, { source: "ae_credit" });
    const deliveredAt = new Date().toISOString();
    await persistOrderKeys(db, { orderId, keys: claim.keys, source: "vipstore" });
    await query(`UPDATE orders SET delivery_status = 'delivered', gameKey = $1, delivered_at = $2, admin_note = $3 WHERE id = $4 AND delivery_status = 'processing_supplier'`, [claim.key, deliveredAt, `VIP Store claim success. Supplier product #${claim.supplier_product_id}.`, orderId]);
    await query(`UPDATE products SET supplier_stock = GREATEST(COALESCE(supplier_stock, 0) - $1, 0), supplier_last_sync = $2 WHERE id = $3 AND LOWER(COALESCE(delivery_type, 'auto')) = 'vipstore_api'`, [getOrderQuantity(order.quantity), deliveredAt, order.product_id]);
  } catch (err) {
    console.error("AE CREDIT VIPSTORE CLAIM ERROR:", err.message);
    await query(`UPDATE orders SET delivery_status = 'problem', gameKey = $1, admin_note = $2 WHERE id = $3 AND delivery_status = 'processing_supplier'`, ["VIP STORE CLAIM FAILED - HUBUNGI ADMIN", `VIP Store claim failed: ${String(err.message || "Unknown error").slice(0, 500)}`, orderId]).catch(() => {});
  }
}

function maskPublicUsername(username) {
  const cleanName = String(username || "Buyer").trim();

  if (cleanName.length <= 2) {
    return cleanName[0] + "***";
  }

  return cleanName.slice(0, 2) + "***";
}

function normalizeVoucherCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase();
}

function normalizeProductIds(value) {
  const source = Array.isArray(value)
    ? value
    : String(value || "")
        .split(",")
        .map((entry) => entry.trim());

  const ids = source
    .map((entry) => Number(entry))
    .filter((entry) => Number.isInteger(entry) && entry > 0);

  return [...new Set(ids)];
}

async function getProductsByIds(productIds) {
  const ids = normalizeProductIds(productIds);

  if (!ids.length) return [];

  const result = await query(
    `SELECT *
     FROM products
     WHERE id = ANY($1::int[])
     ORDER BY game ASC, brand ASC, duration ASC, id ASC`,
    [ids],
  );

  return result.rows;
}

function buildVoucherScopeFromProducts(products) {
  const rows = Array.isArray(products) ? products : [];

  if (!rows.length) {
    return {
      gameName: "",
      brandName: "",
      durationName: "",
    };
  }

  const uniqueGames = [
    ...new Set(
      rows.map((item) => String(item.game || "").trim()).filter(Boolean),
    ),
  ];
  const uniqueBrands = [
    ...new Set(
      rows.map((item) => String(item.brand || "").trim()).filter(Boolean),
    ),
  ];
  const uniqueDurations = [
    ...new Set(
      rows.map((item) => String(item.duration || "").trim()).filter(Boolean),
    ),
  ];

  return {
    gameName: uniqueGames.length === 1 ? uniqueGames[0] : "Multiple Products",
    brandName: uniqueBrands.length === 1 ? uniqueBrands[0] : "",
    durationName: uniqueDurations.length === 1 ? uniqueDurations[0] : "",
  };
}

async function syncVoucherProductTargets(voucherId, productIds) {
  const cleanVoucherId = Number(voucherId);
  const ids = normalizeProductIds(productIds);

  if (!Number.isInteger(cleanVoucherId) || cleanVoucherId <= 0) return;

  await query("DELETE FROM voucher_products WHERE voucher_id = $1", [
    cleanVoucherId,
  ]);

  for (const productId of ids) {
    await query(
      `INSERT INTO voucher_products (voucher_id, product_id, created_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (voucher_id, product_id) DO NOTHING`,
      [cleanVoucherId, productId, new Date().toISOString()],
    );
  }
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function isValidOrderContact(contact) {
  const cleanContact = String(contact || "").trim();

  if (cleanContact.length < 5 || cleanContact.length > 80) {
    return false;
  }

  if (isValidEmail(cleanContact)) {
    return true;
  }

  if (/^\+?[0-9][0-9\s().-]{6,24}$/.test(cleanContact)) {
    return true;
  }

  if (/^@?[a-zA-Z0-9_]{5,32}$/.test(cleanContact)) {
    return true;
  }

  return false;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function getAppBaseUrl(req) {
  const configured = String(process.env.APP_BASE_URL || "").trim();
  if (configured) return configured.replace(/\/$/, "");

  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`.replace(/\/$/, "");
}

async function sendVerificationEmail({ to, username, verificationUrl }) {
  const resendApiKey = String(process.env.RESEND_API_KEY || "").trim();
  const fromEmail = String(
    process.env.RESEND_FROM_EMAIL || "AE Game Store <onboarding@resend.dev>",
  ).trim();

  if (!resendApiKey) {
    console.warn(
      "RESEND_API_KEY belum diset. Link verifikasi:",
      verificationUrl,
    );
    return { sent: false, provider: "dev-log" };
  }

  const subject = "Verify your AE Game Store email";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2>Verify your AE Game Store email</h2>
      <p>Halo ${String(username || "Buyer")}, klik tombol di bawah untuk verifikasi email kamu.</p>
      <p><a href="${verificationUrl}" style="display:inline-block;background:#0ea5e9;color:white;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:700">Verify Email</a></p>
      <p>Link ini berlaku 30 menit. Kalau kamu tidak meminta verifikasi, abaikan email ini.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend gagal kirim email: ${response.status} ${body}`);
  }

  return { sent: true, provider: "resend" };
}

function verifyMidtransSignature(notification) {
  const orderId = String(notification.order_id || "");
  const statusCode = String(notification.status_code || "");
  const grossAmount = String(notification.gross_amount || "");
  const signatureKey = String(notification.signature_key || "");
  const serverKey = String(process.env.MIDTRANS_SERVER_KEY || "");

  if (!orderId || !statusCode || !grossAmount || !signatureKey || !serverKey) {
    return false;
  }

  const expectedSignature = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");

  const actualBuffer = Buffer.from(signatureKey, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function createBuyerBadge({
  code,
  label,
  emoji,
  description,
  descriptionEn,
  benefitsId,
  benefitsEn,
  requirement,
  requirementEn,
}) {
  return {
    code,
    label,
    emoji,
    description,
    description_en: descriptionEn,
    benefits: {
      id: benefitsId,
      en: benefitsEn,
    },
    requirement,
    requirement_en: requirementEn,
  };
}

function getBadgeByCode(code) {
  const cleanCode = String(code || "")
    .trim()
    .toLowerCase();

  const badges = {
    entry: createBuyerBadge({
      code: "entry",
      label: "Rookie",
      emoji: "◇",
      description: "Titik awal perjalanan buyer AE Game Store",
      descriptionEn: "The starting point of your AE Game Store journey",
      requirement: "Akun buyer baru",
      requirementEn: "New buyer account",
      benefitsId: [
        "Akses akun dan riwayat transaksi",
        "Data checkout dapat disimpan untuk pembelian berikutnya",
        "Akses ke promo publik yang sedang aktif",
      ],
      benefitsEn: [
        "Access to account and transaction history",
        "Saved checkout details for future purchases",
        "Access to active public promotions",
      ],
    }),
    verified: createBuyerBadge({
      code: "verified",
      label: "Verified",
      emoji: "◆",
      description: "Buyer dengan transaksi pertama yang berhasil",
      descriptionEn: "Buyer with a first successful transaction",
      requirement: "Minimal 1 order berhasil",
      requirementEn: "At least 1 successful order",
      benefitsId: [
        "Semua benefit Rookie",
        "Status pembelian terverifikasi pada akun dan review",
        "Riwayat order dapat digunakan admin untuk bantuan transaksi",
      ],
      benefitsEn: [
        "All Rookie benefits",
        "Verified purchase status on account and reviews",
        "Order history can be used by admin for transaction support",
      ],
    }),
    prime: createBuyerBadge({
      code: "prime",
      label: "Vanguard",
      emoji: "✦",
      description: "Repeat buyer yang aktif dan konsisten",
      descriptionEn: "An active and consistent repeat buyer",
      requirement: "3 order berhasil atau total belanja Rp150.000+",
      requirementEn: "3 successful orders or Rp150,000+ total spend",
      benefitsId: [
        "Semua benefit Verified",
        "Badge repeat buyer di profil dan review",
        "Berpeluang masuk campaign khusus buyer aktif saat tersedia",
      ],
      benefitsEn: [
        "All Verified benefits",
        "Repeat-buyer badge on profile and reviews",
        "Eligible for active-buyer campaigns when available",
      ],
    }),
    prestige: createBuyerBadge({
      code: "prestige",
      label: "Prestige",
      emoji: "✧",
      description: "High-value buyer dengan benefit VIP",
      descriptionEn: "High-value buyer with VIP benefits",
      requirement: "10 order berhasil atau total belanja Rp500.000+",
      requirementEn: "10 successful orders or Rp500,000+ total spend",
      benefitsId: [
        "Semua benefit Vanguard",
        "Diskon VIP per key pada produk yang sudah dikonfigurasi",
        "Prioritas bantuan admin dan peluang voucher private",
      ],
      benefitsEn: [
        "All Vanguard benefits",
        "Per-key VIP discount on configured products",
        "Priority admin support and private voucher opportunities",
      ],
    }),
    sovereign: createBuyerBadge({
      code: "sovereign",
      label: "Sovereign",
      emoji: "♛",
      description: "Tier tertinggi untuk buyer paling loyal",
      descriptionEn: "The highest tier for the most loyal buyers",
      requirement: "20 order berhasil atau total belanja Rp1.000.000+",
      requirementEn: "20 successful orders or Rp1,000,000+ total spend",
      benefitsId: [
        "Semua benefit Prestige",
        "Badge buyer tertinggi di AE Game Store",
        "Prioritas utama untuk bantuan dan penawaran eksklusif",
      ],
      benefitsEn: [
        "All Prestige benefits",
        "Highest buyer badge on AE Game Store",
        "Top priority for support and exclusive offers",
      ],
    }),
    advocate: createBuyerBadge({
      code: "advocate",
      label: "Advocate",
      emoji: "★",
      description: "Badge spesial untuk kontributor komunitas",
      descriptionEn: "Special badge for community contributors",
      requirement: "Diberikan khusus oleh admin",
      requirementEn: "Specially granted by admin",
      benefitsId: [
        "Pengakuan khusus sebagai kontributor komunitas",
        "Label Advocate pada profil dan review",
        "Tidak menggantikan progres tier transaksi",
      ],
      benefitsEn: [
        "Special recognition as a community contributor",
        "Advocate label on profile and reviews",
        "Does not replace transaction-tier progression",
      ],
    }),
  };

  const aliases = {
    new: "entry",
    loyal: "prime",
    vip: "prestige",
    reviewer: "advocate",
  };

  return badges[cleanCode] || badges[aliases[cleanCode]] || null;
}

const BUYER_BADGE_TIERS = [
  { code: "entry", minOrders: 0, minSpend: 0 },
  { code: "verified", minOrders: 1, minSpend: 0 },
  { code: "prime", minOrders: 3, minSpend: 150000 },
  { code: "prestige", minOrders: 10, minSpend: 500000 },
  { code: "sovereign", minOrders: 20, minSpend: 1000000 },
];

function getBuyerBadgeLadder() {
  return BUYER_BADGE_TIERS.map((tier, rank) => {
    const badge = getBadgeByCode(tier.code);
    return {
      code: tier.code,
      rank,
      label: badge.label,
      emoji: badge.emoji,
      requirement: badge.requirement,
      requirement_en: badge.requirement_en,
    };
  });
}

function getBuyerBadge({
  paidOrderCount = 0,
  totalSpend = 0,
}) {
  const paidOrders = Number(paidOrderCount || 0);
  const spend = Number(totalSpend || 0);

  if (paidOrders >= 20 || spend >= 1000000) {
    return getBadgeByCode("sovereign");
  }

  if (paidOrders >= 10 || spend >= 500000) {
    return getBadgeByCode("prestige");
  }

  if (paidOrders >= 3 || spend >= 150000) {
    return getBadgeByCode("prime");
  }

  if (paidOrders >= 1) {
    return getBadgeByCode("verified");
  }

  return getBadgeByCode("entry");
}

function getBuyerBadgeProgress({
  paidOrderCount = 0,
  totalSpend = 0,
  currentBadgeCode = "",
}) {
  const paidOrders = Math.max(Number(paidOrderCount || 0), 0);
  const spend = Math.max(Number(totalSpend || 0), 0);
  const automaticBadge = getBuyerBadge({
    paidOrderCount: paidOrders,
    totalSpend: spend,
  });
  const automaticRank = BUYER_BADGE_TIERS.findIndex(
    (tier) => tier.code === automaticBadge.code,
  );
  const currentRank = BUYER_BADGE_TIERS.findIndex(
    (tier) => tier.code === String(currentBadgeCode || "").toLowerCase(),
  );
  const progressRank = Math.max(automaticRank, currentRank, 0);
  const currentTier = BUYER_BADGE_TIERS[progressRank];
  const nextTier = BUYER_BADGE_TIERS[progressRank + 1] || null;

  if (!nextTier) {
    return {
      currentBadge: getBadgeByCode(currentTier.code),
      nextBadge: null,
      is_highest_tier: true,
      progress_percent: 100,
      remaining_orders: 0,
      remaining_spend: 0,
      message: "Kamu sudah membuka tier buyer tertinggi.",
      message_en: "You have unlocked the highest buyer tier.",
    };
  }

  const remainingOrders = Math.max(nextTier.minOrders - paidOrders, 0);
  const remainingSpend = Math.max(nextTier.minSpend - spend, 0);
  const orderProgress = nextTier.minOrders > 0
    ? paidOrders / nextTier.minOrders
    : 0;
  const spendProgress = nextTier.minSpend > 0
    ? spend / nextTier.minSpend
    : 0;
  const progressRatio = nextTier.code === "verified"
    ? orderProgress
    : Math.max(orderProgress, spendProgress);
  const progressPercent = Math.max(
    0,
    Math.min(Math.round(progressRatio * 100), 100),
  );
  const message = nextTier.code === "verified"
    ? "Selesaikan 1 order pertama untuk membuka Verified."
    : `${remainingOrders} order lagi atau ${formatCurrencyForText(remainingSpend)} total belanja lagi.`;
  const messageEn = nextTier.code === "verified"
    ? "Complete your first order to unlock Verified."
    : `${remainingOrders} more orders or ${formatCurrencyForText(remainingSpend)} more total spend.`;

  return {
    currentBadge: getBadgeByCode(currentTier.code),
    nextBadge: getBadgeByCode(nextTier.code),
    is_highest_tier: false,
    progress_percent: progressPercent,
    remaining_orders: remainingOrders,
    remaining_spend: remainingSpend,
    message,
    message_en: messageEn,
  };
}

function formatCurrencyForText(value) {
  return "Rp" + Number(value || 0).toLocaleString("id-ID");
}
async function getUserBadgeOverride(userId) {
  const cleanUserId = Number(userId);

  if (!Number.isInteger(cleanUserId) || cleanUserId <= 0) {
    return null;
  }

  const result = await query(
    `
    SELECT badge_override, badge_override_expires_at
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [cleanUserId],
  );

  const user = result.rows[0];

  if (!user || !user.badge_override) {
    return null;
  }

  if (
    user.badge_override_expires_at &&
    new Date(user.badge_override_expires_at) < new Date()
  ) {
    return null;
  }

  return getBadgeByCode(user.badge_override);
}
async function getBuyerStats(userId) {
  const cleanUserId = Number(userId);

  if (!Number.isInteger(cleanUserId) || cleanUserId <= 0) {
    return {
      paidOrderCount: 0,
      totalSpend: 0,
      hasReview: false,
    };
  }

  const result = await query(
    `
    SELECT
      COUNT(o.id) FILTER (WHERE o.payment_status = 'paid')::int AS paid_order_count,
      COALESCE(SUM(o.price) FILTER (WHERE o.payment_status = 'paid'), 0)::int AS total_spend,
      CASE WHEN MAX(r.id) IS NULL THEN false ELSE true END AS has_review
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    LEFT JOIN reviews r ON r.user_id = u.id AND r.active = 1
    WHERE u.id = $1
    GROUP BY u.id
    `,
    [cleanUserId],
  );

  const row = result.rows[0];

  return {
    paidOrderCount: Number(row?.paid_order_count || 0),
    totalSpend: Number(row?.total_spend || 0),
    hasReview: Boolean(row?.has_review),
  };
}

async function isVipBuyer(userId) {
  const overrideBadge = await getUserBadgeOverride(userId);

  if (
    ["prestige", "sovereign", "vip"].includes(String(overrideBadge?.code || ""))
  ) {
    return true;
  }

  const stats = await getBuyerStats(userId);

  return (
    Number(stats.paidOrderCount || 0) >= 10 ||
    Number(stats.totalSpend || 0) >= 500000
  );
}

async function getVipDiscountForProduct({ userId, productId, productPrice }) {
  const cleanProductId = Number(productId);
  const price = Number(productPrice || 0);

  if (!Number.isInteger(cleanProductId) || cleanProductId <= 0 || price <= 0) {
    return {
      valid: false,
      code: "",
      discountAmount: 0,
      message: "",
    };
  }

  const vip = await isVipBuyer(userId);

  if (!vip) {
    return {
      valid: false,
      code: "",
      discountAmount: 0,
      message: "",
    };
  }

  const result = await query(
    `
    SELECT *
    FROM vip_discounts
    WHERE product_id = $1
      AND active = 1
    LIMIT 1
    `,
    [cleanProductId],
  );

  const rule = result.rows[0];

  if (!rule) {
    return {
      valid: false,
      code: "",
      discountAmount: 0,
      message: "",
    };
  }

  const rawDiscount = Number(rule.discount_amount || 0);
  const maxDiscount = Math.max(price - 1000, 0);
  const discountAmount = Math.min(rawDiscount, maxDiscount);

  if (discountAmount <= 0) {
    return {
      valid: false,
      code: "",
      discountAmount: 0,
      message: "",
    };
  }

  return {
    valid: true,
    code: "VIP_DISCOUNT",
    discountAmount,
    message: "Diskon VIP berhasil digunakan",
  };
}
async function getBestCheckoutDiscount({
  userId,
  productId,
  productRow,
  voucherCode,
  quantity = 1,
}) {
  const originalPrice = Number(productRow.price || 0);
  const cleanVoucherCode = normalizeVoucherCode(voucherCode);

  const vipCheck = await getVipDiscountForProduct({
    userId,
    productId,
    productPrice: originalPrice,
  });

  let voucherCheck = {
    valid: true,
    code: "",
    discountAmount: 0,
    message: "",
  };

  if (cleanVoucherCode) {
    voucherCheck = await getVoucherDiscount({
      productId,
      gameName: productRow.game,
      brandName: productRow.brand,
      durationName: productRow.duration,
      voucherCode: cleanVoucherCode,
      productPrice: originalPrice,
      userId,
    });

    if (!voucherCheck.valid && !vipCheck.valid) {
      return {
        valid: false,
        message: voucherCheck.message,
      };
    }
  }

  const voucherDiscount = Number(voucherCheck.discountAmount || 0);
  const vipDiscountPerKey = Number(vipCheck.discountAmount || 0);
  const vipDiscount = vipCheck.valid
    ? calculateVipOrderDiscount(vipDiscountPerKey, quantity)
    : 0;

  if (vipCheck.valid && vipDiscount > voucherDiscount) {
    return {
      valid: true,
      code: vipCheck.code,
      discountAmount: vipDiscount,
      discountPerKey: vipDiscountPerKey,
      message: `${vipCheck.message} (${getOrderQuantity(quantity)} key)`,
      discountType: "vip",
    };
  }

  return {
    valid: true,
    code: voucherCheck.code || "",
    discountAmount: voucherDiscount,
    message: voucherCheck.message || "Harga berhasil dihitung",
    discountType: voucherDiscount > 0 ? "voucher" : "",
  };
}

function getAdminBadge() {
  const role = String(process.env.ADMIN_BADGE || "owner")
    .trim()
    .toLowerCase();

  if (role === "staff") {
    return {
      code: "staff",
      label: "Staff",
      emoji: "⚙️",
      description: "Staff operasional AE Game Store",
    };
  }

  if (role === "admin") {
    return {
      code: "admin",
      label: "Admin",
      emoji: "🛡️",
      description: "Admin AE Game Store",
    };
  }

  return {
    code: "owner",
    label: "Owner",
    emoji: "👑",
    description: "Owner AE Game Store",
  };
}

async function getVoucherDiscount({
  productId,
  gameName,
  brandName,
  durationName,
  voucherCode,
  productPrice,
  userId,
}) {
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

  const currentProductId = Number(productId || 0);
  const targetProductsResult = await query(
    `SELECT product_id
     FROM voucher_products
     WHERE voucher_id = $1`,
    [voucher.id],
  );
  const targetProductIds = targetProductsResult.rows
    .map((row) => Number(row.product_id || 0))
    .filter((entry) => Number.isInteger(entry) && entry > 0);

  if (targetProductIds.length > 0) {
    if (!currentProductId || !targetProductIds.includes(currentProductId)) {
      return {
        valid: false,
        message: "Voucher ini tidak berlaku untuk produk ini",
      };
    }
  } else {
    const targetProductId = Number(voucher.product_id || 0);

    if (targetProductId && targetProductId !== currentProductId) {
      return {
        valid: false,
        message: "Voucher ini tidak berlaku untuk produk ini",
      };
    }

    const targetGame = String(voucher.game_name || "")
      .trim()
      .toLowerCase();
    const targetBrand = String(voucher.brand_name || "")
      .trim()
      .toLowerCase();
    const targetDuration = String(voucher.duration_name || "")
      .trim()
      .toLowerCase();

    const currentGame = String(gameName || "")
      .trim()
      .toLowerCase();
    const currentBrand = String(brandName || "")
      .trim()
      .toLowerCase();
    const currentDuration = String(durationName || "")
      .trim()
      .toLowerCase();

    if (targetGame && targetGame !== currentGame) {
      return {
        valid: false,
        message: "Voucher ini tidak berlaku untuk game ini",
      };
    }

    if (targetBrand && targetBrand !== currentBrand) {
      return {
        valid: false,
        message: "Voucher ini tidak berlaku untuk brand ini",
      };
    }

    if (targetDuration && targetDuration !== currentDuration) {
      return {
        valid: false,
        message: "Voucher ini tidak berlaku untuk durasi ini",
      };
    }
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

function requireUserCsrf(req, res, next) {
  const csrfFromCookie = String(req.cookies.user_csrf || "").trim();
  const csrfFromHeader = String(req.headers["x-user-csrf-token"] || "").trim();

  if (!csrfFromCookie || !csrfFromHeader || csrfFromCookie !== csrfFromHeader) {
    return res.status(403).json({
      message: "Invalid user CSRF token",
    });
  }

  next();
}

function requireSafeAdminAction(req, res, next) {
  const isWriteMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(
    String(req.method || "").toUpperCase(),
  );

  if (!isWriteMethod) {
    return next();
  }

  const csrfFromCookie = String(req.cookies.admin_csrf || "").trim();
  const csrfFromHeader = String(req.headers["x-csrf-token"] || "").trim();

  if (!csrfFromCookie || !csrfFromHeader || csrfFromCookie !== csrfFromHeader) {
    return res.status(403).json({
      message: "Invalid CSRF token",
    });
  }

  return next();
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
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://code.iconify.design",
          "https://app.midtrans.com",
          "https://app.sandbox.midtrans.com",
        ],
        "script-src-attr": ["'unsafe-inline'"],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://app.midtrans.com",
          "https://app.sandbox.midtrans.com",
        ],
        "style-src-attr": ["'unsafe-inline'"],
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "connect-src": [
          "'self'",
          "https://api.iconify.design",
          "https://api.simplesvg.com",
          "https://api.unisvg.com",
          "https://app.midtrans.com",
          "https://app.sandbox.midtrans.com",
          "https://api.midtrans.com",
          "https://api.sandbox.midtrans.com",
        ],
        "frame-src": [
          "'self'",
          "https://app.midtrans.com",
          "https://app.sandbox.midtrans.com",
        ],
        "child-src": [
          "'self'",
          "https://app.midtrans.com",
          "https://app.sandbox.midtrans.com",
        ],
        "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'self'"],
      },
    },
  }),
);

app.use(
  compression({
    threshold: 1024,
  }),
);

app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Origin-Agent-Cluster", "?1");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use((req, res, next) => {
  const nonIndexablePaths = [
    "/account",
    "/admin",
    "/ae-auth",
    "/ae-control",
    "/auth",
    "/health",
    "/offline",
    "/payment",
    "/result",
  ];

  if (
    nonIndexablePaths.some(
      (routePath) =>
        req.path === routePath || req.path.startsWith(`${routePath}/`),
    ) ||
    req.path.startsWith("/api/")
  ) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  if (
    req.path.startsWith("/orders") ||
    req.path.startsWith("/order/") ||
    req.path.startsWith("/user/orders") ||
    req.path.startsWith("/users") ||
    req.path.startsWith("/keys") ||
    req.path.startsWith("/vouchers") ||
    req.path.startsWith("/vip-discounts") ||
    req.path.startsWith("/products") ||
    req.path.startsWith("/security-audit") ||
    req.path.startsWith("/public-products") ||
    req.path.startsWith("/public-vouchers") ||
    req.path.startsWith("/trending-products") ||
    req.path.startsWith("/recent-purchases") ||
    req.path.startsWith("/api/user") ||
    req.path.startsWith("/api/admin")
  ) {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }

  next();
});

app.use(
  express.static("public", {
    etag: true,
    maxAge: 0,
    setHeaders: (res, filePath) => {
      const originalUrl = String(res.req?.originalUrl || "");
      const isVersionedAsset = /[?&]v=[a-zA-Z0-9._-]+(?:&|$)/.test(
        originalUrl,
      );
      const isStyleOrScript =
        filePath.endsWith(".css") || filePath.endsWith(".js");
      const isLongLivedAsset =
        /\.(?:avif|gif|ico|jpe?g|png|svg|webp|woff2?)$/i.test(filePath);

      if (
        filePath.endsWith(".html") ||
        filePath.endsWith("service-worker.js")
      ) {
        res.setHeader("Cache-Control", "no-cache");
      } else if (isStyleOrScript && isVersionedAsset) {
        res.setHeader(
          "Cache-Control",
          "public, max-age=31536000, immutable",
        );
      } else if (isStyleOrScript) {
        res.setHeader("Cache-Control", "no-cache");
      } else if (isLongLivedAsset) {
        res.setHeader("Cache-Control", "public, max-age=604800");
      } else if (filePath.endsWith("manifest.json")) {
        res.setHeader("Cache-Control", "public, max-age=86400");
      }
    },
  }),
);

app.get("/health", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (isShuttingDown) {
    return res.status(503).json({
      ok: false,
      db: false,
      message: "Server is shutting down",
    });
  }

  try {
    await db.query({ text: "SELECT 1", query_timeout: 3000 });
    return res.json({
      ok: true,
      db: true,
      time: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      db: false,
      message: "Database check failed",
    });
  }
});

// Apply global limiter after static assets so CSS/JS/images do not consume API quota.
app.use(globalLimiter);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/result", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "result.html"));
});

app.get("/auth", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "user-auth.html"));
});

app.get("/account", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
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

      const ipAddress =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "";

      const userAgent = String(req.headers["user-agent"] || "").slice(0, 255);

      await query(
        `INSERT INTO admin_sessions
    (session_token, username, created_at, expires_at, ip_address, user_agent)
   VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          sessionToken,
          cleanUsername,
          createdAt.toISOString(),
          expiresAt.toISOString(),
          ipAddress,
          userAgent,
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


app.post(
  "/admin-logout-other-sessions",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const currentToken = String(req.cookies.admin_auth || "").trim();

    if (!currentToken) {
      return res.status(401).json({
        message: "Admin session tidak valid",
      });
    }

    try {
      await deleteExpiredAdminSessions();

      const result = await query(
        `
        DELETE FROM admin_sessions
        WHERE session_token <> $1
        RETURNING id
        `,
        [currentToken],
      );

      return res.json({
        message: "Semua session lain berhasil dilogout",
        deleted_sessions: result.rowCount || 0,
      });
    } catch (err) {
      console.error("ERROR LOGOUT OTHER ADMIN SESSIONS:", err);
      return res.status(500).json({
        message: "Gagal logout session lain",
      });
    }
  },
);

app.get("/ae-control", requireAdminAuth, (req, res) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

app.get("/api/admin/me", requireAdminAuth, async (req, res) => {
  const sessionToken = String(req.cookies.admin_auth || "").trim();

  try {
    const result = await query(
      `
      SELECT username, created_at, expires_at
      FROM admin_sessions
      WHERE session_token = $1
        AND expires_at > $2
      LIMIT 1
      `,
      [sessionToken, new Date().toISOString()],
    );

    const session = result.rows[0];

    if (!session) {
      return res.status(401).json({
        loggedIn: false,
        message: "Admin session tidak valid",
      });
    }

    return res.json({
      loggedIn: true,
      username: session.username,
      badge: getAdminBadge(),
      session: {
        created_at: session.created_at,
        expires_at: session.expires_at,
      },
    });
  } catch (err) {
    console.error("ERROR GET ADMIN ME:", err);
    return res.status(500).json({
      loggedIn: false,
      message: "Gagal mengambil data admin",
    });
  }
});


// VIP Store reseller API admin test endpoints — STEP 1 (20260625-vipstore-step1-api-client-v1)
app.get("/api/admin/vipstore/status", requireAdminAuth, async (req, res) => {
  const config = getVipStoreConfig();

  return res.json({
    configured: isVipStoreConfigured(),
    baseUrl: config.baseUrl,
    userId: config.userId || null,
    apiKey: maskSecret(config.apiKey),
    apiSecretConfigured: Boolean(config.apiSecret),
    endpoints: {
      catalog: "/api/admin/vipstore/catalog",
      balance: "/api/admin/vipstore/balance",
      product_lookup: "/api/admin/vipstore/product/:productId",
      catalog_picker: "/api/admin/vipstore/catalog-normalized",
      sync_products: "/api/admin/vipstore/sync-products",
    },
    note: "Step 3 supports supplier stock sync. Buyer checkout auto-claim is not changed yet.",
  });
});

app.get("/api/admin/vipstore/catalog", requireAdminAuth, async (req, res) => {
  try {
    const result = await getVipStoreCatalog();
    const items = extractVipStoreCatalogItems(result.data);

    return res.status(result.ok ? 200 : result.http_code || 502).json({
      ok: result.ok,
      http_code: result.http_code,
      total_detected_items: items.length,
      data: result.data,
    });
  } catch (err) {
    console.error("ERROR VIPSTORE CATALOG:", err);
    const statusCode = err.code === "VIPSTORE_NOT_CONFIGURED" ? 503 : 502;
    return res.status(statusCode).json({
      ok: false,
      code: err.code || "VIPSTORE_ERROR",
      message: err.message || "Gagal mengambil catalog VIP Store",
    });
  }
});


app.get("/api/admin/vipstore/product/:productId", requireAdminAuth, async (req, res) => {
  try {
    const lookup = await findVipStoreProductById(req.params.productId);

    if (!lookup.found || !lookup.product) {
      return res.status(404).json({
        ok: false,
        found: false,
        http_code: lookup.http_code || 404,
        total_detected_items: lookup.total_detected_items || 0,
        message: "Produk supplier tidak ditemukan. Cek lagi VIP Store Product ID.",
      });
    }

    return res.json({
      ok: true,
      found: true,
      http_code: lookup.http_code || 200,
      total_detected_items: lookup.total_detected_items || 0,
      product: lookup.product,
    });
  } catch (err) {
    console.error("ERROR VIPSTORE PRODUCT LOOKUP:", err);
    const statusCode = err.code === "VIPSTORE_NOT_CONFIGURED" ? 503 : 502;

    return res.status(statusCode).json({
      ok: false,
      found: false,
      code: err.code || "VIPSTORE_ERROR",
      message: err.message || "Gagal cek produk VIP Store",
    });
  }
});


app.get("/api/admin/vipstore/catalog-normalized", requireAdminAuth, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    const limit = Math.min(Math.max(Number(req.query.limit || 500), 1), 800);
    const result = await getVipStoreCatalog();
    const items = extractVipStoreCatalogItems(result.data);
    let products = items.map(normalizeVipStoreCatalogProduct);

    if (q) {
      const terms = q.split(/\s+/).filter(Boolean);
      products = products.filter((item) => {
        const haystack = [
          item.product_id,
          item.name,
          item.category,
          item.duration,
          item.status,
          item.stock,
          item.price,
        ]
          .join(" ")
          .toLowerCase();

        return terms.every((term) => haystack.includes(term));
      });
    }

    products = products
      .sort((a, b) => {
        const statusRank = { ready: 0, out_of_stock: 1, maintenance: 2, hidden: 3 };
        const aRank = statusRank[a.status] ?? 9;
        const bRank = statusRank[b.status] ?? 9;
        if (aRank !== bRank) return aRank - bRank;
        return String(a.name || "").localeCompare(String(b.name || ""));
      })
      .slice(0, limit);

    return res.status(result.ok ? 200 : result.http_code || 502).json({
      ok: result.ok,
      http_code: result.http_code,
      total_detected_items: items.length,
      total_returned_items: products.length,
      items: products,
    });
  } catch (err) {
    console.error("ERROR VIPSTORE NORMALIZED CATALOG:", err);
    const statusCode = err.code === "VIPSTORE_NOT_CONFIGURED" ? 503 : 502;
    return res.status(statusCode).json({
      ok: false,
      code: err.code || "VIPSTORE_ERROR",
      message: err.message || "Gagal mengambil catalog normal VIP Store",
      items: [],
    });
  }
});

app.get("/api/admin/vipstore/balance", requireAdminAuth, async (req, res) => {
  try {
    const result = await getVipStoreBalance();

    return res.status(result.ok ? 200 : result.http_code || 502).json({
      ok: result.ok,
      http_code: result.http_code,
      data: result.data,
    });
  } catch (err) {
    console.error("ERROR VIPSTORE BALANCE:", err);
    const statusCode = err.code === "VIPSTORE_NOT_CONFIGURED" ? 503 : 502;
    return res.status(statusCode).json({
      ok: false,
      code: err.code || "VIPSTORE_ERROR",
      message: err.message || "Gagal mengambil balance VIP Store",
    });
  }
});



app.post("/api/admin/vipstore/sync-products", requireAdminAuth, requireAdminCsrf, async (req, res) => {
  try {
    const productIds = Array.isArray(req.body?.product_ids)
      ? req.body.product_ids
      : req.body?.product_id
        ? [req.body.product_id]
        : [];

    const result = await syncVipStoreMappedProducts({ productIds });

    return res.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    console.error("ERROR VIPSTORE SYNC PRODUCTS:", err);
    const statusCode = err.code === "VIPSTORE_NOT_CONFIGURED" ? 503 : 502;

    return res.status(statusCode).json({
      ok: false,
      code: err.code || "VIPSTORE_SYNC_ERROR",
      message: err.message || "Gagal sync stok VIP Store",
    });
  }
});

app.post("/api/admin/vipstore/sync-products/:productId", requireAdminAuth, requireAdminCsrf, async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: "ID produk tidak valid",
      });
    }

    const result = await syncVipStoreMappedProducts({ productId });

    return res.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    console.error("ERROR VIPSTORE SYNC SINGLE PRODUCT:", err);
    const statusCode = err.code === "VIPSTORE_NOT_CONFIGURED" ? 503 : 502;

    return res.status(statusCode).json({
      ok: false,
      code: err.code || "VIPSTORE_SYNC_ERROR",
      message: err.message || "Gagal sync stok produk VIP Store",
    });
  }
});


app.get("/api/admin/vipstore/safety", requireAdminAuth, async (req, res) => {
  const threshold = Number(process.env.VIPSTORE_LOW_BALANCE_WARNING || 2);

  try {
    const [balanceResult, problemResult, recentLogsResult] = await Promise.all([
      getVipStoreBalance().catch((err) => ({
        ok: false,
        http_code: 0,
        data: { message: err.message },
      })),
      query(
        `
        SELECT
          COUNT(*) FILTER (
            WHERE payment_status = 'paid'
              AND delivery_status IN ('problem', 'processing_supplier')
              AND COALESCE(gameKey, '') ILIKE '%VIP STORE%'
          )::int AS attention_count,
          COUNT(*) FILTER (
            WHERE payment_status = 'paid'
              AND delivery_status = 'problem'
              AND COALESCE(gameKey, '') ILIKE '%VIP STORE%'
          )::int AS problem_count,
          COUNT(*) FILTER (
            WHERE payment_status = 'paid'
              AND delivery_status = 'processing_supplier'
          )::int AS processing_count
        FROM orders
        `,
      ),
      query(
        `
        SELECT *
        FROM vipstore_claim_logs
        ORDER BY created_at DESC, id DESC
        LIMIT 8
        `,
      ).catch(() => ({ rows: [] })),
    ]);

    const balance = extractVipStoreBalanceValue(balanceResult.data);
    const counts = problemResult.rows[0] || {};
    const lowBalance =
      balance !== null && Number.isFinite(balance) && balance <= threshold;

    return res.json({
      ok: true,
      balance_ok: Boolean(balanceResult.ok),
      balance,
      low_balance: lowBalance,
      low_balance_threshold: threshold,
      attention_count: Number(counts.attention_count || 0),
      problem_count: Number(counts.problem_count || 0),
      processing_count: Number(counts.processing_count || 0),
      recent_logs: recentLogsResult.rows || [],
    });
  } catch (err) {
    console.error("ERROR VIPSTORE SAFETY:", err);
    return res.status(500).json({
      ok: false,
      message: "Gagal mengambil status safety VIP Store",
    });
  }
});

app.get("/api/admin/vipstore/claim-logs", requireAdminAuth, async (req, res) => {
  const orderId = String(req.query.order_id || "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 100);

  try {
    const params = [];
    let where = "";

    if (orderId) {
      params.push(orderId);
      where = "WHERE order_id = $1";
    }

    params.push(limit);

    const result = await query(
      `
      SELECT *
      FROM vipstore_claim_logs
      ${where}
      ORDER BY created_at DESC, id DESC
      LIMIT $${params.length}
      `,
      params,
    );

    return res.json({
      ok: true,
      rows: result.rows || [],
    });
  } catch (err) {
    console.error("ERROR VIPSTORE CLAIM LOGS:", err);
    return res.status(500).json({
      ok: false,
      message: "Gagal mengambil claim logs VIP Store",
    });
  }
});

app.post(
  "/api/admin/vipstore/retry-claim/:orderId",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const orderId = String(req.params.orderId || "").trim();

    if (!orderId) {
      return res.status(400).json({
        ok: false,
        message: "Order ID tidak valid",
      });
    }

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const orderResult = await client.query(
        `SELECT
           o.*,
           COALESCE(p.delivery_type, 'auto') AS delivery_type,
           COALESCE(p.supplier_source, '') AS supplier_source,
           COALESCE(p.supplier_product_id, '') AS supplier_product_id,
           COALESCE(p.supplier_product_name, '') AS supplier_product_name,
           COALESCE(p.supplier_stock, 0) AS supplier_stock,
           COALESCE(p.supplier_status, '') AS supplier_status,
           COALESCE(p.supplier_maintenance, 0) AS supplier_maintenance
         FROM orders o
         LEFT JOIN products p ON p.id = o.product_id
         WHERE o.id = $1
         LIMIT 1
         FOR UPDATE OF o`,
        [orderId],
      );

      const order = orderResult.rows[0];

      if (!order) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          ok: false,
          message: "Order tidak ditemukan",
        });
      }

      const deliveryType = normalizeProductDeliveryType(order.delivery_type);
      const paymentStatus = String(order.payment_status || "").toLowerCase();
      const deliveryStatus = String(order.delivery_status || "").toLowerCase();
      const existingKey = String(order.gamekey || order.gameKey || "").trim();

      if (deliveryType !== "vipstore_api") {
        await client.query("ROLLBACK");
        return res.status(400).json({
          ok: false,
          message: "Order ini bukan produk VIP Store API",
        });
      }

      if (paymentStatus !== "paid") {
        await client.query("ROLLBACK");
        return res.status(400).json({
          ok: false,
          message: "Order belum paid. Jangan claim supplier sebelum pembayaran sukses.",
        });
      }

      if (deliveryStatus === "delivered" && existingKey) {
        await client.query("ROLLBACK");
        return res.json({
          ok: true,
          skipped: true,
          message: "Order sudah delivered. Claim tidak dijalankan ulang.",
        });
      }

      if (deliveryStatus === "processing_supplier") {
        await client.query("ROLLBACK");
        return res.status(409).json({
          ok: false,
          message: "Order sedang processing supplier. Tunggu proses sebelumnya selesai.",
        });
      }

      await client.query(
        `UPDATE orders
         SET delivery_status = $1,
             admin_note = $2
         WHERE id = $3`,
        [
          "processing_supplier",
          "Retry claim VIP Store diproses dari admin",
          orderId,
        ],
      );

      await client.query("COMMIT");

      try {
        const claim = await claimVipStoreKeyForOrder(order, {
          source: "admin_retry",
        });
        const deliveredAt = new Date().toISOString();

        await persistOrderKeys(db, {
          orderId,
          keys: claim.keys,
          source: "vipstore",
        });

        await query(
          `UPDATE orders
           SET delivery_status = $1,
               gameKey = $2,
               delivered_at = $3,
               admin_note = $4
           WHERE id = $5
             AND delivery_status = $6`,
          [
            "delivered",
            claim.key,
            deliveredAt,
            `VIP Store retry success. Supplier product #${claim.supplier_product_id}.`,
            orderId,
            "processing_supplier",
          ],
        );

        await query(
          `UPDATE products
           SET supplier_stock = GREATEST(COALESCE(supplier_stock, 0) - $1, 0),
               supplier_last_sync = $2
            WHERE id = $3
              AND LOWER(COALESCE(delivery_type, 'auto')) = 'vipstore_api'`,
          [getOrderQuantity(order.quantity), deliveredAt, order.product_id],
        );

        return res.json({
          ok: true,
          message: "Retry claim berhasil. Key VIP Store sudah dikirim.",
        });
      } catch (claimErr) {
        console.error("VIPSTORE RETRY CLAIM ERROR:", claimErr.message);

        await query(
          `UPDATE orders
           SET delivery_status = $1,
               gameKey = $2,
               admin_note = $3
           WHERE id = $4
             AND delivery_status = $5`,
          [
            "problem",
            "VIP STORE CLAIM FAILED - HUBUNGI ADMIN",
            `VIP Store retry failed: ${String(claimErr.message || "Unknown error").slice(0, 500)}`,
            orderId,
            "processing_supplier",
          ],
        );

        return res.status(502).json({
          ok: false,
          message: "Retry claim gagal. Cek balance supplier / claim log.",
        });
      }
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch (_) {}

      console.error("ERROR VIPSTORE RETRY CLAIM:", err);
      return res.status(500).json({
        ok: false,
        message: "Gagal retry claim VIP Store",
      });
    } finally {
      client.release();
    }
  },
);

app.post("/vouchers", requireAdminAuth, requireAdminCsrf, async (req, res) => {
  const {
    code,
    product_id,
    product_ids,
    game_name,
    brand_name,
    duration_name,
    discount_amount,
    expires_at,
    visibility,
    target_username,
  } = req.body;

  const cleanCode = normalizeVoucherCode(code);
  const legacyProductId = Number(product_id || 0);
  const selectedProductIds = normalizeProductIds(product_ids);

  let cleanGameName = String(game_name || "").trim();
  let cleanBrandName = String(brand_name || "").trim();
  let cleanDurationName = String(duration_name || "").trim();
  let cleanProductId =
    Number.isInteger(legacyProductId) && legacyProductId > 0
      ? legacyProductId
      : null;

  const discountAmount = Number(discount_amount);
  const expiresAt = expires_at ? String(expires_at).trim() : null;
  const cleanVisibility =
    String(visibility || "public")
      .trim()
      .toLowerCase() === "private"
      ? "private"
      : "public";

  // Private voucher = hidden voucher, not user-specific.
  // Anyone can redeem it if they know the code, but it will not appear in /public-vouchers.
  const targetUserId = null;

  try {
    let targetProducts = [];
    const targetIds = selectedProductIds.length
      ? selectedProductIds
      : cleanProductId
        ? [cleanProductId]
        : [];

    if (targetIds.length) {
      targetProducts = await getProductsByIds(targetIds);

      if (targetProducts.length !== targetIds.length) {
        return res.status(400).json({
          message: "Salah satu produk voucher tidak ditemukan",
        });
      }

      const scope = buildVoucherScopeFromProducts(targetProducts);
      cleanGameName = scope.gameName;
      cleanBrandName = scope.brandName;
      cleanDurationName = scope.durationName;
      cleanProductId = targetIds.length === 1 ? targetIds[0] : null;
    }

    if (!/^[A-Z0-9_-]{3,30}$/.test(cleanCode)) {
      return res.status(400).json({
        message:
          "Kode voucher hanya boleh huruf, angka, underscore, strip, 3-30 karakter",
      });
    }

    if (
      !cleanGameName ||
      cleanGameName.length < 2 ||
      cleanGameName.length > 80
    ) {
      return res.status(400).json({
        message: "Pilih minimal 1 produk atau isi nama game voucher",
      });
    }

    if (!Number.isInteger(discountAmount) || discountAmount <= 0) {
      return res.status(400).json({
        message: "Diskon tidak valid",
      });
    }

    const result = await query(
      `INSERT INTO vouchers
  (code, product_id, game_name, brand_name, duration_name, discount_amount, active, expires_at, created_at, visibility, target_user_id)
 VALUES
  ($1, $2, $3, $4, $5, $6, 1, $7, $8, $9, $10)
 ON CONFLICT (code)
 DO UPDATE SET
  game_name = EXCLUDED.game_name,
  brand_name = EXCLUDED.brand_name,
  duration_name = EXCLUDED.duration_name,
  discount_amount = EXCLUDED.discount_amount,
  active = 1,
  expires_at = EXCLUDED.expires_at,
  visibility = EXCLUDED.visibility,
  target_user_id = EXCLUDED.target_user_id,
  product_id = EXCLUDED.product_id
 RETURNING id`,
      [
        cleanCode,
        cleanProductId,
        cleanGameName,
        cleanBrandName || null,
        cleanDurationName || null,
        discountAmount,
        expiresAt,
        new Date().toISOString(),
        cleanVisibility,
        targetUserId,
      ],
    );

    const voucherId = result.rows[0]?.id;
    await syncVoucherProductTargets(voucherId, targetIds);

    return res.json({
      message:
        targetIds.length > 1
          ? `Voucher berhasil disimpan untuk ${targetIds.length} produk`
          : "Voucher berhasil disimpan",
    });
  } catch (err) {
    console.error("ERROR SAVE VOUCHER:", err);
    return res.status(500).json({
      message: "Gagal menyimpan voucher",
    });
  }
});

app.put(
  "/vouchers/:id",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const voucherId = Number(req.params.id);
    const {
      code,
      product_id,
      product_ids,
      game_name,
      brand_name,
      duration_name,
      discount_amount,
      expires_at,
      visibility,
      target_username,
    } = req.body;

    const cleanCode = normalizeVoucherCode(code);
    const legacyProductId = Number(product_id || 0);
    const selectedProductIds = normalizeProductIds(product_ids);

    let cleanGameName = String(game_name || "").trim();
    let cleanBrandName = String(brand_name || "").trim();
    let cleanDurationName = String(duration_name || "").trim();
    let cleanProductId =
      Number.isInteger(legacyProductId) && legacyProductId > 0
        ? legacyProductId
        : null;

    const discountAmount = Number(discount_amount);
    const expiresAt = expires_at ? String(expires_at).trim() : null;
    const cleanVisibility =
      String(visibility || "public")
        .trim()
        .toLowerCase() === "private"
        ? "private"
        : "public";

    // Private voucher = hidden voucher, not user-specific.
    // Anyone can redeem it if they know the code, but it will not appear in /public-vouchers.
    // Keep target_user_id nulled for backward compatibility with old saved data.
    const targetUserId = null;

    if (!Number.isInteger(voucherId) || voucherId <= 0) {
      return res.status(400).json({ message: "ID voucher tidak valid" });
    }

    try {
      let targetProducts = [];
      const targetIds = selectedProductIds.length
        ? selectedProductIds
        : cleanProductId
          ? [cleanProductId]
          : [];

      if (targetIds.length) {
        targetProducts = await getProductsByIds(targetIds);

        if (targetProducts.length !== targetIds.length) {
          return res.status(400).json({
            message: "Salah satu produk voucher tidak ditemukan",
          });
        }

        const scope = buildVoucherScopeFromProducts(targetProducts);
        cleanGameName = scope.gameName;
        cleanBrandName = scope.brandName;
        cleanDurationName = scope.durationName;
        cleanProductId = targetIds.length === 1 ? targetIds[0] : null;
      }

      if (!/^[A-Z0-9_-]{3,30}$/.test(cleanCode)) {
        return res.status(400).json({
          message:
            "Kode voucher hanya boleh huruf, angka, underscore, strip, 3-30 karakter",
        });
      }

      if (
        !cleanGameName ||
        cleanGameName.length < 2 ||
        cleanGameName.length > 80
      ) {
        return res.status(400).json({
          message: "Pilih minimal 1 produk atau isi nama game voucher",
        });
      }

      if (!Number.isInteger(discountAmount) || discountAmount <= 0) {
        return res.status(400).json({
          message: "Diskon tidak valid",
        });
      }

      const duplicateCheck = await query(
        "SELECT id FROM vouchers WHERE code = $1 AND id <> $2 LIMIT 1",
        [cleanCode, voucherId],
      );

      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({
          message: "Kode voucher sudah dipakai voucher lain",
        });
      }

      const result = await query(
        `UPDATE vouchers
         SET code = $1,
             product_id = $2,
             game_name = $3,
             brand_name = $4,
             duration_name = $5,
             discount_amount = $6,
             expires_at = $7,
             visibility = $8,
             target_user_id = $9
         WHERE id = $10
         RETURNING id`,
        [
          cleanCode,
          cleanProductId,
          cleanGameName,
          cleanBrandName || null,
          cleanDurationName || null,
          discountAmount,
          expiresAt,
          cleanVisibility,
          targetUserId,
          voucherId,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Voucher tidak ditemukan",
        });
      }

      await syncVoucherProductTargets(voucherId, targetIds);

      return res.json({
        message:
          targetIds.length > 1
            ? `Voucher berhasil diupdate untuk ${targetIds.length} produk`
            : "Voucher berhasil diupdate",
      });
    } catch (err) {
      console.error("ERROR UPDATE VOUCHER:", err);
      return res.status(500).json({
        message: "Gagal update voucher",
      });
    }
  },
);

app.get("/vouchers", requireAdminAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT
          vouchers.*,
          users.username AS target_username,
          COALESCE(product_targets.product_ids, '[]'::json) AS product_ids,
          COALESCE(product_targets.product_count, 0) AS product_count,
          COALESCE(product_targets.product_scope, '') AS product_scope
        FROM vouchers
        LEFT JOIN users ON users.id = vouchers.target_user_id
        LEFT JOIN LATERAL (
          SELECT
            json_agg(
              vp.product_id
              ORDER BY p.game ASC, COALESCE(NULLIF(p.platform, ''), 'android') ASC, p.brand ASC, p.duration ASC, vp.product_id ASC
            ) AS product_ids,
            COUNT(vp.product_id)::int AS product_count,
            string_agg(
              CONCAT(
                p.game,
                ' — ',
                CASE
                  WHEN LOWER(TRIM(COALESCE(p.platform, 'android'))) = 'ios' THEN 'iOS'
                  ELSE 'Android'
                END,
                ' — ',
                p.brand,
                ' — ',
                p.duration
              ),
              ', '
              ORDER BY p.game ASC, COALESCE(NULLIF(p.platform, ''), 'android') ASC, p.brand ASC, p.duration ASC, vp.product_id ASC
            ) AS product_scope
          FROM voucher_products vp
          LEFT JOIN products p ON p.id = vp.product_id
          WHERE vp.voucher_id = vouchers.id
        ) product_targets ON true
        ORDER BY vouchers.created_at DESC, vouchers.id DESC`,
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("ERROR GET VOUCHERS:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar voucher",
    });
  }
});

app.patch(
  "/vouchers/:id/toggle-active",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const voucherId = Number(req.params.id);
    const active = Number(req.body.active);

    if (!Number.isInteger(voucherId) || voucherId <= 0) {
      return res.status(400).json({ message: "ID voucher tidak valid" });
    }

    if (![0, 1].includes(active)) {
      return res.status(400).json({ message: "Status voucher tidak valid" });
    }

    try {
      const result = await query(
        "UPDATE vouchers SET active = $1 WHERE id = $2 RETURNING id",
        [active, voucherId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Voucher tidak ditemukan" });
      }

      return res.json({
        message: active === 1 ? "Voucher diaktifkan" : "Voucher dinonaktifkan",
      });
    } catch (err) {
      console.error("ERROR TOGGLE VOUCHER:", err);
      return res.status(500).json({
        message: "Gagal mengubah status voucher",
      });
    }
  },
);

app.delete(
  "/vouchers/:id",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const voucherId = Number(req.params.id);

    if (!Number.isInteger(voucherId) || voucherId <= 0) {
      return res.status(400).json({ message: "ID voucher tidak valid" });
    }

    try {
      await query("DELETE FROM voucher_products WHERE voucher_id = $1", [
        voucherId,
      ]);

      const result = await query(
        "DELETE FROM vouchers WHERE id = $1 RETURNING id",
        [voucherId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Voucher tidak ditemukan" });
      }

      return res.json({ message: "Voucher berhasil dihapus" });
    } catch (err) {
      console.error("ERROR DELETE VOUCHER:", err);
      return res.status(500).json({
        message: "Gagal menghapus voucher",
      });
    }
  },
);

app.get("/vip-discounts", requireAdminAuth, async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        vd.*,
        p.game,
        COALESCE(NULLIF(p.platform, ''), 'android') AS platform,
        p.brand,
        p.duration,
        p.price
      FROM vip_discounts vd
      LEFT JOIN products p ON p.id = vd.product_id
      ORDER BY vd.created_at DESC, vd.id DESC
      `,
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("ERROR GET VIP DISCOUNTS:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar diskon VIP",
    });
  }
});

app.post(
  "/vip-discounts",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const productId = Number(req.body.product_id);
    const discountAmount = Number(req.body.discount_amount);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: "Produk tidak valid" });
    }

    if (!Number.isInteger(discountAmount) || discountAmount <= 0) {
      return res.status(400).json({ message: "Diskon VIP tidak valid" });
    }

    try {
      const productResult = await query(
        "SELECT id, price FROM products WHERE id = $1 LIMIT 1",
        [productId],
      );

      const product = productResult.rows[0];

      if (!product) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }

      if (discountAmount >= Number(product.price)) {
        return res.status(400).json({
          message:
            "Diskon VIP tidak boleh lebih besar atau sama dengan harga produk",
        });
      }

      await query(
        `
      INSERT INTO vip_discounts
        (product_id, discount_amount, active, created_at, updated_at)
      VALUES
        ($1, $2, 1, $3, $3)
      ON CONFLICT (product_id)
      DO UPDATE SET
        discount_amount = EXCLUDED.discount_amount,
        active = 1,
        updated_at = EXCLUDED.updated_at
      `,
        [productId, discountAmount, new Date().toISOString()],
      );

      return res.json({
        message: "Diskon VIP berhasil disimpan",
      });
    } catch (err) {
      console.error("ERROR SAVE VIP DISCOUNT:", err);
      return res.status(500).json({
        message: "Gagal menyimpan diskon VIP",
      });
    }
  },
);

app.patch(
  "/vip-discounts/:id/toggle-active",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const id = Number(req.params.id);
    const active = Number(req.body.active);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID diskon VIP tidak valid" });
    }

    if (![0, 1].includes(active)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    try {
      const result = await query(
        "UPDATE vip_discounts SET active = $1, updated_at = $2 WHERE id = $3 RETURNING id",
        [active, new Date().toISOString(), id],
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: "Diskon VIP tidak ditemukan" });
      }

      return res.json({
        message:
          active === 1 ? "Diskon VIP diaktifkan" : "Diskon VIP dinonaktifkan",
      });
    } catch (err) {
      console.error("ERROR TOGGLE VIP DISCOUNT:", err);
      return res.status(500).json({
        message: "Gagal mengubah status diskon VIP",
      });
    }
  },
);

app.delete(
  "/vip-discounts/:id",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID diskon VIP tidak valid" });
    }

    try {
      const result = await query(
        "DELETE FROM vip_discounts WHERE id = $1 RETURNING id",
        [id],
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: "Diskon VIP tidak ditemukan" });
      }

      return res.json({
        message: "Diskon VIP berhasil dihapus",
      });
    } catch (err) {
      console.error("ERROR DELETE VIP DISCOUNT:", err);
      return res.status(500).json({
        message: "Gagal menghapus diskon VIP",
      });
    }
  },
);

app.post("/voucher-preview", voucherPreviewLimiter, async (req, res) => {
  const loggedInUser = getLoggedInUserFromRequest(req);

  if (!loggedInUser) {
    return res.status(401).json({
      message: "Kamu harus login dulu untuk memakai voucher",
    });
  }

  const cleanProductId = Number(req.body.product_id);
  const cleanVoucherCode = normalizeVoucherCode(req.body.voucher_code);
  const cleanQuantity = parseOrderQuantity(req.body.quantity);

  if (!Number.isInteger(cleanProductId) || cleanProductId <= 0) {
    return res.status(400).json({ message: "Produk tidak valid" });
  }
  if (!cleanQuantity) {
    return res.status(400).json({
      message: `Jumlah key harus 1 sampai ${MAX_ORDER_QUANTITY}`,
    });
  }

  try {
    const productResult = await query(
      "SELECT * FROM products WHERE id = $1 AND active = 1 LIMIT 1",
      [cleanProductId],
    );

    const productRow = productResult.rows[0];

    if (!productRow) {
      return res.status(404).json({
        message: "Produk tidak ditemukan atau tidak aktif",
      });
    }

    const unitPrice = Number(productRow.price);

    const discountCheck = await getBestCheckoutDiscount({
      userId: loggedInUser.id,
      productId: cleanProductId,
      productRow,
      voucherCode: cleanVoucherCode,
      quantity: cleanQuantity,
    });

    if (!discountCheck.valid) {
      return res.status(400).json({ message: discountCheck.message });
    }

    const bulkTotals = calculateBulkTotals({
      unitPrice,
      quantity: cleanQuantity,
      discountAmount: discountCheck.discountAmount,
    });
    const originalPrice = bulkTotals.originalPrice;
    const discountAmount = bulkTotals.discountAmount;
    const netPrice = bulkTotals.netPrice;
    const finalPrice = calculateQrisGrossPrice(netPrice);
    const paymentFee = finalPrice - netPrice;

    return res.json({
      message: discountCheck.message || "Preview harga berhasil",
      voucher_code: discountCheck.code,
      discount_type: discountCheck.discountType,
      discount_per_key:
        discountCheck.discountType === "vip"
          ? Number(discountCheck.discountPerKey || 0)
          : 0,
      quantity: cleanQuantity,
      unit_price: unitPrice,
      original_price: originalPrice,
      discount_amount: discountAmount,
      net_price: netPrice,
      payment_fee: paymentFee,
      final_price: finalPrice,
    });
  } catch (err) {
    console.error("ERROR VOUCHER PREVIEW:", err);
    return res.status(500).json({ message: "Gagal cek voucher" });
  }
});
// buat order + pembayaran Midtrans
app.post("/create-order", orderLimiter, requireUserCsrf, async (req, res) => {
  const loggedInUser = getLoggedInUserFromRequest(req);

  if (!loggedInUser) {
    return res.status(401).json({
      message: "Kamu harus login dulu sebelum order",
      redirectUrl: "/auth",
    });
  }
  const { product_id, name, voucher_code, quantity } = req.body;
  const paymentMethod = String(req.body?.payment_method || "midtrans").trim().toLowerCase();
  if (!["midtrans", "ae_credit"].includes(paymentMethod)) {
    return res.status(400).json({ message: "Metode pembayaran tidak valid" });
  }

  const cleanProductId = Number(product_id);
  const cleanQuantity = parseOrderQuantity(quantity);
  let cleanName = String(name || "").trim();
  let cleanContact = "";
  let createdOrderId = "";

  if (!Number.isInteger(cleanProductId) || cleanProductId <= 0) {
    return res.status(400).json({ message: "Produk tidak valid" });
  }

  if (!cleanQuantity) {
    return res.status(400).json({
      message: `Jumlah key harus 1 sampai ${MAX_ORDER_QUANTITY}`,
    });
  }

  try {
    const defaultResult = await query(
      `SELECT username, default_name, default_contact, email
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [loggedInUser.id],
    );
    const defaultUser = defaultResult.rows[0] || {};

    if (!cleanName) {
      cleanName = String(
        defaultUser.default_name || defaultUser.username || "",
      ).trim();
    }

    cleanContact = String(
      defaultUser.email || defaultUser.default_contact || "",
    ).trim();
  } catch (err) {
    console.error("WARN LOAD DEFAULT ORDER DATA:", err.message);
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

    const playStatus = normalizePlayStatus(productRow.play_status);

    if (playStatus === "maintenance") {
      return res.status(400).json({
        message:
          "Produk sedang maintenance. Produk tetap tersedia di katalog, tapi belum bisa dibeli saat ini.",
      });
    }

    const productDeliveryType = normalizeProductDeliveryType(productRow.delivery_type);

    if (productDeliveryType === "vipstore_api") {
      const supplierProductId = normalizeSupplierProductId(productRow.supplier_product_id);
      const supplierStatus = String(productRow.supplier_status || "").toLowerCase();
      const supplierStock = Number(productRow.supplier_stock || 0);
      const supplierMaintenance = Number(productRow.supplier_maintenance || 0) === 1;

      if (!supplierProductId) {
        return res.status(400).json({
          message: "Produk belum terhubung ke supplier. Hubungi admin.",
        });
      }

      if (
        supplierMaintenance ||
        ["maintenance", "hidden", "not_found", "lookup_failed", "not_configured", "mapped_pending"].includes(supplierStatus)
      ) {
        return res.status(400).json({
          message: "Produk supplier sedang tidak tersedia. Coba lagi nanti.",
        });
      }

      if (supplierStock < cleanQuantity) {
        return res.status(400).json({
          message: `Stok supplier tidak cukup untuk ${cleanQuantity} key.`,
        });
      }
    } else if (productDeliveryType === "auto") {
      const keyCheck = await query(
        `SELECT id
         FROM keys
         WHERE product_id = $1
           AND used = 0
           AND (
             reserved_order_id IS NULL
             OR reserved_until IS NULL
             OR reserved_until <= $2
           )
         LIMIT $3`,
        [cleanProductId, new Date().toISOString(), cleanQuantity],
      );

      if (keyCheck.rows.length < cleanQuantity) {
        return res.status(400).json({
          message: `Stok tidak cukup untuk ${cleanQuantity} key`,
        });
      }
    } else if (productDeliveryType === "manual" && cleanQuantity > 1) {
      return res.status(400).json({
        message: "Bulk key belum tersedia untuk produk manual",
      });
    }

    const orderId = "ORDER-" + crypto.randomUUID();
    createdOrderId = orderId;
    const accessToken = crypto.randomBytes(24).toString("hex");
    const createdAt = new Date().toISOString();
    const productPlatformLabel = getPlatformLabel(productRow.platform);
    const productName = `${productPlatformLabel} • ${productRow.brand} - ${productRow.duration}`;
    const game = productRow.game;
    const orderProductName = cleanQuantity > 1
      ? `${productName} (${cleanQuantity} key)`
      : productName;
    const unitPrice = Number(productRow.price);

    const discountCheck = await getBestCheckoutDiscount({
      userId: loggedInUser.id,
      productId: cleanProductId,
      productRow,
      voucherCode: voucher_code,
      quantity: cleanQuantity,
    });

    if (!discountCheck.valid) {
      return res.status(400).json({
        message: discountCheck.message,
      });
    }

    const bulkTotals = calculateBulkTotals({
      unitPrice,
      quantity: cleanQuantity,
      discountAmount: discountCheck.discountAmount,
    });
    const originalPrice = bulkTotals.originalPrice;
    const discountAmount = bulkTotals.discountAmount;
    const netPrice = bulkTotals.netPrice;
    const price = paymentMethod === "ae_credit" ? netPrice : calculateQrisGrossPrice(netPrice);
    const paymentFee = price - netPrice;
    const appliedVoucherCode = discountCheck.code || null;

    const baseUrl = getAppBaseUrl(req);
    const userId = loggedInUser.id;

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      if (productDeliveryType === "auto") {
        const reservedKeys = await reserveLocalKeysForOrder(client, {
          productId: cleanProductId,
          orderId,
          quantity: cleanQuantity,
          reservedUntil: getReservationExpiryIso(),
        });

        if (!reservedKeys) {
          const stockError = new Error(`Stok tidak cukup untuk ${cleanQuantity} key`);
          stockError.statusCode = 409;
          throw stockError;
        }
      }

      if (paymentMethod === "ae_credit") {
        await ensureWalletAccount(client, userId);
        const walletResult = await client.query(
          `SELECT balance FROM wallet_accounts WHERE user_id = $1 FOR UPDATE`,
          [userId],
        );
        const balanceBefore = Number(walletResult.rows[0]?.balance || 0);
        if (balanceBefore < netPrice) {
          const balanceError = new Error(`Saldo AE Credit tidak cukup. Dibutuhkan Rp${netPrice.toLocaleString("id-ID")}.`);
          balanceError.statusCode = 400;
          throw balanceError;
        }
        const balanceAfter = balanceBefore - netPrice;
        const paidDeliveryStatus = productDeliveryType === "vipstore_api" ? "processing_supplier" : productDeliveryType === "manual" ? "manual" : "waiting_delivery";
        await client.query(
          `INSERT INTO orders
          (id, product_id, user_id, access_token, name, contact, game, product, price, unit_price, quantity, original_price, discount_amount, payment_fee, voucher_code, payment_method, payment_status, delivery_status, created_at)
          VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
          [orderId, cleanProductId, userId, accessToken, cleanName, cleanContact, game, orderProductName, price, unitPrice, cleanQuantity, originalPrice, discountAmount, paymentFee, appliedVoucherCode, paymentMethod, "paid", paidDeliveryStatus, createdAt],
        );
        await client.query(`UPDATE wallet_accounts SET balance = $1, updated_at = $2 WHERE user_id = $3`, [balanceAfter, createdAt, userId]);
        await client.query(
          `INSERT INTO wallet_ledger
           (user_id, entry_type, direction, amount, balance_before, balance_after, reference_type, reference_id, description, created_at)
           VALUES ($1, 'purchase', 'debit', $2, $3, $4, 'order', $5, $6, $7)`,
          [userId, netPrice, balanceBefore, balanceAfter, orderId, `Pembelian ${orderProductName}`, createdAt],
        );

        if (productDeliveryType === "auto") {
          const deliveredKeys = await allocateLocalKeysForOrder(client, { id: orderId, product_id: cleanProductId, quantity: cleanQuantity });
          if (!deliveredKeys) {
            const deliveryError = new Error("Stok tidak cukup untuk menyelesaikan order");
            deliveryError.statusCode = 409;
            throw deliveryError;
          }
          await client.query(`UPDATE orders SET delivery_status = 'delivered', gameKey = $1, delivered_at = $2 WHERE id = $3`, [deliveredKeys.join("\n"), createdAt, orderId]);
        } else if (productDeliveryType === "manual") {
          await client.query(`UPDATE orders SET gameKey = $1, admin_note = $2 WHERE id = $3`, ["MANUAL DELIVERY - HUBUNGI ADMIN", "Saldo AE Credit diterima; key diproses manual.", orderId]);
        } else if (productDeliveryType === "vipstore_api") {
          await client.query(`UPDATE orders SET admin_note = $1 WHERE id = $2`, ["AE Credit diterima; VIP Store claim sedang diproses otomatis", orderId]);
        }
      } else {
        await client.query(
          `INSERT INTO orders
          (id, product_id, user_id, access_token, name, contact, game, product, price, unit_price, quantity, original_price, discount_amount, payment_fee, voucher_code, payment_method, payment_status, delivery_status, created_at)
          VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          orderId,
          cleanProductId,
          userId,
          accessToken,
          cleanName,
          cleanContact,
          game,
          orderProductName,
          price,
          unitPrice,
          cleanQuantity,
          originalPrice,
          discountAmount,
          paymentFee,
          appliedVoucherCode,
          paymentMethod,
          "pending",
          "waiting_payment",
          createdAt,
        ],
        );
      }

      await client.query("COMMIT");
    } catch (transactionErr) {
      await client.query("ROLLBACK");
      throw transactionErr;
    } finally {
      client.release();
    }

    res.cookie(`order_token_${orderId}`, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 2,
      path: "/",
    });

    if (paymentMethod === "ae_credit") {
      res.cookie(`order_token_${orderId}`, accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 2,
        path: "/",
      });
      if (productDeliveryType === "vipstore_api") {
        settleWalletVipOrder(orderId);
      }
      return res.json({
        message: "Pembayaran dengan AE Credit berhasil",
        orderId,
        quantity: cleanQuantity,
        paidWithBalance: true,
        resultUrl: `${baseUrl}/result?order_id=${orderId}`,
      });
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContact);
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
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
          name: `${game} - ${orderProductName}`,
        },
      ],
      custom_field1: `quantity:${cleanQuantity}`,
      callbacks: {
        finish: `${baseUrl}/result?order_id=${orderId}`,
        error: `${baseUrl}/result?order_id=${orderId}`,
        pending: `${baseUrl}/result?order_id=${orderId}`,
      },
    });

    try {
      await query(
        `UPDATE orders
         SET snap_token = $1, snap_redirect_url = $2, snap_token_created_at = $3
         WHERE id = $4`,
        [
          transaction.token,
          transaction.redirect_url,
          new Date().toISOString(),
          orderId,
        ],
      );
    } catch (persistErr) {
      console.error("WARN: gagal simpan snap token order:", persistErr.message);
    }

    return res.json({
      message: "Transaksi Midtrans berhasil dibuat",
      orderId: orderId,
      quantity: cleanQuantity,
      snapToken: transaction.token,
      paymentUrl: transaction.redirect_url,
      resultUrl: `${baseUrl}/result?order_id=${orderId}`,
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY || "",
      midtransIsProduction: isMidtransProduction,
    });
  } catch (err) {
    console.error(
      "ERROR CREATE MIDTRANS ORDER:",
      err.response?.data || err.message || err,
    );

    if (createdOrderId) {
      try {
        await releaseReservedKeysForOrder(db, createdOrderId);
        await query(
          `UPDATE orders
           SET payment_status = 'failed', delivery_status = 'cancelled'
           WHERE id = $1 AND payment_status = 'pending'`,
          [createdOrderId],
        );
      } catch (cleanupErr) {
        console.error("WARN CLEANUP ORDER GAGAL:", cleanupErr.message);
      }
    }

    return res.status(err.statusCode || 500).json({
      message: err.statusCode
        ? err.message
        : "Gagal membuat pembayaran Midtrans",
    });
  }
});

app.post("/midtrans-notification", webhookLimiter, async (req, res) => {
  try {
    const notification = await snap.transaction.notification(req.body);

    if (!verifyMidtransSignature(notification)) {
      return res.status(403).send("INVALID SIGNATURE");
    }

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
          `SELECT
             o.*,
             COALESCE(p.delivery_type, 'auto') AS delivery_type,
             COALESCE(p.supplier_source, '') AS supplier_source,
             COALESCE(p.supplier_product_id, '') AS supplier_product_id,
             COALESCE(p.supplier_product_name, '') AS supplier_product_name,
             COALESCE(p.supplier_stock, 0) AS supplier_stock,
             COALESCE(p.supplier_status, '') AS supplier_status,
             COALESCE(p.supplier_maintenance, 0) AS supplier_maintenance
           FROM orders o
           LEFT JOIN products p ON p.id = o.product_id
           WHERE o.id = $1
           LIMIT 1
           FOR UPDATE OF o`,
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

        const orderDeliveryType = normalizeProductDeliveryType(order.delivery_type);

        if (orderDeliveryType === "vipstore_api") {
          await client.query(
            `UPDATE orders
             SET payment_status = $1,
                 delivery_status = $2,
                 admin_note = $3
             WHERE id = $4`,
            [
              "paid",
              "processing_supplier",
              "VIP Store claim sedang diproses otomatis",
              orderId,
            ],
          );

          await client.query("COMMIT");

          try {
            const claim = await claimVipStoreKeyForOrder(order, { source: "midtrans_webhook" });
            const deliveredAt = new Date().toISOString();

            await persistOrderKeys(db, {
              orderId,
              keys: claim.keys,
              source: "vipstore",
            });

            await query(
              `UPDATE orders
               SET delivery_status = $1,
                   gameKey = $2,
                   delivered_at = $3,
                   admin_note = $4
               WHERE id = $5
                 AND delivery_status = $6`,
              [
                "delivered",
                claim.key,
                deliveredAt,
                `VIP Store claim success. Supplier product #${claim.supplier_product_id}.`,
                orderId,
                "processing_supplier",
              ],
            );

            await query(
              `UPDATE products
               SET supplier_stock = GREATEST(COALESCE(supplier_stock, 0) - $1, 0),
                    supplier_last_sync = $2
               WHERE id = $3
                  AND LOWER(COALESCE(delivery_type, 'auto')) = 'vipstore_api'`,
              [getOrderQuantity(order.quantity), deliveredAt, order.product_id],
            );
          } catch (claimErr) {
            console.error("VIPSTORE CLAIM ERROR:", claimErr.message);

            await query(
              `UPDATE orders
               SET delivery_status = $1,
                   gameKey = $2,
                   admin_note = $3
               WHERE id = $4
                 AND delivery_status = $5`,
              [
                "problem",
                "VIP STORE CLAIM FAILED - HUBUNGI ADMIN",
                `VIP Store claim failed: ${String(claimErr.message || "Unknown error").slice(0, 500)}`,
                orderId,
                "processing_supplier",
              ],
            );
          }

          return res.status(200).send("OK");
        }

        if (orderDeliveryType === "manual") {
          await client.query(
            `UPDATE orders
             SET payment_status = $1,
                 delivery_status = $2,
                 gameKey = $3,
                 admin_note = $4
             WHERE id = $5`,
            [
              "paid",
              "manual",
              "MANUAL DELIVERY - HUBUNGI ADMIN",
              "Produk manual delivery, proses key manual.",
              orderId,
            ],
          );

          await client.query("COMMIT");
          return res.status(200).send("OK");
        }

        const deliveredKeys = await allocateLocalKeysForOrder(client, order);

        if (!deliveredKeys) {
          await client.query(
            `UPDATE orders
             SET payment_status = $1, delivery_status = $2, gameKey = $3
             WHERE id = $4`,
            [
              "paid",
              "problem",
              `STOK TIDAK CUKUP UNTUK ${getOrderQuantity(order.quantity)} KEY - HUBUNGI ADMIN`,
              orderId,
            ],
          );

          await client.query("COMMIT");
          return res.status(200).send("OK");
        }

        await client.query(
          `UPDATE orders
           SET payment_status = $1,
               delivery_status = $2,
               gameKey = $3,
               delivered_at = $4
           WHERE id = $5`,
          ["paid", "delivered", deliveredKeys.join("\n"), new Date().toISOString(), orderId],
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
      await releaseReservedKeysForOrder(db, orderId);
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

    const gameKeys = await getStoredOrderKeys(order.id, order.gamekey);

    return res.json({
      id: order.id,
      name: order.name,
      game: order.game,
      product: order.product,
      price: order.price,
      unit_price: Number(order.unit_price || order.original_price || order.price || 0),
      quantity: getOrderQuantity(order.quantity),
      payment_status: order.payment_status,
      delivery_status: order.delivery_status,
      gameKey: gameKeys.join("\n"),
      gameKeys,
      created_at: order.created_at,
    });
  } catch (err) {
    console.error("ERROR GET ORDER:", err);
    return res.status(500).json({
      message: "Gagal mengambil data order",
    });
  }
});

app.get("/order/:id/resume", orderCheckLimiter, async (req, res) => {
  const loggedInUser = getLoggedInUserFromRequest(req);
  if (!loggedInUser) {
    return res
      .status(401)
      .json({ message: "Kamu harus login dulu", redirectUrl: "/auth" });
  }

  const orderId = String(req.params.id || "").trim();
  if (!orderId) {
    return res.status(400).json({ message: "ID order tidak valid" });
  }

  try {
    const result = await query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2 LIMIT 1",
      [orderId, loggedInUser.id],
    );
    const order = result.rows[0];

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order tidak ditemukan atau bukan milikmu" });
    }

    const paymentStatus = String(order.payment_status || "").toLowerCase();
    const deliveryStatus = String(order.delivery_status || "").toLowerCase();

    if (paymentStatus === "paid" && deliveryStatus !== "cancelled") {
      return res.status(409).json({
        message: "Order sudah dibayar",
        code: "ALREADY_PAID",
        resultUrl: `/result?order_id=${orderId}`,
      });
    }
    if (paymentStatus === "cancelled" || paymentStatus === "expired") {
      return res.status(410).json({
        message:
          paymentStatus === "expired"
            ? "Order sudah kedaluwarsa, silakan buat order baru"
            : "Order sudah dibatalkan, silakan buat order baru",
        code: paymentStatus === "expired" ? "EXPIRED" : "CANCELLED",
      });
    }

    const baseUrl = getAppBaseUrl(req);
    const TWENTY_THREE_HOURS_MS = 23 * 60 * 60 * 1000;
    const tokenCreatedAtIso = order.snap_token_created_at || order.created_at;
    const tokenAgeMs = tokenCreatedAtIso
      ? Date.now() - new Date(tokenCreatedAtIso).getTime()
      : Infinity;

    let snapToken = order.snap_token;
    let snapRedirectUrl = order.snap_redirect_url;

    if (!snapToken || tokenAgeMs > TWENTY_THREE_HOURS_MS) {
      try {
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.contact);
        const transaction = await snap.createTransaction({
          transaction_details: {
            order_id: orderId,
            gross_amount: Number(order.price),
          },
          customer_details: {
            first_name: order.name,
            email: isValidEmail ? order.contact : "customer@example.com",
            phone: isValidEmail
              ? ""
              : String(order.contact || "").replace(/[^0-9+]/g, ""),
          },
          item_details: [
            {
              id: String(order.product_id || ""),
              price: Number(order.price),
              quantity: 1,
              name: `${order.game} - ${order.product}`,
            },
          ],
          custom_field1: `quantity:${getOrderQuantity(order.quantity)}`,
          callbacks: {
            finish: `${baseUrl}/result?order_id=${orderId}`,
            error: `${baseUrl}/result?order_id=${orderId}`,
            pending: `${baseUrl}/result?order_id=${orderId}`,
          },
        });

        snapToken = transaction.token;
        snapRedirectUrl = transaction.redirect_url;

        await query(
          `UPDATE orders
           SET snap_token = $1, snap_redirect_url = $2, snap_token_created_at = $3
           WHERE id = $4`,
          [snapToken, snapRedirectUrl, new Date().toISOString(), orderId],
        );
      } catch (recreateErr) {
        console.error(
          "ERROR RESUME ORDER (recreate snap):",
          recreateErr.response?.data || recreateErr.message || recreateErr,
        );
        return res.status(502).json({
          message:
            "Gagal mengambil ulang token pembayaran. Coba lagi atau buat order baru.",
        });
      }
    }

    return res.json({
      message: "Resume order siap",
      orderId,
      snapToken,
      paymentUrl: snapRedirectUrl,
      resultUrl: `${baseUrl}/result?order_id=${orderId}`,
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY || "",
      midtransIsProduction: isMidtransProduction,
      game: order.game,
      product: order.product,
      price: order.price,
      unit_price: Number(order.unit_price || order.original_price || order.price || 0),
      quantity: getOrderQuantity(order.quantity),
      created_at: order.created_at,
    });
  } catch (err) {
    console.error("ERROR RESUME ORDER:", err);
    return res.status(500).json({ message: "Gagal memuat order" });
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
        `SELECT
           o.*,
           COALESCE(p.delivery_type, 'auto') AS delivery_type,
           COALESCE(p.supplier_source, '') AS supplier_source,
           COALESCE(p.supplier_product_id, '') AS supplier_product_id,
           COALESCE(p.supplier_product_name, '') AS supplier_product_name,
           COALESCE(p.supplier_stock, 0) AS supplier_stock,
           COALESCE(p.supplier_status, '') AS supplier_status,
           COALESCE(p.supplier_maintenance, 0) AS supplier_maintenance
         FROM orders o
         LEFT JOIN products p ON p.id = o.product_id
         WHERE o.id = $1
         LIMIT 1
         FOR UPDATE OF o`,
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

      const orderDeliveryType = normalizeProductDeliveryType(order.delivery_type);

      if (orderDeliveryType === "vipstore_api") {
        await client.query(
          `UPDATE orders
           SET payment_status = $1,
               delivery_status = $2,
               admin_note = $3
           WHERE id = $4`,
          [
            "paid",
            "processing_supplier",
            "VIP Store claim diproses dari admin confirm payment",
            orderId,
          ],
        );

        await client.query("COMMIT");

        try {
          const claim = await claimVipStoreKeyForOrder(order, { source: "admin_confirm" });
          const deliveredAt = new Date().toISOString();

          await persistOrderKeys(db, {
            orderId,
            keys: claim.keys,
            source: "vipstore",
          });

          await query(
            `UPDATE orders
             SET delivery_status = $1,
                 gameKey = $2,
                 delivered_at = $3,
                 admin_note = $4
             WHERE id = $5
               AND delivery_status = $6`,
            [
              "delivered",
              claim.key,
              deliveredAt,
              `VIP Store claim success via admin confirm. Supplier product #${claim.supplier_product_id}.`,
              orderId,
              "processing_supplier",
            ],
          );

          await query(
            `UPDATE products
             SET supplier_stock = GREATEST(COALESCE(supplier_stock, 0) - $1, 0),
                 supplier_last_sync = $2
              WHERE id = $3
                AND LOWER(COALESCE(delivery_type, 'auto')) = 'vipstore_api'`,
            [getOrderQuantity(order.quantity), deliveredAt, order.product_id],
          );

          return res.json({
            message: "Pembayaran dikonfirmasi dan key VIP Store berhasil dikirim",
          });
        } catch (claimErr) {
          console.error("VIPSTORE CLAIM ERROR VIA ADMIN CONFIRM:", claimErr.message);

          await query(
            `UPDATE orders
             SET delivery_status = $1,
                 gameKey = $2,
                 admin_note = $3
             WHERE id = $4
               AND delivery_status = $5`,
            [
              "problem",
              "VIP STORE CLAIM FAILED - HUBUNGI ADMIN",
              `VIP Store claim failed via admin confirm: ${String(claimErr.message || "Unknown error").slice(0, 500)}`,
              orderId,
              "processing_supplier",
            ],
          );

          return res.status(502).json({
            message:
              "Pembayaran sudah dikonfirmasi, tapi claim VIP Store gagal. Order masuk problem.",
          });
        }
      }

      if (orderDeliveryType === "manual") {
        await client.query(
          `UPDATE orders
           SET payment_status = $1,
               delivery_status = $2,
               gameKey = $3,
               admin_note = $4
           WHERE id = $5`,
          [
            "paid",
            "manual",
            "MANUAL DELIVERY - HUBUNGI ADMIN",
            "Produk manual delivery, proses key manual.",
            orderId,
          ],
        );

        await client.query("COMMIT");

        return res.json({
          message: "Pembayaran dikonfirmasi. Produk manual delivery perlu diproses manual.",
        });
      }

      const deliveredKeys = await allocateLocalKeysForOrder(client, order);

      if (!deliveredKeys) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Stok tidak cukup untuk ${getOrderQuantity(order.quantity)} key. Tambahkan key dulu sebelum konfirmasi pembayaran.`,
        });
      }

      await client.query(
        `UPDATE orders
         SET payment_status = $1,
             delivery_status = $2,
             gameKey = $3,
             delivered_at = $4
         WHERE id = $5`,
        ["paid", "delivered", deliveredKeys.join("\n"), new Date().toISOString(), orderId],
      );

      await client.query("COMMIT");

      return res.json({
        message: `Pembayaran dikonfirmasi dan ${deliveredKeys.length} key berhasil dikirim`,
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
      `
      SELECT
        u.id,
        u.username,
        u.created_at,
        u.badge_override,
        u.badge_override_expires_at,
        COUNT(o.id) FILTER (WHERE o.payment_status = 'paid')::int AS paid_order_count,
        COALESCE(SUM(o.price) FILTER (WHERE o.payment_status = 'paid'), 0)::int AS total_spend,
        CASE WHEN MAX(r.id) IS NULL THEN false ELSE true END AS has_review
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      LEFT JOIN reviews r ON r.user_id = u.id AND r.active = 1
      GROUP BY u.id
      ORDER BY u.created_at DESC
      `,
    );

    const now = new Date();

    const users = result.rows.map((item) => {
      const paidOrderCount = Number(item.paid_order_count || 0);
      const totalSpend = Number(item.total_spend || 0);
      const hasReview = Boolean(item.has_review);

      const overrideBadge =
        item.badge_override &&
        (!item.badge_override_expires_at ||
          new Date(item.badge_override_expires_at) > now)
          ? getBadgeByCode(item.badge_override)
          : null;

      const automaticBadge = getBuyerBadge({
        paidOrderCount,
        totalSpend,
      });
      const badge = overrideBadge || automaticBadge;

      return {
        ...item,
        paid_order_count: paidOrderCount,
        total_spend: totalSpend,
        has_review: hasReview,
        badge,
        badge_override: item.badge_override || null,
        badge_override_expires_at: item.badge_override_expires_at || null,
        badge_is_override: Boolean(overrideBadge),
        badge_progress: getBuyerBadgeProgress({
          paidOrderCount,
          totalSpend,
          currentBadgeCode: badge.code,
        }),
      };
    });

    return res.json(users);
  } catch (err) {
    console.error("ERROR GET USERS:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar user",
    });
  }
});

app.post(
  "/users/:id/badge-override",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const userId = Number(req.params.id);
    const badgeCode = String(req.body.badge_code || "")
      .trim()
      .toLowerCase();
    const expiresMode = String(req.body.expires_mode || "1d")
      .trim()
      .toLowerCase();

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "ID user tidak valid",
      });
    }

    const badge = getBadgeByCode(badgeCode);

    if (!badge) {
      return res.status(400).json({
        message: "Badge override tidak valid",
      });
    }

    let expiresAt = null;
    const now = new Date();

    if (expiresMode === "1d") {
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    } else if (expiresMode === "7d") {
      expiresAt = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
    } else if (expiresMode === "manual") {
      expiresAt = null;
    } else {
      return res.status(400).json({
        message: "Mode expired tidak valid",
      });
    }

    try {
      const result = await query(
        `
        UPDATE users
        SET badge_override = $1,
            badge_override_expires_at = $2
        WHERE id = $3
        RETURNING id, username
        `,
        [badge.code, expiresAt, userId],
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({
          message: "User tidak ditemukan",
        });
      }

      return res.json({
        message: `Badge ${badge.label} berhasil diterapkan ke ${user.username}`,
      });
    } catch (err) {
      console.error("ERROR SET BADGE OVERRIDE:", err);
      return res.status(500).json({
        message: "Gagal menerapkan badge override",
      });
    }
  },
);

app.delete(
  "/users/:id/badge-override",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "ID user tidak valid",
      });
    }

    try {
      const result = await query(
        `
        UPDATE users
        SET badge_override = NULL,
            badge_override_expires_at = NULL
        WHERE id = $1
        RETURNING id, username
        `,
        [userId],
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({
          message: "User tidak ditemukan",
        });
      }

      return res.json({
        message: `Badge override ${user.username} berhasil direset`,
      });
    } catch (err) {
      console.error("ERROR RESET BADGE OVERRIDE:", err);
      return res.status(500).json({
        message: "Gagal reset badge override",
      });
    }
  },
);

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
      return res.status(400).json({
        message: "ID user tidak valid",
      });
    }

    try {
      const orderCheck = await query(
        "SELECT COUNT(*)::int AS total_orders FROM orders WHERE user_id = $1",
        [userId],
      );

      const totalOrders = Number(orderCheck.rows[0]?.total_orders || 0);

      if (totalOrders > 0) {
        return res.status(400).json({
          message:
            "User ini punya riwayat order, jadi tidak bisa dihapus agar data order tetap aman",
        });
      }

      const result = await query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "User tidak ditemukan",
        });
      }

      return res.json({
        message: "User berhasil dihapus",
      });
    } catch (err) {
      console.error("ERROR DELETE USER:", err);
      return res.status(500).json({
        message: "Gagal hapus user: " + err.message,
      });
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

// ===== ADMIN ORDERS: pagination + filter + date range =====
function buildOrderFilterClause(q, startIdx = 1) {
  const conditions = [];
  const params = [];
  let i = startIdx;

  const payment = String(q.payment_status || "")
    .trim()
    .toLowerCase();
  const delivery = String(q.delivery_status || "")
    .trim()
    .toLowerCase();
  const search = String(q.search || "")
    .trim()
    .toLowerCase();
  const from = String(q.from || "").trim();
  const to = String(q.to || "").trim();

  if (payment) {
    conditions.push(`LOWER(payment_status) = $${i++}`);
    params.push(payment);
  }
  if (delivery) {
    conditions.push(`LOWER(delivery_status) = $${i++}`);
    params.push(delivery);
  }
  if (from) {
    conditions.push(`created_at >= $${i++}`);
    params.push(from + " 00:00:00");
  }
  if (to) {
    conditions.push(`created_at <= $${i++}`);
    params.push(to + " 23:59:59");
  }
  if (search) {
    conditions.push(
      `(LOWER(id) LIKE $${i} OR LOWER(name) LIKE $${i} OR LOWER(contact) LIKE $${i} OR LOWER(game) LIKE $${i} OR LOWER(product) LIKE $${i})`,
    );
    params.push(`%${search}%`);
    i++;
  }

  return {
    where: conditions.length ? "WHERE " + conditions.join(" AND ") : "",
    params,
    nextIdx: i,
  };
}

app.get("/admin-orders", requireAdminAuth, async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

  const { where, params, nextIdx } = buildOrderFilterClause(req.query, 1);

  try {
    const countResult = await query(
      `SELECT COUNT(*)::int AS total, COALESCE(SUM(price) FILTER (WHERE payment_status = 'paid'), 0)::int AS revenue, COUNT(*) FILTER (WHERE payment_status = 'paid')::int AS paid_count FROM orders ${where}`,
      params,
    );

    const summary = countResult.rows[0] || {
      total: 0,
      revenue: 0,
      paid_count: 0,
    };

    const rowsResult = await query(
      `SELECT
         o.*,
         COALESCE(p.delivery_type, 'auto') AS delivery_type,
         COALESCE(p.supplier_source, '') AS supplier_source,
         COALESCE(p.supplier_product_id, '') AS supplier_product_id,
         COALESCE(p.supplier_product_name, '') AS supplier_product_name
       FROM orders o
       LEFT JOIN products p ON p.id = o.product_id
       ${where ? where.replace(/\b(id|name|contact|game|product|created_at|payment_status|delivery_status)\b/g, "o.$1") : ""}
       ORDER BY o.created_at DESC, o.id DESC
       LIMIT $${nextIdx} OFFSET $${nextIdx + 1}`,
      [...params, limit, offset],
    );

    return res.json({
      rows: rowsResult.rows,
      total: summary.total,
      revenue: summary.revenue,
      paid_count: summary.paid_count,
      limit,
      offset,
    });
  } catch (err) {
    console.error("ERROR ADMIN ORDERS:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar order",
    });
  }
});

// ===== ADMIN ORDERS EXPORT: CSV (semua filter aktif) =====
app.get("/admin-orders/export", requireAdminAuth, async (req, res) => {
  const { where, params } = buildOrderFilterClause(req.query, 1);

  try {
    const result = await query(
      `SELECT id, name, contact, game, product, quantity, unit_price, price, original_price, discount_amount, payment_fee, voucher_code, payment_status, delivery_status, gameKey, created_at, delivered_at, cancelled_at, cancel_reason FROM orders ${where} ORDER BY created_at DESC, id DESC LIMIT 5000`,
      params,
    );

    const headers = [
      "Order ID",
      "Nama",
      "Kontak",
      "Game",
      "Produk",
      "Jumlah Key",
      "Harga Satuan",
      "Harga",
      "Harga Asli",
      "Diskon",
      "Fee",
      "Voucher",
      "Status Bayar",
      "Status Kirim",
      "Game Key",
      "Dibuat",
      "Terkirim",
      "Dibatalkan",
      "Alasan Batal",
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines = [headers.join(",")];
    for (const row of result.rows) {
      lines.push(
        [
          row.id,
          row.name,
          row.contact,
          row.game,
          row.product,
          getOrderQuantity(row.quantity),
          row.unit_price,
          row.price,
          row.original_price,
          row.discount_amount,
          row.payment_fee,
          row.voucher_code,
          row.payment_status,
          row.delivery_status,
          row.gamekey || row.gameKey || "",
          row.created_at,
          row.delivered_at,
          row.cancelled_at,
          row.cancel_reason,
        ]
          .map(escapeCsv)
          .join(","),
      );
    }

    const csv = "\uFEFF" + lines.join("\n");
    const stamp = new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="orders-${stamp}.csv"`,
    );
    return res.send(csv);
  } catch (err) {
    console.error("ERROR EXPORT ORDERS:", err);
    return res.status(500).json({
      message: "Gagal export order: " + err.message,
    });
  }
});

// ===== ADMIN ORDERS: detail by id (full info, owner only) =====
app.get("/admin-orders/:id", requireAdminAuth, async (req, res) => {
  const orderId = String(req.params.id || "").trim();
  if (!orderId) {
    return res.status(400).json({ message: "ID order tidak valid" });
  }

  try {
    const result = await query(
      `SELECT
         o.*,
         COALESCE(p.delivery_type, 'auto') AS delivery_type,
         COALESCE(p.supplier_source, '') AS supplier_source,
         COALESCE(p.supplier_product_id, '') AS supplier_product_id,
         COALESCE(p.supplier_product_name, '') AS supplier_product_name,
         COALESCE(p.supplier_stock, 0) AS supplier_stock,
         COALESCE(p.supplier_status, '') AS supplier_status
       FROM orders o
       LEFT JOIN products p ON p.id = o.product_id
       WHERE o.id = $1
       LIMIT 1`,
      [orderId],
    );
    const order = result.rows[0];
    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    const claimLogs = await query(
      `SELECT *
       FROM vipstore_claim_logs
       WHERE order_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT 20`,
      [orderId],
    ).catch(() => ({ rows: [] }));

    return res.json({
      ...order,
      claim_logs: claimLogs.rows || [],
    });
  } catch (err) {
    console.error("ERROR GET ORDER DETAIL:", err);
    return res.status(500).json({
      message: "Gagal mengambil detail order",
    });
  }
});

// ===== ADMIN ORDERS: manual fulfillment (admin input key + mark delivered) =====
app.post(
  "/admin-orders/:id/manual-deliver",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    return res.status(410).json({
      message:
        "Manual delivery dinonaktifkan. Tambahkan stok key agar order bisa otomatis delivered.",
    });
    const orderId = String(req.params.id || "").trim();
    const gameKey = String(req.body?.game_key || "").trim();
    const note = String(req.body?.note || "").trim();

    if (!orderId) {
      return res.status(400).json({ message: "ID order tidak valid" });
    }
    if (!gameKey) {
      return res.status(400).json({ message: "Game key wajib diisi" });
    }
    if (gameKey.length > 500) {
      return res.status(400).json({ message: "Game key terlalu panjang" });
    }

    try {
      const orderResult = await query(
        "SELECT id, payment_status, delivery_status FROM orders WHERE id = $1 LIMIT 1",
        [orderId],
      );
      const order = orderResult.rows[0];

      if (!order) {
        return res.status(404).json({ message: "Order tidak ditemukan" });
      }

      const ps = String(order.payment_status || "").toLowerCase();
      const ds = String(order.delivery_status || "").toLowerCase();

      if (ps !== "paid") {
        return res.status(400).json({
          message:
            "Manual fulfillment hanya untuk order yang sudah berstatus paid",
        });
      }

      if (ds === "delivered") {
        return res.status(400).json({ message: "Order ini sudah delivered" });
      }

      if (ds === "cancelled") {
        return res.status(400).json({ message: "Order ini sudah dibatalkan" });
      }

      await query(
        `UPDATE orders
         SET gameKey = $1,
             delivery_status = $2,
             delivered_at = $3,
             admin_note = COALESCE(NULLIF($4, ''), admin_note)
         WHERE id = $5`,
        [gameKey, "delivered", new Date().toISOString(), note, orderId],
      );

      return res.json({
        message: "Game key berhasil dikirim manual ke buyer",
      });
    } catch (err) {
      console.error("ERROR MANUAL DELIVER:", err);
      return res.status(500).json({
        message: "Gagal manual deliver: " + err.message,
      });
    }
  },
);

// ===== ADMIN ORDERS: cancel order + reason (no refund flow) =====
app.post(
  "/admin-orders/:id/cancel",
  requireAdminAuth,
  requireAdminCsrf,
  async (req, res) => {
    const orderId = String(req.params.id || "").trim();
    const reason = String(req.body?.reason || "").trim();

    if (!orderId) {
      return res.status(400).json({ message: "ID order tidak valid" });
    }
    if (!reason) {
      return res.status(400).json({ message: "Alasan wajib diisi" });
    }
    if (reason.length > 500) {
      return res.status(400).json({ message: "Alasan terlalu panjang" });
    }

    try {
      const orderResult = await query(
        "SELECT id, payment_status, delivery_status FROM orders WHERE id = $1 LIMIT 1",
        [orderId],
      );
      const order = orderResult.rows[0];

      if (!order) {
        return res.status(404).json({ message: "Order tidak ditemukan" });
      }

      const ps = String(order.payment_status || "").toLowerCase();
      const ds = String(order.delivery_status || "").toLowerCase();

      if (ds === "delivered") {
        return res.status(400).json({
          message:
            "Order yang sudah delivered tidak boleh dibatalkan. Gunakan note internal.",
        });
      }

      if (ps === "cancelled" || ds === "cancelled") {
        return res
          .status(400)
          .json({ message: "Order ini sudah dibatalkan sebelumnya" });
      }

      await query(
        `UPDATE orders
         SET payment_status = $1,
             delivery_status = $2,
             cancel_reason = $3,
             cancelled_at = $4
         WHERE id = $5`,
        ["cancelled", "cancelled", reason, new Date().toISOString(), orderId],
      );
      await releaseReservedKeysForOrder(db, orderId);

      return res.json({
        message: "Order berhasil dibatalkan",
      });
    } catch (err) {
      console.error("ERROR CANCEL ORDER:", err);
      return res.status(500).json({
        message: "Gagal membatalkan order: " + err.message,
      });
    }
  },
);

app.get("/stock-summary", requireAdminAuth, async (req, res) => {
  try {
    const result = await query(`
            SELECT 
                p.id,
                p.game,
                p.brand,
                p.duration,
                COUNT(k.id) FILTER (
                  WHERE k.used = 0
                    AND (
                      k.reserved_order_id IS NULL
                      OR k.reserved_until IS NULL
                      OR k.reserved_until <= TO_CHAR(
                        CURRENT_TIMESTAMP AT TIME ZONE 'UTC',
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                      )
                    )
                ) AS available_keys
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

      await releaseReservedKeysForOrder(db, orderId);
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
                COALESCE(NULLIF(products.platform, ''), 'android') AS platform,
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
    const result = await query(`
  SELECT
    products.*,
    COALESCE(NULLIF(products.platform, ''), 'android') AS platform,
    CASE
      WHEN LOWER(products.duration) LIKE '%jam%' THEN
        COALESCE(NULLIF(regexp_replace(products.duration, '[^0-9]', '', 'g'), '')::int, 0)
      WHEN LOWER(products.duration) LIKE '%hari%' THEN
        COALESCE(NULLIF(regexp_replace(products.duration, '[^0-9]', '', 'g'), '')::int, 0) * 24
      WHEN LOWER(products.duration) LIKE '%bulan%' THEN
        COALESCE(NULLIF(regexp_replace(products.duration, '[^0-9]', '', 'g'), '')::int, 0) * 24 * 30
      ELSE
        999999
    END AS duration_order
  FROM products
  ORDER BY products.game ASC, COALESCE(NULLIF(products.platform, ''), 'android') ASC, products.brand ASC, duration_order ASC, products.price ASC, products.id ASC
`);

    return res.json(result.rows);
  } catch (err) {
    console.error("ERROR GET PRODUCTS:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar produk",
    });
  }
});

app.post("/products", requireAdminAuth, requireAdminCsrf, async (req, res) => {
  const {
    game,
    platform,
    brand,
    duration,
    price,
    delivery_type,
    play_status,
    supplier_product_id,
  } = req.body;
  const syncBrandStatus =
    req.body.sync_brand_status === true ||
    req.body.sync_brand_status === "true";
  const cleanGame = String(game || "").trim();
  const cleanBrand = String(brand || "").trim();
  const cleanPlatform = normalizePlatform(platform);
  const cleanDuration = String(duration || "").trim();
  const cleanPrice = Number(price);
  const cleanDeliveryType = normalizeProductDeliveryType(delivery_type);
  const cleanSupplierProductId = normalizeSupplierProductId(supplier_product_id);
  const cleanPlayStatus = normalizePlayStatus(play_status);

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

  if (cleanDeliveryType === "vipstore_api" && !cleanSupplierProductId) {
    return res.status(400).json({
      message: "Supplier Product ID wajib diisi untuk VIP Store API",
    });
  }

  const createdAt = new Date().toISOString();

  console.log("ADD PRODUCT REQUEST:", {
    game: cleanGame,
    brand: cleanBrand,
    duration: cleanDuration,
    price: cleanPrice,
    platform: cleanPlatform,
    delivery_type: cleanDeliveryType,
    supplier_product_id: cleanSupplierProductId,
  });

  try {
    const supplierSnapshot = await buildVipStoreProductSnapshot(
      cleanDeliveryType,
      cleanSupplierProductId,
    );

    const result = await query(
      `INSERT INTO products (
         game, platform, brand, duration, price, active, created_at,
         delivery_type, play_status,
         supplier_source, supplier_product_id, supplier_product_name,
         supplier_price, supplier_stock, supplier_status,
         supplier_maintenance, supplier_maintenance_reason, supplier_last_sync
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9,
         $10, $11, $12,
         $13, $14, $15,
         $16, $17, $18
       ) RETURNING id`,
      [
        cleanGame,
        cleanPlatform,
        cleanBrand,
        cleanDuration,
        cleanPrice,
        1,
        createdAt,
        cleanDeliveryType,
        cleanPlayStatus,
        supplierSnapshot.supplier_source,
        supplierSnapshot.supplier_product_id,
        supplierSnapshot.supplier_product_name,
        supplierSnapshot.supplier_price,
        supplierSnapshot.supplier_stock,
        supplierSnapshot.supplier_status,
        supplierSnapshot.supplier_maintenance,
        supplierSnapshot.supplier_maintenance_reason,
        supplierSnapshot.supplier_last_sync,
      ],
    );

    console.log("INSERT SUCCESS:", result.rows);

    let syncedCount = 0;
    if (syncBrandStatus) {
      const syncResult = await query(
        `UPDATE products
         SET play_status = $1
         WHERE LOWER(TRIM(game)) = LOWER(TRIM($2))
           AND LOWER(TRIM(COALESCE(platform, 'android'))) = LOWER(TRIM($3))
           AND LOWER(TRIM(brand)) = LOWER(TRIM($4))`,
        [cleanPlayStatus, cleanGame, cleanPlatform, cleanBrand],
      );
      syncedCount = Number(syncResult.rowCount || 0);
    }

    return res.json({
      message: syncBrandStatus
        ? `Produk berhasil ditambahkan. Status ${syncedCount} produk di platform + brand ini ikut disamakan.`
        : "Produk berhasil ditambahkan",
      id: result.rows[0].id,
      synced_count: syncedCount,
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
    const { game, platform, brand, duration, price, delivery_type, supplier_product_id } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "ID produk tidak valid",
      });
    }

    const cleanGame = String(game || "").trim();
    const cleanBrand = String(brand || "").trim();
    const cleanPlatform = normalizePlatform(platform);
    const cleanDuration = String(duration || "").trim();
    const cleanPrice = Number(price);
    const cleanDeliveryType = normalizeProductDeliveryType(delivery_type);
    const cleanSupplierProductId = normalizeSupplierProductId(supplier_product_id);
    const syncBrandStatus =
      req.body.sync_brand_status === true ||
      req.body.sync_brand_status === "true";

    const hasPlayStatus = Object.prototype.hasOwnProperty.call(
      req.body,
      "play_status",
    );

    const cleanPlayStatus = hasPlayStatus
      ? normalizePlayStatus(req.body.play_status)
      : null;

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

    if (cleanDeliveryType === "vipstore_api" && !cleanSupplierProductId) {
      return res.status(400).json({
        message: "Supplier Product ID wajib diisi untuk VIP Store API",
      });
    }

    try {
      const supplierSnapshot = await buildVipStoreProductSnapshot(
        cleanDeliveryType,
        cleanSupplierProductId,
      );

      const result = await query(
        `UPDATE products
   SET game = $1,
       platform = $2,
       brand = $3,
       duration = $4,
       price = $5,
       delivery_type = COALESCE($6, delivery_type),
       play_status = COALESCE($7, play_status),
       supplier_source = $8,
       supplier_product_id = $9,
       supplier_product_name = $10,
       supplier_price = $11,
       supplier_stock = $12,
       supplier_status = $13,
       supplier_maintenance = $14,
       supplier_maintenance_reason = $15,
       supplier_last_sync = $16
   WHERE id = $17
   RETURNING id`,
        [
          cleanGame,
          cleanPlatform,
          cleanBrand,
          cleanDuration,
          cleanPrice,
          cleanDeliveryType,
          cleanPlayStatus,
          supplierSnapshot.supplier_source,
          supplierSnapshot.supplier_product_id,
          supplierSnapshot.supplier_product_name,
          supplierSnapshot.supplier_price,
          supplierSnapshot.supplier_stock,
          supplierSnapshot.supplier_status,
          supplierSnapshot.supplier_maintenance,
          supplierSnapshot.supplier_maintenance_reason,
          supplierSnapshot.supplier_last_sync,
          productId,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Produk tidak ditemukan",
        });
      }

      let syncedCount = 0;
      if (syncBrandStatus && cleanPlayStatus) {
        const syncResult = await query(
          `UPDATE products
           SET play_status = $1
           WHERE LOWER(TRIM(game)) = LOWER(TRIM($2))
             AND LOWER(TRIM(COALESCE(platform, 'android'))) = LOWER(TRIM($3))
             AND LOWER(TRIM(brand)) = LOWER(TRIM($4))`,
          [cleanPlayStatus, cleanGame, cleanPlatform, cleanBrand],
        );
        syncedCount = Number(syncResult.rowCount || 0);
      }

      return res.json({
        message: syncBrandStatus
          ? `Produk berhasil diupdate. Status ${syncedCount} produk di platform + brand ini ikut disamakan.`
          : "Produk berhasil diupdate",
        synced_count: syncedCount,
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
    const result = await query(`
  SELECT
    p.id,
    p.game,
    p.brand,
    p.duration,
    p.price,
    p.active,
    COALESCE(NULLIF(p.platform, ''), 'android') AS platform,
    COALESCE(p.delivery_type, 'auto') AS delivery_type,
    COALESCE(p.play_status, 'safe') AS play_status,
    CASE
      WHEN LOWER(COALESCE(p.delivery_type, 'auto')) = 'manual' THEN 9999
      WHEN LOWER(COALESCE(p.delivery_type, 'auto')) = 'vipstore_api' THEN
        CASE
          WHEN COALESCE(p.supplier_maintenance, 0) = 1 THEN 0
          WHEN LOWER(COALESCE(p.supplier_status, '')) IN (
            'maintenance',
            'hidden',
            'not_found',
            'lookup_failed',
            'not_configured',
            'mapped_pending'
          ) THEN 0
          ELSE GREATEST(COALESCE(p.supplier_stock, 0), 0)
        END
      ELSE COUNT(k.id) FILTER (
        WHERE k.used = 0
          AND (
            k.reserved_order_id IS NULL
            OR k.reserved_until IS NULL
            OR k.reserved_until <= TO_CHAR(
              CURRENT_TIMESTAMP AT TIME ZONE 'UTC',
              'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            )
          )
      )::int
    END AS available_keys,
    CASE
      WHEN LOWER(p.duration) LIKE '%jam%' THEN
        COALESCE(NULLIF(regexp_replace(p.duration, '[^0-9]', '', 'g'), '')::int, 0)
      WHEN LOWER(p.duration) LIKE '%hari%' THEN
        COALESCE(NULLIF(regexp_replace(p.duration, '[^0-9]', '', 'g'), '')::int, 0) * 24
      WHEN LOWER(p.duration) LIKE '%bulan%' THEN
        COALESCE(NULLIF(regexp_replace(p.duration, '[^0-9]', '', 'g'), '')::int, 0) * 24 * 30
      ELSE
        999999
    END AS duration_order
  FROM products p
  LEFT JOIN keys k ON k.product_id = p.id
  WHERE p.active = 1
  GROUP BY p.id
  ORDER BY p.game ASC, COALESCE(NULLIF(p.platform, ''), 'android') ASC, p.brand ASC, duration_order ASC, p.price ASC, p.id ASC
`);

    return res.json(result.rows);
  } catch (err) {
    console.error("ERROR PUBLIC PRODUCTS:", err);
    return res.status(500).json({
      message: "Gagal mengambil produk publik",
    });
  }
});

// Public list of currently active vouchers (no auth) for auto-apply hint on the FE.
// Returns only non-sensitive fields needed to compute display & match scope.
app.get("/public-vouchers", async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        vouchers.id,
        vouchers.code,
        vouchers.game_name,
        vouchers.brand_name,
        vouchers.duration_name,
        vouchers.discount_amount,
        vouchers.expires_at,
        COALESCE(product_targets.product_ids, '[]'::json) AS product_ids
      FROM vouchers
      LEFT JOIN LATERAL (
        SELECT json_agg(vp.product_id ORDER BY vp.product_id ASC) AS product_ids
        FROM voucher_products vp
        WHERE vp.voucher_id = vouchers.id
      ) product_targets ON true
WHERE vouchers.active = 1
  AND COALESCE(vouchers.visibility, 'public') = 'public'
  AND (vouchers.expires_at IS NULL OR vouchers.expires_at = '' OR vouchers.expires_at > to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
      ORDER BY vouchers.discount_amount DESC
      LIMIT 50
      `,
    );

    const vouchers = result.rows.map((row) => {
      const game = row.game_name ? String(row.game_name).trim() : "";
      const brand = row.brand_name ? String(row.brand_name).trim() : "";
      const duration = row.duration_name
        ? String(row.duration_name).trim()
        : "";
      const productIds = Array.isArray(row.product_ids)
        ? row.product_ids
            .map((entry) => Number(entry))
            .filter((entry) => Number.isInteger(entry) && entry > 0)
        : [];
      let scope = productIds.length ? "product" : "all";

      if (!productIds.length) {
        if (duration) {
          scope = "duration";
        } else if (brand) {
          scope = "brand";
        } else if (game) {
          scope = "game";
        }
      }

      return {
        code: String(row.code || "").trim(),
        scope,
        product_ids: productIds,
        game_name: game || null,
        brand_name: brand || null,
        duration_name: duration || null,
        discount_amount: Number(row.discount_amount || 0),
        expires_at: row.expires_at || null,
      };
    });

    return res.json(vouchers);
  } catch (err) {
    console.error("ERROR PUBLIC VOUCHERS:", err);
    return res.status(500).json({
      message: "Gagal mengambil voucher publik",
    });
  }
});

// Trending games: top 8 by paid order count over last 7 days.
// Used for the "Lagi Naik Daun" rail on the catalog.
app.get("/trending-products", async (req, res) => {
  try {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const result = await query(
      `
      SELECT
        game,
        COUNT(*)::int AS order_count
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at >= $1
        AND game IS NOT NULL
        AND game <> ''
      GROUP BY game
      ORDER BY order_count DESC, game ASC
      LIMIT 8
      `,
      [sevenDaysAgo],
    );

    return res.json(
      result.rows.map((row) => ({
        game: String(row.game || "").trim(),
        order_count: Number(row.order_count || 0),
      })),
    );
  } catch (err) {
    console.error("ERROR TRENDING PRODUCTS:", err);
    return res.status(500).json({
      message: "Gagal mengambil game trending",
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
    const salt = await bcrypt.genSalt(12);
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

    const userCsrfToken = generateCsrfToken();
    res.cookie("user_csrf", userCsrfToken, {
      httpOnly: false,
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
      `SELECT id, game, product, price, unit_price, quantity, original_price,
              discount_amount, payment_fee, voucher_code, payment_status,
              delivery_status, gameKey, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC`,
      [loggedInUser.id],
    );

    const orders = await Promise.all(
      result.rows.map(async (order) => {
        const gameKeys = await getStoredOrderKeys(order.id, order.gamekey);
        return {
          ...order,
          quantity: getOrderQuantity(order.quantity),
          unit_price: Number(order.unit_price || order.original_price || order.price || 0),
          gameKey: gameKeys.join("\n"),
          gameKeys,
        };
      }),
    );

    return res.json(orders);
  } catch (err) {
    console.error("ERROR GET USER ORDERS:", err);
    return res.status(500).json({ message: "Gagal mengambil riwayat order" });
  }
});

app.post(
  "/user/change-password",
  changePasswordLimiter,
  requireUserCsrf,
  async (req, res) => {
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

      const hashedPassword = await bcrypt.hash(cleanNewPassword, 12);

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
  },
);

app.post("/user-logout", requireUserCsrf, (req, res) => {
  res.clearCookie("user_auth", { path: "/" });
  res.clearCookie("user_csrf", { path: "/" });
  return res.json({ message: "Logout berhasil" });
});
// ----------------------------------

app.post(
  "/api/user/default-order",
  userProfileLimiter,
  requireUserCsrf,
  async (req, res) => {
    const loggedInUser = getLoggedInUserFromRequest(req);

    if (!loggedInUser) {
      return res.status(401).json({ message: "Kamu harus login dulu" });
    }

    const defaultName = String(req.body.defaultName || "").trim();
    const defaultContact = String(req.body.defaultContact || "").trim();

    if (!defaultName || defaultName.length < 2 || defaultName.length > 60) {
      return res.status(400).json({
        message: "Nama default harus 2 sampai 60 karakter",
      });
    }

    const safeNameRegex = /^[a-zA-Z0-9 .,_'’-]+$/;
    if (!safeNameRegex.test(defaultName)) {
      return res.status(400).json({
        message: "Nama default mengandung karakter yang tidak diizinkan",
      });
    }

    if (defaultContact && !isValidOrderContact(defaultContact)) {
      return res.status(400).json({
        message:
          "Kontak default harus berupa email, nomor WhatsApp, atau username Telegram yang valid",
      });
    }

    const emailFromContact =
      defaultContact && isValidEmail(defaultContact)
        ? normalizeEmail(defaultContact)
        : null;

    try {
      await query(
        `UPDATE users
         SET default_name = $1,
             default_contact = $2,
             email = COALESCE($3, email),
             email_verified = CASE
               WHEN $3 IS NOT NULL AND COALESCE(email, '') <> $3 THEN 0
               ELSE email_verified
             END
         WHERE id = $4`,
        [defaultName, defaultContact, emailFromContact, loggedInUser.id],
      );

      return res.json({
        message: "Data order default berhasil disimpan",
        defaultOrder: {
          name: defaultName,
          contact: defaultContact,
        },
        email: emailFromContact || "",
        emailVerified: false,
      });
    } catch (err) {
      console.error("ERROR SAVE DEFAULT ORDER DATA:", err);
      return res.status(500).json({
        message: "Gagal menyimpan data order default",
      });
    }
  },
);

app.post(
  "/api/user/verify-email/send",
  emailVerificationLimiter,
  requireUserCsrf,
  async (req, res) => {
    const loggedInUser = getLoggedInUserFromRequest(req);

    if (!loggedInUser) {
      return res.status(401).json({ message: "Kamu harus login dulu" });
    }

    const requestedEmail = normalizeEmail(req.body.email);

    try {
      const userResult = await query(
        `SELECT id, username, email, default_contact, email_verified
         FROM users
         WHERE id = $1
         LIMIT 1`,
        [loggedInUser.id],
      );

      const user = userResult.rows[0];

      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const fallbackEmail = isValidEmail(user.email)
        ? normalizeEmail(user.email)
        : isValidEmail(user.default_contact)
          ? normalizeEmail(user.default_contact)
          : "";

      const targetEmail = requestedEmail || fallbackEmail;

      if (!isValidEmail(targetEmail)) {
        return res.status(400).json({
          message: "Isi email yang valid dulu di Data Default",
        });
      }

      if (
        normalizeEmail(user.email) === targetEmail &&
        Number(user.email_verified || 0) === 1
      ) {
        return res.json({
          message: "Email sudah terverifikasi",
          email: targetEmail,
          alreadyVerified: true,
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
      const verificationUrl = `${getAppBaseUrl(req)}/verify-email?token=${token}`;

      await query(
        `UPDATE users
         SET email = $1,
             email_verified = 0,
             email_verification_token_hash = $2,
             email_verification_expires_at = $3
         WHERE id = $4`,
        [targetEmail, tokenHash, expiresAt, loggedInUser.id],
      );

      const sendResult = await sendVerificationEmail({
        to: targetEmail,
        username: user.username,
        verificationUrl,
      });

      const responsePayload = {
        message: sendResult.sent
          ? "Link verifikasi sudah dikirim ke email kamu"
          : "Link verifikasi dibuat. RESEND_API_KEY belum diset, jadi link tampil untuk mode testing.",
        email: targetEmail,
        sent: sendResult.sent,
        provider: sendResult.provider,
      };

      if (!sendResult.sent && process.env.NODE_ENV !== "production") {
        responsePayload.verificationUrl = verificationUrl;
      }

      return res.json(responsePayload);
    } catch (err) {
      console.error("ERROR SEND EMAIL VERIFICATION:", err);
      return res.status(500).json({
        message: "Gagal mengirim email verifikasi",
      });
    }
  },
);

app.get("/verify-email", async (req, res) => {
  const token = String(req.query.token || "").trim();

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).send("Link verifikasi tidak valid");
  }

  const tokenHash = hashToken(token);

  try {
    const result = await query(
      `SELECT id, email_verification_expires_at
       FROM users
       WHERE email_verification_token_hash = $1
       LIMIT 1`,
      [tokenHash],
    );

    const user = result.rows[0];

    if (!user) {
      return res
        .status(400)
        .send("Link verifikasi tidak valid atau sudah dipakai");
    }

    if (
      !user.email_verification_expires_at ||
      new Date(user.email_verification_expires_at) < new Date()
    ) {
      return res
        .status(400)
        .send(
          "Link verifikasi sudah expired. Silakan request ulang dari halaman akun.",
        );
    }

    await query(
      `UPDATE users
       SET email_verified = 1,
           email_verification_token_hash = NULL,
           email_verification_expires_at = NULL
       WHERE id = $1`,
      [user.id],
    );

    return res.send(`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Email Verified - AE Game Store</title>
  <style>
    body{font-family:Arial,sans-serif;background:#f0f9ff;color:#0c4a6e;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}
    .card{max-width:460px;background:white;border:1px solid #bae6fd;border-radius:24px;padding:28px;text-align:center;box-shadow:0 14px 32px rgba(14,165,233,.14)}
    a{display:inline-block;margin-top:14px;background:#0ea5e9;color:white;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:800}
  </style>
</head>
<body>
  <div class="card">
    <h1>✅ Email berhasil diverifikasi</h1>
    <p>Email akun AE Game Store kamu sekarang sudah aktif dan terverifikasi.</p>
    <a href="/account">Kembali ke Account</a>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error("ERROR VERIFY EMAIL:", err);
    return res.status(500).send("Gagal verifikasi email");
  }
});

// ----------------------------------

// --- FITUR BARU: Cek User yang sedang Login ---
app.get("/api/user/me", async (req, res) => {
  const token = req.cookies.user_auth;

  if (!token) return res.json({ loggedIn: false });

  try {
    const decoded = jwt.verify(token, jwtSecret);

    const userResult = await query(
      `
      SELECT id, username, default_name, default_contact, email, email_verified,
             email_verification_expires_at, badge_override, badge_override_expires_at
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [decoded.id],
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.json({ loggedIn: false });
    }

    const statsResult = await query(
      `
      SELECT
        COUNT(*) FILTER (WHERE payment_status = 'paid')::int AS paid_order_count,
        COALESCE(SUM(price) FILTER (WHERE payment_status = 'paid'), 0)::int AS total_spend
      FROM orders
      WHERE user_id = $1
      `,
      [user.id],
    );

    const reviewResult = await query(
      `
      SELECT id
      FROM reviews
      WHERE user_id = $1
        AND active = 1
      LIMIT 1
      `,
      [user.id],
    );

    const paidOrderCount = Number(statsResult.rows[0]?.paid_order_count || 0);
    const totalSpend = Number(statsResult.rows[0]?.total_spend || 0);
    const hasReview = reviewResult.rows.length > 0;
    await ensureWalletAccount(db, user.id);
    const walletResult = await query(
      `SELECT balance FROM wallet_accounts WHERE user_id = $1 LIMIT 1`,
      [user.id],
    );
    const walletBalance = Number(walletResult.rows[0]?.balance || 0);

    const overrideBadge =
      user.badge_override &&
      (!user.badge_override_expires_at ||
        new Date(user.badge_override_expires_at) > new Date())
        ? getBadgeByCode(user.badge_override)
        : null;

    const automaticBadge = getBuyerBadge({
      paidOrderCount,
      totalSpend,
    });
    const badge = overrideBadge || automaticBadge;

    return res.json({
      loggedIn: true,
      id: user.id,
      username: user.username,
      contact: user.default_contact || user.email || "",
      defaultOrder: {
        name: user.default_name || "",
        contact: user.default_contact || "",
      },
      email: user.email || "",
      emailVerified: Number(user.email_verified || 0) === 1,
      emailVerificationPending: Boolean(
        user.email_verification_expires_at &&
        new Date(user.email_verification_expires_at) > new Date(),
      ),
      badge,
      badgeIsOverride: Boolean(overrideBadge),
      badgeLadder: getBuyerBadgeLadder(),
      badgeProgress: getBuyerBadgeProgress({
        paidOrderCount,
        totalSpend,
        currentBadgeCode: badge.code,
      }),
      stats: {
        paid_order_count: paidOrderCount,
        total_spend: totalSpend,
        has_review: hasReview,
      },
      wallet: {
        balance: walletBalance,
        min_topup: WALLET_MIN_TOPUP,
        max_topup: WALLET_MAX_TOPUP,
      },
    });
  } catch (err) {
    console.error("ERROR GET USER ME:", err);
    return res.json({ loggedIn: false });
  }
});

app.get("/api/wallet", async (req, res) => {
  const user = getLoggedInUserFromRequest(req);
  if (!user) return res.status(401).json({ message: "Kamu harus login dulu" });

  try {
    await ensureWalletAccount(db, user.id);
    const [account, topups, ledger] = await Promise.all([
      query(`SELECT balance, updated_at FROM wallet_accounts WHERE user_id = $1`, [user.id]),
      query(`SELECT id, amount, status, buyer_note, payment_reference, admin_note, created_at, reviewed_at
             FROM wallet_topup_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`, [user.id]),
      query(`SELECT entry_type, direction, amount, balance_before, balance_after, description, created_at
             FROM wallet_ledger WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT 15`, [user.id]),
    ]);
    return res.json({
      balance: Number(account.rows[0]?.balance || 0),
      updatedAt: account.rows[0]?.updated_at || null,
      topups: topups.rows.map((row) => ({ ...row, amount: Number(row.amount || 0) })),
      ledger: ledger.rows.map((row) => ({
        ...row,
        amount: Number(row.amount || 0),
        balance_before: Number(row.balance_before || 0),
        balance_after: Number(row.balance_after || 0),
      })),
      limits: { minTopup: WALLET_MIN_TOPUP, maxTopup: WALLET_MAX_TOPUP },
    });
  } catch (err) {
    console.error("ERROR GET WALLET:", err);
    return res.status(500).json({ message: "Gagal memuat saldo AE Credit" });
  }
});

const walletTopupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { message: "Terlalu banyak request top up, coba lagi nanti" },
});

app.post("/api/wallet/topups", walletTopupLimiter, requireUserCsrf, async (req, res) => {
  const user = getLoggedInUserFromRequest(req);
  if (!user) return res.status(401).json({ message: "Kamu harus login dulu" });

  const amount = parseWalletAmount(req.body?.amount);
  const buyerNote = String(req.body?.buyer_note || "").trim().slice(0, 300);
  const paymentReference = String(req.body?.payment_reference || "").trim().slice(0, 120);
  if (amount < WALLET_MIN_TOPUP || amount > WALLET_MAX_TOPUP) {
    return res.status(400).json({ message: `Nominal top up harus Rp${WALLET_MIN_TOPUP.toLocaleString("id-ID")} sampai Rp${WALLET_MAX_TOPUP.toLocaleString("id-ID")}` });
  }

  try {
    const pending = await query(`SELECT id FROM wallet_topup_requests WHERE user_id = $1 AND status = 'pending' LIMIT 1`, [user.id]);
    if (pending.rows.length) return res.status(409).json({ message: "Masih ada request top up yang menunggu verifikasi admin" });
    const id = `TOPUP-${crypto.randomUUID()}`;
    await query(`INSERT INTO wallet_topup_requests
      (id, user_id, amount, status, buyer_note, payment_reference, created_at)
      VALUES ($1, $2, $3, 'pending', $4, $5, $6)`,
      [id, user.id, amount, buyerNote || null, paymentReference || null, new Date().toISOString()]);
    return res.status(201).json({ message: "Request top up terkirim. Tunggu verifikasi admin.", id });
  } catch (err) {
    console.error("ERROR CREATE WALLET TOPUP:", err);
    return res.status(500).json({ message: "Gagal membuat request top up" });
  }
});

app.get("/api/admin/wallet/topups", requireAdminAuth, async (req, res) => {
  const status = ["pending", "approved", "rejected"].includes(String(req.query.status || "")) ? String(req.query.status) : "pending";
  try {
    const result = await query(`SELECT t.id, t.user_id, u.username, t.amount, t.status, t.buyer_note,
      t.payment_reference, t.admin_note, t.reviewed_by, t.created_at, t.reviewed_at,
      COALESCE(w.balance, 0) AS balance
      FROM wallet_topup_requests t LEFT JOIN users u ON u.id = t.user_id
      LEFT JOIN wallet_accounts w ON w.user_id = t.user_id
      WHERE t.status = $1 ORDER BY t.created_at ASC LIMIT 100`, [status]);
    return res.json({ status, topups: result.rows.map((row) => ({ ...row, amount: Number(row.amount || 0), balance: Number(row.balance || 0) })) });
  } catch (err) {
    console.error("ERROR ADMIN WALLET TOPUPS:", err);
    return res.status(500).json({ message: "Gagal memuat request top up" });
  }
});

app.post("/api/admin/wallet/topups/:id/approve", requireAdminAuth, requireAdminCsrf, async (req, res) => {
  const topupId = String(req.params.id || "").trim();
  const adminUsername = await getAdminSessionUsername(req).catch(() => "admin");
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const requestResult = await client.query(`SELECT * FROM wallet_topup_requests WHERE id = $1 FOR UPDATE`, [topupId]);
    const request = requestResult.rows[0];
    if (!request) { await client.query("ROLLBACK"); return res.status(404).json({ message: "Request top up tidak ditemukan" }); }
    if (request.status !== "pending") { await client.query("ROLLBACK"); return res.status(409).json({ message: `Request sudah ${request.status}` }); }
    await ensureWalletAccount(client, request.user_id);
    const wallet = (await client.query(`SELECT balance FROM wallet_accounts WHERE user_id = $1 FOR UPDATE`, [request.user_id])).rows[0];
    const before = Number(wallet?.balance || 0);
    const amount = Number(request.amount || 0);
    const after = before + amount;
    if (after > WALLET_MAX_BALANCE) { await client.query("ROLLBACK"); return res.status(400).json({ message: "Saldo user melewati batas maksimum" }); }
    const now = new Date().toISOString();
    await client.query(`UPDATE wallet_accounts SET balance = $1, updated_at = $2 WHERE user_id = $3`, [after, now, request.user_id]);
    await client.query(`INSERT INTO wallet_ledger
      (user_id, entry_type, direction, amount, balance_before, balance_after, reference_type, reference_id, description, admin_username, created_at)
      VALUES ($1, 'topup', 'credit', $2, $3, $4, 'topup', $5, $6, $7, $8)
      ON CONFLICT (reference_type, reference_id, direction) DO NOTHING`,
      [request.user_id, amount, before, after, topupId, "Top up QRIS diverifikasi admin", adminUsername, now]);
    await client.query(`UPDATE wallet_topup_requests SET status = 'approved', reviewed_by = $1, reviewed_at = $2 WHERE id = $3`, [adminUsername, now, topupId]);
    await client.query("COMMIT");
    return res.json({ message: "Top up disetujui", balance: after });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("ERROR APPROVE WALLET TOPUP:", err);
    return res.status(500).json({ message: "Gagal menyetujui top up" });
  } finally { client.release(); }
});

app.post("/api/admin/wallet/topups/:id/reject", requireAdminAuth, requireAdminCsrf, async (req, res) => {
  const topupId = String(req.params.id || "").trim();
  const adminUsername = await getAdminSessionUsername(req).catch(() => "admin");
  const note = String(req.body?.admin_note || "").trim().slice(0, 300) || "Pembayaran belum dapat diverifikasi";
  try {
    const result = await query(`UPDATE wallet_topup_requests SET status = 'rejected', admin_note = $1, reviewed_by = $2, reviewed_at = $3 WHERE id = $4 AND status = 'pending' RETURNING id`, [note, adminUsername, new Date().toISOString(), topupId]);
    if (!result.rowCount) return res.status(409).json({ message: "Request tidak ditemukan atau sudah diproses" });
    return res.json({ message: "Top up ditolak" });
  } catch (err) {
    console.error("ERROR REJECT WALLET TOPUP:", err);
    return res.status(500).json({ message: "Gagal menolak top up" });
  }
});

app.post("/api/admin/wallet/grant", requireAdminAuth, requireAdminCsrf, async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const amount = parseWalletAmount(req.body?.amount);
  const reason = String(req.body?.reason || "").trim().slice(0, 300);
  if (!username || username.length > 80) return res.status(400).json({ message: "Username buyer tidak valid" });
  if (amount < 1000 || amount > WALLET_MAX_TOPUP) return res.status(400).json({ message: "Nominal grant harus Rp1.000 sampai Rp2.000.000" });
  if (!reason) return res.status(400).json({ message: "Alasan grant wajib diisi" });

  const adminUsername = await getAdminSessionUsername(req).catch(() => "admin");
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const userResult = await client.query(`SELECT id, username FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1 FOR UPDATE`, [username]);
    const targetUser = userResult.rows[0];
    if (!targetUser) { await client.query("ROLLBACK"); return res.status(404).json({ message: "Buyer tidak ditemukan" }); }
    await ensureWalletAccount(client, targetUser.id);
    const wallet = (await client.query(`SELECT balance FROM wallet_accounts WHERE user_id = $1 FOR UPDATE`, [targetUser.id])).rows[0];
    const before = Number(wallet?.balance || 0);
    const after = before + amount;
    if (after > WALLET_MAX_BALANCE) { await client.query("ROLLBACK"); return res.status(400).json({ message: "Saldo buyer melewati batas maksimum" }); }
    const now = new Date().toISOString();
    const grantId = `GRANT-${crypto.randomUUID()}`;
    await client.query(`UPDATE wallet_accounts SET balance = $1, updated_at = $2 WHERE user_id = $3`, [after, now, targetUser.id]);
    await client.query(`INSERT INTO wallet_ledger
      (user_id, entry_type, direction, amount, balance_before, balance_after, reference_type, reference_id, description, admin_username, created_at)
      VALUES ($1, 'admin_adjustment', 'credit', $2, $3, $4, 'admin_grant', $5, $6, $7, $8)`,
      [targetUser.id, amount, before, after, grantId, reason, adminUsername, now]);
    await client.query("COMMIT");
    return res.json({ message: `Saldo ${targetUser.username} bertambah ${formatWalletAmountForMessage(amount)}`, username: targetUser.username, balance: after });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("ERROR ADMIN WALLET GRANT:", err);
    return res.status(500).json({ message: "Gagal menambahkan saldo" });
  } finally { client.release(); }
});
// ----------------------------------------------
app.get("/reviews", async (req, res) => {
  try {
    const result = await query(
      `
  SELECT
  r.user_id,
  r.username,
  r.rating,
  r.comment,
  r.created_at,
  COALESCE(os.paid_order_count, 0)::int AS paid_order_count,
  COALESCE(os.total_spend, 0)::int AS total_spend
FROM reviews r
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) FILTER (WHERE payment_status = 'paid')::int AS paid_order_count,
    COALESCE(SUM(price) FILTER (WHERE payment_status = 'paid'), 0)::int AS total_spend
  FROM orders
  GROUP BY user_id
) os ON os.user_id = r.user_id
WHERE r.active = 1
ORDER BY r.updated_at DESC, r.id DESC
LIMIT 12
  `,
    );

    const reviews = result.rows.map((item) => {
      const paidOrderCount = Number(item.paid_order_count || 0);
      const totalSpend = Number(item.total_spend || 0);

      return {
        username: maskPublicUsername(item.username),
        rating: Number(item.rating || 0),
        comment: item.comment || "",
        created_at: item.created_at,
        badge: getBuyerBadge({
          paidOrderCount,
          totalSpend,
          hasReview: true,
        }),
      };
    });

    return res.json(reviews);
  } catch (err) {
    console.error("ERROR GET REVIEWS:", err);
    return res.status(500).json({
      message: "Gagal mengambil review",
    });
  }
});

app.get("/reviews/me", async (req, res) => {
  const loggedInUser = getLoggedInUserFromRequest(req);

  if (!loggedInUser) {
    return res.status(401).json({
      message: "Kamu harus login dulu",
    });
  }

  try {
    const result = await query(
      `
      SELECT rating, comment
      FROM reviews
      WHERE user_id = $1
      LIMIT 1
      `,
      [loggedInUser.id],
    );

    const review = result.rows[0] || null;

    return res.json({
      review,
    });
  } catch (err) {
    console.error("ERROR GET MY REVIEW:", err);
    return res.status(500).json({
      message: "Gagal mengambil review kamu",
    });
  }
});

app.post("/reviews", reviewLimiter, requireUserCsrf, async (req, res) => {
  const loggedInUser = getLoggedInUserFromRequest(req);

  if (!loggedInUser) {
    return res.status(401).json({
      message: "Kamu harus login dulu untuk memberi rating",
    });
  }

  const rating = Number(req.body.rating);
  const comment = String(req.body.comment || "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "Rating harus 1 sampai 5 bintang",
    });
  }

  if (comment.length < 8 || comment.length > 240) {
    return res.status(400).json({
      message: "Komentar harus 8 sampai 240 karakter",
    });
  }

  const hasDangerousTag = /<\s*\/?\s*script/i.test(comment);

  if (hasDangerousTag) {
    return res.status(400).json({
      message: "Komentar mengandung teks yang tidak diizinkan",
    });
  }

  try {
    const paidOrderCheck = await query(
      `
      SELECT id
      FROM orders
      WHERE user_id = $1
        AND payment_status = 'paid'
      LIMIT 1
      `,
      [loggedInUser.id],
    );

    if (paidOrderCheck.rows.length === 0) {
      return res.status(403).json({
        message:
          "Review hanya bisa diberikan oleh akun yang sudah pernah berhasil order",
      });
    }

    const now = new Date().toISOString();

    await query(
      `
      INSERT INTO reviews
        (user_id, username, rating, comment, active, created_at, updated_at)
      VALUES
        ($1, $2, $3, $4, 1, $5, $5)
      ON CONFLICT (user_id)
      DO UPDATE SET
        username = EXCLUDED.username,
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment,
        active = 1,
        updated_at = EXCLUDED.updated_at
      `,
      [loggedInUser.id, loggedInUser.username, rating, comment, now],
    );

    return res.json({
      message: "Terima kasih! Review kamu berhasil disimpan",
    });
  } catch (err) {
    console.error("ERROR SAVE REVIEW:", err);
    return res.status(500).json({
      message: "Gagal menyimpan review",
    });
  }
});

app.get("/recent-purchases", async (req, res) => {
  try {
    const result = await query(
      `
      SELECT name, game, product, created_at
      FROM orders
      WHERE payment_status = 'paid'
      ORDER BY created_at DESC
      LIMIT 10
      `,
    );

    const purchases = result.rows.map((item) => {
      const rawName = String(item.name || "Buyer").trim();
      const maskedName =
        rawName.length <= 2 ? rawName[0] + "***" : rawName.slice(0, 2) + "***";

      return {
        name: maskedName,
        game: item.game || "Game",
        product: item.product || "",
      };
    });

    return res.json(purchases);
  } catch (err) {
    console.error("ERROR RECENT PURCHASES:", err);
    return res.status(500).json({
      message: "Gagal mengambil pembelian terbaru",
    });
  }
});
app.get("/security-audit", requireAdminAuth, async (req, res) => {
  return res.json({
    helmet: true,
    csrf_admin_actions: true,
    rate_limit: true,
    password_hashing: true,
    jwt_secret_configured: Boolean(jwtSecret && jwtSecret.length >= 32),
    midtrans_production: isMidtransProduction,
    notes: [
      "Pastikan .env tidak pernah dipush ke GitHub.",
      "Gunakan password admin yang kuat.",
      "Pastikan Render memakai HTTPS.",
      "Jangan tampilkan kontak/email buyer ke public.",
      "Backup database secara rutin.",
    ],
  });
});

app.get("/admin-stats", requireAdminAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const month = new Date().toISOString().slice(0, 7);

    const todayRevenue = await query(
      `
      SELECT COALESCE(SUM(price), 0)::int AS total
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at LIKE $1
      `,
      [`${today}%`],
    );

    const monthRevenue = await query(
      `
      SELECT COALESCE(SUM(price), 0)::int AS total
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at LIKE $1
      `,
      [`${month}%`],
    );

    const paidToday = await query(
      `
      SELECT COUNT(*)::int AS total
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at LIKE $1
      `,
      [`${today}%`],
    );

    const pendingOrders = await query(
      `
      SELECT COUNT(*)::int AS total
      FROM orders
      WHERE payment_status = 'pending'
      `,
    );

    return res.json({
      revenue_today: Number(todayRevenue.rows[0]?.total || 0),
      revenue_month: Number(monthRevenue.rows[0]?.total || 0),
      paid_today: Number(paidToday.rows[0]?.total || 0),
      pending_orders: Number(pendingOrders.rows[0]?.total || 0),
    });
  } catch (err) {
    console.error("ERROR ADMIN STATS:", err);
    return res.status(500).json({
      message: "Gagal mengambil statistik admin",
    });
  }
});

app.get("/admin-alerts", requireAdminAuth, async (req, res) => {
  try {
    const manualOrders = await query(`
      SELECT id, name, game, product, payment_status, delivery_status, created_at
      FROM orders
      WHERE payment_status = 'paid'
        AND delivery_status = 'manual'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    return res.json({
      manual_orders: manualOrders.rows,
      manual_order_count: manualOrders.rows.length,
    });
  } catch (err) {
    console.error("ERROR ADMIN ALERTS:", err);
    return res.status(500).json({
      message: "Gagal mengambil admin alerts",
    });
  }
});

app.get("/admin-sessions", requireAdminAuth, async (req, res) => {
  try {
    await deleteExpiredAdminSessions();

    const currentToken = String(req.cookies.admin_auth || "").trim();

    const result = await query(
      `
      SELECT
        id,
        username,
        created_at,
        expires_at,
        ip_address,
        user_agent,
        CASE WHEN session_token = $1 THEN true ELSE false END AS current_session
      FROM admin_sessions
      WHERE expires_at > $2
      ORDER BY created_at DESC
      `,
      [currentToken, new Date().toISOString()],
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("ERROR ADMIN SESSIONS:", err);
    return res.status(500).json({
      message: "Gagal mengambil admin sessions",
    });
  }
});

let server = null;

async function startApplication() {
  await bulkOrderSchemaReady;

  if (isShuttingDown) return;

  server = app.listen(port, () => {
    console.log("Server jalan di port", port);
    startVipStoreAutoSync();
  });
}

startApplication().catch(async (err) => {
  console.error("STARTUP DATABASE MIGRATION ERROR:", err);

  try {
    await db.end();
  } catch (closeErr) {
    console.error("ERROR CLOSE DATABASE AFTER STARTUP FAILURE:", closeErr);
  }

  process.exit(1);
});

async function shutdown(signal) {
  if (isShuttingDown) return;

  isShuttingDown = true;
  stopVipStoreAutoSync();
  console.log(`${signal} diterima, memulai graceful shutdown`);

  const forceShutdownTimer = setTimeout(() => {
    console.error("Graceful shutdown timeout, proses dihentikan paksa");
    process.exit(1);
  }, 25 * 1000);
  if (typeof forceShutdownTimer.unref === "function") {
    forceShutdownTimer.unref();
  }

  if (!server) {
    try {
      await db.end();
      clearTimeout(forceShutdownTimer);
      process.exit(0);
    } catch (dbError) {
      console.error("ERROR CLOSE DATABASE POOL:", dbError);
      process.exit(1);
    }
    return;
  }

  server.close(async (serverError) => {
    try {
      await db.end();
      clearTimeout(forceShutdownTimer);
      process.exit(serverError ? 1 : 0);
    } catch (dbError) {
      console.error("ERROR CLOSE DATABASE POOL:", dbError);
      process.exit(1);
    }
  });

  if (typeof server.closeIdleConnections === "function") {
    server.closeIdleConnections();
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
