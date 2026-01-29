export function getSourceStyles(source: string): {
  badge: string;
  accent: string;
} {
  if (source == "newsletter") {
    return {
      badge: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      accent: "text-violet-400",
    };
  } else if (source == "HN - Front Page") {
    return {
      badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      accent: "text-orange-400",
    };
  } else if (source.startsWith("r/")) {
    return {
      badge: "bg-red-500/20 text-red-400 border-red-500/30",
      accent: "text-red-400",
    };
  } else if (source.startsWith("X")) {
    return {
      badge: "bg-sky-500/20 text-sky-400 border-sky-500/30",
      accent: "text-sky-400",
    };
  } else if (source == "The New Stack") {
    return {
      badge: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      accent: "text-pink-400",
    };
  } else if (source == "Dev.to") {
    return {
      badge: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      accent: "text-pink-400",
    };
  } else {
    return {
      badge: "bg-muted text-muted-foreground",
      accent: "text-muted-foreground",
    };
  }
}
