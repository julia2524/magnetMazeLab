import { StyleSheet, View } from "react-native";
import Svg, { Defs, Mask, Path, Rect } from "react-native-svg";
import type { WallGeometry } from "../physics/collisionGeometry";

type Props = { geometry: WallGeometry; width: number; height: number };

const WALL = "#C47A2A";
const FLOOR = "#FFF8E7";
const FLOOR_RIM = "#E3C896";
const FLOOR_SHADE = "#F0E0C0";

/**
 * 게임판 렌더링: "정사각형 보드 전체가 벽, 통로만 비어 있다."
 *
 *   벽 영역 = 보드 전체 사각형 − 통로 영역
 *
 *  1) 통로 바닥   : 중심선을 통로 폭(corridorWidth)으로 굵게 그린 것 (끝은 둥글게 닫힘)
 *  2) 벽          : 보드 전체 사각형. SVG mask 로 "통로 영역"을 정확히 뚫는다.
 *                   mask 의 구멍 = 충돌 판정이 쓰는 중심선 + 통로 폭 과 똑같은 모양이다.
 *
 * 벽을 중심선 양쪽에 따로 그리지 않으므로 코너에서 벽이 겹치거나 벌어지지 않고,
 * 통로 바깥은 전부 벽이라 쇠구슬이 갈 수 있는 빈 공간이 남지 않는다.
 * (바닥을 벽 아래에 먼저 깔고 벽에 구멍을 내는 구조 → 나중에 벽/바닥을 우주 테마로 바꿔도
 *  통로 모양과 충돌에는 영향이 없다.)
 */
export function PathWall({ geometry, width, height }: Props) {
  if (!geometry.hasWalls) return null;
  const d = geometry.pathD;
  const corridor = geometry.corridorWidth;
  const common = {
    d,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        <Defs>
          {/* 흰색 = 벽이 보이는 곳, 검정 = 통로(구멍) */}
          <Mask
            id="corridorHole"
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={width}
            height={height}
          >
            <Rect x={0} y={0} width={width} height={height} fill="white" />
            <Path {...common} stroke="black" strokeWidth={corridor} />
          </Mask>
        </Defs>

        {/* 1. 통로 바닥 (벽 아래에 깔림. 안쪽 가장자리가 살짝 어두운 테두리) */}
        <Path {...common} stroke={FLOOR_RIM} strokeWidth={corridor} />
        <Path {...common} stroke={FLOOR} strokeWidth={Math.max(2, corridor - 6)} />
        <Path
          {...common}
          stroke={FLOOR_SHADE}
          strokeWidth={Math.max(4, corridor * 0.35)}
          opacity={0.5}
        />

        {/* 2. 보드 전체를 덮는 벽. 통로 영역만 뚫려 있다 */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={WALL}
          mask="url(#corridorHole)"
        />
      </Svg>
    </View>
  );
}
