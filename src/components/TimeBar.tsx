import { StyleSheet, Text, View } from "react-native";

type Props = {
  /** 남은 시간 (ms) */
  remainingMs: number;
  totalMs: number;
};

/** 빨간 막대가 시간이 갈수록 짧아지는 타이머. 숫자(초)는 보조 표시 */
export function TimeBar({ remainingMs, totalMs }: Props) {
  const ratio = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const secs = Math.ceil(remainingMs / 1000);
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.label}>{secs}초</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  track: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFD9DE", // 연한 분홍 바탕
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: "#E53935", borderRadius: 8 },
  label: {
    width: 44,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "800",
    color: "#B71C1C",
  },
});
