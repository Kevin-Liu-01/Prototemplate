'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The rendered half of the proof: the same <T> block served in eight locales.
 * The panel cycles on its own so the point makes itself, pauses when the
 * reader picks a locale, and never auto-advances under reduced motion.
 */

type Locale = {
  code: string;
  label: string;
  rtl?: boolean;
  heading: string;
  body: string;
};

const LOCALES: readonly Locale[] = [
  { code: 'en', label: 'English', heading: 'Welcome back', body: 'Your projects are ready.' },
  {
    code: 'es',
    label: 'Español',
    heading: 'Bienvenido de nuevo',
    body: 'Tus proyectos están listos.',
  },
  { code: 'fr', label: 'Français', heading: 'Bon retour', body: 'Vos projets sont prêts.' },
  {
    code: 'de',
    label: 'Deutsch',
    heading: 'Willkommen zurück',
    body: 'Ihre Projekte sind bereit.',
  },
  {
    code: 'ja',
    label: '日本語',
    heading: 'おかえりなさい',
    body: 'プロジェクトの準備ができています。',
  },
  {
    code: 'ko',
    label: '한국어',
    heading: '다시 오신 것을 환영합니다',
    body: '프로젝트가 준비되었습니다.',
  },
  { code: 'ar', label: 'العربية', rtl: true, heading: 'مرحبا بعودتك', body: 'مشاريعك جاهزة.' },
  { code: 'zh', label: '中文', heading: '欢迎回来', body: '你的项目已就绪。' },
];

export default function RenderProof() {
  const [active, setActive] = useState(0);
  const hold = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (hold.current) return;
      setActive((a) => (a + 1) % LOCALES.length);
    }, 2600);
    return () => {
      window.clearInterval(id);
      clearTimeout(holdTimer.current);
    };
  }, []);

  const pick = (i: number) => {
    setActive(i);
    hold.current = true;
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      hold.current = false;
    }, 10000);
  };

  const loc = LOCALES[active];

  return (
    <div className='qt-proof-demo'>
      <p className='qt-proof-intro'>
        Every locale below renders from the single <code className='qt-t'>{'<T>'}</code> block
        above.
      </p>
      <div className='qt-proof-tabs'>
        {LOCALES.map((l, i) => (
          <button
            key={l.code}
            type='button'
            className='qt-proof-tab'
            aria-pressed={i === active}
            lang={l.code}
            onClick={() => pick(i)}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className='qt-proof-stage'>
        <div
          className='qt-proof-screen'
          key={loc.code}
          lang={loc.code}
          dir={loc.rtl ? 'rtl' : 'ltr'}
        >
          <span className='qt-proof-chip'>{loc.code}</span>
          <span className='qt-proof-h'>{loc.heading}</span>
          <span className='qt-proof-p'>{loc.body}</span>
        </div>
      </div>
    </div>
  );
}
