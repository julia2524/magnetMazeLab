// ─────────────────────────────────────────────────────────────
// LevelType / LevelConfig / GeneratedRound 타입 정의
//
// 좌표 규칙
//  - GeneratedRound 의 모든 좌표는 정규화 좌표(x: 0~1, y: 0~1).
//  - 화면 좌표 = (x * 보드너비, y * 보드높이)  →  toBoardPoint() 사용
//  - 길이(length, radius, distance …)는 "보드 너비 = 1" 기준의 단위.
//    (원이 타원으로 찌그러지지 않도록, 생성기는 보드 가로세로비를 보고 계산한다)
// ─────────────────────────────────────────────────────────────

/** 경로의 유형. 레벨 번호와 분리해서 관리 → 같은 유형을 여러 레벨에서 재사용 가능 */
export const LevelType = {
  FREE: "FREE", // 자유 이동 (경로 없음)
  STRAIGHT: "STRAIGHT", // 직선
  L_SHAPE: "L_SHAPE", // ㄱ자 · ㄴ자
  CIRCLE: "CIRCLE", // 원형 · 원호
  SPIRAL: "SPIRAL", // 달팽이형 나선
  WAVE: "WAVE", // 파도형
  ZIGZAG: "ZIGZAG", // 지그재그
} as const;
export type LevelType = (typeof LevelType)[keyof typeof LevelType];

export interface Point {
  x: number;
  y: number;
}

export type Orientation = "HORIZONTAL" | "VERTICAL";

// ── 라운드 변형(Variant): "이 라운드는 이런 모양" 한 줄 ────────────────
// 변형 목록(variants)의 i번째가 i번째 라운드가 된다. (라운드 수가 더 많으면 처음부터 순환)

export interface FreeVariant {
  /** 시작점 → 목적지 방향. 0 = 오른쪽, 90 = 아래, 45 = 오른쪽 아래 대각선 */
  angleDeg: number;
  /** 시작점과 목적지 사이 거리 */
  distance: number;
}

export interface StraightVariant {
  orientation: Orientation;
  length: number;
  /** true 면 시작/목적지 방향을 반대로 (오른쪽→왼쪽, 아래→위) */
  reversed?: boolean;
}

export interface LShapeVariant {
  /** GIYEOK = ㄱ (가로로 갔다가 아래로), NIEUN = ㄴ (아래로 갔다가 가로로) */
  shape: "GIYEOK" | "NIEUN";
  horizontalLength: number;
  verticalLength: number;
}

export interface CircleVariant {
  radius: number;
  /** 원호의 각도. 180 = 반원, 270 = 3/4 원호 (360 미만) */
  sweepDeg: number;
  clockwise: boolean;
  /** 시작 위치 각도. 0 = 오른쪽 끝, 90 = 아래, 180 = 왼쪽 끝, 270 = 위 */
  startAngleDeg: number;
}

export interface SpiralVariant {
  /** 회전 수. 0.5 단위(1.5, 2.5 …)면 목적지가 시작점의 반대쪽에 놓인다 */
  turns: number;
  outerRadius: number;
  innerRadius: number;
  clockwise: boolean;
  /** true = 바깥에서 안쪽으로, false = 안쪽에서 바깥으로 */
  startOutside: boolean;
}

export interface WaveVariant {
  orientation: Orientation;
  waveCount: number;
  /** 파도의 높이(진폭, 중심선에서 위/아래 최대 거리) */
  amplitude: number;
  /** 파도 경로의 전체 길이 */
  length: number;
  reversed?: boolean;
}

export interface ZigzagVariant {
  orientation: Orientation;
  /** 구간별 상대 길이. 구간 수 = 배열 길이, 방향 전환 횟수 = 길이 - 1 */
  segmentWeights: number[];
  /** 진행 방향 전체 길이 */
  span: number;
  /** 지그재그 폭(위아래 흔들리는 거리). span 대비 클수록 꺾임이 가파름 */
  amplitude: number;
  reversed?: boolean;
}

export interface PathConstraints<V> {
  variants: readonly V[];
}

// ── 설정 공통 요소 ──────────────────────────────────────────

export interface MagnetSettings {
  range: number; // 자기력 영향 범위(px)
  attachDistance: number; // 부착 거리(px)
  maxAccel: number; // 최대 자기력 가속도
}

/** 경로 생성 공통 규칙(기획서 6-1)을 검사하는 기준값 */
export interface ValidationRules {
  /** 보드 가장자리에서 경로가 떨어져 있어야 하는 최소 여백 (보드 너비 = 1) */
  boardMargin: number;
  /** 시작점-목적지 최소 거리 */
  minStartGoalDistance: number;
  /** 나선 고리 사이 최소 간격 (중심부가 너무 좁아지는 것 방지) */
  minRingSpacing: number;
  /** 경로 전체를 제한 시간 안에 지나가는 데 필요한 평균 속도(보드 너비/초)의 상한 */
  maxRequiredSpeed: number;
}

export const DEFAULT_RULES: ValidationRules = {
  boardMargin: 0.06,
  minStartGoalDistance: 0.25,
  minRingSpacing: 0.06,
  maxRequiredSpeed: 0.12,
};

/** 랜덤 요소. 기본값은 전부 꺼져 있어서 결정론적(항상 같은 결과)으로 동작한다 */
export interface LevelVariation {
  /** true 면 시드에 따라 좌우/상하를 뒤집을 수 있음 */
  allowMirror: boolean;
  /** 0.1 이면 크기가 ±10% 범위에서 달라짐 */
  sizeJitter: number;
}

export const DEFAULT_VARIATION: LevelVariation = {
  allowMirror: false,
  sizeJitter: 0,
};

// ── LevelConfig ────────────────────────────────────────────

export interface LevelConfigBase {
  levelId: number;
  timeLimitSeconds: number;
  roundCount: number;
  /** [첫 라운드 난이도, 마지막 라운드 난이도]. 라운드 순서에 따라 선형 보간 */
  difficultyRange: readonly [number, number];
  ballRadius: number;
  magnetSettings: MagnetSettings;
  rules?: Partial<ValidationRules>;
  variation?: Partial<LevelVariation>;
}

/** levelType 에 따라 pathConstraints 의 모양이 달라지는 합집합 타입 */
export type LevelConfig = LevelConfigBase &
  (
    | {
        levelType: typeof LevelType.FREE;
        pathConstraints: PathConstraints<FreeVariant>;
      }
    | {
        levelType: typeof LevelType.STRAIGHT;
        pathConstraints: PathConstraints<StraightVariant>;
      }
    | {
        levelType: typeof LevelType.L_SHAPE;
        pathConstraints: PathConstraints<LShapeVariant>;
      }
    | {
        levelType: typeof LevelType.CIRCLE;
        pathConstraints: PathConstraints<CircleVariant>;
      }
    | {
        levelType: typeof LevelType.SPIRAL;
        pathConstraints: PathConstraints<SpiralVariant>;
      }
    | {
        levelType: typeof LevelType.WAVE;
        pathConstraints: PathConstraints<WaveVariant>;
      }
    | {
        levelType: typeof LevelType.ZIGZAG;
        pathConstraints: PathConstraints<ZigzagVariant>;
      }
  );

// ── GeneratedRound ─────────────────────────────────────────

export interface GeneratedRound {
  roundId: string; // 예: "L3-R2"
  levelId: number;
  roundIndex: number; // 0부터 시작
  levelType: LevelType;
  startPosition: Point; // 쇠구슬 시작점 (정규화 좌표)
  goalPosition: Point; // 목적지 (정규화 좌표)
  /** 시각적 가이드 경로. FREE 레벨은 빈 배열(경로 없음) */
  pathPoints: Point[];
  difficulty: number;
  seed: number;
  /** 경로 길이 (보드 너비 = 1). FREE 는 시작-목적지 직선거리 */
  pathLength: number;
  /** 생성에 사용한 보드 가로/세로 비. 보드 크기가 바뀌면(회전 등) 다시 생성해야 함 */
  boardAspect: number;
}
