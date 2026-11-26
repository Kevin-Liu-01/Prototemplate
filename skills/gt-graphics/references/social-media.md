# Social media

`SKILL.md` points here for the pictures and films General Translation posts on X and LinkedIn, and for the card a link unfurls into. The platform limits (image and GIF sizes, how many images a post holds) belong to the wiki's `social-draft` skill, the post copy to `gt-voice` (`references/launch-posts.md`), and the live check of a card after a deploy to `gt-verify`. Prototemplate's `/socials` page shows the skills, the media and these standards together.

## What gets rendered

| Post media | X | LinkedIn |
| --- | --- | --- |
| Still | 16:9, 3840 by 2160 PNG master | 4:5, 2160 by 2700 PNG master |
| Film or clip | 16:9, 1920 by 1080 MP4 | 4:5, 1080 by 1350 MP4 |
| Clip for the X video feed | 9:16, 1080 by 1920 MP4, 15 to 60 seconds | not used |
| GIF | 1400 wide, posted alone | not used: LinkedIn shows a GIF as a still |
| Profile banner | 1500 by 500, with a 3000 by 1000 master | 1584 by 396, with a 3168 by 792 master |

- Each X picture has a LinkedIn twin cut at 4:5 from the same composition, named with `-li` (`logo-rounds.png` and `logo-rounds-li.png`). The Series A launch rendered both from one script (funding-graphics `social/tools/render_compare.sh`).
- A film is H.264 with AAC audio and the moov atom at the front (`-movflags +faststart`). The first frame carries the point, since both feeds autoplay muted.
- A demo, breakdown or case study meant for X's video feed gets a vertical 9:16 cut beside its 16:9 one, with the hook in its first one or two seconds. The 16:9 cut still plays in the main feed.
- The web copies Prototemplate serves sit in `public/media/socials/`: webp stills at quality 90, and films re-encoded at CRF 23 to 24 with a poster frame beside each (`<name>-film.mp4`, `<name>-poster.jpg`).
- A LinkedIn banner keeps its type and marks clear of the profile photo (from x 440 in banner pixels) and of the phone crop (x 132 to 1452).

## What a social picture shows

- **Shipped first.** A comparison puts the shipped version first and largest, with the rounds before it smaller beside or below, each labelled with its name and date ("Shipped, Nov 9", then "Poster B, Nov 3").
- **The logo.** Social pictures carry the logo only. The retired monogram appears only as history, inside a labelled earlier round.
- **Type.** Type set on a social picture (labels, posters, banners, cards) is Katagami Text. A crop of a product page keeps the page's own type.
- **Faces.** A photo of people is never dithered. The team photo goes out as the undithered original.
- **Labels.** A label is plain text. No decorative dot or bullet sits beside it.
- **Names.** A caption or alt text never names Ramp or Sierra (their cuts stay private) and never names the design agency. Nothing mentions an unannounced raise.
- **Alt text.** Every picture has alt text that names what it shows, including the label of each tile, shipped version first.

## The card a link unfurls into

A page's card is the OpenGraph and X metadata in its head plus one image.

| Field | Standard |
| --- | --- |
| Card image | 1200 by 630 (1.91:1) PNG at least; a blog post's card is 2400 by 1260, in a dark and a light version (the export table in `SKILL.md`) |
| Tags | `og:title`, `og:description`, `og:url` (the canonical address), `og:type`, `og:site_name`, `og:image` with its width, height and alt, `twitter:card` set to `summary_large_image`, `twitter:site` and `twitter:creator` |
| Description | 50 to 160 characters, no em dash and no exclamation mark (`pnpm lint:seo`, rule S3) |
| Prototemplate | `seoRoute()` in `src/lib/seo/route.ts` writes every tag above from the route's title and description, and draws the card itself (`src/lib/seo/card.tsx`) unless the route passes its own `image`; `card: false` leaves a private page unfurling as text |
| Blog post | the frontmatter's `ogImages` names the card; without it the post falls back to `images`, then to the generated `/api/og` card (gt-website `references/blog.md`) |

X and LinkedIn cache a card by its address, so a changed card ships under a new `?v=` stamp (the stamp rule is gt-website's, and the live check after a deploy is gt-verify's).

## Sources

Cited in `references/sources.md` under "Added 2026-11-25".
