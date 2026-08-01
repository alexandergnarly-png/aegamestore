function normalizeGameName(game: string) {
  return String(game || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function getGameThumbnail(game: string) {
  const normalized = normalizeGameName(game);

  const thumbnails: Record<string, string> = {
    deltaforce: "/images/games/delta-force.webp",

    pubg: "/images/games/pubg.webp",
    pubgm: "/images/games/pubg.webp",
    pubgmobile: "/images/games/pubg.webp",

    bloodstrike: "/images/games/blood-strike.webp",

    freefire: "/images/games/free-fire.webp",
    ff: "/images/games/free-fire.webp",

    mlbb: "/images/games/mlbb.webp",
    mobilelegends: "/images/games/mlbb.webp",
    mobilelegend: "/images/games/mlbb.webp",

    codm: "/images/games/codm.webp",
    callofdutymobile: "/images/games/codm.webp",
    callofduty: "/images/games/codm.webp",

    arenabreakout: "/images/games/arena-breakout.webp",
    valorant: "/images/games/valorant.webp",
  };

  return thumbnails[normalized] || "";
}

export function getGameInitials(game: string) {
  return String(game || "AE")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}
