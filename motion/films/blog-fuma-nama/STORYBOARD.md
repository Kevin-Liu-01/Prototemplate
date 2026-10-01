# blog-fuma-nama: storyboard

Fuma Nama: The philosophy of an open-sourcerer (Taylor Fang, September 3, 2026). A 24.0 s trailer for the post: a portrait of Fumadocs' creator told through his own words and the framework's shape. 1920 x 1080, 60 fps, silent, dark first.

The arc a viewer can repeat afterwards: Fumadocs' moon and the title; he learned to code from files; the framework is four exposed layers that feed your app; the CLI copies one component out of the package into your code; his goal is zero issues; he is General Translation's first open-source grantee.

## System

- Grid: 0.5 s beats. Every cut and every arrival lands on a beat, except the end card's reassembly, which settles at 20.25 so the last sentence keeps its full reading time inside 24 s. The two other dissolves start 0.75 s before a beat and land on it.
- Accent `#86a8ff`, used twice and never at once: the pulse on the layer thread (10.5 to 11.25) and the copied module's edge (12.5 to 15.0).
- Dither: one grid, 3 px cells, for the moon (Fumadocs' logo, which Fuma calls the moon, Luna): a lit sphere, light from the upper left, tone capped at 0.93 so the lit side keeps its texture, a 3.5 percent ambient so the whole disc reads. It enters by raising tone from 0 and leaves by lowering it to 0.
- Moving type (transition d) is the film's joint: the title becomes the first quote, the first heading becomes the second, the last quote becomes the end card. Each sentence is sampled into the same 3 px glyph cells; the cells leave in reading order over the first 55 percent of the dissolve and each flies for 40 percent of it, so the change runs left to right as a wave; the arriving sentence's text node replaces the cells when they settle.
- Type: Inter 500 for display and labels, 400 for captions. Quotes at 106 (t-display), title and end card at 88 (t-h1), headings at 53 (t-h2), labels 26 and 20. Opening quote marks hang outside the 160 px text edge.
- Series frame: rails draw out of their crosses at 0.0 to 0.6 (`expo.out`, each rail as two halves, one per cross); the counter reads the section, 01 / 06 to 06 / 06.

## Beats

| # | start | end | on-screen copy, word for word | visual | motion and easing | out |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 5.0 | "Fuma Nama: The philosophy of an open-sourcerer" (three lines: "Fuma Nama:" / "The philosophy of" / "an open-sourcerer"); "Taylor Fang"; "September 3, 2026" | Ink. The series frame. The dithered moon on the right, centre (1400, 520), radius 330. Title block at x 160. | Rails 0.0 to 0.6 `expo.out`. Title lines 0.0 to 0.62 (y 24 to 0, opacity, `power3.out`, 60 ms stagger). Byline 0.30, date 0.36. Moon tone 0.2 to 1.7 `power2.out`; its light turns 4 degrees across the scene (re-sampled per frame). | 4.25 to 5.0: title, byline and date dissolve into cells and reassemble as beat 2; the moon's tone lowers to 0 over the same 0.75 s (`power2.in`). |
| 2 | 5.0 | 8.0 | "“I learned to code from files.”" (two lines: "“I learned to code" / "from files.”"); "Fuma Nama" | Type on ink. | Cells settle at 5.0 and the text node replaces them. Holds 3.0 s. | Hard cut at 8.0. |
| 3 | 8.0 | 12.0 | "Less abstraction, less opinionated software"; labels "Content" / "fumadocs-mdx", "Core" / "fumadocs-core", "UI" / "fumadocs-ui", "React app" / "Next.js, React Router, TanStack Start, Waku" | The post's architecture in the isometric family: four 220-unit plates (Content over Core over UI over the React app), 9 thick, 132 of air between them; each top face carries four raised modules (the app carries three and an empty slot drawn as one faint hairline). A doubled-line thread joins the plates at their right corners; the labels sit beside the corners like stations on a line. | The cut lands on the heading. Plates drop in on 8.5, 9.0, 9.5, 10.0 (y -40 to 0, opacity, `expo.out`, 0.5 s), modules after them back to front (`expo.out`, 60 ms stagger), each label with its plate (`power3.out`). Each thread segment draws down out of the plate above as the next lands (0.4 s `power3.out`). 10.5 to 11.25: the accent pulse runs down the thread from Content to the app (`none`). | 11.25 to 12.0: the heading dissolves into cells and reassembles as beat 4's heading. The stack stays. |
| 4 | 12.0 | 15.0 | "A black box and a compiler"; "CLI" / "@fumadocs/cli" | The same stack. The CLI label at left, beside the copy's lane. A 1 px titanium route draws out of the UI plate's left module, down past the stack, and back into the app's empty slot. | CLI label and route 12.0 to 12.5 `power3.out`. A copy of the UI module, edged in the accent, slides out along the route: out 12.5 to 13.0, down 13.0 to 13.5, in 13.5 to 14.0 (`power2.inOut` each leg), and seats in the slot on the beat. The original stays in the UI plate. Hold to 15.0. | Hard cut at 15.0. |
| 5 | 15.0 | 19.5 | "“Zero issues on my repositories, that’s kind of my goal.”" (three lines: "“Zero issues on my" / "repositories, that’s" / "kind of my goal.”"); "Fuma Nama" | Type on ink. | The cut lands on the quote. Holds 4.5 s. | 19.5 to 20.25: the quote dissolves into cells and reassembles as the end card; the attribution's cells become the address. |
| 6 | 19.5 | 24.0 | "Fuma Nama is General Translation’s first open-source grantee." (three lines: "Fuma Nama is" / "General Translation’s first" / "open-source grantee."); "generaltranslation.com/blog/fuma-nama" | End card: the doubled-line GT mark above the sentence, the address in titanium under it, the moon returning low in the frame as a horizon (centre (1300, 1250), radius 520). | Mark 19.75 to 20.25 (y 12 to 0, opacity, `expo.out`). Moon tone 19.5 to 21.0 `power2.out`, its light turning 3 degrees to the end. Sentence settles 20.25 and holds 3.75 s. | Ends at 24.0 on the held card. |

## Reading holds (words / 3 + 1 s)

| sentence | words | needs | gets |
| --- | --- | --- | --- |
| title | 7 | 3.33 | 0.62 to 4.25 = 3.63 |
| quote 1 | 6 | 3.00 | 5.00 to 8.00 = 3.00 |
| heading 1 | 5 | 2.67 | 8.00 to 11.25 = 3.25 |
| heading 2 | 6 | 3.00 | 12.00 to 15.00 = 3.00 |
| quote 2 | 9 | 4.00 | 15.00 to 19.50 = 4.50 |
| end sentence | 8 | 3.67 | 20.25 to 24.00 = 3.75 |

## Sources

- Post: `apps/landing/content/blog/en-US/fuma-nama.mdx` (gt-cloud-wt-icons). Quotes are exact substrings of the printed quotations, each ending in its printed period: "I learned to code from files." (section "The vibrant world of the computer") and "Zero issues on my repositories, that’s kind of my goal." (section "Perfect software").
- Headings are the post's section titles "Less abstraction, less opinionated software" (the modular "Legos") and "A black box and a compiler" (the CLI copying a component, down to "a single slot of a layout").
- Architecture: `apps/landing/src/components/blog/FumadocsArchitecture.tsx`: Content layer (fumadocs-mdx, CMS adapters, local files, API generators), Core layer (fumadocs-core), UI layer (fumadocs-ui, base-ui, shadcn), React app (Next.js, React Router, TanStack Start, Waku), dev tooling (create-fumadocs-app, @fumadocs/cli). The post: "With the CLI, the framework’s four modular layers are complete: Content, Core, UI, and CLI".
- The moon: "The logo of Fumadocs is a circle that I would call the moon, Luna."
- Grantee: "We’re excited to announce our first grantee project: Fumadocs, created by Fuma Nama."
