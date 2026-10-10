# Traps and fixes

`SKILL.md` points here: every failure the toolchain has shown, with its cause and its fix, and the one-pass check for renders that came out as error pages.

## The table

| Symptom | Cause | Fix |
| --- | --- | --- |
| A "pixelated" cover | 1x dither aliasing, and the optimizer re-encoding at quality 75 | Ground at 2x with square pixels; webp covers served at quality 95 |
| `export-blog.py` stopped on a missing `--covers.png` | `pnpm graphics:export -- --covers` passed the `--` through, so argparse read `--covers` as an id | `pnpm graphics:export --covers` |
| Every render failed to save on a fresh clone | `graphics/build/out/` is ignored and absent, and the screenshot does not create folders | `mkdir -p graphics/build/out` |
| "Blurry" diagrams | 12px labels shown at 0.44x | Labels of 26px or more, 3px lines, a narrower composition |
| Lines clipped | 1px rules and 1.5px caps fall under a device pixel | 3px everywhere, labels on backing pills |
| Soft images on a sharp master | The browser shrank the 3840px master itself | `next/image` with `BLOG_COLUMN_SIZES` and the `deviceSizes` ladder |
| Text under the floor after a type increase | The fit scaled the wider composition down | Narrow the composition |
| A captured Lucide glyph drew as a lone corner | The SVG inliner stripped `width` and `height` from the glyph's `<rect>` | `svgFile()` resizes the root tag only (fixed 2026-09-24) |
| A visual shipped as Chrome's "site can't be reached" page | The 8765 server was down during the render | `render.sh` skips a page that never centres; still check each render's pixel standard deviation (below) |
| A crop renders empty | The `SHOTS` file is missing; the library marks it `missing` and sizes it 1440 by 900 without throwing | Confirm every shot a visual uses exists before rendering |
| A sparkle icon appears in a label | The Heroicon name does not exist and `ico()` fell back to `sparkles` | Fix every name `graphics:gen` lists under `MISSING ICONS` |
| A cover the post embeds as a figure went stale | `export-blog.py` skips `H*` ids unless they are in `POST_COVERS` | List the cover in `POST_COVERS` |
| Servers and the scratchpad are gone after a break | The desktop app stops servers and clears the scratchpad when the date changes | Restart 8765 and the dev servers before rendering; keep review sheets under `graphics/build/out/_*.png` |
| The hover pill jumped after every click in a clip | Screenshots re-fire trusted pointer events | Block trusted pointer events in the region and drive hovers synthetically |
| Carousel prop `items` undefined | next-mdx-remote strips expression props | Child elements with string attributes |
| The content preview build failed | The preview app did not know a new component | Stub every new component in the content repository's preview app |
| The PR policy check failed | A `feat` title without a Linear issue | A `docs(blog)` title, or link the issue |

A render that is a flat error page has a low standard deviation (under about 20 in grey). Check the whole set in one pass:

```bash
python3 -c "import sys; from PIL import Image, ImageStat; [print(round(ImageStat.Stat(Image.open(p).convert('L')).stddev[0], 1), p) for p in sys.argv[1:]]" graphics/build/out/*.png | sort -n | head
```
