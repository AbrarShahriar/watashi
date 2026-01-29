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
  } else if (source == "Its Foss") {
    return {
      badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      accent: "text-cyan-400",
    };
  } else if (source == "Linkedin Blog") {
    return {
      badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      accent: "text-blue-400",
    };
  } else if (source == "LogRocket") {
    return {
      badge: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      accent: "text-violet-400",
    };
  } else if (source == "Uber Blog") {
    return {
      badge: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
      accent: "text-zinc-400",
    };
  } else {
    return {
      badge: "bg-muted text-muted-foreground",
      accent: "text-muted-foreground",
    };
  }
}
