import { StyleSheet, View } from "react-native";
import Svg, { Circle, Polygon } from "react-native-svg";
import { GAME_CONFIG } from "../constants/gameConfig";
import { toBoardPoint } from "../levels/levelGenerator";
import type { GeneratedRound } from "../levels/levelTypes";

type Props = {
  round: GeneratedRound;
  width: number;
  height: number;
  /** 통로 폭(px). 있으면 출발/도착 표시를 통로 안에 들어가도록 줄인다 */
  corridorWidth?: number;
  /** 쇠구슬 반지름(px). 출발 표시 크기 기준 */
  ballRadius?: number;
};

/** 별 모양 꼭짓점 */
function starPoints(cx: number, cy: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const ang = ((-90 + i * 36) * Math.PI) / 180;
    pts.push(`${cx + Math.cos(ang) * r},${cy + Math.sin(ang) * r}`);
  }
  return pts.join(" ");
}

/**
 * 시작점 + 목적지 표시.
 * 기존 점선 경로는 최종 게임 화면에서 제거 (벽이 통로를 보여 주므로 불필요).
 */
export function PathGuide({
  round,
  width,
  height,
  corridorWidth,
  ballRadius,
}: Props) {
  const start = toBoardPoint(round.startPosition, width, height);
  const goal = toBoardPoint(round.goalPosition, width, height);
  const G = GAME_CONFIG.GOAL_RADIUS;
  // 시작점 표시 크기는 구슬보다 약간 크게 (레벨별 구슬 크기는 IronBall 이 처리)
  const startR = GAME_CONFIG.BALL_RADIUS + 8;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        {/* 시작점 — 입구가 명확히 보이도록 */}
        <Circle
          cx={start.x}
          cy={start.y}
          r={startR}
          fill="#C8F0C8"
          opacity={0.85}
        />
        <Circle
          cx={start.x}
          cy={start.y}
          r={startR}
          fill="none"
          stroke="#43A047"
          strokeWidth={3}
          strokeDasharray="6 6"
        />
        {/* 목적지 */}
        <Circle cx={goal.x} cy={goal.y} r={G} fill="#FFE08A" opacity={0.85} />
        <Circle
          cx={goal.x}
          cy={goal.y}
          r={G}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={3}
          strokeDasharray="8 6"
        />
        <Polygon
          points={starPoints(goal.x, goal.y, G * 0.55, G * 0.25)}
          fill="#F59E0B"
        />
      </Svg>
    </View>
  );
}
