import React from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { movePen } from "../physics/physicsEngine";
import type { PhysicsShared } from "../physics/physicsTypes";

type Props = {
  s: PhysicsShared;
  onBoardLayout: (width: number, height: number) => void;
  children: React.ReactNode;
};

/**
 * 게임 보드. Gesture Handler의 e.x / e.y 는 "이 View 기준" 좌표라서
 * 화면 좌표에서 보드 시작 위치를 따로 빼지 않아도 곧바로 보드 내부 좌표가 된다.
 *
 * 테두리는 바깥 View 가 가지고, 입력/좌표 기준은 안쪽 View 가 가진다.
 * (테두리 두께만큼 입력 좌표와 그림 좌표가 어긋나는 것을 막기 위함)
 */
export function GameBoard({ s, onBoardLayout, children }: Props) {
  const pan = Gesture.Pan()
    .minDistance(0) // 터치하자마자 반응
    .onBegin((e) => {
      "worklet";
      movePen(s, e.x, e.y, true);
    })
    .onUpdate((e) => {
      "worklet";
      movePen(s, e.x, e.y, false);
    })
    .onFinalize(() => {
      "worklet";
      s.penActive.value = 0;
    });

  const onLayout = (ev: LayoutChangeEvent) => {
    const { width, height } = ev.nativeEvent.layout;
    onBoardLayout(width, height);
  };

  return (
    <View style={styles.frame}>
      <GestureDetector gesture={pan}>
        <View style={styles.board} onLayout={onLayout}>
          {children}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "#F5C26B",
    backgroundColor: "#FFF7E6",
    overflow: "hidden",
  },
  board: { flex: 1 },
});
