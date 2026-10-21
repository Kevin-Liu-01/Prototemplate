'use client';

import { useRef, useState } from 'react';

import DoubledLine from '@/components/shared/diagrams/DoubledLine';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Choice, Range, Toggle } from './controls';
import { useReducedMotion } from './hooks';
import Plate from './Plate';

/* two sources merge into a trunk, and the trunk fans out to three outputs */
const FORK_A = 'M40 62 C170 62 210 130 330 130';
const FORK_B = 'M40 198 C170 198 210 130 330 130';
const TRUNK = 'M330 130 L470 130';
const OUTS = [
  'M470 130 C570 130 580 52 680 52',
  'M470 130 L680 130',
  'M470 130 C570 130 580 208 680 208',
] as const;
/* each split region is the center path closed off the top edge, so the upper thread takes the first ink */
const split = (d: string, x0: number, x1: number) => `${d} L${x1} -20 L${x0} -20 Z`;
const STATIC_PULSE = 'M360 130 L440 130';

type Pulse = 'off' | 'still' | 'moving';
type PulseInk = 'accent' | 'ink';
type Trace = { pts: readonly { x: number; y: number }[]; length: number };

/** Samples a path once in user space, one point per unit; null for an empty path. */
function trace(el: SVGPathElement): Trace | null {
  const length = el.getTotalLength();
  if (!length) return null;
  const steps = Math.max(2, Math.ceil(length));
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const p = el.getPointAtLength((i / steps) * length);
    return { x: p.x, y: p.y };
  });
  return { pts, length };
}

/** The slice of a trace between two distances as M ... L ..., or '' when the window is off it. */
function slice(t: Trace, from: number, to: number): string {
  const a = Math.max(0, from);
  const b = Math.min(t.length, to);
  if (b <= a) return '';
  const step = t.length / (t.pts.length - 1);
  const out: string[] = [];
  for (let d = a; d < b; d += step) {
    const p = t.pts[Math.min(t.pts.length - 1, Math.round(d / step))];
    if (p) out.push(`${out.length ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  }
  const end = t.pts[Math.min(t.pts.length - 1, Math.round(b / step))];
  if (end) out.push(`${out.length ? 'L' : 'M'}${end.x.toFixed(1)} ${end.y.toFixed(1)}`);
  return out.length > 1 ? out.join('') : '';
}

/**
 * The doubled line, live. Every connector is one DoubledLine: a center
 * path stroked at full gauge in ink, then at the gap in the ground, which
 * carves two threads. The forks and the outputs draw first and the trunk
 * last, so its core paints both junctions back into one clean pair. The
 * moving pulse is geometry: each path is sampled once and the pulse's d is
 * rewritten to the slice under a traveling window, one window per journey
 * from a source through the trunk to an output.
 */
export default function DoubledLineDemo() {
  const reduced = useReducedMotion();
  const svg = useRef<SVGSVGElement>(null);
  const [gauge, setGauge] = useState(1.5);
  const [gap, setGap] = useState(3);
  const [twoTone, setTwoTone] = useState(false);
  const [showCore, setShowCore] = useState(false);
  const [pulse, setPulse] = useState<Pulse>('moving');
  const [pulseInk, setPulseInk] = useState<PulseInk>('accent');
  const full = gauge * 2 + gap;
  const moving = pulse === 'moving' && !reduced;

  useLayoutWork(
    () => {
      const root = svg.current;
      if (!root || !moving) return;
      const get = (name: string) => root.querySelector<SVGPathElement>(`[data-dl-base="${name}"]`);
      const forkA = get('a');
      const forkB = get('b');
      const trunk = get('trunk');
      const outs = OUTS.map((_, k) => get(`out-${k}`));
      if (!forkA || !forkB || !trunk || outs.some((o) => !o)) return;
      const tA = trace(forkA);
      const tB = trace(forkB);
      const tT = trace(trunk);
      const tO = outs.map((o) => (o ? trace(o) : null));
      if (!tA || !tB || !tT || tO.some((t) => !t)) return;

      /* journey k: source (k even: A, odd: B), the trunk, then output k */
      const journeys = OUTS.map((_, k) => {
        const src = k % 2 === 0 ? tA : tB;
        const out = tO[k] as Trace;
        const pulses = {
          src: root.querySelector<SVGPathElement>(`[data-dl-pulse="${k % 2 === 0 ? 'a' : 'b'}-${k}"]`),
          trunk: root.querySelector<SVGPathElement>(`[data-dl-pulse="trunk-${k}"]`),
          out: root.querySelector<SVGPathElement>(`[data-dl-pulse="out-${k}"]`),
        };
        return { src, out, pulses, total: src.length + tT.length + out.length };
      });

      const SPEED = 150; // user units per second
      const WINDOW = 46;
      const longest = Math.max(...journeys.map((j) => j.total)) + WINDOW;
      const period = longest / SPEED + 0.6;
      let frame = 0;
      let start = 0;
      let visible = true;

      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        if (!visible) return;
        if (!start) start = now;
        const t = (now - start) / 1000;
        journeys.forEach((j, k) => {
          const local = (t - (k * period) / journeys.length + period * 4) % period;
          const head = local * SPEED;
          const from = head - WINDOW;
          const a = j.src.length;
          const b = a + tT.length;
          j.pulses.src?.setAttribute('d', slice(j.src, from, head));
          j.pulses.trunk?.setAttribute('d', slice(tT, from - a, head - a));
          j.pulses.out?.setAttribute('d', slice(j.out, from - b, head - b));
        });
      };
      frame = requestAnimationFrame(tick);

      const io = new IntersectionObserver((entries) => {
        visible = entries.some((e) => e.isIntersecting);
      });
      io.observe(root);

      return () => {
        cancelAnimationFrame(frame);
        io.disconnect();
        root.querySelectorAll<SVGPathElement>('[data-dl-pulse]').forEach((p) => p.setAttribute('d', ''));
      };
    },
    { dependencies: [moving], revertOnUpdate: true }
  );

  const core = showCore ? 'var(--dmo-core-shown)' : 'var(--dmo-ground)';
  const ink = 'var(--dmo-ink)';
  const inkB = twoTone ? 'var(--dmo-ink-soft)' : undefined;
  const pulseStroke = pulseInk === 'accent' ? 'var(--dmo-accent)' : 'var(--dmo-ink)';
  const pulseProps = {
    fill: 'none',
    stroke: pulseStroke,
    strokeWidth: full,
    vectorEffect: 'non-scaling-stroke' as const,
  };
  const pulses = (keys: readonly string[]) =>
    pulse === 'moving' ? keys.map((key) => <path d='' data-dl-pulse={key} key={key} {...pulseProps} />) : null;

  return (
    <Plate
      controls={
        <>
          <Range format={(v) => `${v}px`} label='Gauge' max={3} min={0.5} step={0.5} value={gauge} onChange={setGauge} />
          <Range format={(v) => `${v}px`} label='Gap' max={7} min={1} step={0.5} value={gap} onChange={setGap} />
          <Choice
            label='Pulse'
            options={[
              { value: 'off', label: 'Off' },
              { value: 'still', label: 'Still' },
              { value: 'moving', label: 'Moving' },
            ]}
            value={pulse}
            onChange={setPulse}
          />
          <Choice
            label='Pulse ink'
            options={[
              { value: 'accent', label: 'Accent' },
              { value: 'ink', label: 'Ink' },
            ]}
            value={pulseInk}
            onChange={setPulseInk}
          />
          <Toggle label='Two-Tone' pressed={twoTone} onChange={setTwoTone} />
          <Toggle label='Show Core' pressed={showCore} onChange={setShowCore} />
        </>
      }
      height={280}
      label='Doubled-line connectors: two sources merge into a trunk that fans out to three outputs'
      moves
      phoneHeight={200}
      tag={`<DoubledLine gauge={${gauge}} gap={${gap}} />`}
    >
      <svg aria-hidden='true' className='dmo-dl' preserveAspectRatio='xMidYMid meet' ref={svg} viewBox='0 0 720 260'>
        {/* the measured center paths, never painted */}
        <g className='dmo-dl-trace'>
          <path d={FORK_A} data-dl-base='a' />
          <path d={FORK_B} data-dl-base='b' />
          <path d={TRUNK} data-dl-base='trunk' />
          {OUTS.map((d, k) => (
            <path d={d} data-dl-base={`out-${k}`} key={d} />
          ))}
        </g>
        <DoubledLine core={core} d={FORK_A} gap={gap} gauge={gauge} ink={ink} inkB={inkB} splitD={split(FORK_A, 40, 330)}>
          {pulses(['a-0', 'a-2'])}
        </DoubledLine>
        <DoubledLine core={core} d={FORK_B} gap={gap} gauge={gauge} ink={ink} inkB={inkB} splitD={split(FORK_B, 40, 330)}>
          {pulses(['b-1'])}
        </DoubledLine>
        {OUTS.map((d, k) => (
          <DoubledLine
            core={core}
            d={d}
            gap={gap}
            gauge={gauge}
            ink={ink}
            inkB={inkB}
            key={d}
            splitD={split(d, 470, 680)}
          >
            {pulses([`out-${k}`])}
          </DoubledLine>
        ))}
        <DoubledLine core={core} d={TRUNK} gap={gap} gauge={gauge} ink={ink} inkB={inkB} splitD={split(TRUNK, 330, 470)}>
          {pulse === 'still' || (pulse === 'moving' && reduced) ? <path d={STATIC_PULSE} {...pulseProps} /> : null}
          {pulses(['trunk-0', 'trunk-1', 'trunk-2'])}
        </DoubledLine>
      </svg>
    </Plate>
  );
}
