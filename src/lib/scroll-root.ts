/**
 * The nearest ancestor of `el` that scrolls on its own, or null when the
 * page itself scrolls. /components holds its plates in the shell's flow
 * sheet, which scrolls while the page stands still, so an observer or a
 * scroll watch rooted at the page never sees a plate there cross its
 * margin; rooted at this element, it does.
 */
export function scrollRoot(el: Element): Element | null {
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
  }
  return null;
}
