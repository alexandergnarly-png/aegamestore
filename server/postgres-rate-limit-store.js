const crypto = require("node:crypto");

class PostgresRateLimitStore {
  constructor({ pool, prefix, ready }) {
    this.pool = pool;
    this.prefix = `${prefix}:`;
    this.ready = ready;
    this.windowMs = 60_000;
    this.localKeys = false;
  }

  init(options) {
    this.windowMs = Number(options.windowMs || this.windowMs);
  }

  getBucketKey(key) {
    return crypto
      .createHash("sha256")
      .update(`${this.prefix}${key}`)
      .digest("hex");
  }

  async increment(key) {
    await this.ready;
    const resetTime = new Date(Date.now() + this.windowMs);
    const result = await this.pool.query(
      `INSERT INTO rate_limit_buckets (bucket_key, hit_count, reset_at)
       VALUES ($1, 1, $2)
       ON CONFLICT (bucket_key) DO UPDATE SET
         hit_count = CASE
           WHEN rate_limit_buckets.reset_at <= NOW() THEN 1
           ELSE rate_limit_buckets.hit_count + 1
         END,
         reset_at = CASE
           WHEN rate_limit_buckets.reset_at <= NOW() THEN EXCLUDED.reset_at
           ELSE rate_limit_buckets.reset_at
         END
       RETURNING hit_count, reset_at`,
      [this.getBucketKey(key), resetTime],
    );
    return {
      totalHits: Number(result.rows[0].hit_count),
      resetTime: new Date(result.rows[0].reset_at),
    };
  }

  async decrement(key) {
    await this.ready;
    await this.pool.query(
      `UPDATE rate_limit_buckets
       SET hit_count = GREATEST(hit_count - 1, 0)
       WHERE bucket_key = $1`,
      [this.getBucketKey(key)],
    );
  }

  async resetKey(key) {
    await this.ready;
    await this.pool.query("DELETE FROM rate_limit_buckets WHERE bucket_key = $1", [
      this.getBucketKey(key),
    ]);
  }
}

module.exports = { PostgresRateLimitStore };
