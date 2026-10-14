'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { ChevronDown, X } from 'lucide-react';

import { useMountEffect } from '@/lib/use-mount-effect';

import { COOKIE_POLICY_URL } from './site-links';

import './prod-chrome.css';

/**
 * The live site's cookie consent (gt-cloud packages/ui
 * src/components/analytics/cookie-banner.tsx and
 * dialog/CookieSettingsDialog.tsx), rebuilt as a stub. A first visit shows
 * the "We value your privacy" card with Accept, Reject all and Customize;
 * Customize, and Manage Cookies in the footer (V0Footer dispatches
 * OPEN_SETTINGS), open the Cookie Settings dialog. The mirror loads no
 * analytics, so the choice is only remembered in this browser's
 * localStorage under CONSENT_KEY: nothing is captured, no cookie is set
 * and no General Translation service is called.
 */
export const CONSENT_KEY = 'pt-mirror-consent';

/** The window event the footer's Manage Cookies button sends. */
export const OPEN_SETTINGS = 'pt-mirror-consent:settings';

type Consent = 'yes' | 'no';

function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'yes' || value === 'no' ? value : null;
  } catch {
    return null;
  }
}

function writeConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // private mode: the choice holds for this page only
  }
}

function Switch({ checked, disabled, label, onChange }: { checked: boolean; disabled?: boolean; label: string; onChange?: (next: boolean) => void }) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className='pc-switch'
      disabled={disabled}
      role='switch'
      type='button'
      onClick={() => onChange?.(!checked)}
    >
      <span className='pc-switch-thumb' />
    </button>
  );
}

function Row({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className='pc-dialog-row'>
        <button aria-expanded={open} className='pc-dialog-trigger' type='button' onClick={() => setOpen(!open)}>
          <span>{title}</span>
          <ChevronDown aria-hidden strokeWidth={2} />
        </button>
        {children}
      </div>
      {open ? <p className='pc-dialog-more'>{body}</p> : null}
    </div>
  );
}

function SettingsDialog({ onClose }: { onClose: () => void }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useMountEffect(() => {
    setConsent(readConsent());
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  });

  return (
    <>
      <div aria-hidden className='pc-overlay' onClick={() => onClose()} />
      <div
        aria-describedby='pc-dialog-desc'
        aria-labelledby='pc-dialog-title'
        aria-modal='true'
        className='pc-dialog'
        ref={dialogRef}
        role='dialog'
        tabIndex={-1}
      >
        <div className='pc-dialog-head'>
          <h2 className='pc-dialog-title' id='pc-dialog-title'>
            Cookie Settings
          </h2>
          <p className='pc-dialog-desc' id='pc-dialog-desc'>
            We use cookies to improve your browsing experience and to understand how you use our website. See
            our <a href={COOKIE_POLICY_URL}>Cookie Policy</a> for more information.
          </p>
        </div>
        <div className='pc-dialog-rows'>
          <Row
            body='These cookies help us understand how you use our website. We use this data to improve our services and enhance your experience.'
            title='Analytics Cookies'
          >
            <Switch
              checked={consent === 'yes'}
              label='Toggle analytics cookies'
              onChange={(next) => setConsent(next ? 'yes' : 'no')}
            />
          </Row>
          <Row
            body='These cookies are necessary for the website to function properly. They enable core functionality such as page navigation and language preferences. These cookies cannot be disabled.'
            title='Essential Cookies'
          >
            <Switch checked disabled label='Essential cookies always enabled' />
          </Row>
        </div>
        <div className='pc-dialog-foot'>
          <button className='pc-btn' type='button' onClick={() => onClose()}>
            Cancel
          </button>
          <button
            className='pc-btn is-primary'
            type='button'
            onClick={() => {
              /* no choice made reads as a decline, as live's handleSave does */
              writeConsent(consent ?? 'no');
              onClose();
            }}
          >
            Save
          </button>
        </div>
        <button className='pc-dialog-close' type='button' onClick={() => onClose()}>
          <X aria-hidden strokeWidth={2} />
          <span className='pn-sr'>Close</span>
        </button>
      </div>
    </>
  );
}

export default function ConsentBanner() {
  /* undecided until the client reads storage, so the server render and
     the first client render agree and show nothing */
  const [decided, setDecided] = useState(true);
  const [settings, setSettings] = useState(false);

  useMountEffect(() => {
    setDecided(readConsent() !== null);
    const open = () => setSettings(true);
    window.addEventListener(OPEN_SETTINGS, open);
    return () => window.removeEventListener(OPEN_SETTINGS, open);
  });

  const choose = (value: Consent) => {
    writeConsent(value);
    setDecided(true);
  };

  return (
    <>
      {!decided && !settings ? (
        <div className='pc-consent'>
          <div className='pc-consent-in'>
            <div className='pc-consent-title'>We value your privacy</div>
            <p className='pc-consent-text'>
              General Translation uses analytics cookies to understand how you use our site. Please accept
              cookies to help us improve your experience.
            </p>
            <div className='pc-consent-actions'>
              <div className='pc-consent-pair'>
                <button className='pc-btn is-primary' type='button' onClick={() => choose('yes')}>
                  Accept
                </button>
                <button className='pc-btn' type='button' onClick={() => choose('no')}>
                  Reject all
                </button>
              </div>
              <button className='pc-btn' type='button' onClick={() => setSettings(true)}>
                Customize
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {settings ? (
        <SettingsDialog
          onClose={() => {
            setSettings(false);
            setDecided(readConsent() !== null);
          }}
        />
      ) : null}
    </>
  );
}
