import { StyleSheet, Text, View } from "react-native";
import type { RoundResult } from "../game/gameState";

type Props = {
  currentRound: number; // 0부터
  totalRounds: number;
  results: readonly RoundResult[];
};

/** ROUND n / 5 + 점 5개 (현재=강조, 성공=★, 실패=✕) */
export function RoundProgress({ currentRound, totalRounds, results }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>
        ROUND {Math.min(currentRound + 1, totalRounds)} / {totalRounds}
      </Text>
      <View style={styles.row}>
        {Array.from({ length: totalRounds }, (_, i) => {
          const r = results[i];
          const current = i === currentRound && r == null;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                current && styles.dotCurrent,
                r === "success" && styles.dotOk,
                r === "fail" && styles.dotFail,
              ]}
            >
              <Text style={styles.dotText}>
                {r === "success" ? "★" : r === "fail" ? "✕" : ""}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingBottom: 12, gap: 6 },
  title: { fontSize: 16, fontWeight: "800", color: "#8A4B08" },
  row: { flexDirection: "row", gap: 10 },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFF3D6",
    borderWidth: 2,
    borderColor: "#F5C26B",
    alignItems: "center",
    justifyContent: "center",
  },
  dotCurrent: { backgroundColor: "#FF8A3D", borderColor: "#FF8A3D", transform: [{ scale: 1.2 }] },
  dotOk: { backgroundColor: "#FFD54F", borderColor: "#F59E0B" },
  dotFail: { backgroundColor: "#E0E0E0", borderColor: "#9E9E9E" },
  dotText: { fontSize: 14, fontWeight: "800", color: "#7A4A00" },
});
