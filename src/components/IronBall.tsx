// import { StyleSheet } from "react-native";
// import Animated, { useAnimatedStyle } from "react-native-reanimated";
// import Svg, {
//   Circle,
//   Defs,
//   Ellipse,
//   RadialGradient,
//   Stop,
// } from "react-native-svg";
// import { GAME_CONFIG } from "../constants/gameConfig";
// import type { PhysicsShared } from "../physics/physicsTypes";

// /**
//  * 쇠구슬.
//  *
//  * 중요:
//  * - RN SVG 에서 width/height="100%" 는 자주 0 으로 잡혀 구슬이 안 보인다.
//  *   → 고정 px 크기 + scale 로 레벨별 반지름 반영.
//  * - transform scale 의 기준점은 뷰 왼쪽 위이므로
//  *   translate 를 (center - baseR * scale) 로 잡아 중심이 ballX/ballY 에 오도록 한다.
//  */
// const BASE_R = GAME_CONFIG.BALL_RADIUS; // 22
// const BASE_SIZE = BASE_R * 2; // 44

// export function IronBall({ s }: { s: PhysicsShared }) {
//   const style = useAnimatedStyle(() => {
//     const r = s.ballRadius.value > 1 ? s.ballRadius.value : BASE_R;
//     const scale = r / BASE_R;
//     return {
//       width: BASE_SIZE,
//       height: BASE_SIZE,
//       opacity: 1,
//       zIndex: 100,
//       elevation: 8, // Android 에서 위에 그리기
//       transform: [
//         { translateX: s.ballX.value - BASE_R * scale },
//         { translateY: s.ballY.value - BASE_R * scale },
//         { scale },
//       ],
//     };
//   });

//   return (
//     <Animated.View
//       pointerEvents="none"
//       collapsable={false}
//       style={[styles.abs, style]}
//     >
//       <Svg width={BASE_SIZE} height={BASE_SIZE} viewBox="0 0 44 44">
//         <Defs>
//           <RadialGradient id="steelBallGrad" cx="35%" cy="30%" r="75%">
//             <Stop offset="0" stopColor="#FFFFFF" />
//             <Stop offset="0.35" stopColor="#C5CDD8" />
//             <Stop offset="0.75" stopColor="#6B7280" />
//             <Stop offset="1" stopColor="#374151" />
//           </RadialGradient>
//         </Defs>
//         {/* 그림자 느낌 바깥 링 */}
//         <Circle cx="22" cy="23.5" r="21" fill="#000000" opacity={0.18} />
//         {/* 본체 */}
//         <Circle
//           cx="22"
//           cy="22"
//           r="20.5"
//           fill="url(#steelBallGrad)"
//           stroke="#111827"
//           strokeWidth="1.5"
//         />
//         {/* 하이라이트 */}
//         <Ellipse cx="15" cy="13" rx="7" ry="4" fill="#FFFFFF" opacity={0.85} />
//       </Svg>
//     </Animated.View>
//   );
// }

// const styles = StyleSheet.create({
//   abs: {
//     position: "absolute",
//     left: 0,
//     top: 0,
//   },
// });

import Animated, { useAnimatedStyle } from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  RadialGradient,
  Stop,
} from "react-native-svg";
import styled from "styled-components/native";

import { GAME_CONFIG } from "../constants/gameConfig";
import type { PhysicsShared } from "../physics/physicsTypes";

/**
 * 쇠구슬.
 *
 * 중요:
 * - RN SVG 에서 width/height="100%" 는 자주 0 으로 잡혀 구슬이 안 보인다.
 * → 고정 px 크기 + scale 로 레벨별 반지름 반영.
 * - transform scale 의 기준점은 뷰 왼쪽 위이므로
 * translate 를 (center - baseR * scale) 로 잡아 중심이 ballX/ballY 에 오도록 한다.
 */
const BASE_R = GAME_CONFIG.BALL_RADIUS; // 22
const BASE_SIZE = BASE_R * 2; // 44

export function IronBall({ s }: { s: PhysicsShared }) {
  const style = useAnimatedStyle(() => {
    const r = s.ballRadius.value > 1 ? s.ballRadius.value : BASE_R;
    const scale = r / BASE_R;
    return {
      width: BASE_SIZE,
      height: BASE_SIZE,
      opacity: 1,
      zIndex: 100,
      elevation: 8, // Android 에서 위에 그리기
      transform: [
        { translateX: s.ballX.value - BASE_R * scale },
        { translateY: s.ballY.value - BASE_R * scale },
        { scale },
      ],
    };
  });

  return (
    <AnimatedContainer pointerEvents="none" collapsable={false} style={style}>
      <Svg width={BASE_SIZE} height={BASE_SIZE} viewBox="0 0 44 44">
        <Defs>
          <RadialGradient id="steelBallGrad" cx="35%" cy="30%" r="75%">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="0.35" stopColor="#C5CDD8" />
            <Stop offset="0.75" stopColor="#6B7280" />
            <Stop offset="1" stopColor="#374151" />
          </RadialGradient>
        </Defs>
        {/* 그림자 느낌 바깥 링 */}
        <Circle cx="22" cy="23.5" r="21" fill="#000000" opacity={0.18} />
        {/* 본체 */}
        <Circle
          cx="22"
          cy="22"
          r="20.5"
          fill="url(#steelBallGrad)"
          stroke="#111827"
          strokeWidth="1.5"
        />
        {/* 하이라이트 */}
        <Ellipse cx="15" cy="13" rx="7" ry="4" fill="#FFFFFF" opacity={0.85} />
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
