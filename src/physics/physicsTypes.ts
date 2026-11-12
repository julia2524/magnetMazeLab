import type { SharedValue } from "react-native-reanimated";

// 쇠구슬 상태 (worklet에서 쓰기 편하도록 숫자 상수로 정의)
export const BallMode = {
  FREE: 0, // 자유 상태
  ATTACHED: 1, // 자석펜에 부착
  RELEASED: 2, // 방금 분리되어 굴러가는 중
} as const;

// 물리 계산과 렌더링이 함께 읽고 쓰는 값들. 전부 "게임 보드 기준 좌표"다.
export interface PhysicsShared {
  // 보드 크기
  boardW: SharedValue<number>;
  boardH: SharedValue<number>;

  // 쇠구슬
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  ballVX: SharedValue<number>;
  ballVY: SharedValue<number>;
  ballMode: SharedValue<number>;
  ballRadius: SharedValue<number>; // 레벨마다 다를 수 있음
  // 부착 시 (구슬 - 자석끝) 상대 좌표. 0으로 서서히 줄어들며 "착!" 하고 빨려 붙는다
  attachOffX: SharedValue<number>;
  attachOffY: SharedValue<number>;

  // 자석펜 (손가락 위치 = 펜 중심)
  penX: SharedValue<number>;
  penY: SharedValue<number>;
  penActive: SharedValue<number>; // 1 = 터치 중
  penVX: SharedValue<number>; // 자석 끝의 부드러운 속도 (손 뗄 때 관성에 사용)
  penVY: SharedValue<number>;
  prevTipX: SharedValue<number>;
  prevTipY: SharedValue<number>;

  // 벽 (라운드 시작 때 한 번 계산해서 넣어 두고, 매 프레임 읽기만 한다)
  wallSegs: SharedValue<number[]>; // 통로 중심선 선분 [ax, ay, bx, by, ...] (보드 px)
  wallCount: SharedValue<number>; // 선분 개수. 0 이면 벽 없음(충돌 안 함)
  wallReach: SharedValue<number>; // 구슬 "중심"이 중심선에서 떨어질 수 있는 최대 거리
}
