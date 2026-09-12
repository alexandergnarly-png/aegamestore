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
      if (!data || typeof data !== "object" || Array.isArray(data) || typeof data.success !== "boolean") {
        throw apiError("VIPSTORE_INVALID_RESPONSE", "Struktur respons VIPStore tidak sesuai dokumentasi (success boolean wajib).", diagnostics);
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
