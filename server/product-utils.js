const GAME_NAME_ALIASES = {
  "8ballpool": "8 Ball Pool",
  "callofdutymobile": "CODM",
  "codm": "CODM",
  "mlbb": "MLBB",
  "mobilelegendsbangbang": "MLBB",
  "pubgm": "PUBG Mobile",
  "pubgmobile": "PUBG Mobile",
};

function normalizeProductGameName(value) {
  const clean = String(value || "").trim().replace(/\s+/g, " ");
  const key = clean.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return GAME_NAME_ALIASES[key] || clean;
}

function normalizeProductDuration(value) {
  const clean = String(value || "").trim().replace(/\s+/g, " ");
  const match = clean.match(/^(\d+)\s*(jam|hari|bulan)$/i);
  return match
    ? `${Number(match[1])} ${match[2][0].toUpperCase()}${match[2].slice(1).toLowerCase()}`
    : clean;
}

module.exports = { normalizeProductDuration, normalizeProductGameName };
