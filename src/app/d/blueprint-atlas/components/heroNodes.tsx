import type { ReactNode } from 'react';

/**
 * The component pairs that ride the burst.
 *
 * Each entry is rendered twice: the English face outbound on the left arm of
 * its ray and the translated face outbound on the right arm, at the same
 * offset. Every `out` face is a real translation of its `en` face — the point
 * of the gate is that correct localized copy comes out the other side, so
 * nothing here is placeholder glyphs.
 */
export type HeroNode = {
  id: string;
  /** Index into FAN_DEG: the ray this pair rides, mirrored on both arms. */
  ray: number;
  /** Starting progress (0–1) of the outward run. */
  phase: number;
  /** Seconds for a full lens-to-rim run. */
  duration: number;
  rtl?: boolean;
  en: ReactNode;
  out: ReactNode;
};

export const HERO_NODES: HeroNode[] = [
  {
    id: 'cta',
    ray: 2,
    phase: 0.62,
    duration: 15,
    en: <span className='ba-mini-btn'>Get started</span>,
    out: <span className='ba-mini-btn'>始める</span>,
  },
  {
    id: 'toast',
    ray: 4,
    phase: 0.3,
    duration: 14,
    en: <>Payment received</>,
    out: <>Paiement reçu</>,
  },
  {
    id: 'field',
    ray: 0,
    phase: 0.5,
    duration: 17,
    en: (
      <span className='ba-mini-field'>
        Email address
        <span className='ba-box'>you@work.com</span>
      </span>
    ),
    out: (
      <span className='ba-mini-field'>
        Correo electrónico
        <span className='ba-box'>tu@trabajo.com</span>
      </span>
    ),
  },
  {
    id: 'price',
    ray: 5,
    phase: 0.74,
    duration: 16,
    en: (
      <>
        Pro · <b>$12</b>/mo
      </>
    ),
    out: (
      <>
        Pro · <b>12&nbsp;€</b>/Monat
      </>
    ),
  },
  {
    id: 'nav',
    ray: 1,
    phase: 0.16,
    duration: 15,
    en: <span className='ba-mini-nav'>Home&nbsp;&nbsp;Pricing&nbsp;&nbsp;Docs</span>,
    out: <span className='ba-mini-nav'>홈&nbsp;&nbsp;요금제&nbsp;&nbsp;문서</span>,
  },
  {
    id: 'signin',
    ray: 3,
    phase: 0.88,
    duration: 16,
    rtl: true,
    en: <span className='ba-mini-nav'>Sign in</span>,
    out: <span className='ba-mini-nav'>تسجيل الدخول</span>,
  },
  {
    id: 'locale',
    ray: 2,
    phase: 0.12,
    duration: 18,
    en: <>Language: English</>,
    out: <>语言：中文</>,
  },
  {
    id: 'search',
    ray: 5,
    phase: 0.42,
    duration: 19,
    en: (
      <span className='ba-mini-field'>
        Search
        <span className='ba-box'>Search the docs…</span>
      </span>
    ),
    out: (
      <span className='ba-mini-field'>
        Rechercher
        <span className='ba-box'>Rechercher dans la doc…</span>
      </span>
    ),
  },
  {
    id: 'plan',
    ray: 1,
    phase: 0.72,
    duration: 20,
    en: <span className='ba-mini-nav'>Upgrade plan</span>,
    out: <span className='ba-mini-nav'>Plano superior</span>,
  },
  {
    id: 'toggle',
    ray: 4,
    phase: 0.84,
    duration: 18,
    en: <>Dark mode</>,
    out: <>Modo oscuro</>,
  },
  {
    id: 'welcome',
    ray: 0,
    phase: 0.06,
    duration: 21,
    en: <>Welcome back!</>,
    out: <>Bentornato!</>,
  },
  {
    id: 'invoice',
    ray: 3,
    phase: 0.34,
    duration: 17,
    en: <>Invoice paid</>,
    out: <>Rechnung bezahlt</>,
  },
];
