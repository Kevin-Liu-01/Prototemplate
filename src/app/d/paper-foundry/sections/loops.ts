import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The foundry's slow work loops. After the entrance cascade settles, the
 * plate keeps machining: each part cell advances its localization content on
 * its own slot of ONE 12s master period, slots 2.4s apart, so at any instant
 * exactly one thing is happening on the plate — never two, never none for
 * long. Every swap is designed to read composed mid-flight (a chip
 * re-measuring, a fan stroke drawing, a card flipping direction), because any
 * grabbed frame is a poster.
 *
 * Reduced motion: no loops — the SSR state (ja pair, four-file fan, en
 * plurals, fr toast, ar RTL card) is itself a composed still. The width
 * readout under the translated chip is still filled in once, since an empty
 * dimension line would read as a fault.
 */

type ChipStep = {
  /** Right slot of the cell label, e.g. 'fr — français'. */
  label: string;
  lang: string;
  text: string;
};

/* The source string is 'Continue', so every leg is that string's real
   translation — 계속하기, not 시작하기 ('get started'), which would be a
   different key. */
const BUTTON_STEPS: readonly ChipStep[] = [
  { label: 'ja — 日本語', lang: 'ja', text: '続ける' },
  { label: 'fr — français', lang: 'fr', text: 'Continuer' },
  { label: 'de — Deutsch', lang: 'de', text: 'Fortfahren' },
  { label: 'ko — 한국어', lang: 'ko', text: '계속하기' },
];

const TOAST_STEPS: readonly ChipStep[] = [
  { label: 'fr — français', lang: 'fr', text: 'Paiement reçu' },
  { label: 'es — español', lang: 'es', text: 'Pago recibido' },
  { label: 'de — Deutsch', lang: 'de', text: 'Zahlung erhalten' },
];

/* The fan's fourth slot — the plate periodically emits one more locale over
   the air. es/ja/de stay seated; this slot cycles. */
const FAN_STEPS: readonly string[] = ['pl.json', 'ar.json', 'ko.json', 'tr.json', 'pt.json'];

type BidiStep = ChipStep & { dir: 'ltr' | 'rtl' };

/* Arabic lands every other pass, so the card demonstrably flips LTR→RTL and
   back — direction is the payload here, not just the string. */
const BIDI_STEPS: readonly BidiStep[] = [
  { label: 'ar — العربية', lang: 'ar', dir: 'rtl', text: 'مرحبًا بعودتك يا سارة' },
  { label: 'fr — français', lang: 'fr', dir: 'ltr', text: 'Bon retour, Sarah' },
  { label: 'ar — العربية', lang: 'ar', dir: 'rtl', text: 'مرحبًا بعودتك يا سارة' },
  { label: 'ja — 日本語', lang: 'ja', dir: 'ltr', text: 'おかえりなさい、サラさん' },
];

type PluralRow = { text: string; cat: string };

type PluralStep = {
  label: string;
  lang: string;
  rows: readonly [PluralRow, PluralRow, PluralRow];
};

/* Same three counts through three grammars — Polish is the reason the cell
   exists: its 'few' form only shows up when the plural machinery is real. */
const PLURAL_STEPS: readonly PluralStep[] = [
  {
    label: 'en — 2 forms',
    lang: 'en',
    rows: [
      { text: '1 file', cat: 'one' },
      { text: '2 files', cat: 'other' },
      { text: '5 files', cat: 'other' },
    ],
  },
  {
    label: 'de — 2 forms',
    lang: 'de',
    rows: [
      { text: '1 Datei', cat: 'one' },
      { text: '2 Dateien', cat: 'other' },
      { text: '5 Dateien', cat: 'other' },
    ],
  },
  {
    label: 'pl — 3 forms',
    lang: 'pl',
    rows: [
      { text: '1 plik', cat: 'one' },
      { text: '2 pliki', cat: 'few' },
      { text: '5 plików', cat: 'many' },
    ],
  },
];

/** Fades the given label/text element out, swaps its text, fades it back. */
function fadeSwap(tl: gsap.core.Timeline, el: HTMLElement, text: string, at: number): void {
  tl.to(el, { autoAlpha: 0, duration: 0.14, ease: 'power1.in' }, at);
  tl.add(() => {
    el.textContent = text;
  }, at + 0.15);
  tl.to(el, { autoAlpha: 1, duration: 0.24, ease: 'power1.out' }, at + 0.2);
}

export function useFoundryLoops(scope: RefObject<HTMLElement | null>): void {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const find = (key: string): HTMLElement | null =>
        root.querySelector<HTMLElement>(`[data-loop='${key}']`);

      const chip = find('chip');
      const chipText = find('chip-text');
      const chipDim = find('chip-dim');
      const chipLabel = find('chip-label');
      const fanPath = find('fan-path');
      const fanText = find('fan-text');
      const pluLabel = find('plu-label');
      const pluWrap = find('plu');
      const pluVals = gsap.utils.toArray<HTMLElement>("[data-loop='plu-val']", root);
      const pluCats = gsap.utils.toArray<HTMLElement>("[data-loop='plu-cat']", root);
      const toast = find('toast');
      const toastText = find('toast-text');
      const toastLabel = find('toast-label');
      const bidiRow = find('bidi-row');
      const bidiLabel = find('bidi-label');

      /* The dimension readout is live-measured, never authored: it must match
         the chip the browser actually laid out, or the caliper is a lie. */
      const writeDim = () => {
        if (chip && chipDim) chipDim.textContent = `${Math.round(chip.offsetWidth)}px`;
      };
      writeDim();
      void document.fonts?.ready.then(writeDim);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      /* --- the translated button chip re-measures per locale --- */
      let buttonIdx = 0;
      const swapButton = () => {
        if (!chip || !chipText || !chipLabel) return;
        buttonIdx = (buttonIdx + 1) % BUTTON_STEPS.length;
        const step = BUTTON_STEPS[buttonIdx];
        if (!step) return;
        const tl = gsap.timeline();
        fadeSwap(tl, chipLabel, step.label, 0);
        tl.to(chipText, { y: -7, autoAlpha: 0, duration: 0.16, ease: 'power2.in' }, 0);
        tl.add(() => {
          const w0 = chip.offsetWidth;
          chipText.textContent = step.text;
          chip.setAttribute('lang', step.lang);
          /* Measure the settled width for the incoming string, then animate
             the box from the old width to it — the visible re-measure. */
          gsap.set(chip, { width: 'auto' });
          const w1 = chip.offsetWidth;
          gsap.set(chip, { width: w0 });
          gsap.to(chip, {
            width: w1,
            duration: 0.38,
            ease: 'power3.inOut',
            onUpdate: writeDim,
            onComplete: () => {
              gsap.set(chip, { width: 'auto' });
              writeDim();
            },
          });
          gsap.fromTo(
            chipText,
            { y: 7 },
            { y: 0, autoAlpha: 1, duration: 0.24, ease: 'power2.out', delay: 0.16 }
          );
        }, 0.18);
      };

      /* --- the fan emits one more locale file --- */
      let fanIdx = 0;
      const swapFan = () => {
        if (!fanPath || !fanText) return;
        fanIdx = (fanIdx + 1) % FAN_STEPS.length;
        const step = FAN_STEPS[fanIdx];
        if (!step) return;
        const tl = gsap.timeline();
        tl.to(fanText, { autoAlpha: 0, y: 3, duration: 0.16, ease: 'power1.in' }, 0);
        tl.to(fanPath, { strokeDashoffset: 1, duration: 0.26, ease: 'power1.in' }, 0);
        tl.add(() => {
          fanText.textContent = step;
        }, 0.3);
        tl.to(fanPath, { strokeDashoffset: 0, duration: 0.42, ease: 'power2.out' }, 0.32);
        tl.fromTo(
          fanText,
          { y: 4 },
          { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' },
          0.55
        );
      };

      /* --- plural forms cycle grammars, category column included --- */
      let pluralIdx = 0;
      const swapPlurals = () => {
        if (!pluLabel || pluVals.length === 0) return;
        pluralIdx = (pluralIdx + 1) % PLURAL_STEPS.length;
        const step = PLURAL_STEPS[pluralIdx];
        if (!step) return;
        const tl = gsap.timeline();
        fadeSwap(tl, pluLabel, step.label, 0);
        tl.to([...pluVals, ...pluCats], {
          autoAlpha: 0,
          y: -4,
          duration: 0.16,
          stagger: 0.04,
          ease: 'power1.in',
        }, 0);
        tl.add(() => {
          pluWrap?.setAttribute('lang', step.lang);
          pluVals.forEach((el, i) => {
            el.textContent = step.rows[i]?.text ?? '';
          });
          pluCats.forEach((el, i) => {
            el.textContent = step.rows[i]?.cat ?? '';
          });
        }, 0.3);
        tl.fromTo(
          [...pluVals, ...pluCats],
          { y: 5 },
          { autoAlpha: 1, y: 0, duration: 0.26, stagger: 0.045, ease: 'power2.out' },
          0.34
        );
      };

      /* --- the translated toast rotates locales --- */
      let toastIdx = 0;
      const swapToast = () => {
        if (!toast || !toastText || !toastLabel) return;
        toastIdx = (toastIdx + 1) % TOAST_STEPS.length;
        const step = TOAST_STEPS[toastIdx];
        if (!step) return;
        const tl = gsap.timeline();
        fadeSwap(tl, toastLabel, step.label, 0);
        tl.to(toastText, { y: -6, autoAlpha: 0, duration: 0.16, ease: 'power2.in' }, 0);
        tl.add(() => {
          const w0 = toast.offsetWidth;
          toastText.textContent = step.text;
          toast.setAttribute('lang', step.lang);
          gsap.set(toast, { width: 'auto' });
          const w1 = toast.offsetWidth;
          gsap.set(toast, { width: w0 });
          gsap.to(toast, {
            width: w1,
            duration: 0.32,
            ease: 'power3.inOut',
            onComplete: () => gsap.set(toast, { width: 'auto' }),
          });
          gsap.fromTo(
            toastText,
            { y: 6 },
            { y: 0, autoAlpha: 1, duration: 0.24, ease: 'power2.out', delay: 0.14 }
          );
        }, 0.18);
      };

      /* --- the greeting flips LTR→RTL when Arabic lands --- */
      let bidiIdx = 0;
      const swapBidi = () => {
        if (!bidiRow || !bidiLabel) return;
        bidiIdx = (bidiIdx + 1) % BIDI_STEPS.length;
        const step = BIDI_STEPS[bidiIdx];
        if (!step) return;
        const rtl = step.dir === 'rtl';
        const tl = gsap.timeline();
        fadeSwap(tl, bidiLabel, step.label, 0);
        /* Leave toward the side the old text was anchored on; arrive from the
           incoming direction's own side, so the flip is legible as motion. */
        tl.to(bidiRow, { x: rtl ? -8 : 8, autoAlpha: 0, duration: 0.18, ease: 'power2.in' }, 0);
        tl.add(() => {
          bidiRow.textContent = step.text;
          bidiRow.setAttribute('dir', step.dir);
          bidiRow.setAttribute('lang', step.lang);
        }, 0.22);
        tl.fromTo(
          bidiRow,
          { x: rtl ? 10 : -10 },
          { x: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out' },
          0.26
        );
      };

      /* The emitting fan stroke gets its dash space once, up front — under
         reduced motion this never runs and the path renders solid. */
      if (fanPath) gsap.set(fanPath, { strokeDasharray: 1, strokeDashoffset: 0 });

      /* One master period; the 3.6s lead leaves the entrance cascade and its
         gloss sweeps a clear stage. Slots 2.4s apart, swaps under 1s. */
      const master = gsap.timeline({ repeat: -1, delay: 3.6 });
      master.call(swapButton, [], 0);
      master.call(swapFan, [], 2.4);
      master.call(swapPlurals, [], 4.8);
      master.call(swapToast, [], 7.2);
      master.call(swapBidi, [], 9.6);
      master.to({}, { duration: 12 }, 0);

      /* The plate machines only while it is on stage. */
      ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) master.play();
          else master.pause();
        },
      });
    },
    { scope }
  );
}
