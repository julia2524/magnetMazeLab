// 충돌 및 거리 판정
export function distance(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  "worklet";
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(v: number, min: number, max: number): number {
  "worklet";
  return v < min ? min : v > max ? max : v;
}
