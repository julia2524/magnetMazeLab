// // 모든 단위는 게임 보드 기준 px. 실제 기기에서 테스트하며 조정하세요.
// export const GAME_CONFIG = {
//   // 자석펜 (손가락 = 펜 중심, 자석 끝은 중심에서 위쪽으로 떨어져 있음)
//   // 손가락 위치 = 펜 그림의 중심. 자석 끝(구슬이 붙는 점)은 손가락 위쪽에 있어서 손에 가려지지 않음
//   PEN_WIDTH: 56,
//   PEN_HEIGHT: 170,
//   TIP_OFFSET_X: 0,
//   TIP_OFFSET_Y: -70, // 펜 중심 → 자석 끝 상대 좌표 (펜 그림을 바꾸면 이 값만 조정)

//   // 쇠구슬
//   BALL_RADIUS: 22,

//   // 목표 지점 (현재는 그림용, 도착 판정은 다음 단계에서 사용)
//   GOAL_RADIUS: 36,

//   // 자기력
//   MAGNET_RANGE: 150, // 영향 범위
//   MAGNET_MAX_ACCEL: 2600, // px/s^2 (가까울수록 강함)
//   ATTACH_DISTANCE: 40, // 이 거리 안이면 착! 부착

//   // 이동
//   MAX_SPEED: 900, // px/s
//   FRICTION: 2.5, // 클수록 빨리 멈춤 (구슬이 굴러가는 느낌)
//   WALL_BOUNCE: 0.6, // 벽 반발 계수
//   ATTACH_SNAP_RATE: 22, // 부착 시 끝부분으로 빨려 들어가는 속도
//   RELEASE_INERTIA: 0.9, // 손 뗄 때 펜 속도를 얼마나 전달할지 (0 = 즉시 정지)
//   MAX_RELEASE_SPEED: 700,

//   MAX_DT: 1 / 30, // 프레임이 늦어도 움직임이 튀지 않도록 제한
// };

// 모든 단위는 게임 보드 기준 px. 실제 기기에서 테스트하며 조정하세요.
export const GAME_CONFIG = {
  // 자석펜 (손가락 = 펜 중심, 자석 끝은 중심에서 위쪽으로 떨어져 있음)
  // 손가락 위치 = 펜 그림의 중심. 자석 끝(구슬이 붙는 점)은 손가락 위쪽에 있어서 손에 가려지지 않음
  PEN_WIDTH: 56,
  PEN_HEIGHT: 170,
  TIP_OFFSET_X: 0,
  TIP_OFFSET_Y: -70, // 펜 중심 → 자석 끝 상대 좌표 (펜 그림을 바꾸면 이 값만 조정)

  // 쇠구슬
  BALL_RADIUS: 22,

  // 목표 지점 (현재는 그림용, 도착 판정은 다음 단계에서 사용)
  GOAL_RADIUS: 36,

  // 자기력
  MAGNET_RANGE: 150, // 영향 범위
  MAGNET_MAX_ACCEL: 2600, // px/s^2 (가까울수록 강함)
  ATTACH_DISTANCE: 40, // 이 거리 안이면 착! 부착

  // 이동
  MAX_SPEED: 900, // px/s
  FRICTION: 2.5, // 클수록 빨리 멈춤 (구슬이 굴러가는 느낌)
  WALL_BOUNCE: 0.6, // 벽 반발 계수
  ATTACH_SNAP_RATE: 22, // 부착 시 끝부분으로 빨려 들어가는 속도
  RELEASE_INERTIA: 0.9, // 손 뗄 때 펜 속도를 얼마나 전달할지 (0 = 즉시 정지)
  MAX_RELEASE_SPEED: 700,

  // 벽 충돌
  COLLISION_STEP: 8, // 한 번에 이동할 최대 거리(px). 빠른 이동도 이 간격으로 쪼개 검사해서 벽을 뛰어넘지 못함
  MAX_FOLLOW_STEPS: 80, // 부착 상태에서 한 프레임에 따라갈 수 있는 최대 횟수 (80 × 8px)
  WALL_RESTITUTION: 0.2, // 벽에 부딪힐 때 살짝 튕기는 정도 (0 = 안 튕김)
  DETACH_DISTANCE: 90, // 벽에 막혀 자석 끝과 이만큼 멀어지면 자석이 구슬을 놓침

  MAX_DT: 1 / 30, // 프레임이 늦어도 움직임이 튀지 않도록 제한
};
