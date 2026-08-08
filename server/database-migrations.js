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
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS supplier_order_id TEXT`,
    `CREATE INDEX IF NOT EXISTS idx_orders_supplier_order_id
     ON orders(supplier_order_id)
     WHERE supplier_order_id IS NOT NULL`,
    `CREATE TABLE IF NOT EXISTS cheatgame_webhook_events (
      event_id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      supplier_order_id TEXT,
      local_order_id TEXT,
      created_at TEXT NOT NULL,
      processed_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS product_supplier_offers (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      supplier_source TEXT NOT NULL,
      supplier_product_id TEXT NOT NULL,
      supplier_product_name TEXT NOT NULL DEFAULT '',
      price_idr NUMERIC(12,2),
      stock INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'mapped_pending',
      maintenance_reason TEXT NOT NULL DEFAULT '',
      last_sync TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(product_id, supplier_source)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_product_supplier_offers_product
     ON product_supplier_offers(product_id)`,
  ];

  for (const statement of statements) {
    await db.query(statement);
  }
}

async function ensureWalletSchema(db) {
  const statements = [
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'midtrans'`,
    `CREATE TABLE IF NOT EXISTS wallet_accounts (
      user_id INTEGER PRIMARY KEY,
      balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS wallet_topup_requests (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      amount BIGINT NOT NULL CHECK (amount > 0),
      status TEXT NOT NULL DEFAULT 'pending',
      buyer_note TEXT,
      payment_reference TEXT,
      admin_note TEXT,
      reviewed_by TEXT,
      created_at TEXT NOT NULL,
      reviewed_at TEXT
    )`,
    `ALTER TABLE wallet_topup_requests ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'manual_qris'`,
    `ALTER TABLE wallet_topup_requests ADD COLUMN IF NOT EXISTS provider_order_id TEXT`,
    `ALTER TABLE wallet_topup_requests ADD COLUMN IF NOT EXISTS payment_amount BIGINT`,
    `ALTER TABLE wallet_topup_requests ADD COLUMN IF NOT EXISTS snap_token TEXT`,
    `ALTER TABLE wallet_topup_requests ADD COLUMN IF NOT EXISTS snap_redirect_url TEXT`,
    `ALTER TABLE wallet_topup_requests ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT`,
    `ALTER TABLE wallet_topup_requests ADD COLUMN IF NOT EXISTS paid_at TEXT`,
    `CREATE TABLE IF NOT EXISTS wallet_ledger (
      id BIGSERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      entry_type TEXT NOT NULL,
      direction TEXT NOT NULL,
      amount BIGINT NOT NULL CHECK (amount > 0),
      balance_before BIGINT NOT NULL,
      balance_after BIGINT NOT NULL CHECK (balance_after >= 0),
      reference_type TEXT NOT NULL,
      reference_id TEXT NOT NULL,
      description TEXT,
      admin_username TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(reference_type, reference_id, direction)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_wallet_topups_status_created
     ON wallet_topup_requests(status, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_wallet_topups_user_created
     ON wallet_topup_requests(user_id, created_at DESC)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_topups_provider_order
     ON wallet_topup_requests(provider_order_id)
     WHERE provider_order_id IS NOT NULL`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_topups_provider_transaction
     ON wallet_topup_requests(provider_transaction_id)
     WHERE provider_transaction_id IS NOT NULL`,
    `CREATE INDEX IF NOT EXISTS idx_wallet_ledger_user_created
     ON wallet_ledger(user_id, created_at DESC)`,
  ];

  for (const statement of statements) {
    await db.query(statement);
  }
}

module.exports = {
  ensureBulkOrderSchema,
  ensureWalletSchema,
};
