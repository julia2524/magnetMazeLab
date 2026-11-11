import { GAME_CONFIG } from "../constants/gameConfig";
import { clamp, distance } from "./collision";
import { magnetAccel } from "./magneticForce";
import { BallMode, type PhysicsShared } from "./physicsTypes";
import { moveWithWalls, resolveWalls } from "./wallCollision";

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

/**
 * 보드 경계 + 경로 벽 충돌을 한 번에 적용.
 * 경로 벽이 있으면 중심선 reach 안으로 되돌리고, 없으면 보드 테두리만 처리.
 */
function clampToBoardAndWalls(
  s: PhysicsShared,
  x: number,
  y: number,
  r: number,
): { x: number; y: number; hit: boolean; nx: number; ny: number } {
  "worklet";
  const segs = s.wallSegs.value;
  const count = s.wallCount.value;
  const reach = s.wallReach.value;

  let cx = x;
  let cy = y;
  let hit = false;
  let nx = 0;
  let ny = 0;

  // 경로 벽 (Level 1 은 count=0 → 스킵)
  if (count > 0 && reach > 0) {
    const res = resolveWalls(segs, count, reach, cx, cy);
    cx = res.x;
    cy = res.y;
    hit = res.hit;
    nx = res.nx;
    ny = res.ny;
  }

  // 보드 테두리
  const maxX = s.boardW.value - r;
  const maxY = s.boardH.value - r;
  if (cx < r) {
    cx = r;
    hit = true;
    nx = 1;
    ny = 0;
  } else if (cx > maxX) {
    cx = maxX;
    hit = true;
    nx = -1;
    ny = 0;
  }
  if (cy < r) {
    cy = r;
    hit = true;
    nx = 0;
    ny = 1;
  } else if (cy > maxY) {
    cy = maxY;
    hit = true;
    nx = 0;
    ny = -1;
  }

  return { x: cx, y: cy, hit, nx, ny };
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
  // 레벨마다 구슬 크기가 다를 수 있음
  const r = s.ballRadius.value > 0 ? s.ballRadius.value : C.BALL_RADIUS;

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

  const segs = s.wallSegs.value;
  const wallCount = s.wallCount.value;
  const reach = s.wallReach.value;
  const step = C.COLLISION_STEP;

  // ── 3) 부착 상태: 자석 끝을 따라가되 벽은 뚫지 않음 ──
  if (s.ballMode.value === BallMode.ATTACHED) {
    // 상대 오프셋이 0으로 줄어들며 끝부분에 착 달라붙는다
    const decay = Math.exp(-C.ATTACH_SNAP_RATE * dt);
    const ox = s.attachOffX.value * decay;
    const oy = s.attachOffY.value * decay;
    s.attachOffX.value = ox;
    s.attachOffY.value = oy;

    const targetX = tip.x + ox;
    const targetY = tip.y + oy;

    // 벽이 있으면 작은 걸음으로 따라가며 충돌 보정
    if (wallCount > 0 && reach > 0) {
      const moved = moveWithWalls(
        segs,
        wallCount,
        reach,
        bx,
        by,
        targetX,
        targetY,
        step,
        C.MAX_FOLLOW_STEPS,
      );
      bx = moved.x;
      by = moved.y;

      // 보드 경계도 유지
      const clamped = clampToBoardAndWalls(s, bx, by, r);
      bx = clamped.x;
      by = clamped.y;

      // 자석 끝과 너무 멀어지면 분리 (벽에 막혀 따라가지 못함)
      const distToTip = distance(bx, by, tip.x, tip.y);
      if (distToTip > C.DETACH_DISTANCE) {
        s.ballMode.value = BallMode.RELEASED;
        s.ballVX.value = s.penVX.value * C.RELEASE_INERTIA * 0.5;
        s.ballVY.value = s.penVY.value * C.RELEASE_INERTIA * 0.5;
      }
    } else {
      // 벽 없음 (Level 1): 그대로 따라감
      bx = targetX;
      by = targetY;
      const clamped = clampToBoardAndWalls(s, bx, by, r);
      bx = clamped.x;
      by = clamped.y;
    }

    s.ballVX.value = 0;
    s.ballVY.value = 0;
  } else {
    // ── 4) 자유/분리 상태: 자기력 → 가속 → 속도 → 위치 ──
    if (active) {
      const d = distance(tip.x, tip.y, bx, by);
      if (d <= C.ATTACH_DISTANCE) {
        // 부착! 현재의 상대 위치를 기억해 두고 거기서부터 빨려 들어간다
        // 단, 벽에 막혀 있지 않은 경우에만 (이미 통로 안이어야 함)
        s.ballMode.value = BallMode.ATTACHED;
        s.attachOffX.value = bx - tip.x;
        s.attachOffY.value = by - tip.y;
        s.ballVX.value = 0;
        s.ballVY.value = 0;
        s.ballX.value = bx;
        s.ballY.value = by;
        return; // 다음 프레임부터 부착 계산
      }
      if (d < C.MAGNET_RANGE && d > 0.001) {
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
      // 정지해도 통로 밖으로 나가지 않게 보정
      const idle = clampToBoardAndWalls(s, bx, by, r);
      bx = idle.x;
      by = idle.y;
    }

    // 연속 충돌(Swept): 한 번에 step 이상 움직이지 않고 매 걸음마다 벽 보정
    // 빠른 이동에도 벽을 뚫지 않도록 남은 시간을 나눠 이동
    let remaining = dt;
    if (wallCount > 0 && reach > 0) {
      const maxIter = C.MAX_FOLLOW_STEPS;
      for (let iter = 0; iter < maxIter && remaining > 1e-5; iter++) {
        const spd = Math.sqrt(vx * vx + vy * vy);
        if (spd < 0.5) {
          vx = 0;
          vy = 0;
          break;
        }
        // 이번 걸음에서 이동할 거리 (최대 step px)
        const stepDt = Math.min(remaining, step / spd);
        const nx0 = bx + vx * stepDt;
        const ny0 = by + vy * stepDt;
        const res = clampToBoardAndWalls(s, nx0, ny0, r);
        if (res.hit) {
          // 벽에 부딪힘 → 법선 방향 속도 성분 제거 + 약한 반발 → 벽을 따라 미끄러짐
          const vn = vx * res.nx + vy * res.ny;
          if (vn < 0) {
            vx -= (1 + C.WALL_RESTITUTION) * vn * res.nx;
            vy -= (1 + C.WALL_RESTITUTION) * vn * res.ny;
          }
        }
        bx = res.x;
        by = res.y;
        remaining -= stepDt;
      }
    } else {
      // 벽 없음: 한 번에 이동 후 보드 경계만
      bx += vx * dt;
      by += vy * dt;
      const res = clampToBoardAndWalls(s, bx, by, r);
      if (res.hit) {
        const vn = vx * res.nx + vy * res.ny;
        if (vn < 0) {
          vx -= (1 + C.WALL_BOUNCE) * vn * res.nx;
          vy -= (1 + C.WALL_BOUNCE) * vn * res.ny;
        }
      }
      bx = res.x;
      by = res.y;
    }

    s.ballVX.value = vx;
    s.ballVY.value = vy;
  }

  // 최종 위치 확정 (항상 보드 안 + 벽 안)
  const final = clampToBoardAndWalls(s, bx, by, r);
  s.ballX.value = final.x;
  s.ballY.value = final.y;
}
