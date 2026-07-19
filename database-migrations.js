async function ensureBulkOrderSchema(db) {
  const statements = [
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit_price INTEGER DEFAULT 0`,
    `ALTER TABLE keys ADD COLUMN IF NOT EXISTS reserved_order_id TEXT`,
    `ALTER TABLE keys ADD COLUMN IF NOT EXISTS reserved_until TEXT`,
    `CREATE TABLE IF NOT EXISTS order_keys (
      id SERIAL PRIMARY KEY,
      order_id TEXT NOT NULL,
      key_id INTEGER,
      key_value TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'local',
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(order_id, position)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_keys_product_reservation
     ON keys(product_id, used, reserved_order_id, reserved_until)`,
    `CREATE INDEX IF NOT EXISTS idx_order_keys_order_id
     ON order_keys(order_id)`,
  ];

  for (const statement of statements) {
    await db.query(statement);
  }
}

module.exports = {
  ensureBulkOrderSchema,
};
