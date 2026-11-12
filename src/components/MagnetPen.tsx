// import { StyleSheet } from "react-native";
// import Animated, {
//   useAnimatedStyle,
//   withTiming,
// } from "react-native-reanimated";
// import Svg, { Path, Rect } from "react-native-svg";
// import { GAME_CONFIG } from "../constants/gameConfig";
// import type { PhysicsShared } from "../physics/physicsTypes";

// const W = GAME_CONFIG.PEN_WIDTH;
// const H = GAME_CONFIG.PEN_HEIGHT;

// /**
//  * 그림 좌표(56x170) 기준으로 자석 끝(구슬이 붙는 점)은 (28, 15).
//  * 박스 중심 (28, 85)이 손가락 위치이므로 TIP_OFFSET = (0, -70).
//  * 그림을 바꾸면 gameConfig의 TIP_OFFSET만 같이 맞추면 된다.
//  */
// export function MagnetPen({ s }: { s: PhysicsShared }) {
//   const style = useAnimatedStyle(() => ({
//     opacity: withTiming(s.penActive.value === 1 ? 1 : 0.35, { duration: 120 }),
//     transform: [
//       { translateX: s.penX.value - W / 2 },
//       { translateY: s.penY.value - H / 2 },
//     ],
//     zIndex: 25,
//   }));

//   return (
//     <Animated.View
//       pointerEvents="none"
//       style={[styles.abs, { width: W, height: H }, style]}
//     >
//       <Svg width={W} height={H} viewBox="0 0 56 170">
//         {/* 손잡이 */}
//         <Rect
//           x="21"
//           y="82"
//           width="14"
//           height="80"
//           rx="7"
//           fill="#FFC93C"
//           stroke="#B7791F"
//           strokeWidth="1.5"
//         />
//         {/* 말굽자석 몸통 */}
//         <Path
//           d="M10 32 V68 a18 18 0 0 0 36 0 V32 H32 V68 a4 4 0 0 1 -8 0 V32 Z"
//           fill="#9AA3B2"
//           stroke="#4B5563"
//           strokeWidth="1.5"
//         />
//         {/* 자석 끝(N극 빨강 / S극 파랑) */}
//         <Rect
//           x="10"
//           y="32"
//           width="14"
//           height="16"
//           fill="#EF4444"
//           stroke="#991B1B"
//           strokeWidth="1.5"
//         />
//         <Rect
//           x="32"
//           y="32"
//           width="14"
//           height="16"
//           fill="#3B82F6"
//           stroke="#1E3A8A"
//           strokeWidth="1.5"
//         />
//       </Svg>
//     </Animated.View>
//   );
// }

// const styles = StyleSheet.create({
//   abs: { position: "absolute", left: 0, top: 0 },
// });

import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path, Rect } from "react-native-svg";
import styled from "styled-components/native";

import { GAME_CONFIG } from "../constants/gameConfig";
import type { PhysicsShared } from "../physics/physicsTypes";

const W = GAME_CONFIG.PEN_WIDTH;
const H = GAME_CONFIG.PEN_HEIGHT;

/**
 * 그림 좌표(56x170) 기준으로 자석 끝(구슬이 붙는 점)은 (28, 15).
 * 박스 중심 (28, 85)이 손가락 위치이므로 TIP_OFFSET = (0, -70).
 * 그림을 바꾸면 gameConfig의 TIP_OFFSET만 같이 맞추면 된다.
 */
export function MagnetPen({ s }: { s: PhysicsShared }) {
  const style = useAnimatedStyle(() => ({
    opacity: withTiming(s.penActive.value === 1 ? 1 : 0.35, { duration: 120 }),
    transform: [
      { translateX: s.penX.value - W / 2 },
      { translateY: s.penY.value - H / 2 },
    ],
    zIndex: 25,
  }));

  return (
    <AnimatedContainer
      pointerEvents="none"
      style={[style, { width: W, height: H }]}
    >
      <Svg width={W} height={H} viewBox="0 0 56 170">
        {/* 손잡이 */}
        <Rect
          x="21"
          y="82"
          width="14"
          height="80"
          rx="7"
          fill="#FFC93C"
          stroke="#B7791F"
          strokeWidth="1.5"
        />
        {/* 말굽자석 몸통 */}
        <Path
          d="M10 32 V68 a18 18 0 0 0 36 0 V32 H32 V68 a4 4 0 0 1 -8 0 V32 Z"
          fill="#9AA3B2"
          stroke="#4B5563"
          strokeWidth="1.5"
        />
        {/* 자석 끝(N극 빨강 / S극 파랑) */}
        <Rect
          x="10"
          y="32"
          width="14"
          height="16"
          fill="#EF4444"
          stroke="#991B1B"
          strokeWidth="1.5"
        />
        <Rect
          x="32"
          y="32"
          width="14"
          height="16"
          fill="#3B82F6"
          stroke="#1E3A8A"
          strokeWidth="1.5"
        />
      </Svg>
    </AnimatedContainer>
  );
}

// Styled Components 정의
const AnimatedContainer = styled(Animated.View)`
  position: absolute;
  left: 0;
  top: 0;
`;
