/** The elements a Tab press can land on, before the visibility check. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** True when `el` has a box and is not hidden by `visibility`, so focus() can reach it. */
function reachable(el: HTMLElement): boolean {
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility === 'visible';
}

/**
 * Keeps Tab inside `container`, for a modal sheet or dialog: Tab on the
 * last reachable control wraps to the first, Shift+Tab on the first wraps
 * to the last, and a Tab pressed while focus is outside the container
 * brings it back in. Call it from a keydown handler; other keys pass.
 */
export function holdTab(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(reachable);
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;
  const active = document.activeElement;
  const inside = active instanceof Node && container.contains(active);
  if (event.shiftKey && (active === first || !inside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !inside)) {
    event.preventDefault();
    first.focus();
  }
}
