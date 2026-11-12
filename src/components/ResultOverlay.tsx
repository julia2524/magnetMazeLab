import { Pressable, StyleSheet, Text, View } from "react-native";

type Props =
  | { kind: "round"; success: boolean; onNext: () => void }
  | {
      kind: "level";
      levelId: number;
      stars: number;
      total: number;
      passed: boolean;
      hasNextLevel: boolean;
      onRetry: () => void;
      onNextLevel: () => void;
    };

/** 라운드 성공/실패 피드백, 5라운드 후 레벨 결과 */
export function ResultOverlay(p: Props) {
  if (p.kind === "round") {
    return (
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.big}>{p.success ? "⭐" : "⏰"}</Text>
          <Text style={styles.title}>{p.success ? "성공!" : "시간이 다 됐어요"}</Text>
          <Text style={styles.sub}>
            {p.success ? "별을 얻었어요!" : "괜찮아요, 다음에 또 해봐요!"}
          </Text>
          <Pressable style={styles.btn} onPress={p.onNext}>
            <Text style={styles.btnText}>다음</Text>
          </Pressable>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>Level {p.levelId} 결과</Text>
        <Text style={styles.stars}>
          {"★".repeat(p.stars)}
          {"☆".repeat(p.total - p.stars)}
        </Text>
        <Text style={styles.sub}>
          {p.passed ? "잘했어요! 다음 레벨로 갈 수 있어요." : "한 번 더 도전해 볼까요?"}
        </Text>
        <View style={styles.row}>
          <Pressable style={[styles.btn, styles.btnSub]} onPress={p.onRetry}>
            <Text style={styles.btnText}>다시 하기</Text>
          </Pressable>
          {p.passed && p.hasNextLevel && (
            <Pressable style={styles.btn} onPress={p.onNextLevel}>
              <Text style={styles.btnText}>다음 레벨</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  card: {
    backgroundColor: "#FFF8E7",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 8,
    minWidth: 240,
  },
  big: { fontSize: 56 },
  title: { fontSize: 24, fontWeight: "800", color: "#8A4B08" },
  stars: { fontSize: 36, color: "#F59E0B" },
  sub: { fontSize: 15, color: "#A8651C", textAlign: "center" },
  row: { flexDirection: "row", gap: 10, marginTop: 8 },
  btn: {
    marginTop: 8,
    backgroundColor: "#FF8A3D",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 18,
  },
  btnSub: { backgroundColor: "#C9A36B" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
