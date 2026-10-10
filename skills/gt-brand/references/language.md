# Language as material

`SKILL.md` section 6 points here: the devices that make writing systems the brand's material, each with its owner file and skill.

## The devices

The brand's recurring subject is writing systems. Each device below has an owner file and a skill:

- **Glyphs.** Characters that make up greater wholes. The glyph field drops characters from eight writing systems that resolve into the word for language in each script in turn. It runs live on `/craft` with the other devices below (BRAND.md section 7).
- **The sentence reassembler.** `src/components/shared/EverySentence.tsx` breaks a headline into glyphs and reassembles it as the same sentence in the next language, with the same number of particles. Its moving type law is DESIGN.md section 8: one shaped text node with `lang` and `dir`, width from a hidden probe, and the host page's clock (`gt-motion`).
- **Locale pills.** A locale is named in one way: a flag printed as SVG at 15 by 11, then the code (`LocaleTag` in Prototemplate, `LocaleFlag` in gt-cloud, held there by `no-raw-locale-flags`). A flag is a data chip next to a locale code and never decoration or an emoji.
- **The 1-bit Bayer language.** Density is ordered dither through the 4 by 4 and 8 by 8 matrices, never an alpha veil. This is the brand's texture (DESIGN.md section 7, `gt-dither`). Pictures of writing (the Rosetta Stone, the Blue Marble) follow the artifact picture standard in `docs/ARTIFACT-PICTURES.md`.
- **The doubled line.** Every connector is one path stroked twice, the mark's own grammar (`src/components/shared/diagrams/DoubledLine.tsx`, `--thread-gauge: 1.5px`, `--thread-gap: 3px`; `gt-diagrams`).
