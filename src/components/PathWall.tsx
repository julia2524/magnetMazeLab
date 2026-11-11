import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { WallGeometry } from "../physics/collisionGeometry";

type Props = { geometry: WallGeometry; width: number; height: number };

/**
 * 벽 그리기. 충돌에 쓰는 중심선(geometry.pathD)을 굵은 선으로 겹쳐 그린다.
 *   1) 바깥 윤곽 + 벽   : 폭 = 통로 폭 + 2 × 벽 두께
 *   2) 안쪽 가장자리    : 통로 폭 + 4  (벽 안쪽 면에 얇은 테두리)
 *   3) 바닥             : 폭 = 통로 폭 (= 충돌 영역의 안쪽 면)
 * 충돌은 "중심선에서 통로 폭/2 - 구슬 반지름" 이내만 허용하므로 보이는 벽과 정확히 같은 위치에서 막힌다.
 * 둥근 join/cap 덕분에 코너가 겹치거나 벌어지지 않는다.
 * strokeLinecap="round" 로 시작/끝 입구가 자연스럽게 열린 원형으로 보인다.
 */
export function PathWall({ geometry, width, height }: Props) {
  if (!geometry.hasWalls) return null;
  const d = geometry.pathD;
  const common = {
    d,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const outer = geometry.outerWidth;
  const corridor = geometry.corridorWidth;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        {/* 1. 가장 바깥 어두운 윤곽 (벽 외곽) */}
        <Path {...common} stroke="#5C3A0A" strokeWidth={outer + 6} />
        {/* 2. 벽 본체 (따뜻한 갈색) */}
        <Path {...common} stroke="#C47A2A" strokeWidth={outer} />
        {/* 3. 벽 안쪽 면 테두리 (조금 더 어두운 톤으로 구분) */}
        <Path {...common} stroke="#A05A18" strokeWidth={corridor + 5} />
        {/* 4. 통로 바닥 (밝은 색 — 구슬이 다니는 길) */}
        <Path {...common} stroke="#FFF8E7" strokeWidth={corridor} />
        {/* 5. 바닥 중앙 살짝 그림자 (깊이감) */}
        <Path
          {...common}
          stroke="#F0E0C0"
          strokeWidth={Math.max(4, corridor * 0.35)}
          opacity={0.5}
        />
      </Svg>
    </View>
  );
}
