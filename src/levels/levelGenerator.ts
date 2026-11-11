// import {
//   DEFAULT_RULES,
//   DEFAULT_VARIATION,
//   LevelType,
//   type GeneratedRound,
//   type LevelConfig,
//   type LevelVariation,
//   type Point,
//   type ValidationRules,
// } from "./levelTypes";
// import {
//   buildCircle,
//   buildFree,
//   buildLShape,
//   buildSpiral,
//   buildStraight,
//   buildWave,
//   buildZigzag,
//   type WorldPath,
// } from "./pathShapes";

// export interface GenerateOptions {
//   /** 게임 보드의 가로/세로 비 (width / height). 원이 찌그러지지 않게 하는 데 필요 */
//   boardAspect: number;
//   /** 시드 기준값. 같은 값이면 항상 같은 라운드가 나온다 */
//   baseSeed?: number;
// }

// const MAX_ATTEMPTS = 8;
// const EPS = 1e-6;

// // ── 유틸 ───────────────────────────────────────────────────

// function lerp(a: number, b: number, t: number) {
//   return a + (b - a) * t;
// }

// /** 시드 기반 난수 (mulberry32). Math.random 은 쓰지 않는다 → 재현 가능 */
// function makeRng(seed: number) {
//   let a = seed >>> 0;
//   return () => {
//     a = (a + 0x6d2b79f5) >>> 0;
//     let t = a;
//     t = Math.imul(t ^ (t >>> 15), t | 1);
//     t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
//     return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
//   };
// }

// function hashSeed(baseSeed: number, levelId: number, roundIndex: number) {
//   return (
//     (Math.imul(baseSeed + 1, 73856093) ^
//       Math.imul(levelId, 19349663) ^
//       Math.imul(roundIndex + 1, 83492791)) >>>
//     0
//   );
// }

// function pick<T>(list: readonly T[], i: number): T {
//   if (list.length === 0)
//     throw new Error("[LevelGenerator] variants 가 비어 있습니다");
//   return list[i % list.length];
// }

// const round4 = (n: number) => Math.round(n * 10000) / 10000;
// const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

// /** FREE 는 경로가 없으므로 시작/목적지만으로 범위를 계산한다 */
// function refPoints(p: WorldPath): Point[] {
//   return p.points.length > 0 ? p.points : [p.start, p.goal];
// }

// function mapPath(p: WorldPath, f: (q: Point) => Point): WorldPath {
//   return { ...p, points: p.points.map(f), start: f(p.start), goal: f(p.goal) };
// }

// function scaleAbout(
//   p: WorldPath,
//   s: number,
//   cx: number,
//   cy: number,
// ): WorldPath {
//   const scaled = mapPath(p, (q) => ({
//     x: cx + (q.x - cx) * s,
//     y: cy + (q.y - cy) * s,
//   }));
//   if (p.ringSpacing !== undefined) scaled.ringSpacing = p.ringSpacing * s;
//   return scaled;
// }

// // ── 1) 레벨 유형별 원본 형태 ───────────────────────────────────

// function buildRaw(config: LevelConfig, roundIndex: number): WorldPath {
//   switch (config.levelType) {
//     case LevelType.FREE:
//       return buildFree(pick(config.pathConstraints.variants, roundIndex));
//     case LevelType.STRAIGHT:
//       return buildStraight(pick(config.pathConstraints.variants, roundIndex));
//     case LevelType.L_SHAPE:
//       return buildLShape(pick(config.pathConstraints.variants, roundIndex));
//     case LevelType.CIRCLE:
//       return buildCircle(pick(config.pathConstraints.variants, roundIndex));
//     case LevelType.SPIRAL:
//       return buildSpiral(pick(config.pathConstraints.variants, roundIndex));
//     case LevelType.WAVE:
//       return buildWave(pick(config.pathConstraints.variants, roundIndex));
//     case LevelType.ZIGZAG:
//       return buildZigzag(pick(config.pathConstraints.variants, roundIndex));
//   }
// }

// // ── 2) 보드 위에 배치: (랜덤 변형) → 중앙 정렬 → 보드에 맞게 축소 → (뒤집기) ──

// function layout(
//   raw: WorldPath,
//   H: number,
//   rules: ValidationRules,
//   variation: LevelVariation,
//   rng: () => number,
// ): WorldPath {
//   let p = raw;

//   if (variation.sizeJitter > 0) {
//     p = scaleAbout(p, 1 + (rng() * 2 - 1) * variation.sizeJitter, 0, 0);
//   }

//   // 중앙 정렬
//   const pts = refPoints(p);
//   const minX = Math.min(...pts.map((q) => q.x));
//   const maxX = Math.max(...pts.map((q) => q.x));
//   const minY = Math.min(...pts.map((q) => q.y));
//   const maxY = Math.max(...pts.map((q) => q.y));
//   const ox = 0.5 - (minX + maxX) / 2;
//   const oy = H / 2 - (minY + maxY) / 2;
//   p = mapPath(p, (q) => ({ x: q.x + ox, y: q.y + oy }));

//   // 보드 안에 들어오도록 모양은 그대로 두고 크기만 줄인다 (가로/세로비가 달라도 안전)
//   const w = maxX - minX;
//   const h = maxY - minY;
//   const usableW = 1 - 2 * rules.boardMargin;
//   const usableH = H - 2 * rules.boardMargin;
//   const s = Math.min(
//     1,
//     w > EPS ? usableW / w : Infinity,
//     h > EPS ? usableH / h : Infinity,
//   );
//   if (s < 1) p = scaleAbout(p, s, 0.5, H / 2);

//   if (variation.allowMirror) {
//     const flipX = rng() < 0.5;
//     const flipY = rng() < 0.5;
//     if (flipX || flipY) {
//       p = mapPath(p, (q) => ({
//         x: flipX ? 1 - q.x : q.x,
//         y: flipY ? H - q.y : q.y,
//       }));
//     }
//   }
//   return p;
// }

// // ── 3) 검증 (기획서 6-1) ──────────────────────────────────────

// function pathLengthOf(p: WorldPath): number {
//   if (p.points.length < 2) return dist(p.start, p.goal);
//   let sum = 0;
//   for (let i = 1; i < p.points.length; i++)
//     sum += dist(p.points[i - 1], p.points[i]);
//   return sum;
// }

// function cross(o: Point, a: Point, b: Point) {
//   return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
// }

// function segmentsCross(a: Point, b: Point, c: Point, d: Point) {
//   const d1 = cross(c, d, a);
//   const d2 = cross(c, d, b);
//   const d3 = cross(a, b, c);
//   const d4 = cross(a, b, d);
//   return d1 * d2 < -EPS && d3 * d4 < -EPS;
// }

// function hasSelfIntersection(pts: Point[]): boolean {
//   for (let i = 0; i < pts.length - 1; i++) {
//     for (let j = i + 2; j < pts.length - 1; j++) {
//       if (segmentsCross(pts[i], pts[i + 1], pts[j], pts[j + 1])) return true;
//     }
//   }
//   return false;
// }

// function validate(
//   p: WorldPath,
//   config: LevelConfig,
//   rules: ValidationRules,
//   H: number,
// ): string[] {
//   const issues: string[] = [];
//   const pts = refPoints(p);

//   if (pts.some((q) => !Number.isFinite(q.x) || !Number.isFinite(q.y))) {
//     return ["좌표가 유효하지 않음"];
//   }

//   // 4. 게임 보드 영역 안 (+ 7. 쇠구슬이 도달 가능한 위치)
//   const m = rules.boardMargin - EPS;
//   if (pts.some((q) => q.x < m || q.x > 1 - m || q.y < m || q.y > H - m)) {
//     issues.push("경로가 게임 보드 영역을 벗어남");
//   }

//   // 6. 시작점과 목적지가 충분히 떨어져 있음
//   if (dist(p.start, p.goal) < rules.minStartGoalDistance - EPS) {
//     issues.push("시작점과 목적지가 너무 가까움");
//   }

//   if (p.points.length >= 2) {
//     // 2. 하나로 연결 (끊김/중복점 없음)
//     for (let i = 1; i < p.points.length; i++) {
//       if (dist(p.points[i - 1], p.points[i]) < EPS) {
//         issues.push("경로에 길이 0인 구간이 있음");
//         break;
//       }
//     }
//     // 5. 자기 교차 없음
//     if (hasSelfIntersection(p.points)) issues.push("경로가 자기 자신과 교차함");
//   }

//   // 8. 제한 시간 안에 도전할 수 있는 길이
//   const required = pathLengthOf(p) / config.timeLimitSeconds;
//   if (required > rules.maxRequiredSpeed)
//     issues.push("제한 시간에 비해 경로가 너무 김");

//   // 나선: 중심부가 너무 좁지 않음
//   if (
//     p.ringSpacing !== undefined &&
//     p.ringSpacing < rules.minRingSpacing - EPS
//   ) {
//     issues.push("나선 간격이 너무 좁음");
//   }
//   return issues;
// }

// // ── 4) 공개 API ───────────────────────────────────────────────

// export function generateRound(
//   config: LevelConfig,
//   roundIndex: number,
//   options: GenerateOptions,
// ): GeneratedRound {
//   const aspect = options.boardAspect;
//   if (!Number.isFinite(aspect) || aspect <= 0) {
//     throw new RangeError(
//       `[LevelGenerator] boardAspect 가 올바르지 않습니다: ${aspect}`,
//     );
//   }
//   if (
//     !Number.isInteger(roundIndex) ||
//     roundIndex < 0 ||
//     roundIndex >= config.roundCount
//   ) {
//     throw new RangeError(
//       `[LevelGenerator] roundIndex 범위 오류: ${roundIndex} (0~${config.roundCount - 1})`,
//     );
//   }

//   const H = 1 / aspect; // 보드 너비를 1로 봤을 때의 높이
//   const rules: ValidationRules = { ...DEFAULT_RULES, ...config.rules };
//   const variation: LevelVariation = {
//     ...DEFAULT_VARIATION,
//     ...config.variation,
//   };
//   const seed = hashSeed(options.baseSeed ?? 0, config.levelId, roundIndex);

//   // 랜덤 요소가 꺼져 있으면 몇 번을 다시 만들어도 결과가 같으므로 1회만 시도한다
//   const randomized = variation.allowMirror || variation.sizeJitter > 0;
//   const attempts = randomized ? MAX_ATTEMPTS : 1;

//   let issues: string[] = [];
//   for (let attempt = 0; attempt < attempts; attempt++) {
//     const rng = makeRng(seed + Math.imul(attempt, 0x9e3779b9));
//     const placed = layout(
//       buildRaw(config, roundIndex),
//       H,
//       rules,
//       variation,
//       rng,
//     );
//     issues = validate(placed, config, rules, H);
//     if (issues.length === 0) {
//       const t =
//         config.roundCount > 1 ? roundIndex / (config.roundCount - 1) : 0;
//       const toNorm = (q: Point): Point => ({
//         x: round4(q.x),
//         y: round4(q.y / H),
//       });
//       return {
//         roundId: `L${config.levelId}-R${roundIndex + 1}`,
//         levelId: config.levelId,
//         roundIndex,
//         levelType: config.levelType,
//         startPosition: toNorm(placed.start),
//         goalPosition: toNorm(placed.goal),
//         pathPoints: placed.points.map(toNorm),
//         difficulty: lerp(
//           config.difficultyRange[0],
//           config.difficultyRange[1],
//           t,
//         ),
//         seed,
//         pathLength: round4(pathLengthOf(placed)),
//         boardAspect: aspect,
//       };
//     }
//   }
//   throw new Error(
//     `[LevelGenerator] Level ${config.levelId}(${config.levelType}) Round ${roundIndex + 1} 생성 실패: ${issues.join(", ")}`,
//   );
// }

// /** 레벨의 모든 라운드를 한 번에 생성 */
// export function generateLevelRounds(
//   config: LevelConfig,
//   options: GenerateOptions,
// ): GeneratedRound[] {
//   return Array.from({ length: config.roundCount }, (_, i) =>
//     generateRound(config, i, options),
//   );
// }

// /** 정규화 좌표 → 보드 내부 좌표(px). 물리 엔진이 쓰는 좌표와 같은 기준 */
// export function toBoardPoint(
//   p: Point,
//   boardWidth: number,
//   boardHeight: number,
// ): Point {
//   return { x: p.x * boardWidth, y: p.y * boardHeight };
// }

import {
  buildCircle,
  buildFree,
  buildLShape,
  buildSpiral,
  buildStraight,
  buildWave,
  buildZigzag,
  type WorldPath,
} from "./pathShapes";

import {
  buildCenterline,
  minShortcutGap,
  minTurnRadius,
} from "@/physics/collisionGeometry";
import {
  DEFAULT_RULES,
  DEFAULT_VARIATION,
  LevelType,
  type GeneratedRound,
  type LevelConfig,
  type LevelVariation,
  type Point,
  type ValidationRules,
} from "./levelTypes";

export interface GenerateOptions {
  /** 게임 보드의 가로/세로 비 (width / height). 원이 찌그러지지 않게 하는 데 필요 */
  boardAspect: number;
  /** 보드 가로 길이(px). 벽이 있는 레벨은 통로 폭(px)을 정규화 좌표와 맞추는 데 필요하다 */
  boardWidthPx?: number;
  /** 시드 기준값. 같은 값이면 항상 같은 라운드가 나온다 */
  baseSeed?: number;
}

const MAX_ATTEMPTS = 8;
const EPS = 1e-6;

// ── 유틸 ───────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** 시드 기반 난수 (mulberry32). Math.random 은 쓰지 않는다 → 재현 가능 */
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(baseSeed: number, levelId: number, roundIndex: number) {
  return (
    (Math.imul(baseSeed + 1, 73856093) ^
      Math.imul(levelId, 19349663) ^
      Math.imul(roundIndex + 1, 83492791)) >>>
    0
  );
}

function pick<T>(list: readonly T[], i: number): T {
  if (list.length === 0)
    throw new Error("[LevelGenerator] variants 가 비어 있습니다");
  return list[i % list.length];
}

const round4 = (n: number) => Math.round(n * 10000) / 10000;
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** FREE 는 경로가 없으므로 시작/목적지만으로 범위를 계산한다 */
function refPoints(p: WorldPath): Point[] {
  return p.points.length > 0 ? p.points : [p.start, p.goal];
}

function mapPath(p: WorldPath, f: (q: Point) => Point): WorldPath {
  return { ...p, points: p.points.map(f), start: f(p.start), goal: f(p.goal) };
}

function scaleAbout(
  p: WorldPath,
  s: number,
  cx: number,
  cy: number,
): WorldPath {
  const scaled = mapPath(p, (q) => ({
    x: cx + (q.x - cx) * s,
    y: cy + (q.y - cy) * s,
  }));
  if (p.ringSpacing !== undefined) scaled.ringSpacing = p.ringSpacing * s;
  return scaled;
}

// ── 1) 레벨 유형별 원본 형태 ───────────────────────────────────

function buildRaw(config: LevelConfig, roundIndex: number): WorldPath {
  switch (config.levelType) {
    case LevelType.FREE:
      return buildFree(pick(config.pathConstraints.variants, roundIndex));
    case LevelType.STRAIGHT:
      return buildStraight(pick(config.pathConstraints.variants, roundIndex));
    case LevelType.L_SHAPE:
      return buildLShape(pick(config.pathConstraints.variants, roundIndex));
    case LevelType.CIRCLE:
      return buildCircle(pick(config.pathConstraints.variants, roundIndex));
    case LevelType.SPIRAL:
      return buildSpiral(pick(config.pathConstraints.variants, roundIndex));
    case LevelType.WAVE:
      return buildWave(pick(config.pathConstraints.variants, roundIndex));
    case LevelType.ZIGZAG:
      return buildZigzag(pick(config.pathConstraints.variants, roundIndex));
  }
}

// ── 2) 보드 위에 배치: (랜덤 변형) → 중앙 정렬 → 보드에 맞게 축소 → (뒤집기) ──

function layout(
  raw: WorldPath,
  H: number,
  rules: ValidationRules,
  variation: LevelVariation,
  rng: () => number,
): WorldPath {
  let p = raw;

  if (variation.sizeJitter > 0) {
    p = scaleAbout(p, 1 + (rng() * 2 - 1) * variation.sizeJitter, 0, 0);
  }

  // 중앙 정렬
  const pts = refPoints(p);
  const minX = Math.min(...pts.map((q) => q.x));
  const maxX = Math.max(...pts.map((q) => q.x));
  const minY = Math.min(...pts.map((q) => q.y));
  const maxY = Math.max(...pts.map((q) => q.y));
  const ox = 0.5 - (minX + maxX) / 2;
  const oy = H / 2 - (minY + maxY) / 2;
  p = mapPath(p, (q) => ({ x: q.x + ox, y: q.y + oy }));

  // 보드 안에 들어오도록 모양은 그대로 두고 크기만 줄인다 (가로/세로비가 달라도 안전)
  const w = maxX - minX;
  const h = maxY - minY;
  const usableW = 1 - 2 * rules.boardMargin;
  const usableH = H - 2 * rules.boardMargin;
  const s = Math.min(
    1,
    w > EPS ? usableW / w : Infinity,
    h > EPS ? usableH / h : Infinity,
  );
  if (s < 1) p = scaleAbout(p, s, 0.5, H / 2);

  if (variation.allowMirror) {
    const flipX = rng() < 0.5;
    const flipY = rng() < 0.5;
    if (flipX || flipY) {
      p = mapPath(p, (q) => ({
        x: flipX ? 1 - q.x : q.x,
        y: flipY ? H - q.y : q.y,
      }));
    }
  }
  return p;
}

// ── 3) 검증 (기획서 6-1) ──────────────────────────────────────

function pathLengthOf(p: WorldPath): number {
  if (p.points.length < 2) return dist(p.start, p.goal);
  let sum = 0;
  for (let i = 1; i < p.points.length; i++)
    sum += dist(p.points[i - 1], p.points[i]);
  return sum;
}

function cross(o: Point, a: Point, b: Point) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function segmentsCross(a: Point, b: Point, c: Point, d: Point) {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  return d1 * d2 < -EPS && d3 * d4 < -EPS;
}

function hasSelfIntersection(pts: Point[]): boolean {
  for (let i = 0; i < pts.length - 1; i++) {
    for (let j = i + 2; j < pts.length - 1; j++) {
      if (segmentsCross(pts[i], pts[i + 1], pts[j], pts[j + 1])) return true;
    }
  }
  return false;
}

/** 벽이 있는 레벨 전용 검증: 통로 폭, 통로끼리의 간격, 급한 커브 */
function validateWalls(p: WorldPath, config: LevelConfig, W: number): string[] {
  const walls = config.walls;
  if (!walls.hasWalls || p.points.length < 2) return [];
  const issues: string[] = [];
  const cw = walls.corridorWidth;
  const wt = walls.wallThickness;

  // 쇠구슬이 지나갈 수 있는 폭인가
  if (cw < walls.minCorridorWidth || cw < config.ballRadius * 2 + 8) {
    issues.push("통로 폭이 쇠구슬이 지나가기에 너무 좁음");
  }

  // 월드 좌표(보드 너비 = 1) → px
  const px = p.points.map((q) => ({ x: q.x * W, y: q.y * W }));
  const center = buildCenterline(px, walls.cornerRadius);

  // 경로를 따라 멀리 떨어진 두 구간이 가까우면 통로끼리 붙어 지름길이 생긴다.
  // 사이에 벽(두께 wt)이 들어갈 만큼 떨어져 있어야 한다.
  const gap = minShortcutGap(center, Math.PI * (cw + wt));
  if (gap < cw + wt - 0.5) issues.push("다른 구간의 통로가 서로 너무 가까움");

  // 너무 급한 커브는 안쪽 벽이 뭉개진다
  if (minTurnRadius(center) < cw * 0.35) issues.push("커브가 너무 급함");
  return issues;
}

function validate(
  p: WorldPath,
  config: LevelConfig,
  rules: ValidationRules,
  H: number,
  W: number,
): string[] {
  const issues: string[] = [];
  const pts = refPoints(p);

  if (pts.some((q) => !Number.isFinite(q.x) || !Number.isFinite(q.y))) {
    return ["좌표가 유효하지 않음"];
  }

  // 4. 게임 보드 영역 안 (+ 7. 쇠구슬이 도달 가능한 위치)
  const m = rules.boardMargin - EPS;
  if (pts.some((q) => q.x < m || q.x > 1 - m || q.y < m || q.y > H - m)) {
    issues.push("경로가 게임 보드 영역을 벗어남");
  }

  // 6. 시작점과 목적지가 충분히 떨어져 있음
  if (dist(p.start, p.goal) < rules.minStartGoalDistance - EPS) {
    issues.push("시작점과 목적지가 너무 가까움");
  }

  if (p.points.length >= 2) {
    // 2. 하나로 연결 (끊김/중복점 없음)
    for (let i = 1; i < p.points.length; i++) {
      if (dist(p.points[i - 1], p.points[i]) < EPS) {
        issues.push("경로에 길이 0인 구간이 있음");
        break;
      }
    }
    // 5. 자기 교차 없음
    if (hasSelfIntersection(p.points)) issues.push("경로가 자기 자신과 교차함");
  }

  // 8. 제한 시간 안에 도전할 수 있는 길이
  const required = pathLengthOf(p) / config.timeLimitSeconds;
  if (required > rules.maxRequiredSpeed)
    issues.push("제한 시간에 비해 경로가 너무 김");

  // 나선: 중심부가 너무 좁지 않음
  if (
    p.ringSpacing !== undefined &&
    p.ringSpacing < rules.minRingSpacing - EPS
  ) {
    issues.push("나선 간격이 너무 좁음");
  }
  issues.push(...validateWalls(p, config, W));
  return issues;
}

// ── 4) 공개 API ───────────────────────────────────────────────

export function generateRound(
  config: LevelConfig,
  roundIndex: number,
  options: GenerateOptions,
): GeneratedRound {
  const aspect = options.boardAspect;
  if (!Number.isFinite(aspect) || aspect <= 0) {
    throw new RangeError(
      `[LevelGenerator] boardAspect 가 올바르지 않습니다: ${aspect}`,
    );
  }
  if (
    !Number.isInteger(roundIndex) ||
    roundIndex < 0 ||
    roundIndex >= config.roundCount
  ) {
    throw new RangeError(
      `[LevelGenerator] roundIndex 범위 오류: ${roundIndex} (0~${config.roundCount - 1})`,
    );
  }

  const H = 1 / aspect; // 보드 너비를 1로 봤을 때의 높이
  let rules: ValidationRules = { ...DEFAULT_RULES, ...config.rules };
  const W = options.boardWidthPx ?? 0;
  if (config.walls.hasWalls) {
    if (!(W > 0))
      throw new RangeError(
        "[LevelGenerator] 벽이 있는 레벨은 boardWidthPx 가 필요합니다",
      );
    // 벽 바깥 면까지 보드 안에 들어오도록 여백을 늘린다
    const extent = config.walls.corridorWidth / 2 + config.walls.wallThickness;
    rules = {
      ...rules,
      boardMargin: Math.max(rules.boardMargin, extent / W + 0.01),
    };
  }
  const variation: LevelVariation = {
    ...DEFAULT_VARIATION,
    ...config.variation,
  };
  const seed = hashSeed(options.baseSeed ?? 0, config.levelId, roundIndex);

  // 랜덤 요소가 꺼져 있으면 몇 번을 다시 만들어도 결과가 같으므로 1회만 시도한다
  const randomized = variation.allowMirror || variation.sizeJitter > 0;
  const attempts = randomized ? MAX_ATTEMPTS : 1;

  let issues: string[] = [];
  for (let attempt = 0; attempt < attempts; attempt++) {
    const rng = makeRng(seed + Math.imul(attempt, 0x9e3779b9));
    const placed = layout(
      buildRaw(config, roundIndex),
      H,
      rules,
      variation,
      rng,
    );
    issues = validate(placed, config, rules, H, W);
    if (issues.length === 0) {
      const t =
        config.roundCount > 1 ? roundIndex / (config.roundCount - 1) : 0;
      const toNorm = (q: Point): Point => ({
        x: round4(q.x),
        y: round4(q.y / H),
      });
      return {
        roundId: `L${config.levelId}-R${roundIndex + 1}`,
        levelId: config.levelId,
        roundIndex,
        levelType: config.levelType,
        startPosition: toNorm(placed.start),
        goalPosition: toNorm(placed.goal),
        pathPoints: placed.points.map(toNorm),
        difficulty: lerp(
          config.difficultyRange[0],
          config.difficultyRange[1],
          t,
        ),
        seed,
        pathLength: round4(pathLengthOf(placed)),
        boardAspect: aspect,
        boardWidth: W,
        boardHeight: W > 0 ? W / aspect : 0,
      };
    }
  }
  throw new Error(
    `[LevelGenerator] Level ${config.levelId}(${config.levelType}) Round ${roundIndex + 1} 생성 실패: ${issues.join(", ")}`,
  );
}

/** 레벨의 모든 라운드를 한 번에 생성 */
export function generateLevelRounds(
  config: LevelConfig,
  options: GenerateOptions,
): GeneratedRound[] {
  return Array.from({ length: config.roundCount }, (_, i) =>
    generateRound(config, i, options),
  );
}

/** 정규화 좌표 → 보드 내부 좌표(px). 물리 엔진이 쓰는 좌표와 같은 기준 */
export function toBoardPoint(
  p: Point,
  boardWidth: number,
  boardHeight: number,
): Point {
  return { x: p.x * boardWidth, y: p.y * boardHeight };
}
