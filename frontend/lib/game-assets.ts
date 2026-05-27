function normalizeGameName(game: string) {
  return String(game || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function getGameThumbnail(game: string) {
  const normalized = normalizeGameName(game);

  const thumbnails: Record<string, string> = {
    deltaforce:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2507950/header.jpg",

    pubgm:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
    pubgmobile:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
    pubg: "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",

    bloodstrike: "https://www.blood-strike.com/favicon.ico",

    freefire:
      "https://play-lh.googleusercontent.com/6llpraFcTI0rEUuRpWEG9NWWblvm106y5JXcDzu60ACuaUYDD3i70a-p9_QM65NsGDE=s512",

    mlbb: "https://play-lh.googleusercontent.com/7nVY1HnQwxS65U6k7PRkDmW4N-1Jwdx0j5JqR68ZtIyM36Z7S6cQLal8hcdR4Pl0Tw=s512",
    mobilelegends:
      "https://play-lh.googleusercontent.com/7nVY1HnQwxS65U6k7PRkDmW4N-1Jwdx0j5JqR68ZtIyM36Z7S6cQLal8hcdR4Pl0Tw=s512",
    mobilelegend:
      "https://play-lh.googleusercontent.com/7nVY1HnQwxS65U6k7PRkDmW4N-1Jwdx0j5JqR68ZtIyM36Z7S6cQLal8hcdR4Pl0Tw=s512",

    codm: "https://play-lh.googleusercontent.com/3rU1PpO9wq0wVQIEV2ODNVJjJdxZB7Y6zjB8Fh91m5nMZT3sZml0j63QXK-DfM7v3g=s512",
    callofdutymobile:
      "https://play-lh.googleusercontent.com/3rU1PpO9wq0wVQIEV2ODNVJjJdxZB7Y6zjB8Fh91m5nMZT3sZml0j63QXK-DfM7v3g=s512",
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
