require("dotenv").config({ quiet: true });
const client = require("../server/vipstore-client");
const config = {
  baseUrl: process.env.VIPSTORE_API_BASE_URL || client.BASE_URL,
  apiKey: String(process.env.VIPSTORE_API_KEY || "").trim(),
  apiSecret: String(process.env.VIPSTORE_API_SECRET || "").trim(),
};

(async () => {
  for (const endpoint of ["balance.php", "catalog.php"]) {
    const started = Date.now();
    try {
      const result = await client.request(config, endpoint, { timeoutMs: 20000 });
      console.log(JSON.stringify({ endpoint, ok: result.ok, ...result.diagnostics,
        products: Array.isArray(result.data.products) ? result.data.products.length : undefined,
        elapsed_ms: Date.now() - started }));
      if (!result.ok) process.exitCode = 1;
    } catch (error) {
      console.log(JSON.stringify({ endpoint, code: error.code, message: error.message, ...error.diagnostics, elapsed_ms: Date.now() - started }));
      process.exitCode = 1;
    }
  }
})().catch(() => { console.error("Diagnosis VIPStore gagal."); process.exitCode = 1; });
