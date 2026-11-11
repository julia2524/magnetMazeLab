import { GAME_CONFIG } from "../constants/gameConfig";
import { clamp, distance } from "./collision";
import { magnetAccel } from "./magneticForce";
import { BallMode, type PhysicsShared } from "./physicsTypes";

/** 펜 중심(손가락) 좌표 → 자석 끝 좌표 */
export function getTip(penX: number, penY: number) {
  "worklet";
  return {
    x: penX + GAME_CONFIG.TIP_OFFSET_X,
    y: penY + GAME_CONFIG.TIP_OFFSET_Y,
  };
}

/** 손가락(보드 기준 좌표)이 움직였을 때 펜 위치 갱신. 펜은 보드 안으로 제한. */
export function movePen(
  s: PhysicsShared,
  x: number,
  y: number,
  isBegin: boolean,
) {
  "worklet";
  const px = clamp(x, 0, s.boardW.value);
  const py = clamp(y, 0, s.boardH.value);
  s.penX.value = px;
  s.penY.value = py;
  if (isBegin) {
    // 처음 터치한 순간 속도가 튀지 않도록 기준점을 맞춰 둔다
    const tip = getTip(px, py);
    s.prevTipX.value = tip.x;
    s.prevTipY.value = tip.y;
    s.penVX.value = 0;
    s.penVY.value = 0;
    s.penActive.value = 1;
  }
}

export function resetBall(s: PhysicsShared, x: number, y: number) {
  "worklet";
  s.ballX.value = x;
  s.ballY.value = y;
  s.ballVX.value = 0;
  s.ballVY.value = 0;
  s.ballMode.value = BallMode.FREE;
  s.attachOffX.value = 0;
  s.attachOffY.value = 0;
}

/** 물리 한 스텝. 프레임마다 실제 경과 시간(dt, 초)을 넣어서 호출한다. */
export function stepPhysics(s: PhysicsShared, rawDt: number) {
  "worklet";
  const C = GAME_CONFIG;
  // 프레임이 크게 늦어져도 구슬이 튀지 않도록 dt 상한
  const dt = Math.min(rawDt, C.MAX_DT);
  if (dt <= 0) return;

  const active = s.penActive.value === 1;
  const tip = getTip(s.penX.value, s.penY.value);
  const r = C.BALL_RADIUS;

  // ── 1) 손가락을 뗐다 → 분리 (펜 속도를 약하게 전달) ──
  if (!active && s.ballMode.value === BallMode.ATTACHED) {
    let vx = s.penVX.value * C.RELEASE_INERTIA;
    let vy = s.penVY.value * C.RELEASE_INERTIA;
    const sp = Math.sqrt(vx * vx + vy * vy);
    if (sp > C.MAX_RELEASE_SPEED) {
      vx = (vx / sp) * C.MAX_RELEASE_SPEED;
      vy = (vy / sp) * C.MAX_RELEASE_SPEED;
    }
    s.ballVX.value = vx;
    s.ballVY.value = vy;
    s.ballMode.value = BallMode.RELEASED;
  }

  // ── 2) 자석 끝의 속도 추정 (부드럽게) ──
  const ivx = (tip.x - s.prevTipX.value) / dt;
  const ivy = (tip.y - s.prevTipY.value) / dt;
  const k = Math.min(1, dt * 20);
  s.penVX.value += (ivx - s.penVX.value) * k;
  s.penVY.value += (ivy - s.penVY.value) * k;
  s.prevTipX.value = tip.x;
  s.prevTipY.value = tip.y;

  let bx = s.ballX.value;
  let by = s.ballY.value;
  let vx = s.ballVX.value;
  let vy = s.ballVY.value;

  // ── 3) 부착 상태: 자석 끝 기준으로 위치 계산 (독립 물리 중단) ──
  if (s.ballMode.value === BallMode.ATTACHED) {
    // 상대 오프셋이 0으로 줄어들며 끝부분에 착 달라붙는다.
    // 펜 위치에 오프셋을 더하는 방식이라 빠르게 움직여도 뒤처지지 않는다.
    const decay = Math.exp(-C.ATTACH_SNAP_RATE * dt);
    const ox = s.attachOffX.value * decay;
    const oy = s.attachOffY.value * decay;
    s.attachOffX.value = ox;
    s.attachOffY.value = oy;
    bx = tip.x + ox;
    by = tip.y + oy;
    s.ballVX.value = 0;
    s.ballVY.value = 0;
  } else {
    // ── 4) 자유/분리 상태: 자기력 → 가속 → 속도 → 위치 ──
    if (active) {
      const d = distance(tip.x, tip.y, bx, by);
      if (d <= C.ATTACH_DISTANCE) {
        // 부착! 현재의 상대 위치를 기억해 두고 거기서부터 빨려 들어간다
        s.ballMode.value = BallMode.ATTACHED;
        s.attachOffX.value = bx - tip.x;
        s.attachOffY.value = by - tip.y;
        s.ballVX.value = 0;
        s.ballVY.value = 0;
        return; // 다음 프레임부터 부착 계산
      }
      if (d < C.MAGNET_RANGE) {
        const a = magnetAccel(d);
        vx += ((tip.x - bx) / d) * a * dt;
        vy += ((tip.y - by) / d) * a * dt;
      }
    }

    // 마찰(감속): 프레임 속도와 무관하게 같은 느낌
    const damp = Math.exp(-C.FRICTION * dt);
    vx *= damp;
    vy *= damp;

    // 최대 속도 제한
    const sp = Math.sqrt(vx * vx + vy * vy);
    if (sp > C.MAX_SPEED) {
      vx = (vx / sp) * C.MAX_SPEED;
      vy = (vy / sp) * C.MAX_SPEED;
    }
    // 아주 느려지면 완전히 멈춤
    if (sp < 4) {
      vx = 0;
      vy = 0;
      if (s.ballMode.value === BallMode.RELEASED)
        s.ballMode.value = BallMode.FREE;
    }

    bx += vx * dt;
    by += vy * dt;

    // 벽에 튕김
    const maxX = s.boardW.value - r;
    const maxY = s.boardH.value - r;
    if (bx < r) {
      bx = r;
      vx = Math.abs(vx) * C.WALL_BOUNCE;
    } else if (bx > maxX) {
      bx = maxX;
      vx = -Math.abs(vx) * C.WALL_BOUNCE;
    }
    if (by < r) {
      by = r;
      vy = Math.abs(vy) * C.WALL_BOUNCE;
    } else if (by > maxY) {
      by = maxY;
      vy = -Math.abs(vy) * C.WALL_BOUNCE;
    }

    s.ballVX.value = vx;
    s.ballVY.value = vy;
  }

  // 구슬은 항상 보드 안에 유지
  s.ballX.value = clamp(bx, r, s.boardW.value - r);
  s.ballY.value = clamp(by, r, s.boardH.value - r);
}
