const { Pool } = require("pg");

const databaseUrl = String(process.env.DATABASE_URL || "");
let databaseHost = "";
try {
  databaseHost = new URL(databaseUrl).hostname;
} catch (_) {}
const isPrivateHost = databaseHost && !databaseHost.includes(".");
const sslDisabled = process.env.DATABASE_SSL === "false" || isPrivateHost;
const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false";
const statementTimeoutMs = Math.max(
  5000,
  Number(process.env.DATABASE_STATEMENT_TIMEOUT_MS) || 60000,
);

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: sslDisabled ? false : { rejectUnauthorized },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  lock_timeout: 10000,
  statement_timeout: statementTimeoutMs,
  query_timeout: statementTimeoutMs + 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected DB pool error:", err);
});

module.exports = pool;
