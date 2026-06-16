export function getScoreStyles(score) {
  if (score >= 85) {
    return {
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      bar: "bg-emerald-500",
      border: "border-l-emerald-500",
      panel: "bg-emerald-600",
      text: "text-emerald-700",
    };
  }

  if (score >= 70) {
    return {
      badge: "bg-amber-50 text-amber-700 ring-amber-100",
      bar: "bg-amber-500",
      border: "border-l-amber-500",
      panel: "bg-amber-500",
      text: "text-amber-700",
    };
  }

  return {
    badge: "bg-red-50 text-red-700 ring-red-100",
    bar: "bg-red-500",
    border: "border-l-red-500",
    panel: "bg-red-600",
    text: "text-red-700",
  };
}
