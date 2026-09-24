# Self-hosted Google Fonts

These woff2 files are the static latin (and, for Cinzel, latin-ext) builds that
fonts.googleapis.com served this site's `next/font/google` calls, downloaded by
`scripts/fetch-google-faces.py`. `MANIFEST.json` records the source URL, weight,
style, subset and unicode range of every file. The site loads them through
`next/font/local`, so a production build no longer fetches anything from Google:
Google Fonts occasionally answers with extensionless `/l/font?kit=` URLs and
Turbopack's loader fails on them (vercel/next.js#99114), which turned pushes red
at random.

Families and licenses (all SIL Open Font License 1.1, text at
https://openfontlicense.org): Aboreto, Cinzel, Federo, Forum, Fraunces,
Instrument Sans, Julius Sans One, Marcellus, Sora, Space Grotesk. Inter, one
level up, is the rsms.me build and is documented in `src/lib/fonts.ts`.

To refresh or add a face, edit the `WANT` table in the script and run
`python3 scripts/fetch-google-faces.py`.
