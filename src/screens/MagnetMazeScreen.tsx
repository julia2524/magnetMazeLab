import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFrameCallback, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { GameBoard } from "../components/GameBoard";
import { IronBall } from "../components/IronBall";
import { MagnetPen } from "../components/MagnetPen";
import { level1 } from "../levels/level1";
import { resetBall, stepPhysics } from "../physics/physicsEngine";
import { BallMode, type PhysicsShared } from "../physics/physicsTypes";

export default function MagnetMazeScreen() {
  // 물리 상태는 React state가 아니라 shared value에 둔다 → 매 프레임 리렌더링 없이 부드럽게 동작
  const s: PhysicsShared = {
    boardW: useSharedValue(0),
    boardH: useSharedValue(0),
    ballX: useSharedValue(-100),
    ballY: useSharedValue(-100),
    ballVX: useSharedValue(0),
    ballVY: useSharedValue(0),
    ballMode: useSharedValue<number>(BallMode.FREE),
    attachOffX: useSharedValue(0),
    attachOffY: useSharedValue(0),
    penX: useSharedValue(-100),
    penY: useSharedValue(-100),
    penActive: useSharedValue(0),
    penVX: useSharedValue(0),
    penVY: useSharedValue(0),
    prevTipX: useSharedValue(0),
    prevTipY: useSharedValue(0),
  };

  // 물리 계산: 매 프레임, 실제 경과 시간(dt)을 사용 (렌더링과 분리)
  useFrameCallback((frame) => {
    "worklet";
    const ms = frame.timeSincePreviousFrame;
    if (ms == null || s.boardW.value === 0) return;
    stepPhysics(s, ms / 1000);
  });

  const initialized = useRef(false);

  const placeStart = (w: number, h: number) => {
    resetBall(s, w * level1.ballStart.x, h * level1.ballStart.y);
    s.penX.value = w * level1.penStart.x;
    s.penY.value = h * level1.penStart.y;
    s.penActive.value = 0;
  };

  const onBoardLayout = (w: number, h: number) => {
    s.boardW.value = w;
    s.boardH.value = h;
    if (!initialized.current) {
      initialized.current = true;
      placeStart(w, h);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>자석 미로</Text>
        <Pressable
          style={styles.resetBtn}
          onPress={() => placeStart(s.boardW.value, s.boardH.value)}
        >
          <Text style={styles.resetText}>다시 하기</Text>
        </Pressable>
      </View>

      <View style={styles.boardWrap}>
        <GameBoard s={s} onBoardLayout={onBoardLayout}>
          <MagnetPen s={s} />
          <IronBall s={s} />
        </GameBoard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFE9B8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#8A4B08" },
  resetBtn: {
    backgroundColor: "#FF8A3D",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  resetText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  boardWrap: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },
});
