# graphics

The toolchain behind the blog illustrations. The procedure and the rules
are in [`docs/GRAPHICS.md`](../docs/GRAPHICS.md) (served at
`/docs/graphics`); the `gt-graphics` skill (`skills/gt-graphics`) carries
them into agent sessions.

```bash
pnpm install                       # heroicons for the label icons
pnpm graphics:serve                # graphics/ on http://127.0.0.1:8765
pnpm graphics:gen                  # build/visuals/*.html + build/manifest.json
pnpm graphics:render [id ...]      # out/<id>.png at 3840 wide (agent-browser, Pillow)
python3 build/sheet.py [id ...]    # out/_sheet*.png contact sheets
build/composite-videos.sh          # the two clips onto their stills
pnpm graphics:export -- --covers   # public/static/blogs (or --dest DIR)
python3 build/cover-grounds.py     # bg/covers/*.png: cover grounds through the 8x8 Bayer screen
node build/gen-covers.js           # after graphics:gen: the post covers, social cards and the spine diagram (area P)
python3 build/export-covers.py     # those pages at the names the posts use (or --dest DIR)
```

| folder | holds |
| --- | --- |
| `social/` | the launch posts for each set (X thread, LinkedIn post) with the image each carries |
| `../public/graphics/sheets/` | contact sheets of the finished set (`sheet.py` output copied there as lossless WebP when a set ships: `cwebp -lossless -z 9`, every pixel kept at about two thirds of the PNG's bytes), served on `/graphics` for review at thumbnail size |
| `build/` | `gen-lib.js`, `gen-visuals.js`, `render.sh`, `export-blog.py`, `composite-videos.sh`, `capture-sidebar.sh`, `rewriting-covers.py`, `cover-grounds.py`, `gen-covers.js`, `export-covers.py`, `sheet.py`, `gen-gallery.js`, `manifest.json`, `icons/` |
| `serve/` | the static server (`node serve/server.js [root]`) |
| `glyph/` | glyphfield studio scripts and the project source (`load.js`) |
| `bg/` | a link to `public/graphics/bg/`, the glyphfield exports (lossless webp, pixel-identical to the PNG originals): `user/` the palette, `blue/` the cover variants; served, so `/graphics` shows them at native size |
| `shots/hi/` | product captures at 3 to 5x (lossless webp) |
| `shots/logos/` | partner logos the covers seat, copied from generaltranslation.com's `public/logos` |
| `fonts/` | Katagami Text 1.200 (roman and italic, the bytes generaltranslation.com serves) for every label; Inter for the docs type D1 shows and the F2 mock; Geist Mono for code |
| `rec/` | the recordings the clips composite from |

`build/visuals/`, `out/`, `rec/stopmo*/` and `serve/inbox/` are generated
and ignored.
