'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import './delivery.css';

/**
 * The greyed-out deploy. Upper panel: the dashboard editor with a Spanish
 * string mid-edit and Save pressed. Middle: the build pipeline drawn as four
 * hairline stages — with `build` and `deploy` at 25% opacity and struck
 * through by a single 1.5px line, because the CDN serves the fix without
 * them. Lower: a phone-width frame already running, its text changed in
 * place. The fork states the trade-off instead of claiming both.
 *
 * The strike is measured off the two skipped stages at mount so it crosses
 * exactly those boxes at every width.
 */

/* Five real rows — the information floor for a list artifact — with the one
   being fixed at the bottom, mid-keystroke. */
const ROWS: readonly { k: string; v: string; state?: string; save?: boolean; caret?: boolean }[] = [
  { k: 'checkout.getStarted', v: '"Comenzar ahora"', state: 'saved' },
  { k: 'checkout.helloWorld', v: '"¡Hola, mundo!"', state: 'saved' },
  { k: 'checkout.continue', v: '"Continuar"', state: 'saved' },
  { k: 'checkout.orderSummary', v: '"Resumen del pedido"', state: 'saved' },
  { k: 'checkout.paymentReceived', v: '"Pago recibido', caret: true, save: true },
];

const STAGES: readonly { name: string; skip?: boolean }[] = [
  { name: 'commit' },
  { name: 'build', skip: true },
  { name: 'deploy', skip: true },
  { name: 'live' },
];

export type OtaPipelineProps = {
  className?: string;
  title?: string;
};

export default function OtaPipeline({ className, title }: OtaPipelineProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const pipe = root.current?.querySelector<HTMLElement>('.dlv-pipe');
      const strike = root.current?.querySelector<HTMLElement>('.dlv-pipe-strike');
      if (!pipe || !strike) return;

      const place = () => {
        const skipped = pipe.querySelectorAll<HTMLElement>('[data-skip]');
        if (skipped.length < 2) return;
        const first = skipped[0];
        const last = skipped[skipped.length - 1];
        const left = first.offsetLeft - 8;
        const right = last.offsetLeft + last.offsetWidth + 8;
        strike.style.left = `${left}px`;
        strike.style.width = `${right - left}px`;
      };

      place();
      window.addEventListener('resize', place);
      return () => window.removeEventListener('resize', place);
    },
    { scope: root }
  );

  return (
    <div
      className={['dlv-ota', className].filter(Boolean).join(' ')}
      ref={root}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <div className='dlv-panel'>
        <div className='dlv-panel-bar'>
          <span>editor — es</span>
          <span>dashboard</span>
        </div>
        <div className='dlv-ota-rows'>
          {ROWS.map((row) => (
            <div className='dlv-ota-row' key={row.k}>
              <span>{row.k}</span>
              <span>
                {row.v}
                {row.caret ? <i className='dlv-caret-d' /> : null}
                {row.caret ? '"' : null}
              </span>
              {row.save ? (
                <span className='dlv-ota-save'>Save</span>
              ) : (
                <span className='dlv-ota-state'>{row.state}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className='dlv-pipe'>
        {STAGES.map((stage, i) => (
          <span style={{ display: 'contents' }} key={stage.name}>
            {i > 0 ? <span className='dlv-pipe-join' aria-hidden='true' /> : null}
            <span className='dlv-pipe-stage' data-skip={stage.skip || undefined}>
              {stage.name}
            </span>
          </span>
        ))}
        <span className='dlv-pipe-strike' aria-hidden='true' />
      </div>

      <div className='dlv-ota-bottom'>
        <div className='dlv-page'>
          <div className='dlv-page-bar'>
            <b>acme.com/es</b>
            <span className='dlv-loc'>es</span>
          </div>
          <div className='dlv-phone-body'>
            <div className='dlv-phone-h'>Pago recibido</div>
            <div className='dlv-phone-meta'>
              <span className='dlv-chip'>no deploy</span>
              <span>edge · v215 live</span>
            </div>
          </div>
        </div>

        <div className='dlv-tradeoff'>
          <span>
            <b>CDN</b> — update live
          </span>
          <span>bundled JSON — redeploy to update</span>
        </div>
      </div>
    </div>
  );
}
