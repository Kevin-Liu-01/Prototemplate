# AI patterns and their rewrites

This catalog is the pattern list of the wiki humanizer
(skills/personal/humanizer/SKILL.md, after blader/humanizer, Wikipedia's
"Signs of AI writing" guide and hardikpandya/stop-slop), with the GT rules
from Kevin's directives added. Each entry names the pattern, gives the
tells, and shows the rewrite. Where an example uses a GT fact, the fact
comes from BRAND.md or the deck.

## Content

1. Significance inflation. The tells are "stands as", "is a testament to",
   "pivotal", "crucial", "underscores" and "setting the stage for". Cut the
   ceremony and state the fact.
   - Before: "The CLI stands as a pivotal part of the localization workflow."
   - After: "Running `npx gt translate` translates the project."
2. Superficial "-ing" analysis. A clause such as "highlighting",
   "showcasing", "emphasizing", "fostering" or "reflecting" tacked onto a
   sentence adds no information. Delete it, or turn it into its own
   sentence with evidence.
3. Promotional language. The tells are "groundbreaking", "vibrant",
   "stunning", "breathtaking", "nestled" and "in the heart of", plus the GT
   list: supercharge, cutting-edge, unlock, game-changing. State the
   mechanism and let the reader judge it.
4. Vague attribution. "Experts argue" and "Industry reports suggest" name
   no one. Name the source or cut the claim.
5. The formulaic challenges section. "Despite its challenges, it continues
   to thrive" says nothing. Name the specific problem and what was done
   about it.
6. Narration from a distance. Copy that hovers above the scene has no
   person, decision, artifact or consequence in it. Say who did what, what
   changed, and what evidence shows it.

## Language

7. AI vocabulary. Replace "delve", "tapestry", "landscape" (abstract),
   "interplay", "intricate", "garner", "enduring", "enhance", "foster",
   "underscore" and "additionally" with plain words.
8. "Increasingly" before an adjective. "Increasingly complex" says only
   that something is complex. Say what it is.
9. Copula avoidance. "Serves as", "stands as", "boasts" and "features"
   replace a plain "is" or "has".
   - Before: "Locadex serves as GT's AI agent."
   - After: "Locadex is GT's AI agent product."
10. Negative parallelism. "Not only X but also Y", "It's not X, it's Y" and
    "X isn't the goal. Y is." are hard cuts in both registers. Make the
    positive claim.
11. The rule of three. A forced group of three adjectives or nouns adds
    false completeness ("fast, scalable, reliable"). Keep a list when the
    items are real and separate, and drop to two or to prose when they are
    padding.
12. Synonym cycling. "The library", "the SDK", "the toolkit" and "the
    package" for one thing makes a reader count four things. Pick the term
    BRAND.md section 1 uses and keep it.
13. False ranges. "From startups to enterprises" puts two points on a
    scale that does not exist. Name the actual set.
14. A passive that hides the actor. Name the actor when the actor matters.
    A passive with an obvious actor stays, as in the deck's "Translations
    are generated at build time and deploy with the app."
15. Filler. "In order to" becomes "to", "due to the fact that" becomes
    "because", and "it is important to note that" is cut.
16. Hedging stacks. "It could potentially be argued that" becomes a claim
    or nothing. GT copy hedges nothing (deck slide 12). In Kevin's own
    writing "I think" marks an opinion and is never a hedge.

## Style

17. Dashes. The em dash, the en dash and a double hyphen are cut. Use a
    period, a comma, a colon or parentheses. Ranges read "X to Y".
18. Mechanical bold. Bold a term at the point it is defined, and nothing
    else.
19. Inline-header lists. A bold "Header:" on every bullet reads as
    generated. Write plain bullets with full sentences, or use a table or a
    ruled list (the deck's lists are ruled rows).
20. Title Case headings. Headings use sentence case, and Title Case stays on
    buttons.
21. Emojis. None, unless Kevin asks for one.
22. Hyphenation. The wiki humanizer drops hyphens from common compound
    modifiers. GT copy keeps a hyphen in a compound modifier before a noun
    ("open-source libraries", "sentence-case headings").
23. Fragment rhythm. One-word sentences, strings of fragments and a noun
    phrase with a comma tail are cut in GT copy and in Kevin's reflective
    writing (Kevin, 2026-09-08 and 2026-10-01). The wiki humanizer's
    stacked lines and fragments predate the 2026-09-08 directive, which
    covers everything Kevin will read or ship.

## Communication

24. Collaborative artifacts. "I hope this helps", "Let me know" and "Would
    you like me to" are cut.
25. Sycophancy. "Great question!" and "You're absolutely right!" are cut,
    with the whole sentence.
26. Signposts and content labels. "Let's dive in", "Here's what you need to
    know", "Three facts matter.", "The facts that matter are that" and
    "This section covers" announce the content. Cut the announcement and
    start with the content (Kevin, 2026-10-01).
27. Authority tropes and setup loops. "The real question is", "At its core"
    and "What really matters is" are cut, and the claim follows directly.
28. False agency. "The piece explores" and "This guide aims to" give a
    document intentions. Name the person who acts, or state the claim.
29. Generic conclusions. "The future looks bright" and "Exciting times lie
    ahead" are cut. End on a specific fact.
30. Interruptions. A comma-bounded aside between subject and verb, or before
    a colon, reads as AI to Kevin even when every word is plain (Kevin,
    2026-09-20). Write two sentences.
31. Rhetorical questions. GT copy and film narration ask none (MOTION.md,
    Copy and Sound). The wiki humanizer's questions in series predate the
    2026-09-08 directive.

## The five-axis score

Score the rewrite before it goes to Kevin, from 1 to 10 on each axis.

| Axis | A high score means |
| --- | --- |
| Directness | Each sentence states its claim without setup, label or hedge. |
| Rhythm | Sentence length follows the content, with no fragment cadence and no chopped prose. |
| Trust | Every claim carries a number, a mechanism or an artifact, and every fact is checked. |
| Authenticity | Only GT, or only Kevin, could have written it. |
| Density | No sentence can be cut without losing information. |

Revise again when the total is under 35 of 50.
