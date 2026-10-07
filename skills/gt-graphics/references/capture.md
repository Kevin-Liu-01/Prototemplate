# Capturing sources for graphics

Every crop in a GT visual is cut from a capture made this way. A visual can only be as sharp as its source, so captures are taken at three to five times the CSS resolution and kept lossless. Paths are relative to `$PROTOTEMPLATE`.

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

- Capture from a local landing dev server built from gt-cloud `main` (the September set used port 3021). Match the shipped UI, and note the commit the capture came from.
- Use 5x for pages that get cropped small (the intro, the old intro), 4x for full-page references and 3x for pages that only appear whole.
- Convert to lossless webp before committing: `python3 -c "from PIL import Image; Image.open('in.png').save('out.webp', 'WEBP', lossless=True)"`. `imageSize()` in `gen-lib.js` reads PNG and WebP headers.
- Register the file in `SHOTS` in `graphics/build/gen-lib.js` with its `dpr`. The library divides the pixel size by the density, so every rectangle is measured in CSS px at 1440 by 900. A `SHOTS` entry whose file is missing does not throw: it is marked `missing`, sized 1440 by 900, and its crops render empty.
- Keep separate agent-browser sessions per job (`shots`, `capture`, `gtdocs` for the render and the audit, `glyph` for glyphfield), so one job's viewport and media settings never carry over into another.

## Themes and state

`agent-browser set media light` (or `dark`) emulates the colour-scheme preference, and the docs follow it when no theme is stored. Reset it after the capture. Do not force theme classes on the root by hand, because the site's own theme script repaints over them.

The landing app reads three cookies that set state before the first paint (recorded for the docs post screenshots on 2026-09-09):

| Cookie | Effect |
| --- | --- |
| `cookie_consent=no` | hides the consent banner |
| `gt_theme=light` or `gt_theme=dark` | sets the stored theme |
| `gt-fw-pref=next` | selects the framework tab on the server |

The CSS `nextjs-portal { display: none }` hides the Next.js dev badge when a stylesheet injection is easier than the eval above.

## Menus and states

Open a dropdown or menu with its real control, for example `agent-browser find role button click --name "Overview"`, wait about 800ms for the animation, then capture. Radix popovers render in a portal; measure them with `getBoundingClientRect` on `[data-radix-popper-content-wrapper]`. A page scrolled to show a later section is its own capture with its scroll offset noted beside its `SHOTS` entry (`newAbout` is the Introduction scrolled 717px).

## Measuring

Read geometry from the DOM with one `eval`, which is exact where reading pixels from a screenshot is not:

```js
JSON.stringify([...document.querySelectorAll('#nd-sidebar a[href]')].map(a => {
  const r = a.getBoundingClientRect(); return { t: a.textContent.trim(), x: r.left, y: r.top, w: r.width, h: r.height };
}))
```

Keep the rectangles in the generator as named objects (`N` and `O` in `gen-visuals.js`). A visual that hard-codes numbers cannot be re-cut when the page changes. Record anything surprising beside the rectangle, as `O.headerLine` notes that the old header's rule sits on row 63 of the capture.

## SSO-protected Vercel previews

Headless browsers and `fetch` hit the Vercel SSO redirect on a protected preview. The old docs were captured from a signed-in Chrome (Claude in Chrome) by serializing the DOM to the local graphics server:

1. Start the server with `pnpm graphics:serve`. It accepts `POST /?name=<file>` from any origin and writes the body to `graphics/inbox/<file>`. `graphics/.gitignore` lists `serve/inbox/` and leaves `graphics/inbox/` out, so keep the saved pages out of commits by hand.
2. In the signed-in tab, run a non-blocking script that clones `documentElement`, fetches each stylesheet with `credentials: 'include'`, inlines `url()` fonts and images as data URLs, inlines every `<img>` source, and POSTs the HTML to `http://127.0.0.1:8765/?name=<page>.html`.
3. Store the result in `window.__snapResult` and poll for it. A synchronous script that runs for 45 seconds times out the CDP call.
4. Remove `#claude-agent-glow-border`, `#claude-phantom-cursor`, `grammarly-desktop-integration` and the cookie banner from the clone before saving.
5. Serve the saved HTML locally and screenshot it with agent-browser at the density you need.

The `vercel:access-protected-vercel-deployment` skill describes header-based access to a protected preview (`vercel curl` and the trusted OIDC header) for a Vercel CLI signed in to the team, and agent-browser sends extra headers with `set headers <json>`. The September captures used the DOM route above.

## Sources

- Prototemplate: `.agents/skills/docs-source-capture/SKILL.md` (2026-09-18), absorbed here; `docs/GRAPHICS.md`, Capturing; `graphics/build/gen-lib.js` (`SHOTS`, `imageSize`); `graphics/build/gen-visuals.js` (`N`, `O`); `graphics/serve/server.js`; `graphics/build/capture-sidebar.sh`.
- Session note docs-redesign-post-part2 (the state cookies and the dev badge, 2026-09-09).
