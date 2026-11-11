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
    <GestureDetector gesture={pan}>
      <View style={styles.board} onLayout={onLayout}>
        {children}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    backgroundColor: "#FFF7E6",
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "#F5C26B",
    overflow: "hidden",
  },
});
