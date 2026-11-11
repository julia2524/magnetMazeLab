/**
 * 쇠구슬 ↔ 벽 충돌.
 *
 * 통로는 "중심선에서 reach 이내"인 영역이다 (reach = 통로 반폭 - 구슬 반지름 → 구슬 반지름 반영).
 * 구슬 중심이 이 영역 밖으로 나가면 영역 경계로 되돌린다. 되돌려진 위치는 항상 벽면 위이므로
 * 벽에 닿은 채로 계속 이동하면 자연스럽게 벽을 따라 미끄러진다.
 *
 * 연속 충돌(Swept): 한 번에 COLLISION_STEP(px) 이상 움직이지 않고, 매 걸음마다 보정한다.
 * 걸음이 벽 틈(구슬 지름 이상)보다 훨씬 작아서 벽을 뛰어넘을 수 없다.
 */

export interface WallHit {
  x: number;
  y: number;
  hit: boolean;
  /** 벽 바깥쪽 방향 법선 (hit 일 때만 의미 있음) */
  nx: number;
  ny: number;
}

/** 점 (x, y) 에서 중심선까지의 가장 가까운 점 */
export function nearestOnCenterline(
  segs: number[],
  count: number,
  x: number,
  y: number,
) {
  "worklet";
  let best = Infinity;
  let bx = 0;
  let by = 0;
  for (let i = 0; i < count; i++) {
    const k = i * 4;
    const ax = segs[k];
    const ay = segs[k + 1];
    const ex = segs[k + 2] - ax;
    const ey = segs[k + 3] - ay;
    const len2 = ex * ex + ey * ey;
    let t = len2 > 0 ? ((x - ax) * ex + (y - ay) * ey) / len2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const px = ax + ex * t;
    const py = ay + ey * t;
    const dx = x - px;
    const dy = y - py;
    const d2 = dx * dx + dy * dy;
    if (d2 < best) {
      best = d2;
      bx = px;
      by = py;
    }
  }
  return { px: bx, py: by, d: Math.sqrt(best) };
}

/** 구슬 중심이 통로 밖이면 가장 가까운 벽면 위로 되돌린다 */
export function resolveWalls(
  segs: number[],
  count: number,
  reach: number,
  x: number,
  y: number,
): WallHit {
  "worklet";
  if (count <= 0) return { x, y, hit: false, nx: 0, ny: 0 };
  const near = nearestOnCenterline(segs, count, x, y);
  if (near.d <= reach) return { x, y, hit: false, nx: 0, ny: 0 };
  const nx = (x - near.px) / near.d;
  const ny = (y - near.py) / near.d;
  return {
    x: near.px + nx * reach,
    y: near.py + ny * reach,
    hit: true,
    nx,
    ny,
  };
}

/**
 * (x, y) → 목표(tx, ty) 방향으로 작은 걸음씩 이동하며 매번 벽 보정.
 * 벽에 막히면 벽면을 따라 미끄러지고, 더 못 나아가면 멈춘다. (부착 상태에서 자석 끝을 따라갈 때 사용)
 */
export function moveWithWalls(
  segs: number[],
  count: number,
  reach: number,
  x: number,
  y: number,
  tx: number,
  ty: number,
  step: number,
  maxSteps: number,
) {
  "worklet";
  let cx = x;
  let cy = y;
  for (let k = 0; k < maxSteps; k++) {
    const dx = tx - cx;
    const dy = ty - cy;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.01) break;
    const m = d < step ? d : step;
    const res = resolveWalls(
      segs,
      count,
      reach,
      cx + (dx / d) * m,
      cy + (dy / d) * m,
    );
    const nd = Math.sqrt(
      (tx - res.x) * (tx - res.x) + (ty - res.y) * (ty - res.y),
    );
    cx = res.x;
    cy = res.y;
    if (d - nd < 0.05) break; // 더 가까워지지 않음 = 막힘
  }
  return { x: cx, y: cy };
}
