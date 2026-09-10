# Design Review — Audit, Fix, Verify

UX principles from Steve Krug's "Don't Make Me Think."

## Contract

This skill guarantees:
- Structured design audit with letter grades (A-F) across 10 categories
- AI Slop Score as standalone headline metric
- 6 usability tests on every page (Trunk Test, 3-Second Scan, Page Area Test, Happy Talk Detection, Mindless Choice Audit, Goodwill Reservoir)
- First-person narration mode (anti-slop: if you can't name the specific element, you're generating platitudes)
- Before/after screenshots for every fix
- One atomic commit per fix
- Findings sorted by impact (High > Medium > Polish)

## Review modes and authority

Use **surface mode** for a screen, flow, or product and the six-phase rendered
audit below. Use **change mode** when the target is uncommitted work, a branch,
a commit range, or a pull request. A review request is read-only; run the Fix
Loop only when the user also asks for implementation.

### Change mode: review the affected interface

Resolve the change before judging it:

1. Determine the default branch and merge base before checking a dirty working
   tree. A stray edit must not hide a multi-commit branch. Include tracked,
   staged, and untracked files and report those counts separately.
   If the tree is clean and the branch has no commits ahead, check for an open
   pull request or an explicitly named ref. If neither identifies the target,
   stop and ask which commit, branch, pull request, or whole-repository surface
   to review; never silently substitute `HEAD~1..HEAD`.
2. Exclude lockfiles, snapshots, generated output, vendored code, and binaries,
   but name every exclusion. Keep the referencing code for changed fonts and
   images in scope.
3. Expand changed files to direct rendered consumers. Expand two hops only for
   tokens, themes, and shared primitives. Review at most five consumers,
   ordered by route/layout entry point, importer count, then package proximity;
   state how many were omitted.
4. Read both sides of every diff. Treat removed accessible names, native
   semantics, labels, focus treatments, reduced-motion rules, logical
   properties, language/direction metadata, wrapping, numeric alignment, color
   tokens, and explanatory copy as regression leads. Confirm an equivalent
   replacement is absent before reporting one.
5. Read the PR title/body, linked issue, and commit subjects. Check every
   promised variant, interaction state, translation, empty/loading/error state,
   narrow viewport, and sibling surface implied by that intent.

Classify each confirmed finding as `Introduced`, `Regression`, or
`Pre-existing`. Only the first two affect the finding cap and verdict;
pre-existing issues are reported separately, at most three, and never turn a
clean change into a block. Source findings cite the reviewed ref, not whichever
files happen to be checked out. Rendered claims require browser evidence;
source-only claims must say **Not visually verified**.

For pull requests, fetch the head into `refs/remotes/pr/<n>` and inspect it with
`git show`/`git diff`; never check it out over the author's tree. Rendered PR
verification is opt-in and uses an isolated disposable worktree. Record every
`.git` write (fetch, deepen, worktree) in Verification so the read-only claim is
auditable.

## UX Principles: How Users Actually Behave

### The Three Laws of Usability

1. **Don't make me think.** Every page should be self-evident. If a user stops to think "What do I click?" — the design has failed.
2. **Clicks don't matter, thinking does.** Three mindless, unambiguous clicks beat one click that requires thought.
3. **Omit, then omit again.** Get rid of half the words on each page, then get rid of half of what's left. Happy talk must die. Instructions must die.

### How Users Actually Behave

- **Users scan, they don't read.** Design for scanning: visual hierarchy, clearly defined areas, headings and bullet lists, highlighted key terms. We're designing billboards at 60 mph.
- **Users satisfice.** They pick the first reasonable option, not the best. Make the right choice the most visible choice.
- **Users muddle through.** They don't figure out how things work. They wing it.
- **Users don't read instructions.** Guidance must be brief, timely, and unavoidable.

### Billboard Design for Interfaces

- **Use conventions.** Logo top-left, nav top/left, search = magnifying glass. Don't innovate on navigation to be clever.
- **Visual hierarchy is everything.** More important = more prominent. If everything shouts, nothing is heard.
- **Make clickable things obviously clickable.** No relying on hover states for discoverability.
- **Eliminate noise.** Fix noise by removal, not addition.
- **Clarity trumps consistency.**

### Navigation as Wayfinding

Users on the web have no sense of scale, direction, or location. Navigation must always answer: What site is this? What page am I on? What are the major sections? What are my options at this level? Where am I? How can I search?

### The Goodwill Reservoir

Users start with a reservoir of goodwill. Every friction point depletes it.

**Deplete faster:** Hiding info users want. Punishing users for not doing things your way. Asking for unnecessary information. Putting sizzle in their way. Unprofessional appearance.

**Replenish:** Know what users want and make it obvious. Tell them what they want to know upfront. Save them steps. Make it easy to recover from errors.

## Phases

### Phase 1: First Impression

Navigate to the target URL. Take a screenshot.

```bash
agent-browser snapshot <url> --output first-impression.png
```

Write the first impression in **first-person narration mode**:
- "The site communicates **[what]**."
- "I notice **[observation]**."
- "The first 3 things my eye goes to are: **[1]**, **[2]**, **[3]**."
- "If I had to describe this in one word: **[word]**."

**Page Area Test:** Point at each clearly defined area. Can you instantly name its purpose? Areas you can't name in 2 seconds are poorly defined.

### Phase 2: Design System Extraction

Extract the actual design system rendered on the page (not what a config says):
- **Fonts:** list with usage counts. Flag if >3 distinct families.
- **Colors:** palette. Flag if >12 unique non-gray colors.
- **Heading Scale:** h1-h6 sizes. Flag skipped levels.
- **Spacing Patterns:** sample padding/margin values.

### Phase 3: Page-by-Page Visual Audit

For each page in scope, run the **Trunk Test**:
1. What site is this? (Site ID visible)
2. What page am I on? (Page name prominent)
3. What are the major sections? (Nav visible and clear)
4. What are my options at this level? (Local nav obvious)
5. Where am I in the scheme of things? (Breadcrumbs, "you are here")
6. How can I search?

Score: PASS (all 6) / PARTIAL (4-5) / FAIL (3 or fewer). A FAIL is HIGH-impact.

Then apply the **10-Category Checklist (~80 items)**:

1. **Visual Hierarchy & Composition** (8 items) — focal point, eye flow, visual noise, information density, above-the-fold purpose, squint test, white space
2. **Typography** (15 items) — font count <=3, scale ratio, line-height, measure 45-75 chars, heading hierarchy, weight contrast, no blacklisted fonts, flag generic (Inter/Roboto), text-wrap balance, tabular-nums on number columns, body >=16px
3. **Color & Contrast** (10 items) — palette coherent <=12 colors, WCAG AA (4.5:1 body, 3:1 large), semantic consistency, no color-only encoding, dark mode elevation
4. **Spacing & Layout** (12 items) — grid consistent, 4/8px scale, alignment, rhythm, concentric border-radius, no horizontal scroll, max content width, safe-area-inset
5. **Interaction States** (10 items) — hover, focus-visible, active/pressed, disabled, loading skeletons, empty states, error messages, touch targets >=44px, mindless choice audit
6. **Responsive Design** (8 items) — mobile layout makes design sense, touch targets, no horizontal scroll, images responsive, text readable without zoom, nav collapses
7. **Motion & Animation** (6 items) — ease-out for entering / ease-in for exiting, 50-700ms duration, every animation communicates something, prefers-reduced-motion, no transition:all
8. **Content & Microcopy** (8 items) — empty states designed, error messages specific, button labels specific, no lorem ipsum, happy talk detection with word count, instructions detection
9. **AI Slop Detection** (10 anti-patterns) — purple gradients, 3-column feature grid, icons in colored circles, centered everything, uniform bubbly radius, decorative blobs, emoji as design, colored left-border cards, generic hero copy, cookie-cutter section rhythm
10. **Performance as Design** (6 items) — LCP <2.0s, CLS <0.1, skeleton quality, image optimization, font-display swap, no FOUT

### Phase 4: Interaction Flow Review

Walk 2-3 key user flows in first-person narration mode.

**Goodwill Reservoir tracking** (start at 70/100):
- Hidden information: -15
- Format punishment: -10
- Unnecessary info requests: -10
- Interstitials blocking task: -15
- Sloppy appearance: -10
- Ambiguous choices requiring thought: -5 each
- Obvious top tasks: +10
- Upfront about costs: +5
- Saves steps: +5 each
- Graceful error recovery: +10

Report with visual dashboard. Below 30 = critical UX debt.

### Phase 5: Cross-Page Consistency

Compare across pages: nav consistent? Footer consistent? Component reuse? Tone consistency? Spacing rhythm?

### Phase 6: Compile Report

**Dual headline scores:**
- Design Score: A-F (weighted average of 10 categories)
- AI Slop Score: A-F (standalone)

**Category weights:** Visual Hierarchy 15%, Typography 15%, Spacing 15%, Color 10%, Interactions 10%, Responsive 10%, Content 10%, AI Slop 5%, Motion 5%, Performance 5%.

**Grade computation:** Start at A. Each High-impact finding drops one letter. Each Medium drops half a letter. Polish findings noted but don't affect grade.

## Fix Loop

For each fixable finding, in impact order:
1. Locate source files
2. Make the minimal fix (CSS-first, smallest change)
3. One commit per fix: `style(design): FINDING-NNN — short description`
4. Re-test and take after screenshot
5. Classify: verified / best-effort / reverted / deferred

**Hard cap:** 30 fixes. After 30, stop regardless. Self-regulate every 5 fixes.

## Anti-Patterns

- Generating platitudes instead of naming specific elements
- Fixing things without before/after screenshots
- Bundling multiple fixes into one commit
- Refactoring unrelated code while fixing design issues
- Evaluating source code instead of the rendered site
- Skipping the Trunk Test or Goodwill Reservoir tracking

## Output Format

```
DESIGN AUDIT: {domain}
========================
Design Score: {A-F}
AI Slop Score: {A-F}

Pages audited: N
Findings: N (High: X, Medium: Y, Polish: Z)
Fixes applied: N (verified: X, best-effort: Y, reverted: Z)

Top 5 findings:
1. [HIGH] {finding} — {suggestion}
...

Goodwill: {score}/100
Quick Wins (3-5 highest-impact, <30min each):
1. {quick win}
...
```
