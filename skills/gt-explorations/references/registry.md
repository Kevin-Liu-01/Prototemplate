# The registry and Kevin's numbers

Detail for section 3 of `gt-explorations`: the registry fields, how Kevin's numbers map to views, and the renumbering record. Paths are relative to `$PROTOTEMPLATE`.

## The registry

`$PROTOTEMPLATE/src/lib/directions.ts` (`DIRECTIONS`) is the one list. The gallery at `/`, `/directions/<slug>`, `/compare`, the presenter at `/present`, the sitemap and the page check (`scripts/lib/site-pages.mjs`) all read it, so a direction is registered once.

| Field | What it holds |
| --- | --- |
| `label` | the number Kevin uses, as two digits |
| `n` | the round or exploration number the direction came from |
| `slug` | the route under `/d`, fixed for the life of the direction |
| `name`, `concept`, `signature`, `tone` | the name, the idea in one or two sentences, the one motion moment, the theme family |
| `site` | a full site with its own `/enterprise` page |
| `reference` | the shipped outcome |

The shipped outcome carries no `label`. It is what the rounds produced, and a number would enter it in the comparison (commit 127960d, 2026-08-25). `src/lib/marks.ts` keeps the current mark the same way, as `REFERENCE_MARK`, and never offers it as a candidate.

## Kevin's numbers

- Refer to every version by the number Kevin uses, in reports, notes and commits. He writes "version 1 has the best layout direction" and "the best wheel is number 6" (2026-07-29) and expects the work to follow those numbers.
- The number he uses is the one he saw. In July it was the switcher's position, and `docs/research/ITERATION_SPEC.md` mapped each position to its slug before work began. Today the gallery's book view shows `label`, and the viewer shell's sidebar and toolbar count positions in the site map's order (`pad2(position + 1)` in `src/app/directions/sections.ts`), so Toolchain is label 01 and row 05 on the shell. When a number could name two directions, find which view he was on, and ask once if it is still unclear.
- A version that was overwritten comes back under a number of its own. Kevin, 2026-07-29: "number 1 is a revrsion, have a version 0 that is the version before 1". The same night an earlier state of version 1 became version 11. Each keeps the trait it was kept for.

## Renumbering

- Renumber only when Kevin asks, and then in one registry pass: remove the losers, number the keepers from the one he names, and keep every slug and URL so notes keyed by slug survive. Kevin, 2026-07-31: "remove 00-09 and 011. keep 10,12,13,14,15,16,17,18,19,20,21,22 and number them correctly with 10 as 01."
- Without that ask, survivors keep their numbers and new directions take the next free ones. In the fifth deco round the seven shortlisted directions kept 18, 19, 21, 23, 24, 25 and 26, and the three new ones took 27, 28 and 29 (2026-09-14). Gaps in the labels are expected.
- Counts written in prose do not follow the registry. On 2026-10-05 `DIRECTIONS` held 27 entries while `README.md`, `public/llms.txt` and `src/app/directions/DirectionViewer.tsx` said seventeen, `ARCHITECTURE.md` and `src/app/craft/CraftArticle.tsx` said sixteen, `src/app/GalleryViewer.tsx` said 17 and thirteen, and a comment in `src/lib/directions.ts` itself said thirteen explorations. After any registry change, find the counts and fix them in the same change:

  ```bash
  grep -rniE "\b(thirteen|sixteen|seventeen|twenty|[0-9]+ directions)\b" README.md ARCHITECTURE.md public/llms.txt src/app src/lib src/components | grep -v "src/app/d/"
  ```
