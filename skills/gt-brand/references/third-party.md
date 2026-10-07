# Third-party material

Detail for section 8 of `gt-brand`. Any logo, picture, font, model or shader
that GT did not make follows this procedure: where it comes from, how its
provenance is recorded, how it is credited, and what happens when its terms
do not fit. The logo recipe is in `references/marks.md` (thesvg.org) and the
picture recipe in `gt-dither` sections 5 and 7. This file holds the order and
the rules that apply to every kind of asset.

## 1. Source order

1. The house components first: the GT mark, the Locadex mark and the
   `LocaleFlag` SVGs (`LocaleTag` in Prototemplate).
2. A customer's or partner's logo comes from the company's own brand page,
   in true ink and in the variant for the theme. A customer logo once
   rendered gray where its brand kit was black (2026-08-05: "actrrually
   gray").
3. Other marks come from thesvg.org's registry, inlined as components
   (`references/marks.md`).
4. Artifact pictures are CC0 or licensed scans (`gt-dither`).
5. Product media are real recordings of the real product.

- Keep searching until the real asset is found. Never redraw an
  approximation by hand.
- Match optical size across a logo wall: marks of different proportions sit
  at one visual weight, so their bounding boxes differ.

## 2. Provenance

Record each asset's source and terms as it lands:

- a credits file or a README section beside the asset (`public/media/README.md`
  for finished artwork, `public/fonts/google/README.md` for the Google
  faces);
- `gt-dither`'s source list for pictures (`docs/ARTIFACT-PICTURES.md`).

## 3. Credit

- Borrowed creative work is credited on the page that shows it. An adapted
  shader carries a visible attribution that links to the author's post.
- A share-alike image in a film needs Kevin's explicit decision, and the
  film's page carries a credits block (`gt-films` section 11).

## 4. Licences

- Third-party fonts, marks and models keep their own terms, or they are
  removed.
- A licensing problem in a public repository is fixed by removing or
  replacing the material. The repository stays public and its history is not
  rewritten. Kevin, 2026-10-02: "never privatize the repo. simply remove
  third party models."
- Original code in Kevin's public open-source repositories is MIT.
  Prototemplate reserves all rights to General Translation, Inc. (2026-09-25,
  `LICENSE`), and its third-party fonts, icons and adapted skills keep their
  own licenses.

## 5. Customer marks on public pages

- A public page shows only the customer marks that BRAND.md section 9 and
  the production site already show.
- A brief for an outside vendor uses dummy brands until a customer's
  permission is confirmed (`gt-films`, Short media).

## Sources

- Kevin's messages: the gray customer logo (2026-08-05), the licence
  (2026-09-25: "make prototemplate not mit licensed anymore"), the public
  repository (2026-10-02), the vendor brief (2026-09-30).
- Prototemplate: `LICENSE`, `public/media/README.md`,
  `public/fonts/google/README.md`, `docs/ARTIFACT-PICTURES.md`, BRAND.md
  section 9.
- Claude memory note for gt-cloud: thesvg-brand-marks.
