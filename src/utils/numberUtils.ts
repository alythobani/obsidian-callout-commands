export function clamp({ value, min, max }: { value: number; min: number; max: number }): number {
  return Math.min(Math.max(value, min), max);
}
