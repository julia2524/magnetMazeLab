import { GAME_CONFIG } from "../constants/gameConfig";

/**
 * 목적지 도착 영역 반지름(px). 화면에 그리는 목적지 표시와 판정이 같은 값을 쓴다.
 * 통로 끝(반원) 안에 들어가도록 통로 반폭보다 살짝 작게 제한한다.
 */
export function goalRadiusFor(corridorWidth?: number): number {
  return corridorWidth
    ? Math.min(GAME_CONFIG.GOAL_RADIUS, corridorWidth / 2 - 3)
    : GAME_CONFIG.GOAL_RADIUS;
}

/** 공의 "중심"이 목적지 원 안에 들어오면 도착. radius <= 0 이면 목적지 없음. 실제 게임 좌표 기준 */
export function isArrived(
  ballX: number,
  ballY: number,
  goalX: number,
  goalY: number,
  radius: number,
): boolean {
  "worklet";
  if (radius <= 0) return false;
  const dx = ballX - goalX;
  const dy = ballY - goalY;
  return dx * dx + dy * dy <= radius * radius;
}
