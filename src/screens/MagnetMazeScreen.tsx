import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFrameCallback, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { GameBoard } from "../components/GameBoard";
import { IronBall } from "../components/IronBall";
import { MagnetPen } from "../components/MagnetPen";
import { PathGuide } from "../components/PathGuide";
import { LEVEL_CONFIGS, getLevelConfig } from "../levels/levelConfigs";
import { generateRound } from "../levels/levelGenerator";
import { resetBall, stepPhysics } from "../physics/physicsEngine";
import { BallMode, type PhysicsShared } from "../physics/physicsTypes";

const PEN_START = { x: 0.5, y: 0.85 }; // 보드 비율

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

  // ── 레벨/라운드 (지금은 개발용 선택 칩. 나중에 GameController 가 맡는다) ──
  const [levelId, setLevelId] = useState(1);
  const [roundIndex, setRoundIndex] = useState(0);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  const config = getLevelConfig(levelId);

  // 보드 가로세로비 + 레벨 + 라운드 → 라운드 데이터 생성
  const { round, error } = useMemo(() => {
    if (!size) return { round: null, error: null };
    try {
      return {
        round: generateRound(config, roundIndex, {
          boardAspect: size.w / size.h,
        }),
        error: null,
      };
    } catch (e) {
      return { round: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [config, roundIndex, size]);

  const onBoardLayout = (w: number, h: number) => {
    s.boardW.value = w;
    s.boardH.value = h;
    setSize((prev) =>
      prev && Math.abs(prev.w - w) < 0.5 && Math.abs(prev.h - h) < 0.5
        ? prev
        : { w, h },
    );
  };

  // 쇠구슬을 라운드의 시작점에, 자석펜을 기본 위치에 놓는다
  const placeStart = useCallback(() => {
    if (!round || !size) return;
    resetBall(
      s,
      round.startPosition.x * size.w,
      round.startPosition.y * size.h,
    );
    s.penX.value = size.w * PEN_START.x;
    s.penY.value = size.h * PEN_START.y;
    s.penActive.value = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, size]);

  useEffect(() => {
    placeStart();
  }, [placeStart]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>자석 미로</Text>
          <Text style={styles.sub}>
            Level {levelId} · {config.levelType} · 제한{" "}
            {config.timeLimitSeconds}초
          </Text>
        </View>
        <Pressable style={styles.resetBtn} onPress={placeStart}>
          <Text style={styles.resetText}>다시 하기</Text>
        </Pressable>
      </View>

      <View style={styles.chips}>
        {LEVEL_CONFIGS.map((c) => (
          <Chip
            key={c.levelId}
            label={`L${c.levelId}`}
            selected={c.levelId === levelId}
            onPress={() => {
              setLevelId(c.levelId);
              setRoundIndex(0);
            }}
          />
        ))}
      </View>
      <View style={styles.chips}>
        {Array.from({ length: config.roundCount }, (_, i) => (
          <Chip
            key={i}
            label={`R${i + 1}`}
            selected={i === roundIndex}
            onPress={() => setRoundIndex(i)}
          />
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.boardWrap}>
        <GameBoard s={s} onBoardLayout={onBoardLayout}>
          {round && size && (
            <PathGuide round={round} width={size.w} height={size.h} />
          )}
          <MagnetPen s={s} />
          <IronBall s={s} />
        </GameBoard>
      </View>
    </SafeAreaView>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFE9B8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#8A4B08" },
  sub: { fontSize: 13, color: "#A8651C", marginTop: 2 },
  resetBtn: {
    backgroundColor: "#FF8A3D",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  resetText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  chips: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#FFF3D6",
    borderWidth: 2,
    borderColor: "#F5C26B",
  },
  chipOn: { backgroundColor: "#FF8A3D", borderColor: "#FF8A3D" },
  chipText: { fontSize: 14, fontWeight: "700", color: "#8A4B08" },
  chipTextOn: { color: "#fff" },
  error: {
    color: "#B91C1C",
    paddingHorizontal: 20,
    paddingBottom: 4,
    fontSize: 12,
  },
  boardWrap: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },
});
