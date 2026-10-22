/**
 * Drag to turn, for the 3D plates. A horizontal drag turns the object
 * about its vertical axis and a vertical drag tilts it, within a limit.
 * The host keeps touch-action: pan-y, so on a phone a vertical swipe still
 * scrolls the page and a horizontal one turns the scene. On release the
 * turn coasts and slows (and, with a rest pose, eases back to it); under
 * reduced motion it stops where the pointer left it and returns to rest at
 * once. Arrow keys turn and tilt in steps when the host has focus.
 */

export type Turn = { yaw: number; pitch: number; dragging: boolean };

export type DragOptions = {
  el: HTMLElement;
  turn: Turn;
  onChange: () => void;
  /** radians per CSS pixel */
  rate?: number;
  pitchLimit?: number;
  /** a pose to ease back to after release */
  rest?: { yaw: number; pitch: number };
  reduced: () => boolean;
};

export function attachDrag({ el, turn, onChange, rate = 0.008, pitchLimit = 0.6, rest, reduced }: DragOptions): () => void {
  let id = -1;
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let velocity = 0;
  let frame = 0;

  const clampPitch = (p: number) => Math.max(-pitchLimit, Math.min(pitchLimit, p));

  const stopCoast = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const coast = () => {
    let prev = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      turn.yaw += velocity * dt;
      velocity *= Math.exp(-dt * 3.2);
      let moving = Math.abs(velocity) > 0.02;
      if (rest) {
        const k = 1 - Math.exp(-dt * 3);
        const dy = rest.yaw - turn.yaw;
        const dp = rest.pitch - turn.pitch;
        turn.yaw += dy * k * (Math.abs(velocity) < 0.6 ? 1 : 0.2);
        turn.pitch += dp * k;
        moving = moving || Math.abs(dy) > 0.002 || Math.abs(dp) > 0.002;
      }
      onChange();
      frame = moving ? requestAnimationFrame(step) : 0;
    };
    frame = requestAnimationFrame(step);
  };

  const settle = () => {
    if (reduced()) {
      if (rest) {
        turn.yaw = rest.yaw;
        turn.pitch = rest.pitch;
      }
      onChange();
      return;
    }
    coast();
  };

  const down = (event: PointerEvent) => {
    if (event.button !== 0 || id !== -1) return;
    id = event.pointerId;
    el.setPointerCapture(id);
    stopCoast();
    velocity = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    lastT = event.timeStamp;
    turn.dragging = true;
  };

  const move = (event: PointerEvent) => {
    if (event.pointerId !== id) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    const dt = Math.max(1, event.timeStamp - lastT) / 1000;
    lastX = event.clientX;
    lastY = event.clientY;
    lastT = event.timeStamp;
    turn.yaw += dx * rate;
    if (event.pointerType === 'mouse') turn.pitch = clampPitch(turn.pitch + dy * rate);
    velocity = velocity * 0.6 + ((dx * rate) / dt) * 0.4;
    onChange();
  };

  const up = (event: PointerEvent) => {
    if (event.pointerId !== id) return;
    if (el.hasPointerCapture(id)) el.releasePointerCapture(id);
    id = -1;
    turn.dragging = false;
    if (event.timeStamp - lastT > 90) velocity = 0;
    settle();
  };

  const key = (event: KeyboardEvent) => {
    const step = 0.2;
    if (event.key === 'ArrowLeft') turn.yaw -= step;
    else if (event.key === 'ArrowRight') turn.yaw += step;
    else if (event.key === 'ArrowUp') turn.pitch = clampPitch(turn.pitch - step);
    else if (event.key === 'ArrowDown') turn.pitch = clampPitch(turn.pitch + step);
    else return;
    event.preventDefault();
    stopCoast();
    onChange();
  };

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('keydown', key);
  return () => {
    stopCoast();
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
    el.removeEventListener('keydown', key);
  };
}
