import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { GAME_CONFIG } from "../constants/gameConfig";
import { BallMode, type PhysicsShared } from "../physics/physicsTypes";

const R = GAME_CONFIG.BALL_RADIUS;
const SIZE = R * 2;

export function IronBall({ s }: { s: PhysicsShared }) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: s.ballX.value - R },
      { translateY: s.ballY.value - R },
      // 붙는 순간 살짝 커지는 "착!" 효과
      {
        scale: withSpring(s.ballMode.value === BallMode.ATTACHED ? 1.12 : 1, {
          damping: 8,
          stiffness: 300,
        }),
      },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.abs, { width: SIZE, height: SIZE }, style]}
    >
      <Svg width={SIZE} height={SIZE} viewBox="0 0 44 44">
        <Defs>
          <RadialGradient id="steel" cx="35%" cy="30%" r="75%">
            <Stop offset="0" stopColor="#F4F6FA" />
            <Stop offset="0.45" stopColor="#A9B2C0" />
            <Stop offset="1" stopColor="#4B5563" />
          </RadialGradient>
        </Defs>
        <Circle
          cx="22"
          cy="22"
          r="21"
          fill="url(#steel)"
          stroke="#374151"
          strokeWidth="1.5"
        />
        <Ellipse cx="15" cy="13" rx="6" ry="3.5" fill="#FFFFFF" opacity={0.7} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  abs: { position: "absolute", left: 0, top: 0 },
});
