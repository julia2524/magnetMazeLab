// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   Pressable,
//   StyleSheet,
//   Text,
//   View,
//   type LayoutChangeEvent,
// } from "react-native";
// import { useFrameCallback, useSharedValue } from "react-native-reanimated";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { GameBoard } from "../components/GameBoard";
// import { IronBall } from "../components/IronBall";
// import { MagnetPen } from "../components/MagnetPen";
// import { PathGuide } from "../components/PathGuide";
// import { PathWall } from "../components/PathWall";
// import { GAME_CONFIG } from "../constants/gameConfig";
// import {
//   LEVEL_CONFIGS,
//   fitConfigToBoard,
//   getLevelConfig,
// } from "../levels/levelConfigs";
// import { generateRound } from "../levels/levelGenerator";
// import { buildWallGeometry } from "../physics/collisionGeometry";
// import { stepPhysics } from "../physics/physicsEngine";
// import { BallMode, type PhysicsShared } from "../physics/physicsTypes";
// import { resolveWalls } from "../physics/wallCollision";

// const PEN_START = { x: 0.5, y: 0.85 }; // 보드 비율

// export default function MagnetMazeScreen() {
//   // 물리 상태는 React state가 아니라 shared value에 둔다 → 매 프레임 리렌더링 없이 부드럽게 동작
//   const s: PhysicsShared = {
//     boardW: useSharedValue(0),
//     boardH: useSharedValue(0),
//     ballX: useSharedValue(-100),
//     ballY: useSharedValue(-100),
//     ballVX: useSharedValue(0),
//     ballVY: useSharedValue(0),
//     ballMode: useSharedValue<number>(BallMode.FREE),
//     attachOffX: useSharedValue(0),
//     attachOffY: useSharedValue(0),
//     penX: useSharedValue(-100),
//     penY: useSharedValue(-100),
//     penActive: useSharedValue(0),
//     penVX: useSharedValue(0),
//     penVY: useSharedValue(0),
//     prevTipX: useSharedValue(0),
//     prevTipY: useSharedValue(0),
//     ballRadius: useSharedValue<number>(GAME_CONFIG.BALL_RADIUS),
//     wallSegs: useSharedValue<number[]>([]),
//     wallCount: useSharedValue(0),
//     wallReach: useSharedValue(0),
//   };

//   // 물리 계산: 매 프레임, 실제 경과 시간(dt)을 사용 (렌더링과 분리)
//   useFrameCallback((frame) => {
//     "worklet";
//     const ms = frame.timeSincePreviousFrame;
//     if (ms == null || s.boardW.value === 0) return;
//     stepPhysics(s, ms / 1000);
//   });

//   // ── 레벨/라운드 (지금은 개발용 선택 칩. 나중에 GameController 가 맡는다) ──
//   const [levelId, setLevelId] = useState(1);
//   const [roundIndex, setRoundIndex] = useState(0);
//   const [size, setSize] = useState<{ w: number; h: number } | null>(null);

//   const baseConfig = getLevelConfig(levelId);
//   // 정사각형 보드 한 변(px): 보드 영역의 가로/세로 중 짧은 쪽
//   const [side, setSide] = useState(0);
//   const onWrapLayout = (ev: LayoutChangeEvent) => {
//     const { width, height } = ev.nativeEvent.layout;
//     const next = Math.floor(Math.min(width, height));
//     if (next > 0) setSide((prev) => (prev === next ? prev : next));
//   };
//   // 작은 화면에서는 통로 폭·벽 두께·구슬 반지름을 같은 비율로 줄여 보드 대비 비율을 유지
//   const config = useMemo(
//     () => (size ? fitConfigToBoard(baseConfig, size.w) : baseConfig),
//     [baseConfig, size],
//   );

//   // 보드 가로세로비 + 레벨 + 라운드 → 라운드 데이터 생성
//   const { round, error } = useMemo(() => {
//     if (!size) return { round: null, error: null };
//     try {
//       return {
//         round: generateRound(config, roundIndex, {
//           boardAspect: size.w / size.h,
//           boardWidthPx: size.w,
//         }),
//         error: null,
//       };
//     } catch (e) {
//       return { round: null, error: e instanceof Error ? e.message : String(e) };
//     }
//   }, [config, roundIndex, size]);

//   const onBoardLayout = (w: number, h: number) => {
//     if (w < 1 || h < 1) return;
//     s.boardW.value = w;
//     s.boardH.value = h;
//     // 보드 크기를 처음 알면 구슬을 일단 보드 중앙에 둬서 "안 보이는" 상태를 피한다.
//     // (라운드 데이터가 준비되면 placeStart 가 시작점으로 옮긴다)
//     if (s.ballX.value < 0 || s.ballY.value < 0) {
//       const r =
//         s.ballRadius.value > 1 ? s.ballRadius.value : GAME_CONFIG.BALL_RADIUS;
//       s.ballX.value = w * 0.5;
//       s.ballY.value = h * 0.5;
//       s.ballRadius.value = r;
//     }
//     setSize((prev) =>
//       prev && Math.abs(prev.w - w) < 0.5 && Math.abs(prev.h - h) < 0.5
//         ? prev
//         : { w, h },
//     );
//   };

//   // 벽 데이터는 라운드가 시작될 때 한 번만 계산해서 재사용한다 (렌더링과 충돌이 같은 데이터를 쓴다)
//   const walls = useMemo(
//     () =>
//       round && size
//         ? buildWallGeometry(
//             round,
//             config.walls,
//             config.ballRadius,
//             size.w,
//             size.h,
//           )
//         : null,
//     [round, size, config],
//   );

//   // 쇠구슬을 라운드의 시작점에, 자석펜을 기본 위치에 놓는다
//   const placeStart = useCallback(() => {
//     if (!round || !size) return;

//     const r =
//       config.ballRadius > 1 ? config.ballRadius : GAME_CONFIG.BALL_RADIUS;
//     s.ballRadius.value = r;

//     // 벽 데이터 (Level 1 은 빈 배열 / count 0)
//     if (walls) {
//       s.wallSegs.value = walls.segs;
//       s.wallCount.value = walls.segCount;
//       s.wallReach.value = walls.reach;
//     } else {
//       s.wallSegs.value = [];
//       s.wallCount.value = 0;
//       s.wallReach.value = 0;
//     }

//     // 시작 좌표 (정규화 → px)
//     let sx = round.startPosition.x * size.w;
//     let sy = round.startPosition.y * size.h;

//     // 벽이 있으면 시작점이 통로 안에 있도록 보정
//     if (walls && walls.segCount > 0 && walls.reach > 0) {
//       const snapped = resolveWalls(
//         walls.segs,
//         walls.segCount,
//         walls.reach,
//         sx,
//         sy,
//       );
//       sx = snapped.x;
//       sy = snapped.y;
//     }

//     // 보드 경계 안
//     sx = Math.max(r, Math.min(size.w - r, sx));
//     sy = Math.max(r, Math.min(size.h - r, sy));

//     // JS 스레드에서 shared value 직접 설정 (worklet 호출 불필요)
//     s.ballX.value = sx;
//     s.ballY.value = sy;
//     s.ballVX.value = 0;
//     s.ballVY.value = 0;
//     s.ballMode.value = BallMode.FREE;
//     s.attachOffX.value = 0;
//     s.attachOffY.value = 0;

//     s.penX.value = size.w * PEN_START.x;
//     s.penY.value = size.h * PEN_START.y;
//     s.penActive.value = 0;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [round, size, walls, config]);

//   useEffect(() => {
//     placeStart();
//   }, [placeStart]);

//   return (
//     <SafeAreaView style={styles.safe}>
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.title}>자석 미로</Text>
//           <Text style={styles.sub}>
//             Level {levelId} · {config.levelType} · 제한{" "}
//             {config.timeLimitSeconds}초
//           </Text>
//         </View>
//         <Pressable style={styles.resetBtn} onPress={placeStart}>
//           <Text style={styles.resetText}>다시 하기</Text>
//         </Pressable>
//       </View>

//       <View style={styles.chips}>
//         {LEVEL_CONFIGS.map((c) => (
//           <Chip
//             key={c.levelId}
//             label={`L${c.levelId}`}
//             selected={c.levelId === levelId}
//             onPress={() => {
//               setLevelId(c.levelId);
//               setRoundIndex(0);
//             }}
//           />
//         ))}
//       </View>
//       <View style={styles.chips}>
//         {Array.from({ length: config.roundCount }, (_, i) => (
//           <Chip
//             key={i}
//             label={`R${i + 1}`}
//             selected={i === roundIndex}
//             onPress={() => setRoundIndex(i)}
//           />
//         ))}
//       </View>

//       {error && <Text style={styles.error}>{error}</Text>}

//       <View style={styles.boardWrap} onLayout={onWrapLayout}>
//         <View style={{ width: side, height: side }}>
//           <GameBoard s={s} onBoardLayout={onBoardLayout}>
//             {walls && size && (
//               <PathWall geometry={walls} width={size.w} height={size.h} />
//             )}
//             {round && size && (
//               <PathGuide
//                 round={round}
//                 width={size.w}
//                 height={size.h}
//                 corridorWidth={
//                   config.walls.hasWalls ? config.walls.corridorWidth : undefined
//                 }
//                 ballRadius={config.ballRadius}
//               />
//             )}
//             <MagnetPen s={s} />
//             <IronBall s={s} />
//           </GameBoard>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// function Chip({
//   label,
//   selected,
//   onPress,
// }: {
//   label: string;
//   selected: boolean;
//   onPress: () => void;
// }) {
//   return (
//     <Pressable
//       onPress={onPress}
//       style={[styles.chip, selected && styles.chipOn]}
//     >
//       <Text style={[styles.chipText, selected && styles.chipTextOn]}>
//         {label}
//       </Text>
//     </Pressable>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#FFE9B8" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//   },
//   title: { fontSize: 24, fontWeight: "800", color: "#8A4B08" },
//   sub: { fontSize: 13, color: "#A8651C", marginTop: 2 },
//   resetBtn: {
//     backgroundColor: "#FF8A3D",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 16,
//   },
//   resetText: { color: "#fff", fontSize: 16, fontWeight: "700" },
//   chips: {
//     flexDirection: "row",
//     gap: 8,
//     paddingHorizontal: 16,
//     paddingBottom: 8,
//   },
//   chip: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 14,
//     backgroundColor: "#FFF3D6",
//     borderWidth: 2,
//     borderColor: "#F5C26B",
//   },
//   chipOn: { backgroundColor: "#FF8A3D", borderColor: "#FF8A3D" },
//   chipText: { fontSize: 14, fontWeight: "700", color: "#8A4B08" },
//   chipTextOn: { color: "#fff" },
//   error: {
//     color: "#B91C1C",
//     paddingHorizontal: 20,
//     paddingBottom: 4,
//     fontSize: 12,
//   },
//   boardWrap: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingBottom: 16,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View, type LayoutChangeEvent } from "react-native";
import { useFrameCallback, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

import { GameBoard } from "../components/GameBoard";
import { IronBall } from "../components/IronBall";
import { MagnetPen } from "../components/MagnetPen";
import { PathGuide } from "../components/PathGuide";
import { PathWall } from "../components/PathWall";
import { GAME_CONFIG } from "../constants/gameConfig";
import {
  LEVEL_CONFIGS,
  fitConfigToBoard,
  getLevelConfig,
} from "../levels/levelConfigs";
import { generateRound } from "../levels/levelGenerator";
import { buildWallGeometry } from "../physics/collisionGeometry";
import { stepPhysics } from "../physics/physicsEngine";
import { BallMode, type PhysicsShared } from "../physics/physicsTypes";
import { resolveWalls } from "../physics/wallCollision";

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
    ballRadius: useSharedValue<number>(GAME_CONFIG.BALL_RADIUS),
    wallSegs: useSharedValue<number[]>([]),
    wallCount: useSharedValue(0),
    wallReach: useSharedValue(0),
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

  const baseConfig = getLevelConfig(levelId);
  // 정사각형 보드 한 변(px): 보드 영역의 가로/세로 중 짧은 쪽
  const [side, setSide] = useState(0);
  const onWrapLayout = (ev: LayoutChangeEvent) => {
    const { width, height } = ev.nativeEvent.layout;
    const next = Math.floor(Math.min(width, height));
    if (next > 0) setSide((prev) => (prev === next ? prev : next));
  };
  // 작은 화면에서는 통로 폭·벽 두께·구슬 반지름을 같은 비율로 줄여 보드 대비 비율을 유지
  const config = useMemo(
    () => (size ? fitConfigToBoard(baseConfig, size.w) : baseConfig),
    [baseConfig, size],
  );

  // 보드 가로세로비 + 레벨 + 라운드 → 라운드 데이터 생성
  const { round, error } = useMemo(() => {
    if (!size) return { round: null, error: null };
    try {
      return {
        round: generateRound(config, roundIndex, {
          boardAspect: size.w / size.h,
          boardWidthPx: size.w,
        }),
        error: null,
      };
    } catch (e) {
      return { round: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [config, roundIndex, size]);

  const onBoardLayout = (w: number, h: number) => {
    if (w < 1 || h < 1) return;
    s.boardW.value = w;
    s.boardH.value = h;
    // 보드 크기를 처음 알면 구슬을 일단 보드 중앙에 둬서 "안 보이는" 상태를 피한다.
    // (라운드 데이터가 준비되면 placeStart 가 시작점으로 옮긴다)
    if (s.ballX.value < 0 || s.ballY.value < 0) {
      const r =
        s.ballRadius.value > 1 ? s.ballRadius.value : GAME_CONFIG.BALL_RADIUS;
      s.ballX.value = w * 0.5;
      s.ballY.value = h * 0.5;
      s.ballRadius.value = r;
    }
    setSize((prev) =>
      prev && Math.abs(prev.w - w) < 0.5 && Math.abs(prev.h - h) < 0.5
        ? prev
        : { w, h },
    );
  };

  // 벽 데이터는 라운드가 시작될 때 한 번만 계산해서 재사용한다 (렌더링과 충돌이 같은 데이터를 쓴다)
  const walls = useMemo(
    () =>
      round && size
        ? buildWallGeometry(
            round,
            config.walls,
            config.ballRadius,
            size.w,
            size.h,
          )
        : null,
    [round, size, config],
  );

  // 쇠구슬을 라운드의 시작점에, 자석펜을 기본 위치에 놓는다
  const placeStart = useCallback(() => {
    if (!round || !size) return;

    const r =
      config.ballRadius > 1 ? config.ballRadius : GAME_CONFIG.BALL_RADIUS;
    s.ballRadius.value = r;

    // 벽 데이터 (Level 1 은 빈 배열 / count 0)
    if (walls) {
      s.wallSegs.value = walls.segs;
      s.wallCount.value = walls.segCount;
      s.wallReach.value = walls.reach;
    } else {
      s.wallSegs.value = [];
      s.wallCount.value = 0;
      s.wallReach.value = 0;
    }

    // 시작 좌표 (정규화 → px)
    let sx = round.startPosition.x * size.w;
    let sy = round.startPosition.y * size.h;

    // 벽이 있으면 시작점이 통로 안에 있도록 보정
    if (walls && walls.segCount > 0 && walls.reach > 0) {
      const snapped = resolveWalls(
        walls.segs,
        walls.segCount,
        walls.reach,
        sx,
        sy,
      );
      sx = snapped.x;
      sy = snapped.y;
    }

    // 보드 경계 안
    sx = Math.max(r, Math.min(size.w - r, sx));
    sy = Math.max(r, Math.min(size.h - r, sy));

    // JS 스레드에서 shared value 직접 설정 (worklet 호출 불필요)
    s.ballX.value = sx;
    s.ballY.value = sy;
    s.ballVX.value = 0;
    s.ballVY.value = 0;
    s.ballMode.value = BallMode.FREE;
    s.attachOffX.value = 0;
    s.attachOffY.value = 0;

    s.penX.value = size.w * PEN_START.x;
    s.penY.value = size.h * PEN_START.y;
    s.penActive.value = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, size, walls, config]);

  useEffect(() => {
    placeStart();
  }, [placeStart]);

  return (
    <SafeContainer>
      <HeaderContainer>
        <View>
          <TitleText>자석 미로</TitleText>
          <SubText>
            Level {levelId} · {config.levelType} · 제한{" "}
            {config.timeLimitSeconds}초
          </SubText>
        </View>
        <ResetButton onPress={placeStart}>
          <ResetButtonText>다시 하기</ResetButtonText>
        </ResetButton>
      </HeaderContainer>

      <ChipsContainer>
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
      </ChipsContainer>
      <ChipsContainer>
        {Array.from({ length: config.roundCount }, (_, i) => (
          <Chip
            key={i}
            label={`R${i + 1}`}
            selected={i === roundIndex}
            onPress={() => setRoundIndex(i)}
          />
        ))}
      </ChipsContainer>

      {error && <ErrorText>{error}</ErrorText>}

      <BoardWrap onLayout={onWrapLayout}>
        <View style={{ width: side, height: side }}>
          <GameBoard s={s} onBoardLayout={onBoardLayout}>
            {walls && size && (
              <PathWall geometry={walls} width={size.w} height={size.h} />
            )}
            {round && size && (
              <PathGuide
                round={round}
                width={size.w}
                height={size.h}
                corridorWidth={
                  config.walls.hasWalls ? config.walls.corridorWidth : undefined
                }
                ballRadius={config.ballRadius}
              />
            )}
            <MagnetPen s={s} />
            <IronBall s={s} />
          </GameBoard>
        </View>
      </BoardWrap>
    </SafeContainer>
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
    <ChipPressable onPress={onPress} selected={selected}>
      <ChipText selected={selected}>{label}</ChipText>
    </ChipPressable>
  );
}

// Styled Components 정의
const SafeContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: #ffe9b8;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 20px;
  padding-vertical: 8px;
`;

const TitleText = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: #8a4b08;
`;

const SubText = styled.Text`
  font-size: 13px;
  color: #a8651c;
  margin-top: 2px;
`;

const ResetButton = styled(Pressable)`
  background-color: #ff8a3d;
  padding-horizontal: 16px;
  padding-vertical: 8px;
  border-radius: 16px;
`;

const ResetButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 700;
`;

const ChipsContainer = styled.View`
  flex-direction: row;
  gap: 8px;
  padding-horizontal: 16px;
  padding-bottom: 8px;
`;

const ChipPressable = styled(Pressable)<{ selected: boolean }>`
  padding-horizontal: 12px;
  padding-vertical: 6px;
  border-radius: 14px;
  background-color: ${({ selected }) => (selected ? "#FF8A3D" : "#FFF3D6")};
  border-width: 2px;
  border-color: ${({ selected }) => (selected ? "#FF8A3D" : "#F5C26B")};
`;

const ChipText = styled.Text<{ selected: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${({ selected }) => (selected ? "#fff" : "#8A4B08")};
`;

const ErrorText = styled.Text`
  color: #b91c1c;
  padding-horizontal: 20px;
  padding-bottom: 4px;
  font-size: 12px;
`;

const BoardWrap = styled.View`
  flex: 1;
  padding-horizontal: 16px;
  padding-bottom: 16px;
  align-items: center;
  justify-content: center;
`;
