'use client';

import { useCallback, useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import './Toast.css';

/**
 * The one-line notice above everything: 'Link to slide 12 copied',
 * 'Slide 12, press Enter', 'Link copied', and the first-visit hint. The
 * element is presentational; useToast() owns the message and the 1400ms
 * hold (a caller may ask for a longer one), and hands ViewerShell the say()
 * it publishes in context.
 */
export const TOAST_HOLD_MS = 1400;

export type ToastProps = {
  message: string;
  /** visible while true; the text stays in place through the fade */
  on: boolean;
};

export function Toast({ message, on }: ToastProps) {
  return (
    <div className={on ? 'pt-toast is-on' : 'pt-toast'} role='status' aria-live='polite'>
      {message}
    </div>
  );
}

export type ToastState = {
  message: string;
  on: boolean;
  /** shows msg for the hold, restarting the timer on every call */
  say: (msg: string, hold?: number) => void;
};

export function useToast(hold: number = TOAST_HOLD_MS): ToastState {
  const [message, setMessage] = useState('');
  const [on, setOn] = useState(false);
  const timer = useRef(0);

  useMountEffect(() => () => window.clearTimeout(timer.current));

  const say = useCallback(
    (msg: string, ms?: number) => {
      setMessage(msg);
      setOn(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setOn(false), ms ?? hold);
    },
    [hold]
  );

  return { message, on, say };
}
