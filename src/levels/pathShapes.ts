import type {
  CircleVariant,
  FreeVariant,
  LShapeVariant,
  Point,
  SpiralVariant,
  StraightVariant,
  WaveVariant,
  ZigzagVariant,
} from "./levelTypes";

/**
 * 경로 형태 빌더.
 * 보드와 무관한 "월드 좌표"(보드 너비 = 1, y 아래쪽이 +)에서 원점 근처에 모양만 만든다.
 * 보드 중앙 배치 · 크기 맞춤 · 정규화는 levelGenerator 가 담당한다.
 */
export interface WorldPath {
  /** 가이드 경로. FREE 는 빈 배열 */
  points: Point[];
  start: Point;
  goal: Point;
  /** 나선의 고리 사이 간격(검증용) */
  ringSpacing?: number;
}

const DEG = Math.PI / 180;

function fromPoints(points: Point[]): WorldPath {
  return { points, start: points[0], goal: points[points.length - 1] };
}

export function buildFree(v: FreeVariant): WorldPath {
  const dx = Math.cos(v.angleDeg * DEG) * v.distance;
  const dy = Math.sin(v.angleDeg * DEG) * v.distance;
  return {
    points: [],
    start: { x: -dx / 2, y: -dy / 2 },
    goal: { x: dx / 2, y: dy / 2 },
  };
}

export function buildStraight(v: StraightVariant): WorldPath {
  const h = v.length / 2;
  const pts =
    v.orientation === "HORIZONTAL"
      ? [
          { x: -h, y: 0 },
          { x: h, y: 0 },
        ]
      : [
          { x: 0, y: -h },
          { x: 0, y: h },
        ];
  return fromPoints(v.reversed ? pts.reverse() : pts);
}

export function buildLShape(v: LShapeVariant): WorldPath {
  const a = v.horizontalLength;
  const b = v.verticalLength;
  return fromPoints(
    v.shape === "GIYEOK"
      ? [
          { x: 0, y: 0 },
          { x: a, y: 0 },
          { x: a, y: b },
        ] // ㄱ: 오른쪽으로 갔다가 아래로
      : [
          { x: 0, y: 0 },
          { x: 0, y: b },
          { x: a, y: b },
        ], // ㄴ: 아래로 갔다가 오른쪽으로
  );
}

export function buildCircle(v: CircleVariant): WorldPath {
  const dir = v.clockwise ? 1 : -1; // 화면은 y가 아래 → 각도가 늘어나는 쪽이 시계 방향
  const n = Math.max(2, Math.ceil(v.sweepDeg / 6));
  const pts: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const ang = (v.startAngleDeg + (dir * v.sweepDeg * i) / n) * DEG;
    pts.push({ x: Math.cos(ang) * v.radius, y: Math.sin(ang) * v.radius });
  }
  return fromPoints(pts);
}

export function buildSpiral(v: SpiralVariant): WorldPath {
  const dir = v.clockwise ? 1 : -1;
  const n = Math.max(8, Math.ceil(v.turns * 40));
  const total = v.turns * 2 * Math.PI;
  const startAngle = Math.PI; // 왼쪽에서 시작
  const pts: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const r = v.outerRadius + (v.innerRadius - v.outerRadius) * u;
    const ang = startAngle + dir * total * u;
    pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
  }
  const path = fromPoints(v.startOutside ? pts : pts.reverse());
  path.ringSpacing = (v.outerRadius - v.innerRadius) / v.turns;
  return path;
}

export function buildWave(v: WaveVariant): WorldPath {
  const n = Math.max(8, Math.ceil(v.waveCount * 24));
  const pts: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const along = (s - 0.5) * v.length;
    const across = v.amplitude * Math.sin(2 * Math.PI * v.waveCount * s);
    pts.push(
      v.orientation === "HORIZONTAL"
        ? { x: along, y: across }
        : { x: across, y: along },
    );
  }
  return fromPoints(v.reversed ? pts.reverse() : pts);
}

export function buildZigzag(v: ZigzagVariant): WorldPath {
  const total = v.segmentWeights.reduce((a, b) => a + b, 0);
  const pts: Point[] = [];
  let acc = 0;
  for (let i = 0; i <= v.segmentWeights.length; i++) {
    const along = (acc / total - 0.5) * v.span;
    const across = (i % 2 === 0 ? -1 : 1) * (v.amplitude / 2);
    pts.push(
      v.orientation === "HORIZONTAL"
        ? { x: along, y: across }
        : { x: across, y: along },
    );
    if (i < v.segmentWeights.length) acc += v.segmentWeights[i];
  }
  return fromPoints(v.reversed ? pts.reverse() : pts);
}
