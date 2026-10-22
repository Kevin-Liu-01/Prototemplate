'use client';

/**
 * Shows a control's hover and focus states at rest, from the page's own
 * rules. On a call it reads every same-origin stylesheet, takes each rule
 * whose selector names one of the given classes with :hover,
 * :focus-visible or :focus-within, and writes a copy whose pseudo-class
 * also matches inside an element marked data-ixa-force="hover" or
 * data-ixa-force="focus". The copies go into one style element, so a
 * specimen cell draws exactly what the live control draws, and a change to
 * the shell's sheets reaches the specimen with no edit here.
 */

export type ForcedState = 'hover' | 'focus';

const PSEUDOS: Record<ForcedState, readonly string[]> = {
  hover: [':hover'],
  focus: [':focus-visible', ':focus-within'],
};

const STYLE_ID = 'ixa-forced-states';

/** Splits a selector list on its top-level commas, leaving the commas inside :is() and :has() alone. */
function splitList(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i += 1) {
    const ch = list[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    else if (ch === ',' && depth === 0) {
      out.push(list.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(list.slice(start).trim());
  return out.filter(Boolean);
}

/** One selector with the state's pseudo-classes rewritten, or null when it holds none or holds one under :not(). */
function rewrite(selector: string, state: ForcedState): string | null {
  const pseudos = PSEUDOS[state];
  if (!pseudos.some((pseudo) => selector.includes(pseudo))) return null;
  if (/:not\([^)]*:(hover|focus)/.test(selector)) return null;
  const mark = `:is([data-ixa-force~='${state}'], [data-ixa-force~='${state}'] *)`;
  let out = selector;
  for (const pseudo of pseudos) out = out.split(pseudo).join(mark);
  return out;
}

function collect(rules: CSSRuleList, classes: readonly string[], out: string[]): void {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      const text = rule.selectorText;
      if (!classes.some((name) => text.includes(name))) continue;
      const forced: string[] = [];
      for (const selector of splitList(text)) {
        if (!classes.some((name) => selector.includes(name))) continue;
        for (const state of ['hover', 'focus'] as const) {
          const next = rewrite(selector, state);
          if (next) forced.push(next);
        }
      }
      if (forced.length > 0) out.push(`${forced.join(', ')} { ${rule.style.cssText} }`);
    } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
      const inner: string[] = [];
      collect(rule.cssRules, classes, inner);
      if (inner.length > 0) {
        const at = rule instanceof CSSMediaRule ? `@media ${rule.conditionText}` : `@supports ${rule.conditionText}`;
        out.push(`${at} { ${inner.join('\n')} }`);
      }
    } else if ('cssRules' in rule && rule.cssRules instanceof CSSRuleList) {
      collect(rule.cssRules, classes, out);
    }
  }
}

/** Writes (or rewrites) the forced copies of every hover and focus rule that names one of `classes`. */
export function forceStates(classes: readonly string[]): () => void {
  const out: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      /* a cross-origin sheet: nothing of the shell's lives there */
      continue;
    }
    collect(rules, classes, out);
  }
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = out.join('\n');
  const owned = style;
  return () => owned.remove();
}
