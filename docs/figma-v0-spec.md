# Figma "Landing page design" v0 — extraction spec (IN PROGRESS)

Source: https://www.figma.com/design/zIeooSp1PZTzPaUmEt6c8i/Landing-page-design
Scope per Kevin: this content is the spec FOR THE FIVE FINAL SITES (dossier,
orbit, signal, observatory, procession homes). Terminal-hero v0 is drawn;
a non-terminal-hero version must be self-started (same parts rearranged,
terminal becomes a section). LOCADEX IS NOT A GIF — it is an isometric
diagram in the same isometric family as the app's other iso diagrams.
Also consider spacetypegenerator.com-style kinetic type ONLY if it earns
a place (candidate: the intro's language-morph moment).

## Access recipe (proven)
- File is link-viewable anonymously; canvas renders in Claude-in-Chrome
  (NOT the in-app pane — it pauses rAF and the canvas stays blank).
- Figma canvas IGNORES synthesized scroll/drag/click for pan/zoom/selection.
- What works: the DOM — zoom % input in the zoom menu; the LAYERS PANEL
  (toggle beside filename). Clicking a layer row updates the URL with its
  node-id (URL in tool responses lags one action — pair each click with a
  cheap zoom action to read the fresh URL). Navigating to
  ?node-id=X-Y centers AND fits that node → readable screenshots.
- Frame children enumerate by expanding the frame's chevron (x≈79) in the
  layers panel; the panel scrolls with plain scroll events.

## Page: "Landing with terminal" — canvas inventory
Top-level: CONTENT HIGH-LEVEL text = 18-29 · Rectangle 1 (its grey box) ·
NAV BAR SECTIONS text (id TBD) · frame "landing with terminal v0" = 2-6.
There is a second page "Drafting" (not yet opened).

### Node map harvested so far (frame children, layers-panel order)
- 17-4  Screenshot 2026-08-03 at 11.01.0…
- 12-237 Screenshot 2026-08-03 at 11.00.5…
- 17-18 [not a big fan of this graphic pers…]
- 17-2  HEADER: Deploy today. SUBHEAD…
- 14-439 Screenshot 2026-08-03 at 10.59…
- 14-427 BENTO HEADER: Translations tha… (1)
- 14-419 BENTO HEADER: Translations tha… (2)
- 14-431 [need visual here that shows how…]
- 14-425 [need visual here that shows a few…]
- 14-400 [glyph rise background in this sec…]
- 14-433 SUBHEAD: Review from one surfa…
- 14-437 HEADER: Ship to the world. SUBH…
- 14-399 HEADER: Localize in context. SUB…
- 14-398 Screenshot 2026-08-03 at 11.00.1…
- 14-397 Screenshot 2026-08-03 at 10.59…
- 14-394 Screenshot 2026-08-03 at 10.58…
- 12-329 [this is nice visual to explain local…]
- 17-14 [this should take up less space th…]
- 17-12 Built for the enterprise. Enterpris…
- 17-10 Served from the edge. Translation…
- 12-328 120+ languages, in every writi…
STILL TO HARVEST (visible in panel, scrolled position ~rows below 14-398):
(next panel screenful, ids pending): [need visuals for this section],
[need better visuals for Locadex: …], Screenshot 2026-08-03 at 2.36.2…,
SUBHEAD: The easiest way to loc…, [cut this line], text [either on hover
or replacing …], [maybe also give hebrew example …], [bolster this graphic
with a few m…], Every locale needs to be routed c…, Integrate with any
tool. Just a few…, Run the Locadex agent. Connect …, Every locale is a
different length. …, Every locale uses different numbe…, HEADER: Built for
developers…, Screenshot 2026-08-03 at 10.58…, plus rows below and the
Drafting page. RESUME: layers panel is open and scrolled to these rows;
click row → pair with cheap zoom action to read fresh node-id from URL;
then navigate ?node-id=X-Y to fit + screenshot each node for verbatim
transcription.

## CONTENT HIGH-LEVEL (node 18-29) — COMPLETE, verbatim structure
1. Intro — [Takeaway] Localize your app into different languages ·
   [Visual] Terminal and preview with clickable frameworks and languages ·
   [CTA] Get started / npx
2. Customers — [Takeaway] Trusted by the best companies · [Visual] Logo
   wall for social proof · [CTA] (future) Each logo linked to customer
   story & video
3. Full Stack — [Takeaway] GT is full stack infrastructure · [Visual]
   Isometric diagram with scroll-through: Code, Context, Translations,
   and Agents · [CTA] Product page(s)
4. Developer Experience — [Takeaway] Localization is hard and painful, we
   make it fast and easy · [Visual] a) Bento illustrating complexity of
   problem: Language length, orientation, currencies, plurals, routing,
   etc. b) Bento illustrating simplicity of solution: Locadex,
   Integrations · [CTA] Docs & Locadex product page
5. Context — [Takeaway] Killer advantage is context from connecting all
   your systems. · [Visual] a) Bento illustrating translations in context:
   application logic, key terminology, voice and style, and dynamic
   content b) Dashboard mockup illustrating review with context ·
   [CTA] Context product page
6. Global & Enterprise-Ready — [Takeaway] GT is built for enterprises to
   go global. · [Visual] a) Globe with bullets on language coverage,
   served from CDN, and built for enterprise B) Get started block ·
   [CTA] Get started / get a demo

## NAV BAR SECTIONS (read at canvas level)
Product > Locadex, Context, Infrastructure
Resources > Customers, Blog, Careers
Enterprise (line partially clipped in capture — verify when harvesting the node)

## Annotations already read off the v0 frame (localized)
HERO (top): headline mock "Your product speaks every 言語." with note
"HEADER: Launch in every language. [Remove underline]".
- "[Experiment with removing GT logo (this feels nonstandard) to have logo
  repeated in hero section & also creates more room to see social proof
  without scroll]"
- "[change back to gt-… (partial; likely 'gt-next' something)]" near terminal
- "[Experiment with brighter backgrounds / is there a way to combine this
  more with the paper foundry aesthetic which looks super clean in light
  mode imo]"
- Blue-box consistency note: "[Consistency: blue box highlight wherever
  using this little flag box (here the source locale is missing the blue,
  and below in the developer section the highlight is different in grey).
  However the text should not be blue… another issue is that clicking the
  target locales actually translates the terminal?? Also use only 1 or 2
  languages as example (hello world and get started); if using two, make
  use both have the third column rotating through target locales (i.e.
  confusing when only one is moving), also noting payment received
  overlaps]" (approximate tail — verify at node capture)
PREVIEW window: "[More padding on this text block] [Noting another display
to help user: see you can move the box, maybe arrow?] [Should be consistent
language display, so also de and zh]"
LOGO WALL: "[make sure logos are updated from their current sites, some of
these like clickhouse have off spacing] [for now also hyperlink to their
website] [reorder logos: cursor, ramp, partiful, profound, sierra,
clickhouse]" and "[Make this text & the logos way bigger and likely
black/white not grey, since we want to make this very visible; also this
makes me think that maybe hero section text should also be left-aligned if
every other header is; personally pref the left-aligned look cc
https://cursor.com/home]"
FULL STACK: "HEADER: The full stack for localization. SUBHEAD: Everything
you need to reach your next billion global users." + "[Move through each
layer as you scroll — although is it possible to go bottom-up? since
technically want to start from foundations in code and build up from
there] LAYERS: • Agents — Automate the whole process. Locadex keeps your
app localized with every update. The Locadex agent is the fastest way to
localize your app, end-to-end. Just merge a PR. • Translations — See
translations in every target locale, in just minutes. Review both static
and dynamic content before you go live. Preview, annotate, and approve
from the Dashboard. • Context — Deliver the best experience of your
product in every language. GT translates with full understanding of your
context. Define key product terms, tone, and style to keep consistent
across every surface. • Code — Your codebase is the source of truth. GT
internationalizes it to support 120+ locales. Open-source
internationalization (i18n) libraries with SDKs for every stack."
DEVELOPER EXPERIENCE: "HEADER: Built for developers. SUBHEAD: General
Translation handles all the messy parts of localization." Three columns:
1) "Every locale is a different length. Some change your entire
orientation. GT renders components correctly for every language. [maybe
also give hebrew example for right to left]" 2) "Every locale uses
different numbers, currencies, dates, plurals, and more. GT handles every
possible branch and edge case. [bolster this graphic with a few more
examples from these often-listed categories to help emphasize why it is a
thorny problem; maybe a bento wider/bento or expanding this to take up more
space than 1 column as it is here; also great/find thing generally has some
UI fixes (the 22 is too big and looks like different font, use '2 plural
forms' instead of '2 forms' to make clear); the numbers/currencies thing is
already shown in the above ticker … either move next to make clearer or
make a simplified duplicate]" (approximate — verify) 3) "Every locale needs
to be routed correctly. GT automatically routes your users to the correct
SEO-friendly URL path. [text (either on hover or replacing like in
bottom?): Localizing in French means translating both the pathname and the
page]"
LOCADEX: "HEAD: The easiest way to localize your full system in native
speed and quality." + "Run the Locadex agent. Connect your repository to
our custom-built AI agent. Just merge a PR." + Locadex dark card +
"[need better visuals for Locadex: suggest gif of scanning motion in the
parallax section]" → OVERRIDDEN BY KEVIN: isometric diagram, house iso
principles, NOT a gif.
INTEGRATE: "Integrate with any tool. Just a few clicks to integrate with
your Google Drive, CMS platform, or docs framework" + "[need visuals for
this section]"
CONTEXT section header: "HEADER: Localize in context…" (capture pending)
+ BENTO HEADERs "Translations that work dynamically. SUBHEAD: Generate
variants for all possible values and user responses." (one of the two
BENTO HEADER nodes; verify both)
ENTERPRISE tail (from panel names, capture pending): "Built for the
enterprise. Enterpris…", "Served from the edge. Translation…", "120+
languages, in every writi…", "HEADER: Ship to the world. SUBH…",
"HEADER: Deploy today. SUBHEAD…", "SUBHEAD: Review from one surfa…",
"[glyph rise background in this sec…]", "[this is nice visual to explain
local…]", "[this should take up less space th…]".

## Next steps
1. Finish node harvest (scroll panel; then Drafting page).
2. Navigate each node, screenshot, transcribe EXACT wording into this doc.
3. Design mapping: v0 sections -> five site homes (each keeps its hero
   variant; sections below follow this flow) + the non-terminal-hero
   variant (terminal demoted to a section).
4. Build per section with house grammar; Locadex = isometric (reuse
   tc-stack-iso family principles); full-stack scroll-through = iso stack
   with scroll steps; logo wall big/black-white with links + order:
   cursor, ramp, partiful, profound, sierra, clickhouse (sierra logo asset
   needed — not currently in public/logos).

## SWEEP 2 — verbatim section content (Aug 4 session)

### CLOSING / GET STARTED band (node 17-4 image, 995x332 + 17-2 text)
"HEADER: Deploy today. SUBHEAD: Join the world's best developer teams on
General Translation." Visual mock: full-bleed chroma-tunnel band (very
much our prismatic/wide-rule material), eyebrow "REACH EVERY USER",
headline "Deploy today in every language.", sub "Talk to an engineer
about implementation, or get started for free.", buttons [Get started]
[Get a demo]. Note 17-18: "[not a big fan of this graphic personally …
(combine) with rest of the aesthetic … s etc.]" → build it in house
material (prismatic band grammar), not the mock's random gradient. A
second note tail nearby: "…for light mode as currently it's a bit random]".

### ENTERPRISE section right column + testimonial
- 17-12: "Built for the enterprise. Enterprise plans include custom FDE
  hours to build any workflow for your use case. Plus SSO, SOC 2 Type II,
  ISO 27001, and audit logs."
- 12-237 image: REAL testimonial — x.com/theo embed, dark card: "Every
  once in awhile, I see a snippet of code that makes me a bit emotional.
  Now is one of those moments. Internationalization went from “$%!# this”
  to “trivial”." — Theo, CEO, T3Chat, "View the post". (REAL words — keep
  verbatim, link the post.)
- 17-14 note under it: "[this should take up less space … font size …
  between … need to … for light mode as currently it's a bit random]"
  (verify exact tail at node fit if needed).

### SHIP TO THE WORLD (globe) section (nodes 14-437 text + 14-439 image)
"HEADER: Ship to the world. SUBHEAD: GT is deployed in production apps
with millions of global users". Visual: dark card, wireframe meridian
globe with chroma wash + latency/PoP readout lines on its right (=our
EdgeGlobe + prismatic material). Right column bullets:
- 12-328: "120+ languages, in every writing system. zh is distinct from
  zh-HK. GT covers every re[gion?] … 78 base languages that expand into
  129 dist[inct locales]" + small locale-code table screenshot + 12-329
  note: "[this is nice visual to explain locale codes, the second …
  seeing scripts though. if possible to combine]" (capture exact tails
  at node fit).
- 17-10: "Served from the edge. Translations are served from a
  low-latency C[DN …] locale. Fix a string or roll it back without
  tou[ching …]" (capture exact tail at node fit).
- 17-12 (Built for the enterprise — above).

### REVIEW WORKSPACE section (nodes 14-433 text + 14-398 image)
"SUBHEAD: Review from one surface. SUBSUBHEAD: Edit and approve
translations with your team in a side-by-side view with diffs and version
history." Mock: light workspace panel — header "WORKSPACE · ES-419 /
4 STRINGS", columns "SOURCE — EN | TRANSLATION — ES" with rows:
"Hello, world! → ¡Hola, mundo! APPROVED"; "Launch in every language →
Lanza en todos los idiomas APPROVED"; "End-to-end localization for the
world's best companies → (strikethrough old) Localización integral para
las mejores empresas del mundo. [edit]"; "By contin▌ (typing)"; footer
"⌘K search · history · download        agent · locadex". Left copy in
mock: "Edit in context. Agents write translations. You review, edit, and
approve in a focused workspace. — Side-by-side source and translation
view — See diffs when translations are regenerated — Edit translations
before or after they go live" with note "[replace all of this with above
text]" (i.e. use the SUBHEAD/SUBSUBHEAD copy, not the mock's).
=> maps to our ReviewWorkspace component family.

### CONTEXT BENTO ROW (4 bentos; near 14-400 note "[glyph rise background
in this section]" — the section behind gets the glyph-rain rise material)
1. "BENTO HEADER: Translations that reflect your application logic.
   SUBHEAD: GT translates your content in the context of your codebase."
   Visual (14-394, 273x218): 🇺🇸 en "Save" node branching in a doubled-
   thread Y into context="file" → "speichern" (de · write it to disk)
   and context="discount" → "sparen" (de · spend less money).
2. "BENTO HEADER: Translations that reflect your key terminology.
   SUBHEAD: Define a glossary with key product, brand, and feature terms
   to inherit universally." Visual (249x131): glossary card "Vault
   pinned / de Vault / es B̶ó̶v̶e̶d̶a̶ Vault". Notes: "[more languages in this
   example.] [maybe also add second illustrative example: never translate
   “Locadex”]"
3. "BENTO HEADER: Translations that reflect your voice and style.
   SUBHEAD: Define directives to guide tone and style for translations."
   Note: "[need visual here that shows a few examples of directives. can
   be for: audience, formality, conventions, and formatting. example: Use
   active voice, avoid jargon, and use formal “Sie.” since glossary shows
   different languages here just show it for one language]"
4. "BENTO HEADER: Translations that work dynamically. SUBHEAD: Generate
   variants for all possible values and user responses." Note: "[need
   visual here that shows how derive logic works. can be a branching on
   the bento. maybe with female variant in spanish]"
Context section header above this row = node 14-399 "HEADER: Localize in
context. SUB…" (capture exact subhead at node fit).

## SWEEP 3 — exact wording finals
- 14-399: "HEADER: Localize in context. SUBHEAD: GT connects your code,
  content, and translations."
- 12-328: "120+ languages, in every writing system. zh is distinct from
  zh-HK. GT covers every regional variant, with 78 base languages that
  expand into 129 distinct locale tags."
- 12-329 note: "[this is nice visual to explain locale codes, the second
  is cool for seeing scripts though. if possible to combine]" — visuals:
  (1) locale-tag expansion table (base rows ar/zh/es/fr with locale-tag
  chips, footer "…78 base languages · 129 distinct locale tags"),
  (2) scripts grid: язык ru·Cyrillic, भाषा hi·Devanagari, 语言 zh·Han,
  language en·Latin, γλώσσα el·Greek, لغة ar·Arabic, ภาษา th·Thai,
  언어 ko·Hangul (= exactly our EVERY/glyph vocabulary — combine both
  into one artifact per the note).
- 17-10: "Served from the edge. Translations are served from a
  low-latency CDN, versioned per locale. Fix a string or roll it back
  without touching your code."
- Locadex visual (from context shots): dark PR card ending
  "merged · +38 −6 · checks passed" → build as HOUSE ISOMETRIC diagram
  (Kevin's override: same iso principles as our other iso diagrams; the
  PR/merge story can live in the iso composition; NOT a gif).
- Deploy band CTA labels: [Get started] [Get a demo]; hero CTAs:
  Get started / npx (copy command) per flow.

## STATUS
Extraction ~90% complete. Remaining nits: hero-area node exact texts
(largely transcribed in Sweep 1 annotations), full-stack iso mock
screenshot 2.36.2 (superseded — we use our own tc-stack-iso family),
[cut this line] / hover-text nodes in DX (transcribed approximately),
Drafting page (unopened; likely scratch). BUILD PLAN: implement shared
v0 sections once under src/app/d/_v0/sections (root-agnostic tc grammar):
Customers logo wall (big, black/white, linked, order cursor ramp partiful
profound sierra clickhouse — need sierra asset), FullStack iso
scroll-through (Agents/Translations/Context/Code layers copy verbatim,
tc-stack-iso family), DX problem/solution bentos (3 cols verbatim +
hebrew RTL example note), Locadex ISO + Integrate row, Context section
(header + 4 bentos verbatim + glyph-rise background + ReviewWorkspace
"Review from one surface"), Ship-to-the-world globe section (EdgeGlobe +
3 bullets verbatim + Theo testimonial verbatim), Deploy band (prismatic
material, REACH EVERY USER eyebrow-less per house rules — keep wording).
Then integrate below each of the 5 site heroes; Orbit becomes the
non-terminal-hero arrangement (terminal demoted into the Intro section).
Register nothing new; reshoot thumbs; full gates; ship both repos.

## ROUND 2 — THE LITERAL PLAN IMAGES (Aug 4, from Kevin directly)
Verdict on round 1: only the Locadex isometric survived ("the only thing
i really like u made is the locadex animation, which should have the
locadex logo on it. lets rebuild following this structure").
Mock layouts are LITERAL specs, not copy sources.

### Nav bar (applies to the five v0 homes)
Product > Locadex, Context, Infrastructure · Resources > Customers,
Blog, Careers · Enterprise · Pricing · Docs.

### Developer Experience (rebuild)
HEADER: Built for developers. SUBHEAD: General Translation handles all
the infrastructure, so you no longer need to think about localization.
- Save bento: "Every locale is a different length. Some change your
  entire orientation. GT renders components correctly for every locale."
  [maybe also give hebrew example for right to left]
- Numbers bento: "Every locale uses different numbers, currencies,
  dates, plurals, and more. GT handles every possible branch and edge
  case." [bolster with more examples from the listed categories — maybe
  a bento within bento or let it take more than 1 column. plural UI
  fixes: the 22 is too big / looks like a different font; say "2 plural
  forms" not "2 forms". the numbers/currencies thing is already shown in
  the above ticker — either move here to make clearer or make a
  simplified duplicate]
- Routing bento: "Every locale needs to be routed correctly. GT
  automatically routes your users to the correct SEO-friendly URL path."
  text (either on hover or replacing line at bottom): "Localizing in
  French means translating both the pathname and the page." [cut this
  line] (= the current bottom line goes)

### Locadex (keep the iso; refine)
SUBHEAD: The easiest way to localize your full system in native speed
and quality. ("your ?ll system" partially clipped in capture)
- "Run the Locadex agent. Connect your repository to our custom-built
  AI agent. Just merge a PR." — the iso stays (mock card: PR #218 ·
  +38 −6 · checks passed); ADD the Locadex logo to the agent slab
  (public/brand/locadex-mark.svg, mask-rendered).
- "Integrate with any tool. Just a few clicks to integrate with your
  Google Drive, CMS platform, or docs framework." [need visuals for
  this section] → build a real connector visual, not a marks row.

### Context (rebuild bentos with their own headers)
HEADER: Localize in context. SUBHEAD: GT connects your code, content,
and translations. [glyph rise background in this section]
1. BENTO: Translations that reflect your application logic. / GT
   translates your content in the context of your codebase. (Save →
   «speichern» context:'file' vs «sparen» context:'discount' fork)
2. BENTO: Translations that reflect your key terminology. / Define a
   glossary with key product, brand, and feature terms to inherit
   universally. (Vault pinned) [more languages in this example] [maybe
   second illustrative example: never translate "Locadex"]
3. BENTO: Translations that reflect your voice and style. / Define
   directives to guide tone and style for translations. [need visual:
   a few directive examples — audience, formality, conventions,
   formatting. example: Use active voice, avoid jargon, and use formal
   "Sie." show for ONE language since glossary already shows many]
4. BENTO: Translations that work dynamically. / Generate variants for
   all possible values and user responses. [need visual: logical
   branching like bento 1's fork — male/female variant in Spanish]
SUBHEAD: Review from one surface. SUBSUBHEAD: Edit and approve
translations with your team in a side-by-side view with diffs and
version history. Workspace rows: "Hello, world!" → "¡Hola, mundo!"
APPROVED · "Launch in every language" → "Lanza en todos los idiomas"
APPROVED · "End-to-end localization for the world's best companies" →
"Localización integral para las mejores empresas del mundo" [edit].
Left card: "Edit in context." + "Agents write translations. You review,
edit, and approve in a focused workspace." bullets: Side-by-side source
and translation view / See diffs when translations are regenerated /
Edit translations before or after they go live.

### Ship to the world (refine)
SUBHEAD: GT is deployed in production apps with millions of global users
- 120+ languages, in every writing system. — "zh is distinct from
  zh-HK. GT covers every regional variant, with 78 base languages that
  expand into 129 distinct locale tags." + locale-tag visual [nice
  visual to explain locale codes; the second is cool for seeing
  scripts — combine if possible]
- Served from the edge. / Built for the enterprise. (copy as round 1)
- Theo testimonial: [take less space — smaller font, less vertical
  space; there is a space in "T3 Chat"]

### Deploy (copy change)
HEADER: Deploy today. SUBHEAD: Join the world's best developer teams on
General Translation. [mock's graphic rejected — two lines on left +
eyebrows don't fit the aesthetic; keep house prismatic band]

## ROUND 3 — the non-terminal v0 + the interactive rounds (Aug 4)
What is now BUILT, verified against src/app/d/_v0/ and the five homes.

### The non-terminal v0 = the ORBIT home (singularity-orbit)
The terminal-hero demotion from the original scope note, shipped: orbit
is the arrangement (home.css header names it "landing non-terminal v0").
- HERO (glyph field): copy block LEFT — "Launch in every / language."
  static, sub, rainbow Get started (the production glow ported in
  v0-pages.css: blurred pink→blue→purple→green ring behind the solid
  button) + npx pill ($ npx gt@latest / Copy). The Docs button is CUT on
  this home (dossier keeps it). Behind the copy the house glyph field
  bleeds across the whole stage — createGlyphField(drift:'rise',
  glyphScale:1.18): a rising cloud of eight scripts condensing into the
  word "language" script after script. The compact terminal strip is
  retired; the hero trust card is hidden on all five v0 roots (the
  Customers wall below says it once).
- CUSTOMERS header: "Trusted by companies around the globe." (heading
  prop; default "Trusted by the best companies." stays on the other
  homes). Wall order cursor/ramp/partiful/profound/sierra/clickhouse,
  linked, full ink.
- FULL STACK subhead: "GT connects all the infrastructure you need in a
  single ecosystem." (sub prop; default keeps the "next billion" line).
- DX bentos re-headed: "Localization is complex." / "We handle
  everything: different languages, locales, translation, and
  internationalization." ("Built for the world's developers." is
  V0Developer's DEFAULT head — what the other four homes render.)
- BUILT (same day, later round): the window was extracted into the
  shared _v0/TranslateWindow.tsx (byte-identical behavior, computed-style
  baseline verified) and seated on orbit as _v0/sections/DevWindow.tsx —
  "Built for the world's developers." over a full-bleed night row —
  between Customers and Full Stack, so the flow now runs hero →
  Customers → developers-window → Full Stack → DX. The title bar carries
  the drawn GT mark + "Translate" in both hosts.

### The dossier window — the interactive contract (dossier hero)
- Preview is the DEFAULT face; seg [Preview][Terminal] (Eye /
  TerminalSquare icons). Faces change ONLY by hand — nothing calls
  setView but the seg; the guided pass (es → ja → de after the run
  settles) walks locales only and dies on the first manual input.
- Preview face: an Acme product mock — localized nav, heading, sub,
  stats row, button, toast; locale tabs es/fr/ja/de/zh; address bar
  example.com/{loc}. Stat VALUES are real per-locale Intl output
  (currency revenue, grouped invoice count, payout date) from fixed
  inputs, never transcribed strings.
- Locale switch: every localized line deletes and retypes, staggered top
  to bottom, whole swap ~0.9s (the ReviewWorkspace slice pattern — one
  text node per line, code-point slicing). Intl figures and the payload
  pane swap with one rise, no typing.
- Inspectors: the WHOLE component is the hit target; hover raises the
  rectangle + a chip naming the hashed payload key its string ships
  under (public/_gt/[locale].json's real shape — keys hash the SOURCE,
  constant across locales). CLICK pins: the seam rolls to 26% and the
  matching JSON row lifts; click-again / elsewhere / Escape dismisses
  back to the 70/30 rest.
- The living file: on an ~8s cadence (first edit ~4.9s in, past the
  capture window) one payload value re-edits in place — caret up,
  delete, retype to a per-locale alternate wording, back next cycle —
  one dial writes BOTH text nodes (JSON leaf + rendered button), so
  file and UI can never disagree.
- Also in the window: the stack strip (six frameworks as window
  furniture, id='frameworks'; the wizard's Detected line reports the
  pick, faces never switch), and the terminal face's replay settles in
  ~2.5s under the preview — flipping the seg always finds a finished
  run (128 strings, 640 translations, ✓ 12.4s).

### The four-beat flat stack (V0FullStack + StackTower)
- Founder revert to the ORIGINAL toolchain flat-plate format: four thin
  solid plates (thickness ~4% of footprint, ~40% air), one per beat,
  physical order = beat order — code, context, translations, agents,
  bottom-up, copy verbatim from the spec.
- Builds in on scroll: contiguous ScrollTrigger windows on one read line
  (58%); arriving slabs settle from 64px above, bottom-up; they leave
  again scrolling back. The hot slab lifts 12px, takes top z + the
  accent edge; the copy rail's spotlight moves with it.
- The connective rail: a doubled vertical (two 1px strokes at constant
  gauge) at the plates' left; corner-radius leader taps land on each
  plate's left vertex, mono labels at the leaders' ends; the rail
  extends and retracts with the build (RAIL_SCALE).
- Top-face artifacts, one per beat: the <T>-block rhythm (code),
  glossary + directives chips (context), source string + the one accent
  payload chip (translations), the Locadex mark mask-rendered in the
  plate's own ink (agents).
- Reduced motion / no-JS: the FULL stack, static, first beat lit.

### System decisions (v0-pages.css, all five homes)
- SINGLE RAIL: the doubled outer pair retires — .tc-rail::before and the
  nav pseudo go; bands mounted inside the rail draw no outer pair of
  their own.
- Registration crosses ONLY on the dark feature bands (full stack,
  context, deploy — .tcb-in / .v0-dep-in), at all four rail corners;
  ordinary sections and the nav stay uncrossed.
- FOLD BUDGET: the logo wall's row is visible at 1440×900 — hero
  paddings compressed, transcript one step tighter, the Customers lead
  set as a caption line; orbit's hero stage holds ~470px (clamp
  420–500px).
- Same family: square corners on hero cards, windows, framed cell cards
  and band mats (controls keep small radii); headers sit at the TOP of
  their bands — the section-head altitude removed.
