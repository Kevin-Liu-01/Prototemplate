'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';

import FieldEffectsMenu from '@/components/shared/FieldEffectsMenu';
import {
  createPrismaticField,
  type PrismaticEffectMode,
  type PrismaticFieldHandle,
  type PrismaticParams,
} from '@/lib/prismatic-field';

const EFFECT_MODES: readonly PrismaticEffectMode[] = ['lens', 'dither', 'chroma'];

function isEffectMode(value: string): value is PrismaticEffectMode {
  return (EFFECT_MODES as readonly string[]).includes(value);
}

export type PrismaticFieldProps = {
  /** '1' = wide horizontal burst, '2' = arc/dome over a dark core. */
  preset?: '1' | '2';
  /** Higher exposureScale = dimmer. Raise it when content sits on top. */
  params?: Partial<PrismaticParams>;
  /** Device pixel ratio cap. The soft upscale is part of the look; keep at or below 1. */
  dpr?: number;
  speed?: number;
  className?: string;
  /**
   * Retained for call-site compatibility. Offscreen fields are always skipped
   * by the shared engine, so this no longer has an effect.
   */
  pauseOffscreen?: boolean;
  /**
   * Cursor-reactive effect modes for this field — hover the field and the
   * burst reacts around the cursor. Opting in is explicit: either this prop,
   * or a `data-fx="lens dither chroma"` attribute on any ancestor of the
   * mount. Every field without either behaves exactly as before.
   */
  effects?: readonly PrismaticEffectMode[];
  /** Mode engaged on mount before any stored choice. Defaults to the first of `effects`. */
  defaultEffect?: PrismaticEffectMode | 'off';
  /**
   * The docked bottom-right options menu. Defaults to on whenever effects
   * are given; set false for opted-in fields that have no room for chrome.
   */
  effectsMenu?: boolean;
  /** localStorage key for the committed mode; defaults to the page's path. */
  persistKey?: string;
};

type MenuState = {
  modes: readonly PrismaticEffectMode[];
  selected: PrismaticEffectMode | 'off';
};

/**
 * The canonical prismatic light field — a raw-WebGL port of the reference shader.
 *
 * Renders nothing but a canvas (plus, for effect-enabled fields, the quiet
 * effects menu docked bottom-right of the positioned parent); callers
 * position it. Falls back to a transparent canvas when WebGL is unavailable,
 * so the parent must supply its own dark background rather than relying on
 * this for base color.
 *
 * Pointer tracking for effects attaches to the nearest `[data-fx]` ancestor
 * when one exists, else to the canvas's parent — the hero plate — so the
 * whole plate is the hover surface. The committed mode persists per page.
 */
export default function PrismaticField({
  preset = '1',
  params,
  dpr = 1,
  speed = 1,
  className,
  effects,
  defaultEffect,
  effectsMenu,
  persistKey,
}: PrismaticFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<PrismaticFieldHandle | null>(null);
  const storageKeyRef = useRef<string>('');
  const [menu, setMenu] = useState<MenuState | null>(null);

  /* Stable dependency for the (rare) case of a literal array prop. */
  const effectsKey = effects?.join(' ');

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* The declarative tag: any ancestor carrying data-fx opts the field in
       and becomes the pointer host ("a tag where I can add hover effects").
       Searched from the parent — the canvas reflects data-fx itself, and
       closest() would otherwise match the mount. */
    const declaredHost = canvas.parentElement?.closest<HTMLElement>('[data-fx]') ?? null;
    const requested: readonly string[] =
      effects ?? (declaredHost?.dataset.fx ?? '').split(/\s+/).filter(Boolean);
    const modes = requested.filter(isEffectMode);
    const host = declaredHost ?? canvas.parentElement;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* The committed mode persists per page (or per explicit key). */
    storageKeyRef.current = persistKey ?? `gt-fx:${window.location.pathname}`;
    let initial: PrismaticEffectMode | 'off' = defaultEffect ?? modes[0] ?? 'off';
    if (modes.length > 0) {
      try {
        const stored = window.localStorage.getItem(storageKeyRef.current);
        if (stored === 'off' || (stored !== null && isEffectMode(stored) && modes.includes(stored))) {
          initial = stored as PrismaticEffectMode | 'off';
        }
      } catch {
        /* storage unavailable (private mode) — the default stands */
      }
    }

    const field = createPrismaticField(canvas, {
      preset,
      dpr,
      speed,
      params,
      effects:
        !reduced && modes.length > 0 && host !== null
          ? { host, modes, initial }
          : undefined,
    });
    if (!field) return;
    handleRef.current = field;
    canvas.dataset.fxMode = field.getEffectMode();

    if (!reduced && modes.length > 0 && (effectsMenu ?? true)) {
      setMenu({ modes, selected: field.getEffectMode() });
    }

    return () => {
      handleRef.current = null;
      field.destroy();
    };
  }, [preset, dpr, speed, effectsKey]);

  const select = (mode: PrismaticEffectMode | 'off') => {
    setMenu((current) => (current ? { ...current, selected: mode } : current));
    handleRef.current?.setEffectMode(mode);
    const canvas = canvasRef.current;
    if (canvas) canvas.dataset.fxMode = mode;
    try {
      window.localStorage.setItem(storageKeyRef.current, mode);
    } catch {
      /* best effort — the session still switches */
    }
  };

  const preview = (mode: PrismaticEffectMode | 'off' | null) => {
    handleRef.current?.setEffectMode(mode ?? menu?.selected ?? 'off');
  };

  return (
    <>
      <canvas ref={canvasRef} className={className} aria-hidden data-fx={effectsKey} />
      {menu !== null ? (
        <FieldEffectsMenu
          modes={menu.modes}
          selected={menu.selected}
          onSelect={select}
          onPreview={preview}
        />
      ) : null}
    </>
  );
}
