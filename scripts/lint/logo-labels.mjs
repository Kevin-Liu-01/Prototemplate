/**
 * The label half of the logo lock: a picture or film the manifest
 * (scripts/lint/logo.json) holds as history shows the previous mark, so
 * every page that shows it says so beside it. pnpm lint:logo reads the
 * deck (its slides and the built public/brand-deck.html) on every run;
 * pnpm lint:logo --built reads the pages next build prerendered, and
 * pnpm build runs it.
 *
 * In the markup, every attribute that shows a history picture (src,
 * srcset, poster, data-dark and the other data- attributes, a style url(),
 * an SVG image href, the /_next/image?url= form; not a link's href or a
 * download) has a scope, and the scope's text must say what the picture shows
 * (LABEL). The scope is the nearest element, the tag itself included, that
 * carries data-previous-mark, else the nearest figure, p, li, article, tr or
 * section. A reference with no scope fails. A <section> (a deck slide) is
 * the loosest scope, so in one it needs as many labelling sentences as it shows
 * history pictures (a picture's light and dark twins count as one); a
 * grid of them under one caption marks its wrapper, caption included,
 * with data-previous-mark. The document head (preloads,
 * og:image) is skipped: it shows nothing.
 *
 * A picture drawn only after the page loads (a client component's state)
 * is not in the prerendered markup; its component reads
 * src/lib/previous-mark.ts, which takes the same list, and pnpm lint:logo
 * --dom (logo-dom.mjs) reads the page in a browser as a reader sees it.
 */

/** What a label says: the note in src/lib/previous-mark.ts, a film's note, or a caption's own words. */
export const LABEL = /previous mark|before the (?:logo|globe)|predates the logo/i;

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const SCOPES = new Set(['figure', 'p', 'li', 'article', 'tr', 'section']);
const TAG = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g;
/* a picture or film address inside an attribute value */
const ASSET = /(?:^|[\s"'(,=])((?:\/|\.\/)?[A-Za-z0-9_\-./]+\.(?:png|jpe?g|webp|gif|avif|svg|mp4|webm|mov))(?=[\s"'),?#&]|$)/gi;

const blank = (s) => s.replace(/[^\n]/g, ' ');
const ATTR = /([^\s=>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
/** True when the attribute puts a picture on the page: a link's href or a download names the file without showing it. */
const shows = (tag, attr) =>
  ['src', 'srcset', 'poster', 'style', 'background'].includes(attr) || attr.startsWith('data-') || ((attr === 'href' || attr === 'xlink:href') && (tag === 'image' || tag === 'use'));

/** A picture's path with its content hash (the built deck's a.1f2e3d4c.jpg) and theme suffix dropped, so its light and dark twins read as one picture. */
export const twin = (rel) => rel.replace(/\.[0-9a-f]{8}(?=\.\w+$)/, '').replace(/-(?:light|dark)(?=\.\w+$)/, '');

/** The visible text of a stretch of markup: tags dropped, entities left as they are. */
const textOf = (html) => html.replace(/<[^>]*>/g, ' ');

/**
 * The references to history pictures in `html` that no label covers.
 * `toRel` maps an address as written (`/shots/a.jpg`, `shots/a.jpg`) to a
 * repository path or null; `isHistory` says whether that path shows the
 * previous mark. Returns [{ ref, rel, line }].
 */
export function unlabelled(html, toRel, isHistory) {
  /* scripts, styles and comments hold no shown picture; the head shows nothing */
  let doc = html
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, blank)
    .replace(/<head\b[\s\S]*?<\/head>/i, blank);
  /* /_next/image?url=%2Fshots%2Fa.jpg%3Fv%3D2: the address inside, decoded; a quote stays escaped */
  doc = doc.replace(/%(2F|3F|3D|26|23)/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));

  /* the element tree: each element's open tag, its attributes and where it closes */
  const elements = [];
  const stack = [];
  const refs = [];
  for (const m of doc.matchAll(TAG)) {
    const [whole, close, rawName, attrs] = m;
    const name = rawName.toLowerCase();
    if (close) {
      const at = stack.map((e) => e.name).lastIndexOf(name);
      if (at < 0) continue;
      while (stack.length > at) stack.pop().end = m.index;
      continue;
    }
    const element = { name, attrs, start: m.index, open: m.index + whole.length, end: doc.length, parent: stack.at(-1) ?? null };
    elements.push(element);
    for (const [, attr, dq, sq, bare] of attrs.matchAll(ATTR)) {
      if (!shows(name, attr.toLowerCase())) continue;
      for (const a of ` ${dq ?? sq ?? bare ?? ''}`.matchAll(ASSET)) {
        const rel = toRel(a[1].replace(/^\.\//, ''));
        if (rel && isHistory(rel)) refs.push({ ref: a[1], rel, element, index: m.index });
      }
    }
    if (!VOID.has(name) && !whole.endsWith('/>')) stack.push(element);
  }

  const scoped = refs.map((ref) => {
    let scope = null;
    let marked = false;
    for (let e = ref.element; e; e = e.parent) {
      if (/\sdata-previous-mark\b/.test(` ${e.attrs}`)) {
        scope = e;
        marked = true;
        break;
      }
    }
    if (!scope) for (let e = ref.element; e; e = e.parent) if (SCOPES.has(e.name)) { scope = e; break; }
    return { ...ref, scope, marked };
  });

  const out = [];
  for (const { ref, rel, element, index, scope, marked } of scoped) {
    let said = Boolean(scope) && LABEL.test(textOf(doc.slice(scope.open, scope.end)));
    /* a whole <section> (a deck slide) is the loosest scope: one label in it
       covers one picture, so a slide that shows two history pictures says so
       twice, or puts each in its own figure */
    if (said && scope.name === 'section' && !marked) {
      /* a picture's light and dark twins (a.jpg and a-dark.jpg, b.webp and b-light.webp) are one picture, in one element or two */
      const pictures = new Set(scoped.filter((r) => r.scope === scope && !r.marked).map((r) => twin(r.rel)));
      /* a label is a sentence that says it */
      const labels = textOf(doc.slice(scope.open, scope.end)).split(/[.!?]+/).filter((sentence) => LABEL.test(sentence)).length;
      said = labels >= pictures.size;
    }
    if (!said) out.push({ ref, rel, element, line: doc.slice(0, index).split('\n').length, scope: scope?.name ?? null });
  }
  return out.map(({ element, ...miss }) => miss);
}
