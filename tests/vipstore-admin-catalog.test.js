const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const server = fs.readFileSync("server.js", "utf8");
const source = server.slice(server.indexOf("let vipStoreAdminCatalogRequest"), server.indexOf("async function readSupplierCatalogCache"));

(async () => {
  const liveItems = [{ product_id: "679", duration: "7 days" }];
  const mappedItems = [{ product_id: "10" }];
  let cache = null;
  let failure = false;
  let calls = 0;
  let saves = 0;
  const ctx = vm.createContext({
    console: { warn() {} },
    readSupplierCatalogCache: async (source) => { assert.equal(source, "vipstore"); return cache; },
    getVipStoreCatalog: async () => {
      calls++;
      if (failure) throw Object.assign(new Error("HTML challenge"), { code: "SUPPLIER_CATALOG_REJECTED" });
      return { items: liveItems };
    },
    getVipStoreIdrRate: async () => 17000,
    validateSupplierCatalog: (result) => result.items,
    normalizeVipStoreCatalogProduct: (item) => item,
    saveSupplierCatalogCache: async (source, items) => {
      assert.equal(source, "vipstore");
      assert.equal(items[0], liveItems[0]);
      saves++;
      return "2026-09-12T10:00:00Z";
    },
    getMappedSupplierCatalog: async (source) => { assert.equal(source, "vipstore"); return mappedItems; },
  });
  vm.runInContext(source, ctx);
  const [first, second] = await Promise.all([ctx.getAdminVipStoreCatalog(), ctx.getAdminVipStoreCatalog()]);
  assert.equal(calls, 1, "Concurrent requests share one supplier call");
  assert.equal(first, second);
  assert.equal(first.catalog_source, "live");
  assert.equal(saves, 1);

  cache = { items: liveItems, updated_at: first.updated_at, stale: false };
  assert.equal((await ctx.getAdminVipStoreCatalog()).catalog_source, "cache");
  assert.equal(calls, 1, "Fresh admin cache avoids another upstream request");
  failure = true;
  const fallback = await ctx.getAdminVipStoreCatalog(true);
  assert.equal(calls, 2, "Refresh must attempt a live request");
  assert.equal(fallback.fallback, true);
  assert.equal(fallback.stale, true);
  assert.equal(fallback.updated_at, first.updated_at, "Failure must not renew the snapshot timestamp");
  assert.equal(saves, 1, "Failed responses must not overwrite the cache");
  cache = null;
  assert.equal((await ctx.getAdminVipStoreCatalog()).catalog_source, "mapping");
  mappedItems.length = 0;
  await assert.rejects(ctx.getAdminVipStoreCatalog(), /HTML challenge/, "No fabricated success when no data exists");

  console.log("VIPStore admin catalog fallback and request retry checks passed.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
