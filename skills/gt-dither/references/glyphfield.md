# Glyphfield, the source of new material

`SKILL.md` section 4 points here.

## The rules

- Glyphfield is Kevin's studio and open-source repository
  (glyphfield.com/studio, github.com/Kevin-Liu-01/Glyphfield, MIT). The
  studio field was ported from it. The original material,
  `glyphfield-dither-gradient`, is a moving wave distorted by layered
  noise under a 4x4 Bayer threshold with three palette colors; its
  `grain` sets the screen-space cell size.
- New material starts in the studio. Compare a few distinct treatments at
  the target aspect ratio, then refine the one chosen. Record the material
  ID, colors, scale, motion settings and the source document.
- What ships is material code or exported assets:
  - live motion becomes a preset and shader body in the studio-field
    engine (every copy), mounted through `createStudioField`;
  - fixed artwork ships as an exported SVG or raster, checked at display
    size;
  - fixed-timing motion ships as a Studio export with a still for reduced
    motion.
- A page never depends on an editor iframe, a local checkout or a
  generation request per page view.
- Tune the shader for texture and motion. Masks, fades, text protection and
  theme blending stay in the page's CSS, except a clearing on a dithered
  field, which is a tone dissolve in the shader (`bayerSmoke`'s `clear`,
  `references/engines.md`), because a CSS mask prints partial-alpha cells.
- Gem Smoke (Paper Shaders, Apache-2.0) is the material of the grantee
  post covers and the films (`gt-graphics`, `gt-films`). The landing ports
  its smoke alone as `bayerSmoke` for live card art.
- Keep the source URL and revision, the material settings and the license
  notices with copied code or assets.
- Agents drive the studio through `window.glyphfield.studio` and discover
  the API at `/llms.txt` and `/api/agent`. The headless export recipe is in
  gt-graphics; the landing code map is gt-cloud's `.agents/skills/glyphfield`.
