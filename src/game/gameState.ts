/**
 * 게임 진행 규칙 (순수 로직 · 화면/물리와 분리).
 * 라운드 결과(성공/실패) → 별 → 레벨 결과까지를 하나의 reducer 로 관리한다.
 * 성공/실패는 phase 가 PLAYING 일 때만 받아들이므로, 같은 라운드에서 두 번 실행되지 않는다.
 */

export const PASS_STARS = 3; // 레벨 통과에 필요한 별 수 (5개 중). 기획에 맞게 조정
export const AUTO_ADVANCE_MS = 1800; // 라운드 결과 표시 후 자동으로 다음 라운드로 넘어가는 시간

export type RoundResult = "success" | "fail" | null;
export type Phase = "PLAYING" | "ROUND_RESULT" | "LEVEL_RESULT";

export interface GameState {
  levelId: number;
  roundIndex: number;
  roundCount: number;
  /** 라운드별 결과. 아직 안 한 라운드는 null */
  results: RoundResult[];
  phase: Phase;
  /** 방금 끝난 라운드의 결과 (ROUND_RESULT 표시용) */
  lastResult: "success" | "fail" | null;
  /** 라운드(재)시작마다 +1. 타이머/배치/중복 방지의 기준 */
  serial: number;
}

export type GameAction =
  | { type: "SUCCESS" }
  | { type: "FAIL" }
  | { type: "NEXT" }
  | { type: "RESTART_ROUND" }
  | { type: "START_LEVEL"; levelId: number; roundCount: number };

export function createGame(
  levelId: number,
  roundCount: number,
  serial = 0,
): GameState {
  return {
    levelId,
    roundIndex: 0,
    roundCount,
    results: Array.from({ length: roundCount }, () => null),
    phase: "PLAYING",
    lastResult: null,
    serial,
  };
}

export function gameReducer(s: GameState, a: GameAction): GameState {
  switch (a.type) {
    case "SUCCESS":
    case "FAIL": {
      if (s.phase !== "PLAYING") return s; // 이미 확정된 라운드 → 무시 (중복 방지)
      const kind = a.type === "SUCCESS" ? "success" : "fail";
      const results = s.results.slice();
      results[s.roundIndex] = kind;
      return { ...s, results, lastResult: kind, phase: "ROUND_RESULT" };
    }
    case "NEXT": {
      if (s.phase !== "ROUND_RESULT") return s;
      if (s.roundIndex + 1 >= s.roundCount) {
        return { ...s, phase: "LEVEL_RESULT" };
      }
      return {
        ...s,
        roundIndex: s.roundIndex + 1,
        phase: "PLAYING",
        lastResult: null,
        serial: s.serial + 1,
      };
    }
    case "RESTART_ROUND": {
      if (s.phase !== "PLAYING") return s;
      return { ...s, serial: s.serial + 1 };
    }
    case "START_LEVEL":
      return createGame(a.levelId, a.roundCount, s.serial + 1);
  }
}

export function starsOf(results: readonly RoundResult[]): number {
  return results.filter((r) => r === "success").length;
}

export function isLevelPassed(results: readonly RoundResult[]): boolean {
  return starsOf(results) >= PASS_STARS;
}

/** 실제 경과 시간(Date.now 기준)으로 계산한 남은 시간(ms). 프레임 수와 무관 */
export function remainingMs(
  startMs: number,
  nowMs: number,
  totalMs: number,
): number {
  return Math.max(0, Math.min(totalMs, totalMs - (nowMs - startMs)));
}
