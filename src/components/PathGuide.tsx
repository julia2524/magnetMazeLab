import { StyleSheet, View } from "react-native";
import Svg, { Circle, Polygon, Polyline } from "react-native-svg";
import { GAME_CONFIG } from "../constants/gameConfig";
import { toBoardPoint } from "../levels/levelGenerator";
import type { GeneratedRound } from "../levels/levelTypes";

type Props = { round: GeneratedRound; width: number; height: number };

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

/** 경로(점선 가이드) + 시작점 + 목적지. 물리/충돌과는 무관한 그림일 뿐이다. */
export function PathGuide({ round, width, height }: Props) {
  const pts = round.pathPoints.map((p) => toBoardPoint(p, width, height));
  const start = toBoardPoint(round.startPosition, width, height);
  const goal = toBoardPoint(round.goalPosition, width, height);
  const G = GAME_CONFIG.GOAL_RADIUS;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        {pts.length > 1 && (
          <Polyline
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#8FBBFF"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 18"
          />
        )}
        {/* 시작점 */}
        <Circle
          cx={start.x}
          cy={start.y}
          r={GAME_CONFIG.BALL_RADIUS + 10}
          fill="#C8F0C8"
          opacity={0.8}
        />
        <Circle
          cx={start.x}
          cy={start.y}
          r={GAME_CONFIG.BALL_RADIUS + 10}
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
