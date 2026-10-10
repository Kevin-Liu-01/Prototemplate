# Before and after

Rewrites from Kevin's reviews of GT writing, each with the rule it applies. Detail for `gt-voice`; the rules themselves are in SKILL.md.

| Before | After | Rule |
| --- | --- | --- |
| Heading: "Open-source libraries and a closed platform, built together." | Heading: "Open source and platform". Body: "GT builds both the open-source libraries and the closed platform." | Kevin rejected the comma-tail heading (2026-09-08); deck slide 07 now has a plain-noun title with the claim in the body |
| "The identity has to work at small sizes" | "Small sizes" | A sentence-shaped title becomes a plain noun (2026-09-08) |
| "Three details enlarged" | "Three close-ups" | Kevin: "'three details emerged' is not good wording" (2026-09-09) |
| "Supercharge your global growth with cutting-edge AI." | "Translations are generated at build time and deploy with the app." | A mechanism replaces marketing (deck slide 12) |
| "Unlock global markets with our game-changing localization platform." | "Source code is the source of truth. Every locale ships with the deploy." | The same (deck slide 12) |
| "That market is yours to gain." and "Localization is a growth lever." | "Numbers, currency, and dates localize too." | The copy test and no metaphors (deck slide 62) |
| Caption: "16px, favicon" | Caption: "16px favicon" | No comma tail on a data label (2026-09-08) |
| Caption: "The ground is the seam." | "A framed cell has a 1px padding gap that shows the surface underneath, so the cell draws no border." | The mechanism replaces the metaphor (DESIGN.md section 2) |
| An uppercase tracked "REACH EVERY USER" above a heading | The heading and one lead paragraph, nothing above | No eyebrows (docs/figma-v0-spec.md, `gt-ui/no-eyebrow`) |
| "Three facts matter." followed by the facts | The three facts, each stated as its own sentence | No content labels (2026-10-01) |
| "The detail that X is one most people would miss." | "The detail most people would miss is that X." | Short frame first, long content last (2026-09-20) |
| "Typos, since proofreading is a big part of the final grade:" | "Proofreading is a big part of the final grade. The typos I found are below." | No aside before a colon (2026-09-20) |
| "What I took from the talk was the timescale." | "My first reaction was that ..." with the point itself | A first-person reaction replaces an abstract-noun summary (2026-09-28, 2026-10-01) |
| `// Identity values pass through untranslated, since translating a model_uid would corrupt data, which is worse than the bill this feature saves.` | `// 'identity': every value of the field is byte-identical to its translation. 'translated': at least one value differs.` | A comment states the contract, and the justification moves to the PR (gt-cloud code-comments) |
