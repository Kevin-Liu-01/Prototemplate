# X Bookmark Deep Absorption

Transform raw X bookmark data into full wiki graph integration — not just hub-page entries.

## The Problem This Solves

Shallow absorption: bookmarks get added to `x-bookmarks-*.md` hub pages but never propagate to dedicated tool/person pages, cross-references, resolvers, or the index. The wiki stays disconnected from the signal.

## When to Run

- After `ft sync` + `./scripts/sync-x-bookmarks.sh` adds new bookmarks
- When Kevin says "absorb bookmarks" or "process bookmarks"
- During `source-compile` automation runs targeting x-bookmarks
- When Kevin says bookmarks from a date range need processing

## The Pipeline

### Phase 0: Enrich (MANDATORY — run before absorbing)

A raw bookmark is usually NOT self-contained: ~82% carry `t.co` links whose
destination is the real value, ~31% are video demos, and many authors continue
the point in a self-reply thread. **Always enrich first** so absorption works
from resolved links, fetched destinations, and thread continuations — not just
the tweet text.

```bash
# Incremental + cached + resumable. Re-running only processes new or stale-schema bookmarks.
npx tsx scripts/enrich-x-bookmarks.ts                 # all (deep links + self-threads + artifact replies)
npx tsx scripts/enrich-x-bookmarks.ts --limit 5       # test a sample first
npx tsx scripts/enrich-x-bookmarks.ts --ids 123,456   # specific bookmarks
```

Output: `raw/x-bookmarks/enriched/<id>.json` (one per bookmark) + `_index.json`.
The collector is deterministic (mechanical work in code, per the brain-agent
loop); the LLM does the synthesis below from the enriched records.

If the batch contains images or video demos, download local media artifacts
before writing pages:

```bash
npm run download:x-bookmark-media -- --synced-date 2026-06-24
npm run download:x-bookmark-media -- --ids 123,456
npm run download:x-bookmark-media -- --ids 123,456 --videos  # explicit local video preservation only
```

Output: `wiki/assets/x-bookmarks/<tweet-id>/manifest.json` plus local image
files/thumbnails by default. Use local image links in pages; keep video demos
linked through the source tweet/enriched record unless Kevin explicitly asks for
local video preservation and repo size is acceptable.

Then build or refresh the one-by-one artifact ledger:

```bash
npm run audit:x-bookmark-artifacts
npm run audit:x-bookmark-artifacts -- --limit 25
npm run audit:x-bookmark-artifacts -- --ids 123,456
```

Output: `wiki/meta/x-bookmark-artifact-audit.json` plus
`outputs/bookmark-absorb/artifact-audit-YYYY-MM-DD.{md,json}`. This ledger is
the source of truth for whether each bookmark's enriched record, resolved links,
self-thread, artifact replies, images, video demos, and local media files still
need human/agent review. Coverage alone is not completion.

**Enriched record shape** (`EnrichedBookmark`):

```jsonc
{
  "id", "url", "authorHandle", "authorName", "text", "postedAt", "engagement",
  "resolvedLinks": [
    { "short": "t.co/…", "url": "<final>", "kind": "github|youtube|article|x-status",
      "title": "…", "text": "<fetched excerpt: README / article / transcript>",
      "meta": { "stars": 1234, "homepage": "…", "topics": [] },
      "child": { /* one high-signal link followed from inside the destination */ } }
  ],
  "selfThread": [ { "id", "text", "createdAt" } ],   // author's own continuation only
  "artifactReplies": [
    { "id", "text", "createdAt", "urls" }             // author replies likely containing repos/docs/demos
  ],
  "media": { "hasVideo", "videoCount", "imageCount", "bestVideoUrl", "thumbnails" },
  "errors": []
}
```

### Phase 1: Read enriched records and categorize

Read `raw/x-bookmarks/enriched/*.json` (NOT the raw text alone). Select records
by `syncedAt` first, not tweet ID alone: Kevin can bookmark old tweets today, so
`compile.last_bookmark_id` misses legitimate new captures. Use
`compile.last_bookmark_synced_at` as the primary marker and `compile.last_bookmark_id`
as a secondary guard. For each selected record:

```
#   TOOL — new library, CLI, framework, SDK, MCP, service, platform
#   SKILL — executable agent skill, skill pack, prompt workflow, or registry-installable workflow
#   DESIGN — typography, color, animation, layout, UI pattern
#   PERSON — notable individual (2+ mentions or high-signal take)
#   CONCEPT — reusable technical idea, architecture, pattern, eval method, or design principle
#   PHILOSOPHY — strong opinion, operating belief, thesis, counter-signal
#   AI — agent tools, model announcements, agent UX
#   OTHER — lifestyle, ephemeral, low-signal
```

Synthesize from the WHOLE enriched record:
- **`resolvedLinks[].title/text`** — the actual destination content (repo README,
  article body, video transcript). This is usually the real signal, not the tweet.
- **`selfThread`** — the author's continuation often carries the product name,
  pricing, launch status, or the technical detail the bookmark omitted. Treat it
  as first-class content and cite it: `[Source: X/@handle thread, DATE]`.
- **`artifactReplies`** — author replies that look like repos, docs, demos,
  papers, templates, datasets, downloads, or launch artifacts. Inspect each one;
  these replies often contain the actual GitHub repo or follow-up link the root
  tweet omitted. Cite them as `[Source: X/@handle reply, DATE]`.
- **`media`** — note demos: "Demo video (4K)" / "N screenshots". Link `bestVideoUrl`.
- **`resolvedLinks[].meta.stars/topics`** — GitHub signal for the notability gate.
- **Online research** — for any promoted tool/project/person, search primary
  sources, GitHub, docs, articles, and independent discussion before writing the
  dedicated page. Use `agent-reach` when local social/web CLI access is available.
- **Versioning research** — for any promoted tool, library, SDK, CLI, framework,
  skill, or platform, check current versions/releases from primary sources before
  writing. Tweets are release signals, not version authority.

### Phase 2: Hub Page Entries (Level 1)

Route each bookmark to the correct hub page:

| Category | Hub Page |
|---|---|
| AI/agents | `wiki/tools/x-bookmarks-ai-agents.md` |
| Skills/agent workflows | `wiki/tools/x-bookmarks-ai-agents.md` for agent skills; `wiki/tools/x-bookmarks-dev-tools.md` for developer workflow skills |
| Dev tools | `wiki/tools/x-bookmarks-dev-tools.md` |
| React/Next.js | `wiki/tools/x-bookmarks-react-nextjs.md` |
| CSS/frontend | `wiki/tools/x-bookmarks-css-frontend.md` |
| Design/UI | `wiki/design/x-bookmarks-design-ui.md` |
| 3D/shaders | `wiki/tools/x-bookmarks-3d-shaders.md` |
| career/biz | `wiki/career/x-bookmarks-career.md` |
| Dedalus | `wiki/projects/x-bookmarks-dedalus.md` |

Format: `### Title` block with quoted tweet, author attribution, date, engagement, and a `**Takeaway:**` line linking to relevant wiki pages.

For promoted bookmarks or artifact ledgers, include the original tweet as a
React Tweet directive so the wiki page preserves the source artifact:

```md
::tweet{ id="2069742622252445866" url="https://x.com/emilkowalski/status/2069742622252445866" }
```

Render source-critical resolved links as artifact cards, not plain bullets:

```md
::artifact{ url="https://github.com/vercel/react-tweet" title="vercel/react-tweet" kind="repo" variant="compact" }
```

Use `variant="compact"` for ledgers and full cards for dedicated pages. Relevant
artifact replies should be linked directly with `::artifact`; embed replies with
`::tweet` only when the reply itself is the durable source.

### Phase 3: Dedicated Pages (Level 2)

A bookmark gets a dedicated page when ANY of these are true:

- **Tool/library/SDK/CLI/framework announced** with >500 bookmarks or a working demo
- **Skill/agent workflow introduced** with an install route, source repo, repeatable workflow, or high-signal demo. Adopted executable skills belong under `skills/<category>/<slug>/SKILL.md`; generated wiki source pages are regenerated from there. Reference-only skill candidates belong in `wiki/tools/` or `wiki/concepts/`, not hand-written root `wiki/skills/<slug>.md` mirrors.
- **Person page warranted** — notable individual mentioned 2+ times across sources OR single take with >5K likes from a builder with credibility
- **Concept/philosophy** — original thesis, reusable technical idea, architecture, pattern, eval method, design principle, or operating belief worth tracking over time
- **Existing wiki page should be updated** — the bookmark adds new info to an entity already in the wiki

Page creation follows `wiki/RESOLVER.md` decision tree. Use the standard page format from AGENTS.md.

### Phase 3.5: Tool Version Snapshots (MANDATORY for promoted tools)

Every promoted tool/library/SDK/CLI/framework/platform must carry a version or
release-status snapshot in its dedicated page or the batch ledger:

- Package-backed tools: run the relevant registry command, for example
  `npm view <pkg> version dist-tags time --json`, and record `latest`, major
  compatibility tags, publish date, and any canary/beta channel that affects use.
- GitHub-backed tools: check releases/tags with `gh release list`, GitHub API, or
  `git ls-remote --tags <repo>`. If there are no meaningful tags, record the
  default-branch commit checked and say that release tags were absent.
- Hosted services/platforms: check official docs/changelog/pricing pages and
  record the verified date plus product version, plan, API version, or release
  channel when one exists.
- Skills and workflow dependencies: check the source repo/registry entry and record the current
  tag or source commit. If installed through a registry such as `skills.sh`,
  inspect the resolved source before treating a social post as current.

When a version check is not applicable, write why: "service has no public package
version", "reference-only design pattern", or "hub-only until source/docs repeat".
Do not leave versionable tools as floating claims.

### Phase 4: Cross-Reference Walk (Level 3)

For every dedicated page created or existing page updated:

1. **Search wiki for related pages** — `rg` for the entity name, author handle, related concepts
2. **Add timeline entries** to related pages that should know about this
3. **Update frontmatter `related:`** arrays on both the new and existing pages
4. **Add `[[wikilinks]]`** in body text where the entity is mentioned

### Phase 5: Registry + Skill Candidates (Level 4)

If any bookmark introduces a tool or skill that could enter Kevin's stack:

1. Check if it belongs in `wiki/meta/capability-routing-map.md`
2. Check if it belongs in `wiki/SKILL-RESOLVER.md`
3. Mirror compact routing into `config/cursor/rules/tool-hierarchy.mdc` only if the route should be available as a Cursor projection.
4. If a resolved link is a **GitHub repo** (`kind: "github"`) with a real README
   and stars, the tweet is a genuine skill/tool candidate — not a guess. Evaluate
   it through the three-gate chain from AGENTS.md before recommending install:
   - **Brin**: `curl https://api.brin.sh/skill/<owner>/<repo>` (or `repo/<owner>/<repo>`)
   - **skill-auditor**: run the 6-step vetting protocol (must be SAFE)
   - **Reputation**: stars, source org, install count
   Record the candidate + gate results in the absorption log; only suggest
   installation if all gates pass.
4. Record the current version/release snapshot in the tool page or batch ledger
   before calling the tool updated.

For installable skills specifically:

- If adopted, create or update the executable source under
  `skills/{engineering,productivity,personal,misc}/<slug>/SKILL.md`, then run
  the skill-generation checks so `wiki/skills/<category>/<slug>.md`,
  `wiki/meta/skill-registry.*`, and the runtime index are current.
- If not adopted, keep it as a candidate/reference page under `wiki/tools/` or
  `wiki/concepts/` and record why it is not active.
- Never hand-write root `wiki/skills/<slug>.md` mirror articles; those are
  generated source views or family synthesis pages.

### Phase 6: Index and Log (Level 5)

1. Add new pages to `wiki/_index.md` (alphabetical within category, update counts)
2. Append to `wiki/log.md` with full absorption record
3. Run `npx tsx scripts/build-index.ts` if available
4. Run `qmd update && qmd embed` when qmd is available

### Phase 6.5: Persist one-by-one review decisions (MANDATORY)

Coverage is not completion. For each reviewed bookmark, persist the decision
back into `wiki/meta/x-bookmark-artifact-audit.json` before rerunning the audit.
The audit preserves these fields while recomputing media/source flags.

Required fields for a completed row:

```jsonc
{
  "reviewStatus": "reviewed | promoted | deferred",
  "reviewedAt": "YYYY-MM-DD",
  "reviewedBy": "codex",
  "reviewedArtifacts": [
    "raw/x-bookmarks/enriched/<id>.json",
    "wiki/assets/x-bookmarks/<id>/manifest.json",
    "source/docs/repo URLs checked",
    "version commands or why not applicable"
  ],
  "visualObservation": "What the image/video actually showed, or why none exists.",
  "thoughtNotes": [
    "Durable article/skill/tool/object/workflow insight saved from this bookmark."
  ],
  "promotedPages": [
    "wiki/tools/example.md"
  ],
  "decisions": {
    "articles": "create | update | hub-only | no-change | defer",
    "skills": "create | update | candidate | no-change | defer",
    "tools": "create | update | candidate | no-change | defer",
    "objects": "update | no-change | defer",
    "versioning": "update | not-applicable | defer",
    "rationale": "Short why."
  }
}
```

Then run the X bookmark doctor:

```bash
npx tsx scripts/doctor.ts --only x-bookmarks
```

The doctor warns if a completed row lacks structured decisions, reviewed
artifacts, promoted pages for promoted rows, direct wiki references, unresolved
source review, unresolved visual review, or media repair work. It also resolves
each promoted page/skill target on disk, so `promotedPages` must point at real
`wiki/...`, `skills/...`, `config/...`, or `scripts/...` paths, or a resolvable
wiki slug/link.

### Phase 7: Coverage Audit (MANDATORY)

After hub/page edits and absorb-log updates, run:

```bash
npm run audit:x-bookmarks
```

This writes `outputs/bookmark-absorb/coverage-YYYY-MM-DD.{md,json}` and checks
every raw bookmark against wiki references, conversation/thread coverage,
`wiki/_absorb_log.json`, and legacy batch reports. Completion requires:

- `covered: <total>/<total>`
- `missing: 0`
- `highSignalMissing: 0`
- no `logged-only` or `reported-only` rows that should be promoted to a hub floor

If the audit finds gaps, add compact catch-up rows to the correct hub page, then
mark the corresponding `raw/x-bookmarks/enriched/<id>.json` entries absorbed
with the hub page path and rerun the audit.

### Phase 7.5: Artifact + System Audit (MANDATORY)

After coverage passes, run:

```bash
npm run audit:x-bookmark-artifacts
```

Use `wiki/meta/x-bookmark-artifact-audit.json` as the per-bookmark work queue.
For each high-priority row, work one bookmark at a time:

1. Read the enriched record.
2. Inspect resolved links, child links, self-thread items, and artifact replies.
3. Inspect local images with vision/OCR when `visual-review-required` is set.
4. Repair local media when `missing-local-*` or `empty-local-*` flags appear.
5. Promote durable thoughts into the right wiki pages, tools, concepts,
   philosophies, skills, playbooks, diagrams, or person pages.
6. Interrogate every bound brain object and workflow; update their canonical owners when the signal changes the system.
7. Preserve review notes in the ledger row before rerunning the audit:
   - `reviewStatus`: `reviewed` when no durable update was needed, `promoted`
     when a page, skill, tool, object, or workflow changed, or `deferred` with a reason when
     source/media access blocks completion.
   - `reviewedAt`, `reviewedBy`, and `reviewedArtifacts`: prove which local
     artifacts were actually read (`enriched-record`, `resolved-links`,
     `self-thread`, `artifact-replies`, `local-images`, `video-demo`).
   - `decisions`: structured one-by-one calls for `articles`, `skills`,
     `tools`, `objects`, and `versioning`, each using one of `create`,
     `update`, `hub-only`, `candidate`, `merge`, `no-change`,
     `not-applicable`, or `defer`, plus a concise `rationale`.
   - `visualObservation`, `thoughtNotes`, and `promotedPages` when applicable.
8. Run `npx tsx scripts/doctor.ts --only x-bookmarks` and treat warnings as the
   remaining work queue. The doctor fails only if the ledger infrastructure is
   broken; it warns while the 800+ row review is still in progress. Promoted
   rows must pass the target-resolution check, meaning every `promotedPages`
   entry points at a real page/skill/config/script or resolvable wiki slug.

Completion for a full bookmark review means the ledger has no pending rows for
the selected range and no unresolved `source-review-required`,
`visual-review-required`, or local media repair flags. A hub-page reference only
proves the bookmark was accounted for; it does not prove the artifact was read.

## Notability Gates — ingest-then-rank, DON'T ignore

> **Default: ingest (almost) everything, then rank by depth — never silently drop a bookmark.** The variable is *how deep* it goes (dedicated page → hub entry → one-line ranked line), **not whether** it's captured. Ranking is how signal surfaces; a dropped bookmark can't be re-ranked when its topic turns out to matter later. [Source: User, 2026-06-22]

**Tier 1 — Dedicated page:**
- Tool/skill with >500 bookmarks, a resolved GitHub repo with >100 stars, or a working demo link/video
- Person with >10K followers AND a take >5K likes relevant to Kevin's domains
- Any tool Kevin's own tweet references (self-signal)
- Any entity mentioned across 2+ separate bookmarks
- A bookmark whose **resolved link or self-thread** contains substantive, citable content (full article, README, launch detail) even if the tweet itself was thin
- A bookmark whose **artifactReplies** expose a repo, docs, demo, paper, template, dataset, or other primary artifact

**Tier 2 — Hub-page entry (a ranked block within its hub):**
- Most bookmarks. Ephemeral deals/promos, lifestyle/personal content, lower-engagement takes, link-only tweets — still get a hub block with quote + attribution + a one-line takeaway, so they're searchable and re-rankable. Mark them low-tier; promote to a page only if they later repeat or gain a resolved artifact.

**Tier 3 — One-line ranked line (the floor — still ingested, never dropped):**
- Anything that doesn't merit a full hub block still gets a single ranked line (handle · topic · link · score) in the hub's "low-signal / parked" list. Capture first, rank second; nothing is silently ignored.

**Deduplicate by pointing, not dropping:**
- Retweets / duplicates of already-captured content → link to the existing canonical entry (and bump its evidence/engagement), rather than skipping. "Skip entirely" is replaced by *merge into the canonical entry* — the bookmark is still accounted for.

## Quality Checklist

Before declaring absorption complete:

- [ ] Enrichment ran first; absorption used `enriched/*.json`, not raw text alone
- [ ] Every bookmark from the date range is in at least one hub page
- [ ] Resolved-link content (README/article/transcript) and self-threads were
      mined for value, not just the tweet text
- [ ] Author artifact replies were inspected and any repo/docs/demo links were resolved
- [ ] Demo media noted (and `bestVideoUrl` linked) where present
- [ ] Local image media downloaded to `wiki/assets/x-bookmarks/`; videos linked through tweet/source records unless explicitly preserved
- [ ] `npm run audit:x-bookmark-artifacts` ran and its next-review queue was drained for the selected range
- [ ] Image rows marked `visual-review-required` were actually inspected with vision/OCR or kept pending with an explicit reason
- [ ] Local media flags (`missing-local-*`, `empty-local-*`, stale manifests) were repaired or explicitly deferred
- [ ] Every completed row has structured `decisions` for articles, skills, tools, objects, and versioning
- [ ] Every completed row lists `reviewedArtifacts`; every `promoted` row lists `promotedPages` that resolve on disk
- [ ] `npx tsx scripts/doctor.ts --only x-bookmarks` reports no infrastructure failures and its warnings match the remaining queue
- [ ] Object candidates from the artifact audit were reflected in canonical pages, skills, tools, workflows, graph bindings, or diagrams
- [ ] Promoted/source-critical tweets have `::tweet{...}` directives
- [ ] Source-critical links/repos/docs/demos/videos have `::artifact{...}` cards
- [ ] Promoted tools/projects were researched beyond X when primary/independent sources exist
- [ ] Every promoted tool/library/SDK/CLI/framework/platform has a current
      version/release-status snapshot, or an explicit "not versioned" note
- [ ] GitHub-repo links evaluated as skill candidates through the three gates
- [ ] Every notable bookmark has a dedicated page or existing page update
- [ ] Every new page is in `_index.md` with correct category and count
- [ ] Every person page has proper aliases (handle, @handle, full name)
- [ ] Cross-references flow BOTH directions (new→existing AND existing→new)
- [ ] `log.md` records what was created, updated, and why
- [ ] `state.json` updates both `compile.last_bookmark_synced_at` and `compile.last_bookmark_id`
- [ ] `npm run audit:x-bookmarks` reports every raw bookmark covered in wiki pages
- [ ] `qmd update && qmd embed` ran after index rebuild when available
- [ ] No orphan pages (every new page has at least one inbound link)
