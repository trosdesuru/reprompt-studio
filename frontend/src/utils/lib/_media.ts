export function getExactAspectRatio(
  width?: number | null,
  height?: number | null,
  resolution?: string | null,
): number {
  let w = width;
  let h = height;

  if ((!w || !h) && resolution && resolution.includes("x")) {
    const [resW, resH] = resolution.toLowerCase().split("x").map(Number);
    if (!isNaN(resW) && !isNaN(resH)) {
      w = resW;
      h = resH;
    }
  }

  if (!w || !h) return 0.8;

  return w / h;
}

export function getTailwindAspectClass(
  width?: number | null,
  height?: number | null,
  resolution?: string | null,
): string {
  const ratio = getExactAspectRatio(width, height, resolution);
  if (ratio > 1.1) return "aspect-[4/3]";
  if (ratio < 0.5) return "aspect-[9/20]";
  if (ratio < 0.75) return "aspect-[2/3]";
  if (ratio >= 0.75 && ratio <= 1.1) return "aspect-square";

  return "aspect-[4/5]"; // Fallback
}
