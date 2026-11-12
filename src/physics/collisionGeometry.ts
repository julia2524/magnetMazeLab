import type { GeneratedRound, Point, WallSettings } from "../levels/levelTypes";
import { nearestOnCenterline } from "./wallCollision";

/**
 * 중심선(Centerline) → 통로(Corridor) → 벽(Wall) 변환.
 *
 * 게임판 = 정사각형 전체가 벽. 거기서 통로만 비워 둔다.
 *     벽 영역 = 보드 전체 − 통로 영역
 *     통로 영역 = 중심선에서 corridorWidth/2 이내인 점들 (끝은 반원으로 닫힘)
 *  - 그리기: 보드 전체 사각형을 벽으로 채우고, 같은 통로 영역(중심선 + 폭)을 mask 로 뚫는다 (PathWall)
 *  - 충돌:   "구슬 중심은 중심선에서 reach(= 통로 반폭 - 구슬 반지름) 이내"만 허용 (wallCollision)
 *  두 가지가 같은 중심선·같은 폭에서 나오기 때문에 보이는 통로와 충돌 영역이 항상 일치한다.
 *  통로 끝은 둥글게 닫혀 있고(반지름 = 통로 반폭) 보드 테두리와는 항상 wallThickness 이상 떨어진다.
 *
 * 모든 좌표는 보드 픽셀 단위다. (정규화 좌표 → px 변환은 buildWallGeometry 에서 한 번만 한다)
 */

const DEG = Math.PI / 180;

export interface WallGeometry {
  hasWalls: boolean;
  /** 보드 크기(px). 벽 영역 = 이 사각형 전체 − 통로 */
  boardWidth: number;
  boardHeight: number;
  /** 통로 양 끝(= 출발지 / 목적지 쪽). 중심선의 첫 점과 끝 점 */
  start: Point;
  goal: Point;
  /** 코너를 둥글게 깎은 최종 중심선 (px) */
  centerline: Point[];
  /** 충돌용 선분 [ax, ay, bx, by, ...] */
  segs: number[];
  segCount: number;
  corridorWidth: number; // 벽 안쪽 면 사이 거리
  wallThickness: number;
  /** 벽 바깥 면까지의 전체 폭 = corridorWidth + 2 * wallThickness */
  outerWidth: number;
  ballRadius: number;
  /** 구슬 중심이 중심선에서 떨어질 수 있는 최대 거리 = corridorWidth / 2 - ballRadius */
  reach: number;
  /** SVG path 문자열 (렌더링용) */
  pathD: string;
}

const EMPTY: WallGeometry = {
  hasWalls: false,
  boardWidth: 0,
  boardHeight: 0,
  start: { x: 0, y: 0 },
  goal: { x: 0, y: 0 },
  centerline: [],
  segs: [],
  segCount: 0,
  corridorWidth: 0,
  wallThickness: 0,
  outerWidth: 0,
  ballRadius: 0,
  reach: 0,
  pathD: "",
};

function clamp1(v: number) {
  return v < -1 ? -1 : v > 1 ? 1 : v;
}

/** 꺾이는 코너를 반지름 radius 의 원호로 깎는다. 촘촘한 곡선의 점들(거의 일직선)은 건드리지 않는다. */
export function filletPolyline(pts: Point[], radius: number): Point[] {
  if (radius <= 0 || pts.length < 3) return pts.slice();
  const out: Point[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const P = pts[i];
    const l1 = Math.hypot(pts[i - 1].x - P.x, pts[i - 1].y - P.y);
    const l2 = Math.hypot(pts[i + 1].x - P.x, pts[i + 1].y - P.y);
    if (l1 < 1e-6 || l2 < 1e-6) {
      out.push(P);
      continue;
    }
    const v1x = (pts[i - 1].x - P.x) / l1;
    const v1y = (pts[i - 1].y - P.y) / l1;
    const v2x = (pts[i + 1].x - P.x) / l2;
    const v2y = (pts[i + 1].y - P.y) / l2;
    const phi = Math.acos(clamp1(v1x * v2x + v1y * v2y)); // 코너의 안쪽 각도
    if (phi > Math.PI - 20 * DEG) {
      out.push(P);
      continue;
    }
    const half = phi / 2;
    let t = radius / Math.tan(half); // 코너에서 원호 시작점까지 거리
    const tMax = 0.5 * Math.min(l1, l2); // 이웃한 코너의 원호와 겹치지 않게
    if (t > tMax) t = tMax;
    const rEff = t * Math.tan(half);
    const ax = P.x + v1x * t;
    const ay = P.y + v1y * t;
    const bx = P.x + v2x * t;
    const by = P.y + v2y * t;
    const bisX = v1x + v2x;
    const bisY = v1y + v2y;
    const bl = Math.hypot(bisX, bisY);
    const cx = P.x + (bisX / bl) * (rEff / Math.sin(half));
    const cy = P.y + (bisY / bl) * (rEff / Math.sin(half));
    const a0 = Math.atan2(ay - cy, ax - cx);
    const a1 = Math.atan2(by - cy, bx - cx);
    let sweep = a1 - a0;
    while (sweep > Math.PI) sweep -= 2 * Math.PI;
    while (sweep < -Math.PI) sweep += 2 * Math.PI;
    const n = Math.max(2, Math.ceil(Math.abs(sweep) / (6 * DEG)));
    for (let k = 0; k <= n; k++) {
      const ang = a0 + (sweep * k) / n;
      out.push({ x: cx + Math.cos(ang) * rEff, y: cy + Math.sin(ang) * rEff });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** 일정한 간격(px)으로 다시 찍은 점들 (검증용) */
export function resamplePolyline(pts: Point[], spacing: number): Point[] {
  if (pts.length < 2) return pts.slice();
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(
      cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y),
    );
  }
  const total = cum[cum.length - 1];
  const n = Math.max(1, Math.ceil(total / spacing));
  const out: Point[] = [];
  let seg = 0;
  for (let k = 0; k <= n; k++) {
    const s = (total * k) / n;
    while (seg < pts.length - 2 && cum[seg + 1] < s) seg++;
    const len = cum[seg + 1] - cum[seg];
    const u = len > 1e-9 ? (s - cum[seg]) / len : 0;
    out.push({
      x: pts[seg].x + (pts[seg + 1].x - pts[seg].x) * u,
      y: pts[seg].y + (pts[seg + 1].y - pts[seg].y) * u,
    });
  }
  return out;
}

/** 경로에서 가장 급한 커브의 반지름(px). 작을수록 급커브. 직선이면 Infinity */
export function minTurnRadius(pts: Point[]): number {
  const r = resamplePolyline(pts, 5);
  const m = 4;
  let best = Infinity;
  for (let i = m; i < r.length - m; i++) {
    const a = r[i - m];
    const b = r[i];
    const c = r[i + m];
    const cr = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
    if (cr < 1e-9) continue;
    const ab = Math.hypot(b.x - a.x, b.y - a.y);
    const bc = Math.hypot(c.x - b.x, c.y - b.y);
    const ca = Math.hypot(a.x - c.x, a.y - c.y);
    best = Math.min(best, (ab * bc * ca) / (2 * cr));
  }
  return best;
}

/**
 * 경로를 따라 minSeparation 이상 떨어진 두 지점 사이의 최소 직선거리(px).
 * 이 값이 작으면 서로 다른 구간의 통로가 맞닿아 지름길이 생긴다.
 */
export function minShortcutGap(pts: Point[], minSeparation: number): number {
  const step = 6;
  const r = resamplePolyline(pts, step);
  const total = (r.length - 1) * step; // 근사
  const skip = Math.ceil(minSeparation / (total / Math.max(1, r.length - 1)));
  let best = Infinity;
  for (let i = 0; i < r.length; i++) {
    for (let j = i + skip; j < r.length; j++) {
      const d = Math.hypot(r[i].x - r[j].x, r[i].y - r[j].y);
      if (d < best) best = d;
    }
  }
  return best;
}

/** 정규화된 경로 → px 로 바꾸고 코너를 둥글게 깎은 중심선 */
export function buildCenterline(
  pointsPx: Point[],
  cornerRadius: number,
): Point[] {
  return filletPolyline(pointsPx, cornerRadius);
}

/** 라운드 데이터 + 벽 설정 → 렌더링/충돌에 쓰는 벽 데이터 (라운드 시작 때 한 번만 호출) */
export function buildWallGeometry(
  round: GeneratedRound,
  walls: WallSettings,
  ballRadius: number,
  boardW: number,
  boardH: number,
): WallGeometry {
  if (!walls.hasWalls || round.pathPoints.length < 2) return EMPTY;

  const px = round.pathPoints.map((p) => ({
    x: p.x * boardW,
    y: p.y * boardH,
  }));
  const centerline = buildCenterline(px, walls.cornerRadius);

  const segs: number[] = [];
  for (let i = 0; i < centerline.length - 1; i++) {
    const a = centerline[i];
    const b = centerline[i + 1];
    if (Math.hypot(b.x - a.x, b.y - a.y) < 1e-6) continue;
    segs.push(a.x, a.y, b.x, b.y);
  }

  const pathD = centerline
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return {
    hasWalls: true,
    boardWidth: boardW,
    boardHeight: boardH,
    start: centerline[0],
    goal: centerline[centerline.length - 1],
    centerline,
    segs,
    segCount: segs.length / 4,
    corridorWidth: walls.corridorWidth,
    wallThickness: walls.wallThickness,
    outerWidth: walls.corridorWidth + 2 * walls.wallThickness,
    ballRadius,
    reach: Math.max(0, walls.corridorWidth / 2 - ballRadius),
    pathD,
  };
}

/**
 * 점이 "보이는 통로" 안인지 (반지름 extra 만큼 여유를 두고). 렌더링과 같은 기준이다.
 * 구슬이 갈 수 있는 곳은 extra = ballRadius 일 때의 이 영역과 정확히 같다.
 */
export function isInCorridor(
  g: WallGeometry,
  x: number,
  y: number,
  extra = 0,
): boolean {
  if (!g.hasWalls) return true;
  if (x < 0 || y < 0 || x > g.boardWidth || y > g.boardHeight) return false;
  return nearestOnCenterline(g.segs, g.segCount, x, y).d <= g.corridorWidth / 2 - extra;
}

/**
 * 보드 구조 검사 (지침서 5단계). 문제가 있으면 설명 문자열 목록, 없으면 빈 배열.
 *  - 통로가 보드 안에 있고, 테두리와 최소 wallThickness 만큼 벽이 남는가 (= 테두리와 연결되지 않음)
 *  - 출발지/목적지(통로 양 끝)가 보드 안쪽에 있는가
 *  - 구슬이 지나갈 폭(reach > 0)이 있는가
 *  - 다른 구간의 통로가 서로 너무 가깝지 않은가 (벽 한 겹 이상 유지 = 지름길 없음)
 */
export function verifyBoardGeometry(g: WallGeometry): string[] {
  if (!g.hasWalls) return [];
  const issues: string[] = [];
  const half = g.corridorWidth / 2;
  const need = half + g.wallThickness - 0.5; // 통로 끝(반원)까지 포함해 테두리에서 떨어져야 하는 거리
  for (const p of g.centerline) {
    const edge = Math.min(p.x, p.y, g.boardWidth - p.x, g.boardHeight - p.y);
    if (edge < need) {
      issues.push(
        `통로가 보드 테두리에 너무 가까움 (남는 벽 ${(edge - half).toFixed(1)}px < ${g.wallThickness}px)`,
      );
      break;
    }
  }
  if (g.reach <= 0) issues.push("통로가 쇠구슬보다 좁음");
  const gap = minShortcutGap(g.centerline, Math.PI * (g.corridorWidth + g.wallThickness));
  if (gap < g.corridorWidth + g.wallThickness - 0.5) {
    issues.push("다른 구간의 통로가 서로 너무 가까움");
  }
  return issues;
}
