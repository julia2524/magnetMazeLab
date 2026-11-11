import { GAME_CONFIG } from "../constants/gameConfig";

/**
 * 거리 d에서 구슬이 받는 자기력 가속도 크기(px/s²).
 * - 영향 범위 밖: 0 (멀리 있으면 전혀 안 움직임)
 * - 범위 가장자리: 0에서 시작해 가까워질수록 부드럽게 강해짐 (t²)
 * - 최대값은 MAGNET_MAX_ACCEL로 제한해서 급격한 움직임 방지
 */
export function magnetAccel(d: number): number {
  "worklet";
  const range = GAME_CONFIG.MAGNET_RANGE;
  if (d >= range) return 0;
  const t = 1 - d / range; // 0(멀다) ~ 1(딱 붙음)
  return GAME_CONFIG.MAGNET_MAX_ACCEL * t * t;
}
