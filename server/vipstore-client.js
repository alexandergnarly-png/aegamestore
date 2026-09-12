const crypto = require("node:crypto");

const BASE_URL = "https://vipstore.web.id/backend/api/reseller";
const METHODS = {
  "catalog.php": "GET", "balance.php": "GET", "claim.php": "POST",
  "reset-products.php": "GET", "reset-key.php": "POST",
  "notifications.php": "GET", "product-sales-stats.php": "GET",
};

function headersFor(config, rawBody, timestamp = Math.floor(Date.now() / 1000), nonce = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.createHash("sha256").update(rawBody).digest("hex");
  return {
    "Content-Type": "application/json", Accept: "application/json",
    "X-API-Key": config.apiKey,
    "X-Timestamp": String(timestamp), "X-Nonce": nonce,
    "X-Signature": crypto.createHmac("sha256", config.apiSecret).update(`${timestamp}.${nonce}.${hash}`).digest("hex"),
  };
}

function apiError(code, message, diagnostics = {}) {
  return Object.assign(new Error(message), { code, diagnostics });
}

function normalizeCatalogResponse(data) {
  if (!data || typeof data !== "object") return data;
  const flag = (value) => {
    if ([true, 1, "1", "true"].includes(value)) return true;
    if ([false, 0, "0", "false"].includes(value)) return false;
    return undefined;
  };
  const flags = [data.success, data.ok, data.status];
  // A denial always wins, even if a product list accompanies it.
  if (flags.some((value) => flag(value) === false) || data.error) return { ...data, success: false };
  if (data.success !== undefined) {
    return { ...data, success: flag(data.success) };
  }
  if (flags.some((value) => value !== undefined && flag(value) === undefined)) return data;
  const products = Array.isArray(data) ? data : data.products;
  // Missing success is accepted ONLY for a complete, nonempty catalog shape.
  // Never infer purchase success from a payload or from HTTP 200.
  if (Array.isArray(products) && products.length && products.every((item) =>
    item && typeof item === "object" && !Array.isArray(item) &&
    Number.isSafeInteger(Number(item.id ?? item.product_id ?? item.variant_id)) &&
    Number(item.id ?? item.product_id ?? item.variant_id) > 0 &&
    typeof (item.name ?? item.product_name) === "string" &&
    typeof (item.price ?? item.reseller_price) === "number" &&
    Number.isFinite(item.price ?? item.reseller_price) && (item.price ?? item.reseller_price) >= 0 &&
    Number.isInteger(item.stock ?? item.available_codes) && (item.stock ?? item.available_codes) >= 0
  )) return { ...(!Array.isArray(data) ? data : {}), success: true, products };
  return data;
}

async function request(config, endpoint, options = {}, fetchImpl = fetch) {
  endpoint = String(endpoint).replace(/^\/+/, "");
  const method = String(options.method || METHODS[endpoint] || "GET").toUpperCase();
  if (!METHODS[endpoint] || METHODS[endpoint] !== method) throw apiError("VIPSTORE_INVALID_REQUEST", "Endpoint atau metode VIPStore tidak sesuai dokumentasi.");
  if (!config.apiKey || !config.apiSecret) throw apiError("VIPSTORE_NOT_CONFIGURED", "API key dan secret VIPStore belum dikonfigurasi.");
  const base = new URL(config.baseUrl || BASE_URL);
  if (base.origin !== "https://vipstore.web.id" || base.pathname.replace(/\/+$/, "") !== "/backend/api/reseller" || base.search || base.hash || base.username || base.password) {
    throw apiError("VIPSTORE_INVALID_BASE_URL", `Base URL VIPStore harus ${BASE_URL}`);
  }
  const rawBody = method === "GET" ? "" : JSON.stringify(options.body || {});
  const attempts = method === "GET" ? 2 : 1;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Number(options.timeoutMs) || 30000);
    try {
      const response = await fetchImpl(`${BASE_URL}/${endpoint}`, {
        method, headers: headersFor(config, rawBody), redirect: "manual",
        body: method === "GET" ? undefined : rawBody, signal: controller.signal,
      });
      const raw = await response.text();
      const diagnostics = {
        endpoint, http_status: response.status,
        content_type: response.headers.get("content-type") || "",
        server: response.headers.get("server") || "",
        request_id: response.headers.get("cf-ray") || "",
        bytes: Buffer.byteLength(raw),
      };
      if (response.status >= 300 && response.status < 400) throw apiError("VIPSTORE_REDIRECT", "VIPStore mengalihkan endpoint API. Periksa konfigurasi routing API supplier.", diagnostics);
      let data;
      try { data = JSON.parse(raw); } catch {
        const challenge = /one moment|just a moment|checking your browser|challenge-platform|captcha|bot verification/i.test(raw);
        diagnostics.challenge = challenge;
        throw apiError(challenge ? "VIPSTORE_SECURITY_CHALLENGE" : "VIPSTORE_INVALID_RESPONSE",
          challenge ? "VIPStore mengirim halaman pemeriksaan browser ke server. Admin VIPStore perlu mengecualikan endpoint API reseller dari browser challenge."
            : "VIPStore mengirim respons non-JSON. Periksa routing endpoint API di server supplier.", diagnostics);
      }
      diagnostics.response_shape = Array.isArray(data) ? "array" : data === null ? "null" : typeof data;
      diagnostics.success_type = typeof data?.success;
      diagnostics.products_type = Array.isArray(data?.products) ? "array" : typeof data?.products;
      if (endpoint === "catalog.php") data = normalizeCatalogResponse(data);
      if (!data || typeof data !== "object" || Array.isArray(data) || typeof data.success !== "boolean") {
        throw apiError("VIPSTORE_INVALID_RESPONSE", `Respons VIPStore belum dapat divalidasi (HTTP ${response.status}; bentuk ${diagnostics.response_shape}; success ${diagnostics.success_type}; products ${diagnostics.products_type}). Stok lama tidak ditimpa.`, diagnostics);
      }
      // Keep only sanitized error text; never send credentials or raw HTML to logs.
      if (typeof data.message === "string") {
        for (const secret of [config.apiKey, config.apiSecret]) data.message = data.message.split(secret).join("[redacted]");
        data.message = data.message.replace(/<[^>]*>/g, " ").slice(0, 240);
      }
      return { ok: response.ok && data.success, http_code: response.status, data, supplier_source: "VIPSTORE", diagnostics, diagnostic_message: data.success ? "" : data.message || "Request ditolak VIPStore" };
    } catch (error) {
      const wrapped = String(error.code || "").startsWith("VIPSTORE_") ? error : apiError(
        error.name === "AbortError" ? "VIPSTORE_TIMEOUT" : "VIPSTORE_REQUEST_FAILED",
        error.name === "AbortError" ? "Request VIPStore timeout." : "Koneksi server ke VIPStore gagal.", { endpoint });
      if (attempt < attempts && ["VIPSTORE_TIMEOUT", "VIPSTORE_REQUEST_FAILED", "VIPSTORE_INVALID_RESPONSE", "VIPSTORE_SECURITY_CHALLENGE"].includes(wrapped.code)) continue;
      throw wrapped;
    } finally { clearTimeout(timer); }
  }
}

function normalizeCatalogLabel(value) {
  if (Array.isArray(value)) return value.map(normalizeCatalogLabel).filter(Boolean).join(" / ");
  if (value && typeof value === "object") return normalizeCatalogLabel(value.name ?? value.title ?? value.label ?? value.value ?? "");
  return String(value ?? "").trim();
}

module.exports = { BASE_URL, METHODS, headersFor, request, normalizeCatalogLabel };
