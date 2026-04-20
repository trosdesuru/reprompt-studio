export type ImageFormat = "square" | "landscape" | "portrait";

export function detectImageFormat(width?: number, height?: number): ImageFormat {
  if (!width || !height) return "square";

  const ratio = width / height;

  if (ratio > 1.1) return "landscape";
  if (ratio < 0.9) return "portrait";
  return "square";
}
