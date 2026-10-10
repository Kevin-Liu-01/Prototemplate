---
name: gt-voice
description: >-
  How Kevin writes for General Translation: plain technical English for site
  copy, docs, decks, captions, films, UI strings, PR text and Slack; sentence
  shape; the heading and casing rules; writing for a stranger; the humanizer
  pass that strips AI patterns; code comments, commit messages and PR
  descriptions; and the first-person register for Kevin's own posts and
  reviews. Use when writing or editing any text Kevin will ship, publish or
  read, including code comments and PR descriptions, and before showing him
  a draft.
metadata:
  title: Voice and the humanizer
  areas: voice
  updated: 2026-10-10
  origin: prototemplate
  owner: P
---

# Voice and the humanizer

General Translation (GT) builds localization tools for developers: the
open-source `gt` libraries and a translation platform. Kevin Liu works at
GT, and the rules below come from his reviews of GT writing. GT copy has the
register of a technical specification: complete declarative sentences,
concrete nouns, and a number or a mechanism where marketing would put an
adjective. Kevin's own posts and reviews use the same plain words in the
first person. Every draft goes through the humanizer pass and the review
checklist below before Kevin sees it.

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`) unless they
name a gt-cloud checkout (`$GT_CLOUD`). A deck slide number is the file
prefix in `deck/slides/`: slide 62 is `62-content-rule.html`. The deck
viewer's counter counts position, so it can show a lower number.

## Two registers

| Register | Where it applies | Shape |
| --- | --- | --- |
| GT copy | The site, the docs, the blog, decks, captions, film titles and narration, README and CLI text, UI strings, GT's posts on X, LinkedIn, GitHub and Discord, Slack summaries | Sentence case, complete declarative sentences with one claim each, no hedging, no first-person reactions |
| Kevin's own writing | His personal posts, peer reviews, notes, and the PR titles and bodies he opens | First person, his own phrasings kept, real reactions welcome, lowercase on posts and PRs |

- GT copy follows the five rules of the deck's Writing style slide (slide
  12). Sentences are short and declarative, and each carries one claim. A
  number or a mechanism stands where a marketing adjective would. Nothing
  is hedged, so a claim is made or it is left out. Exclamation marks and em
  dashes are not used. Sentence case is used everywhere, and Title Case only
  on buttons.
- In Kevin's own writing, "I think", "I don't think", "As I see it", "My
  first reaction was that", "What I keep coming back to is that" and "Where
  I land on prioritization is that" are welcome (Kevin, 2026-10-01). When
  you rewrite his draft, keep his first-person phrasings and his longer
  sentences. Chopping his prose into short sentences also reads as AI to him.
- Personal posts follow the founder-post register of deck slide 63:
  lowercase, terse and first person. Kevin's PR prose is lowercase too
  (Kevin, 2026-08-14 and 2026-10-05). Code identifiers in backticks keep
  their case.
- Both registers make no claim without a number, a mechanism or an
  artifact, and both avoid founder cliches such as "thrilled to announce".
  A post passes three checks before it goes out: only GT could have written
  it, it cites concrete evidence, and it supports the reputation for quality
  (deck slide 63).
- Third-person bios, intros and spoken answers about Kevin belong to the
  wiki's kevin-voice skill, whose blurbs are credential fragments by design.
  X and LinkedIn formats (length, links in a reply, hashtags at the bottom)
  belong to the wiki's social-draft skill. Both skills carry the same bans
  on dashes, contrast pairs and marketing words.
- A launch is an X thread and a LinkedIn post drafted together, with the
  open-source credit order and Kevin's posted edits carried forward:
  [references/launch-posts.md](references/launch-posts.md). Slack updates,
  team replies, teammate specs and partner replies take the shapes in
  [references/messages.md](references/messages.md).

## Hard rules

These hold in both registers unless a rule names one.

1. No em dashes. Use a period, a comma, a colon or parentheses. The en dash
   and a double hyphen count as dashes in prose too (wiki kevin-voice and
   social-draft), so a range reads "slides 17 to 23". The lint
   `gt-ui/no-em-dash` fails any string that holds U+2014. It reads
   JavaScript and TypeScript strings only, so grep Markdown, MDX, the deck's
   HTML and PR bodies yourself. The wiki social-draft skill makes one
   exception: an em dash Kevin wrote himself in a post's source stays. An
   agent never adds one.
2. No metaphors or analogies. "The ground is the seam" and "a growth lever"
   are out. The one sanctioned comparison is the company's own positioning,
   stated plainly: "The positioning is the Vercel model applied to
   localization." (deck slide 07, BRAND.md section 2).
3. No contrast pairs: "X, not Y", "never X, always Y", "not just X but Y",
   "It's not X, it's Y", "X isn't the goal. Y is." State the positive claim.
   When a contrast carries real information, show it with a concrete
   example.
4. No fragment rhythm. One-word sentences ("Literally."), strings of short
   fragments for cadence, and a noun phrase with a comma tail ("Open-source
   libraries and a closed platform, built together.") all read as AI to
   Kevin (2026-09-08).
5. No exclamation marks.
6. No rhetorical questions in GT copy, film narration included (MOTION.md,
   Copy and Sound).
7. No signposts or content labels. "Three facts matter.", "The facts that
   matter are that", "The simplest answer comes from", "Here's what you need
   to know", "Let's dive in" and "This section covers" all go. State the
   content (Kevin, 2026-10-01).
8. No eyebrows. A small uppercase tracked line above a heading that restates
   it is noise; Kevin's words were "3 lines of text stacked to say the same
   thing". A functional tag (a locale code, a date, a version) is fine. The
   lint `gt-ui/no-eyebrow` flags `uppercase` together with a wide tracking
   utility, or an inline style with an uppercase transform and a positive
   letter spacing.
9. No marketing vocabulary: supercharge, cutting-edge, unlock, game-changing,
   leveraging, ecosystem, synergy, passionate about, humbled, super excited,
   the future is here (deck slide 12, wiki social-draft and kevin-voice).
10. No emojis unless Kevin asks for one. A flag is never an emoji; it is an
    SVG chip beside a locale code (BRAND.md section 9).

## Sentence shape

- Every sentence has a subject and a verb, captions included. A short data
  label carries no comma tail: "16px favicon" rather than "16px, favicon",
  and "The X banner at 1500 by 500 pixels." rather than "The X banner, 1500
  by 500." (Kevin, 2026-09-08).
- Keep the subject short. When more than about six words stand before the
  verb, reorder so the short frame comes first and the long content comes
  last (Kevin, 2026-09-20).
- Nothing interrupts a clause. A comma-bounded aside between subject and
  verb, an appositive dropped into a clause, and an aside before a colon all
  read as AI to Kevin. Write two sentences.
- Put a frame first only when a sentence needs one, such as crediting a
  catch in a review. A frame is never a label added on top of content.
- Name the actor when the actor matters. A passive is fine when the actor is
  obvious, as in the deck's "Translations are generated at build time and
  deploy with the app."
- Use a technical term precisely and sparingly, then explain it plainly
  (BRAND.md section 3).
- In gt-cloud, UI copy goes through `<T>` or `gt()` (gt-cloud CLAUDE.md).
  Keep a sentence inside one `<T>` block or one `gt()` string so it
  translates as a whole. `gt-next/no-dynamic-string` and
  `gt-next/no-dynamic-jsx` warn on built-up content in apps/dashboard.

## Headings and casing

- Headings use sentence case. The first letter is a capital, proper nouns
  keep theirs (General Translation, Prototemplate, Glyphfield, Locadex,
  Fumadocs, GitHub), and every other word is lowercase.
- A heading or a short label has no trailing period; a body sentence keeps
  its period (Kevin, 2026-09-08). The lint `gt-ui/no-heading-period` fails
  an `h1` to `h6` whose last text ends in a single period.
- Slide and section titles are plain nouns: "Brand personality", "Writing
  style", "Anti-patterns", "Small sizes". The claim goes into the first
  sentence of the body (Kevin, 2026-09-08). deck/DECK-GRAMMAR.md also
  allows a plain statement as a heading.
- A display heading runs to two lines at most. Kevin named three-line
  headers as a defect of the first site rebuild (2026-08-04). In the films
  a heading that does not fit two lines at 100 px is shortened to the
  post's own shorter wording (MOTION.md, Round 4 direction, 2026-10-01).
- Title Case appears only on button labels. On the gt-cloud landing every
  button is the shared `Cta`, and `gt-ui/cta-title-case` requires a capital
  on every word except a short function word after the first (a, an, and,
  as, at, but, by, for, in, nor, of, on, or, the, to, vs, with). Examples
  are "Get Started", "Get a Demo" and "Talk to Us" (generaltranslation.com,
  read 2026-10-06).
- Product tokens keep their exact form and code formatting where the
  surface allows it: `gt`, `gt-next`, `gt-react`, `gt-vue`, `gt-node`,
  `gt-python`, `npx gt translate`, `gt login`, CLI, API. A token never
  starts a sentence or a heading, so another word goes first ("The `gt`
  library", "Run `npx gt translate`").
- The naming system is fixed (BRAND.md section 1). General Translation is
  the company. GT is the short form and the mark. `gt` is the open-source
  library, and Locadex is the AI agent product.
- A heading is a name. A domain belongs in the body, so the heading reads
  Prototemplate and the body gives prototemplate.com (deck/DECK-GRAMMAR.md,
  Type).
- Monospace is for code artifacts only (tokens, commands, file paths). A
  heading or a paragraph is never set in mono (BRAND.md section 6, lint
  `gt-ui/mono-is-not-voice`).

## Writing for strangers

Public writing (blog posts, docs, launch copy) is for a developer who has
never heard of Kevin or GT. Kevin wants it "so much more straightforward and
clear to a user who has no idea who I am" (2026-09-10).

- Define the product and the site once, in plain words.
- Open each section with the point a stranger can reuse. The implementation
  and the numbers follow as evidence.
- Cut PR numbers, colleague first names, process narration, and component
  or file names that teach nothing. Keep an API or a component name when
  the reader can act on it, such as Next.js `notFound()` or
  `Accept: text/markdown`. A short notes list at the end can hold credits.
- Keep transitions short and informative. A meta sentence about the text
  itself is cut.
- Keep every fact verified. An edit may reword, cut or add context, and it
  never changes a fact.

## Facts and public surfaces

- The copy test from the product video review: every line states a number
  or a mechanism, and a line that could appear unchanged in a competitor's
  video is cut (deck slide 62). The test covers site copy, docs
  introductions, blog posts, README and CLI text, and posts on X, LinkedIn,
  GitHub and Discord.
- Titles, names and dates appear exactly as published. Quote the source or
  paraphrase it faithfully (MOTION.md, Copy).
- Nothing sensitive appears on a public surface: funding, revenue and its
  mix, headcount, customer counts, and unannounced launches with their
  timing (brand questionnaire, 2026-08-11; MOTION.md, The facts the films
  may state). Prototemplate is a public repository, so the rule covers its
  docs, deck and skills too.
- In the films, a customer that BRAND.md section 9 names appears only as
  BRAND.md states it (MOTION.md, The facts the films may state).
- The tagline "Every product in every language" is the company's own line
  (BRAND.md section 2) and is quoted as written.
- Enterprise copy never implies GT is better than the customer's team. It
  says GT adapts to their stack, workflows and review process, used by
  their own team or alongside forward-deployed engineers (the CEO, relayed
  by Kevin, 2026-08-15).
- A docs get-started caption opens with the action the reader takes ("Use",
  "Install"), never with "Learn" (2026-08-26).

## The humanizer pass

Run the pass on every draft before Kevin sees it. The full pattern catalog,
with rewrites, is in [references/ai-patterns.md](references/ai-patterns.md).

1. Read the draft through once.
2. Mark every pattern from the catalog and every hard rule above that the
   draft breaks.
3. Rewrite in the right register, then check the hard rules again.
4. Ask what still makes the text read as machine-written, and fix it.
5. Score directness, rhythm, trust, authenticity and density from 1 to 10
   each. Revise again when the total is under 35 of 50.

| Group | What to look for |
| --- | --- |
| Inflation and promotion | stands as, is a testament to, pivotal, crucial, underscores, setting the stage for, groundbreaking, vibrant, stunning |
| Superficial analysis | a trailing "-ing" clause such as highlighting, showcasing, emphasizing, fostering or reflecting |
| AI vocabulary | delve, tapestry, landscape (abstract), interplay, intricate, garner, enduring, enhance, foster, additionally, "increasingly" before an adjective |
| Copula avoidance | serves as, stands as, boasts, features where "is" or "has" would do |
| Forced structure | the rule of three, synonym cycling, false ranges ("from X to Y" with no scale), a passive that hides the actor |
| Formatting tells | mechanical bold, a bold inline header on every bullet, Title Case headings, emojis |
| Conversation residue | "I hope this helps", "Let me know", "Great question", filler ("in order to", "due to the fact that"), hedging stacks |
| Empty framing | vague attributions ("experts argue"), generic upbeat endings, false agency ("this guide aims to"), narration from a distance, setup loops ("The real question is", "At its core") |

The wiki humanizer (version 2.5.2-kevin) predates Kevin's 2026-09-08
directive, and it differs from the rules above in three places. The rules
above apply to everything Kevin will read or ship.

- The humanizer's voice profile asks for punchy one-line paragraphs,
  stacked one-line lists, rhetorical questions in series, fragments such as
  "Not a title. An operating mode." and a punchy closing line. On
  2026-09-08 Kevin rejected fragments strung for rhythm in decks, docs,
  site copy, PR text and Slack summaries.
- The humanizer favors short sentences. In Kevin's reflective writing his
  longer sentences stay (2026-10-01).
- The humanizer drops hyphens from common compound modifiers. GT copy keeps
  the hyphen in a compound modifier before a noun, as in "open-source
  libraries" (deck slide 07) and "sentence-case headings" (deck slide 63).

Two canon documents still carry older examples. BRAND.md section 3 offers
"the ground is the seam" and "One pipeline. Every language ships with the
deploy." as voice examples, and MOTION.md's Copy section repeats the second.
Both predate the 2026-09-08 rules (a metaphor, and a fragment before a
sentence), and Kevin rejected the second as a heading. Deck slide 12 holds
the current examples.

## Code comments, commits and PR descriptions

Code comments follow gt-cloud's code-comments skill.

- A comment answers one of two questions: what the code does (its contract
  of inputs, outputs, failure modes and decision rules), or what must stay
  true (a constraint the code cannot show).
- Write it in one or two lines, present tense and third person, without
  "we": "Returns null unless the locale is supported."
- The reason a comment may give is the constraint itself: "Non-ASCII must
  fail this test: CJK prose contains no spaces, so a whitespace check alone
  cannot exclude it."
- Feature justification and implementation history belong in the PR
  description or the commit message. A note to the reviewer ("this is safe
  because") and a comment that narrates the next line are deleted. A module
  header describes what the module's functions do in one or two sentences,
  with no tour of the product problem.
- Before keeping a comment, ask whether the sentence would still be true
  and useful if the feature discussion had never happened.
- Match the density of the surrounding file. Kevin reads comment lines as
  part of a PR's size; on 2026-10-02 he sent back a PR whose product
  comments were 20 percent of its added lines.

Commit messages follow each repository's own form.

- gt-cloud subjects are conventional commits: `type(scope): summary`, with
  a lowercase summary that keeps proper nouns and acronyms, and the squash
  merge appends the PR number:
  `fix(api): cap MCP request bodies at the API body limit (#5102)`. gt-ship
  holds the allowed types and the Linear rule for `feat`.
- Prototemplate subjects are plain sentence-case lines with no type prefix
  and no closing period. Most recent ones state what is now true ("The blog
  films on /brand are the round 7 cuts"), and some are imperatives ("Add
  the page check: every page at ten viewports in both themes").

PR descriptions combine gt-cloud's pr-desc skill with Kevin's own spec.
gt-ship holds the body's structure, the screenshots, the bot blocks to keep
and the PR size audit. The prose rules are these.

- Say what the PR delivers and what changes for a user or a system. Two to
  four sentences is often enough. Skip the line-by-line tour and the
  implementation approach, and name a file only when a reviewer should
  scrutinize it.
- Kevin's PR text is lowercase, with no em dashes, no Claude references and
  no generated-with footer (2026-08-14). On his upstream open-source PRs he
  also wants the mechanism explained from first principles and the
  screenshots carrying the story (2026-10-05).
- Check every claim against the code and the images before publishing.

## Before and after

[references/before-after.md](references/before-after.md) holds the rewrites from Kevin's reviews, each with its rule: comma-tail headings to plain nouns, marketing lines to mechanisms, metaphors to the mechanism, content labels to the content, long subjects reordered, and a justifying code comment turned into a contract.

## Review checklist

- [ ] No em dash, en dash or double hyphen in prose, and ranges read "X to Y".
- [ ] No metaphor or analogy apart from the Vercel positioning.
- [ ] No contrast pair ("X, not Y", "never X, always Y", "not just X but Y").
- [ ] Every sentence and caption has a subject and a verb. No fragment
      strings, one-word sentences or comma-tail headings remain.
- [ ] No subject runs past about six words before its verb, and no aside
      sits between subject and verb or before a colon.
- [ ] No signpost, content label, eyebrow or exclamation mark appears, and
      GT copy has no rhetorical question.
- [ ] Headings are in sentence case, titles are plain nouns, no heading ends
      in a period, and no display heading runs past two lines. Title Case
      appears only on buttons.
- [ ] Product tokens are exact and never open a sentence, and a domain sits
      in the body.
- [ ] Each claim carries a number, a mechanism or an artifact, and the copy
      test passes.
- [ ] Every fact, title, name and date matches its source, and nothing
      sensitive is on a public surface.
- [ ] A stranger can follow the text: the product is defined once and no
      internal PR numbers or names sit in the prose.
- [ ] Kevin's own writing keeps his first-person phrasings and his sentence
      length.
- [ ] The humanizer score is 35 of 50 or higher.
- [ ] The lints pass where they run, and the grep is clean everywhere else.

These commands run the checks. The last two cover the prose no lint reads,
and they use grep with bash or zsh quoting, so they run without ripgrep.

```sh
# Prototemplate: gt-ui over src/app, src/components and src/lib
# (deck/, public/ and the archived src/app/d are ignored).
cd "$PROTOTEMPLATE" && pnpm lint:code

# gt-cloud: oxlint and oxfmt at the root. no-em-dash and no-heading-period
# run on apps/landing and packages/ui; no-eyebrow and cta-title-case on
# apps/landing.
cd "$GT_CLOUD" && pnpm lint
cd "$GT_CLOUD" && pnpm exec oxlint --quiet apps/landing/src/components

# Em and en dashes in the deck, the blog copies and the Markdown that /docs
# and /handbook render (the lists are in src/app/docs/registry.ts).
cd "$PROTOTEMPLATE" && grep -rnE $'\xe2\x80\x94|\xe2\x80\x93' deck/slides content \
  BRAND.md DESIGN.md ARCHITECTURE.md AGENTS.md docs/SHIP-LOOP.md docs/LIBRARIES.md \
  docs/GRAPHICS.md docs/handbook

# Dashes, double hyphens and exclamation marks in a PR body saved to a file.
grep -nE $'\xe2\x80\x94|\xe2\x80\x93| -- |[[:alnum:]]!([[:space:]]|$)' pr-body.md
```

The dash scan finds existing debt. On 2026-10-05 DESIGN.md, ARCHITECTURE.md,
docs/SHIP-LOOP.md and docs/LIBRARIES.md held em dashes, and /docs renders all
four. Add none, and remove the ones in a passage you edit. `content/blog`
holds copies of published posts, which keep their published wording. A
` -- ` hit inside a code block is a command flag.

## Related skills

Kevin's wiki keeps humanizer, kevin-voice, social-draft and slack-voice,
the general skills this one distils. kevin-voice writes third-person bios
and intros about Kevin, social-draft sets the X and LinkedIn formats, and
slack-voice drafts Slack messages. In this set, gt-reporting owns reports
and PR slates to Kevin, gt-lints owns the gt-ui rules, gt-deck the deck's
grammar, gt-films the narration and on-screen copy of the films, and
gt-ship the PR flow, the PR body's structure and the PR size audit.

## Sources

[references/sources.md](references/sources.md) lists the deck slides, the canon sections, the lint rules, the gt-cloud and wiki skills, the memory notes and Kevin's dated directives behind each rule, and the lines changed on 2026-10-10.
