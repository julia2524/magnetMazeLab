import { GAME_CONFIG } from "../constants/gameConfig";
import { LevelType, type LevelConfig, type MagnetSettings } from "./levelTypes";

const MAGNET: MagnetSettings = {
  range: GAME_CONFIG.MAGNET_RANGE,
  attachDistance: GAME_CONFIG.ATTACH_DISTANCE,
  maxAccel: GAME_CONFIG.MAGNET_MAX_ACCEL,
};

const COMMON = {
  roundCount: 5,
  difficultyRange: [0, 1] as const,
  ballRadius: GAME_CONFIG.BALL_RADIUS,
  magnetSettings: MAGNET,
};

// 아래 variants 는 "라운드 i 는 이런 모양" 표입니다. 숫자는 보드 너비 = 1 기준.
// (기획서의 라운드 표는 예시이므로, 이 표만 고치면 라운드 구성이 바뀝니다)

const level1: LevelConfig = {
  ...COMMON,
  levelId: 1,
  levelType: LevelType.FREE,
  timeLimitSeconds: 45,
  pathConstraints: {
    variants: [
      { angleDeg: 20, distance: 0.35 }, // R1 가까운 배치
      { angleDeg: 0, distance: 0.6 }, // R2 좌우
      { angleDeg: 90, distance: 0.7 }, // R3 위아래
      { angleDeg: 45, distance: 0.7 }, // R4 대각선
      { angleDeg: 60, distance: 1.0 }, // R5 먼 거리
    ],
  },
};

const level2: LevelConfig = {
  ...COMMON,
  levelId: 2,
  levelType: LevelType.STRAIGHT,
  timeLimitSeconds: 50,
  pathConstraints: {
    variants: [
      { orientation: "HORIZONTAL", length: 0.4 }, // R1 짧은 가로
      { orientation: "HORIZONTAL", length: 0.8 }, // R2 긴 가로
      { orientation: "VERTICAL", length: 0.5 }, // R3 짧은 세로
      { orientation: "VERTICAL", length: 1.0 }, // R4 긴 세로
      { orientation: "HORIZONTAL", length: 0.6, reversed: true }, // R5 반대 방향
    ],
  },
};

const level3: LevelConfig = {
  ...COMMON,
  levelId: 3,
  levelType: LevelType.L_SHAPE,
  timeLimitSeconds: 60,
  pathConstraints: {
    variants: [
      { shape: "GIYEOK", horizontalLength: 0.4, verticalLength: 0.4 }, // R1 짧은 ㄱ
      { shape: "GIYEOK", horizontalLength: 0.6, verticalLength: 0.7 }, // R2 긴 ㄱ
      { shape: "NIEUN", horizontalLength: 0.5, verticalLength: 0.6 }, // R3 ㄴ
      { shape: "GIYEOK", horizontalLength: 0.75, verticalLength: 0.35 }, // R4 가로가 긴 ㄱ
      { shape: "NIEUN", horizontalLength: 0.35, verticalLength: 0.9 }, // R5 세로가 긴 ㄴ
    ],
  },
};

const level4: LevelConfig = {
  ...COMMON,
  levelId: 4,
  levelType: LevelType.CIRCLE,
  timeLimitSeconds: 65,
  pathConstraints: {
    variants: [
      { radius: 0.4, sweepDeg: 180, clockwise: true, startAngleDeg: 180 }, // R1 큰 반원
      { radius: 0.22, sweepDeg: 180, clockwise: true, startAngleDeg: 180 }, // R2 작은 반원
      { radius: 0.32, sweepDeg: 180, clockwise: false, startAngleDeg: 0 }, // R3 반대 방향 반원
      { radius: 0.3, sweepDeg: 270, clockwise: true, startAngleDeg: 180 }, // R4 3/4 원호
      { radius: 0.26, sweepDeg: 220, clockwise: false, startAngleDeg: 300 }, // R5 다른 크기 원호
    ],
  },
};

const level5: LevelConfig = {
  ...COMMON,
  levelId: 5,
  levelType: LevelType.SPIRAL,
  timeLimitSeconds: 75,
  pathConstraints: {
    variants: [
      {
        turns: 1.5,
        outerRadius: 0.36,
        innerRadius: 0.1,
        clockwise: true,
        startOutside: true,
      }, // R1 넓은 나선
      {
        turns: 2.5,
        outerRadius: 0.38,
        innerRadius: 0.1,
        clockwise: true,
        startOutside: true,
      }, // R2 회전 증가
      {
        turns: 2.5,
        outerRadius: 0.38,
        innerRadius: 0.1,
        clockwise: false,
        startOutside: true,
      }, // R3 반대로 감김
      {
        turns: 2.5,
        outerRadius: 0.42,
        innerRadius: 0.1,
        clockwise: true,
        startOutside: false,
      }, // R4 큰 나선(안→밖)
      {
        turns: 3.5,
        outerRadius: 0.42,
        innerRadius: 0.1,
        clockwise: true,
        startOutside: true,
      }, // R5 회전 많음
    ],
  },
};

const level6: LevelConfig = {
  ...COMMON,
  levelId: 6,
  levelType: LevelType.WAVE,
  timeLimitSeconds: 80,
  pathConstraints: {
    variants: [
      { orientation: "HORIZONTAL", waveCount: 1, amplitude: 0.08, length: 0.8 }, // R1 완만한 파도
      { orientation: "HORIZONTAL", waveCount: 2, amplitude: 0.08, length: 0.8 }, // R2 파도 2개
      {
        orientation: "HORIZONTAL",
        waveCount: 3,
        amplitude: 0.07,
        length: 0.84,
      }, // R3 파도 3개
      { orientation: "HORIZONTAL", waveCount: 2, amplitude: 0.16, length: 0.8 }, // R4 큰 진폭
      { orientation: "VERTICAL", waveCount: 3, amplitude: 0.1, length: 1.0 }, // R5 세로 파도
    ],
  },
};

const level7: LevelConfig = {
  ...COMMON,
  levelId: 7,
  levelType: LevelType.ZIGZAG,
  timeLimitSeconds: 90,
  pathConstraints: {
    variants: [
      {
        orientation: "HORIZONTAL",
        segmentWeights: [1, 1, 1],
        span: 0.7,
        amplitude: 0.3,
      }, // R1 전환 2회
      {
        orientation: "HORIZONTAL",
        segmentWeights: [1, 1, 1, 1],
        span: 0.8,
        amplitude: 0.3,
      }, // R2 전환 3회
      {
        orientation: "HORIZONTAL",
        segmentWeights: [1, 1, 1, 1, 1],
        span: 0.84,
        amplitude: 0.3,
      }, // R3 전환 4회
      {
        orientation: "HORIZONTAL",
        segmentWeights: [1.5, 0.7, 1.2, 0.6],
        span: 0.84,
        amplitude: 0.35,
      }, // R4 구간 길이 다름
      {
        orientation: "VERTICAL",
        segmentWeights: [1, 0.6, 1.1, 0.8, 1.2, 0.7],
        span: 1.1,
        amplitude: 0.45,
        reversed: true,
      }, // R5 방향·길이 다양
    ],
  },
};

export const LEVEL_CONFIGS: readonly LevelConfig[] = [
  level1,
  level2,
  level3,
  level4,
  level5,
  level6,
  level7,
];

export function getLevelConfig(levelId: number): LevelConfig {
  const config = LEVEL_CONFIGS.find((c) => c.levelId === levelId);
  if (!config)
    throw new Error(`[levelConfigs] Level ${levelId} 설정이 없습니다`);
  return config;
}
