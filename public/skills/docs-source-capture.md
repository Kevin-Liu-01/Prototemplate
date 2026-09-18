# Docs source capture

Illustrations are only as sharp as their sources. Every crop in the
graphics pipeline comes from a capture made this way.

## Local pages at high density

```bash
export AGENT_BROWSER_SESSION=shots
agent-browser open "http://localhost:3021/en-US/docs/overview/get-started"
agent-browser set viewport 1440 900 4          # 4x: a 5760 by 3600 PNG
agent-browser wait --load networkidle
agent-browser eval '[...document.querySelectorAll("nextjs-portal")].forEach(p => p.style.display = "none"); "ok"'
agent-browser mouse move 900 820               # park the pointer on plain text
agent-browser screenshot graphics/shots/hi/intro.png
```

- Use a landing dev server built from `main`. The docs at the time used
  circle theme toggles, not sun and moon; match the shipped UI, and say
  which commit the capture came from.
- 5x for the pages that get cropped small (the intro, the old intro), 4x
  for full-page references, 3x for pages that only appear whole.
- Register the file in `SHOTS` with its `dpr`; the library divides the
  pixel size by it to get CSS px, so every rectangle is measured at 1440.
- Convert to lossless webp for the repository (PIL: `save(..., 'WEBP',
  lossless=True)`); the library reads webp sizes too.

## Themes

`agent-browser set media light` (or `dark`) emulates the color-scheme
preference; the docs follow it when no theme is stored. Reset with
`set media dark` after the capture, and never force classes on the root by
hand: the site's own theme script wins on the next paint.

## Menus and states

Open a dropdown or menu with the real control (`agent-browser find role
button click --name "Overview"`), wait 800ms for the animation, then
capture. Radix popovers render in a portal; measure them with
`getBoundingClientRect` on `[data-radix-popper-content-wrapper]`.

## SSO-protected Vercel previews (the old docs)

Headless browsers and fetch hit the Vercel SSO redirect. Use the signed-in
Chrome through Claude in Chrome: run a non-blocking script that clones
`documentElement`, fetches each stylesheet with `credentials: 'include'`,
inlines `url()` fonts and images as data URLs, inlines `<img>` sources and
POSTs the HTML to a local CORS server (`graphics/serve/server.js` accepts
POST into `inbox/`). Store the result in `window.__snapResult` and poll,
since a 45s synchronous script times out the CDP call. Then serve that HTML
locally and screenshot it with agent-browser at the density you need.
Strip `#claude-agent-glow-border`, `#claude-phantom-cursor`,
`grammarly-desktop-integration` and the cookie banner first.

## Measuring

Dump geometry with one `eval` rather than reading pixels:

```js
JSON.stringify([...document.querySelectorAll('#nd-sidebar a[href]')].map(a => {
  const r = a.getBoundingClientRect(); return { t: a.textContent.trim(), x: r.left, y: r.top, w: r.width, h: r.height };
}))
```

Keep the rectangles in the generator as named objects; a visual that
hard-codes numbers cannot be re-cut when the page changes.
