function normalizeGameName(game: string) {
  return String(game || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function getGameThumbnail(game: string) {
  const normalized = normalizeGameName(game);

  const thumbnails: Record<string, string> = {
    deltaforce: "/images/games/delta-force.jpg",

    pubg: "/images/games/pubg.jpg",
    pubgm: "/images/games/pubg.jpg",
    pubgmobile: "/images/games/pubg.jpg",

    bloodstrike: "/images/games/blood-strike.jpg",

    freefire: "/images/games/free-fire.jpg",
    ff: "/images/games/free-fire.jpg",

    mlbb: "/images/games/mlbb.jpg",
    mobilelegends: "/images/games/mlbb.jpg",
    mobilelegend: "/images/games/mlbb.jpg",

    codm: "/images/games/codm.jpg",
    callofdutymobile: "/images/games/codm.jpg",
    callofduty: "/images/games/codm.jpg",
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
