'use client';

import { useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { LANGS, type LangCode } from '../stories';
import { onRadioKeys, radioTab } from './radios';

type Props = {
  value: LangCode;
  onPick: (code: LangCode) => void;
  onPeek: (code: LangCode | null) => void;
  children: ReactNode;
};

/** How long the pointer rests on a code before the globe turns to it, and off the ring before it turns back, in ms. */
const PEEK_MS = 140;
const UNPEEK_MS = 220;

/** The ring's step between languages, in degrees. */
const STEP = 360 / LANGS.length;

const indexOf = (code: LangCode) =>
  Math.max(
    0,
    LANGS.findIndex((l) => l.code === code)
  );

/** The shortest turn, in degrees, that brings the language at `to` to where the one at `from` stands. */
function shortest(from: number, to: number): number {
  return (((((from - to) * STEP) % 360) + 540) % 360) - 180;
}

/* The language the titles are set in, as codes round the globe's dial
   (front-page.css, .gtp-ring), so the dial's ring has a use: the chosen code
   stands at the dial's right; under the pointer, in focus, or on a tap of
   the chosen code, the others stand out round it; a pick turns the ring the
   short way until the chosen code is at the right, and the others fold back
   into the rim. While it is open its hit area runs out to the codes, so the
   pointer can cross from the dial to any of them; resting on a code turns
   the globe to its city (onPeek), after a short wait so a pointer that
   passes over the codes does not spin it; the dial's tick ring turns so a
   long tick points at the pointer. Each code's name is its own
   language's name for itself, for a screen reader. `children` is the globe
   in its dial. */
export default function LanguageRing({
  value,
  onPick,
  onPeek,
  children,
}: Props) {
  const dial = useRef<HTMLDivElement>(null);
  const aim = useRef({ turn: 0, frame: 0 });
  // the dial's tick ring turns the short way until a long tick (one every 90 degrees, one at the right at rest) points at
  // the pointer, or back to the chosen language at the right; once a frame at most
  const point = (x?: number, y?: number) => {
    cancelAnimationFrame(aim.current.frame);
    aim.current.frame = requestAnimationFrame(() => {
      const el = dial.current;
      if (!el) return;
      let target = 0;
      if (x !== undefined && y !== undefined) {
        const b = el.getBoundingClientRect();
        target =
          (Math.atan2(y - (b.top + b.height / 2), x - (b.left + b.width / 2)) *
            180) /
          Math.PI;
      }
      aim.current.turn +=
        ((((target - aim.current.turn) % 90) + 135) % 90) - 45;
      el.style.setProperty('--point', `${aim.current.turn.toFixed(1)}deg`);
    });
  };
  const peekTimer = useRef(0);
  const peek = (code: LangCode | null) => {
    window.clearTimeout(peekTimer.current);
    peekTimer.current = window.setTimeout(
      () => onPeek(code),
      code ? PEEK_MS : UNPEEK_MS
    );
  };
  // the ring's turn follows the chosen language, however it was chosen, the short way round
  const [ring, setRing] = useState({
    code: value,
    turn: -indexOf(value) * STEP,
  });
  if (ring.code !== value)
    setRing({
      code: value,
      turn: ring.turn + shortest(indexOf(ring.code), indexOf(value)),
    });
  // folded after a pick until the pointer leaves; opened on a touch screen by a tap on the chosen code
  const [shut, setShut] = useState(false);
  const [tapped, setTapped] = useState(false);
  return (
    <div
      ref={dial}
      className='gtp-dial'
      data-open={tapped || undefined}
      data-shut={shut || undefined}
      onPointerMove={(e) => point(e.clientX, e.clientY)}
      onPointerLeave={() => {
        setShut(false);
        peek(null);
        point();
      }}
    >
      {children}
      <div
        className='gtp-ring'
        role='radiogroup'
        aria-label='Language of the titles'
        onKeyDown={onRadioKeys}
      >
        {LANGS.map((l, i) => {
          const on = l.code === value;
          return (
            <button
              key={l.code}
              type='button'
              role='radio'
              aria-checked={on}
              tabIndex={radioTab(on)}
              aria-label={l.name}
              className='gtp-ring-code'
              data-testid={`atlas-ring-${l.code}`}
              style={
                {
                  '--a': `${i * STEP + ring.turn}deg`,
                  '--k': (i - indexOf(value) + LANGS.length) % LANGS.length,
                } as CSSProperties
              }
              onPointerEnter={() => peek(l.code)}
              onPointerLeave={() => peek(null)}
              onClick={() => {
                if (on) {
                  setShut(false);
                  setTapped((t) => !t);
                  return;
                }
                setShut(true);
                setTapped(false);
                window.clearTimeout(peekTimer.current);
                onPeek(null);
                onPick(l.code);
              }}
            >
              {l.code.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
