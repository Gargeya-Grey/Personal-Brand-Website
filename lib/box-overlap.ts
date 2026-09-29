export type Box = { x: number; y: number; width: number; height: number };

/** Areas in square units; touching edges have zero intersection. */
export function boxOverlap(a: Box, b: Box) {
  const width = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const height = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const intersection = width * height;
  const union = a.width * a.height + b.width * b.height - intersection;
  return { intersection, union, iou: union > 0 ? intersection / union : 0 };
}
