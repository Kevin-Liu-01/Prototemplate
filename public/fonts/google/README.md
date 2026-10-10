# Self-hosted Google Fonts

These woff2 files are the static latin (and, for Cinzel, latin-ext) builds that
fonts.googleapis.com served this site's `next/font/google` calls, downloaded by
`scripts/build/fetch-google-faces.py`. `MANIFEST.json` records the source URL, weight,
style, subset and unicode range of every file. The site loads them through
`next/font/local`, so a production build no longer fetches anything from Google:
Google Fonts occasionally answers with extensionless `/l/font?kit=` URLs and
Turbopack's loader fails on them (vercel/next.js#99114), which turned pushes red
at random.

Families and licenses (all SIL Open Font License 1.1, text at
https://openfontlicense.org): Aboreto, Cinzel, Federo, Forum, Fraunces,
Instrument Sans, Inter, Julius Sans One, Marcellus, Sora, Space Grotesk.

`inter-specimen.woff2` is Google's build of Inter (Copyright 2016 The Inter
Project Authors, https://github.com/rsms/inter), cut by the css2 `text=`
parameter to the specimen strings of the presenter's Details slide
(`src/app/present/slides/TypeDetailSlide.tsx`) plus a to z. It keeps Google's
wght axis and feature list, so the slide can set it beside the official build.
The site's own Inter, one level up, is the rsms.me build and is documented in
`src/lib/fonts.ts`.

To refresh or add a face, edit the `WANT` table (or `TEXT_CUTS`, for a cut to
given characters) in the script and run `python3 scripts/build/fetch-google-faces.py`.
