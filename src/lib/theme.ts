/**
 * The site's theme. It lives on <html data-theme>, so every stylesheet
 * remaps its tokens under [data-theme='dark'], and the choice persists
 * under one key, gt-theme, which the boot script in src/app/layout.tsx
 * applies before first paint. Dark is the default when nothing is saved
 * (decision 2). The shell's ThemeButton, the docs switch, the D key and
 * every framing page read and write it through these functions.
 */
export type Theme = 'light' | 'dark';

export const THEME_KEY = 'gt-theme';

export const DEFAULT_THEME: Theme = 'dark';

/** The glyph names the theme the page is in: the left half filled in light, the right half in dark. */
export const THEME_GLYPH: Record<Theme, string> = { light: '◐', dark: '◑' };

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/** The saved choice, or null when nothing is saved or storage is unavailable. */
export function loadTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return isTheme(saved) ? saved : null;
  } catch {
    // private mode: the attribute alone carries the choice for the session
    return null;
  }
}

/** The theme on <html>, or the default when the attribute is missing. */
export function readTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  return isTheme(current) ? current : DEFAULT_THEME;
}

/**
 * The message a theme change posts to every same-origin frame on the page.
 * Every framed site page (the boot script in src/app/layout.tsx) applies it
 * live. The frames also follow the gt-theme storage event, so the message
 * is the path that holds when storage does not (a private window), and the
 * one the presenter's LazyFrame.tsx uses to hand a freshly loaded frame the
 * current theme.
 */
export type ThemeMessage = { type: 'gt-theme'; theme: Theme };

/** Posts the theme to one frame's window; a frame that left the origin never receives it. */
export function postTheme(target: Window | null | undefined, theme: Theme): void {
  if (!target) return;
  const message: ThemeMessage = { type: 'gt-theme', theme };
  try {
    target.postMessage(message, window.location.origin);
  } catch {
    // a detached frame: nothing to tell
  }
}

/** Stamps the attribute, persists the choice and tells every frame on the page. */
function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // private mode: the switch still works for the session
  }
  document.querySelectorAll('iframe').forEach((frame) => postTheme(frame.contentWindow, theme));
}

/** Flips the theme and returns the new one. */
export function toggleTheme(): Theme {
  const next: Theme = readTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

/** Calls `onChange` whenever <html data-theme> changes; returns the unsubscribe. */
export function onThemeChange(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}
