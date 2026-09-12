# VIPStore audit — 2026-09-12

Contract: user-provided `vipstore-api-documentation (1).md`.

## Evidence and limits

- User's Render diagnostic returned HTTP 200, `text/html`, title `One moment, please...`, not the documented JSON API. That is consistent with a browser challenge on the request path, not evidence of an invalid HMAC.
- Local signed request through the rebuilt client: balance HTTP 200 JSON, approximately 1.3 seconds.
- Local signed catalog request: HTTP 200 JSON, 400 products, 1,052,241 bytes, approximately 18.5 seconds. Earlier requests timed out. The catalog path is intermittently slow/unavailable.
- The former HTTP 402 with a minimum balance message was from the removed provider; it was not a documented VIPStore catalog error.
- No live purchase or reset was made during this audit. Render's outbound path has not been retested by this workspace. Local success does not establish Render success.

## Findings addressed

1. VIPStore currency conversion unnecessarily called the other supplier. It now uses the configured VIPStore rate or the store's existing safe USD/IDR rate.
2. Old client accepted redirects and mixed non-JSON responses with confirmed API rejections. The new client refuses redirects, distinguishes challenge/non-JSON/network errors, and never persists raw HTML or credentials in diagnostics.
3. GET requests can retry once with a fresh nonce/signature. Purchase/reset POSTs execute once. Unknown purchase outcomes remain for review; only documented pre-delivery rejections qualify for automatic refund.
4. Claim handling reads only documented `codes`, checks `product_id` and actual `qty`, persists each delivered unit, and resumes from saved keys. It no longer interprets arbitrary nested strings as license keys.
5. Admin cache is explicitly labeled. Checkout requires successful live verification; the previous stale-snapshot checkout exception was removed. Failed product lookup cannot overwrite a saved mapping with fabricated zero stock.
6. All active requests, webhook processing, admin options, and configuration instructions for the former provider were removed. Its products are deactivated and switched to manual by an idempotent migration. Financial records and historical provider identifiers are retained, not relabeled as VIPStore.

## Render verification

After deployment, run `node scripts/check-vipstore.js` in Render Shell. It calls only balance and catalog and prints status, content type, duration, challenge classification, and product count without balance values or secrets.

Expected: both endpoints `ok: true`, JSON content type, catalog product count.

If `VIPSTORE_SECURITY_CHALLENGE` persists only on Render, the VIPStore administrator must inspect the API path `/backend/api/reseller/*` and Render's outbound traffic, excluding authenticated API requests from browser challenges while retaining API authentication. Rebuilding application code does not grant control over supplier infrastructure. Do not rotate working credentials merely because an HTML challenge appears.

Unused environment keys for the removed provider can be deleted from deployment settings; no code reads them. Old database history is retained intentionally. Removed source files are recoverable from Git history.
