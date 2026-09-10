# iMessage → Wiki People Pages

Sync Kevin's iMessage contacts into the wiki at `~/Documents/GitHub/kevin-wiki/wiki/people/`.
Follows the voice/style rules in `wiki/people/STYLE.md`.

## When to Use

- "sync iMessage" / "pull iMessage contacts"
- "who am I texting most"
- "update my people pages"
- "add new people from my messages"
- After a noticeable gap since last sync (check `state.json` → `syncs.imessage`)

## Hard Constraints

- **Cursor's embedded shell cannot read `chat.db`** — macOS Full Disk Access
  required. Always run extraction from a real terminal (Terminal.app or iTerm)
  with FDA enabled. Tell Kevin to run the script himself the first time.
- **`raw/imessage/` is gitignored.** Extractions stay local. Person pages in
  `wiki/people/` ARE committed.
- **Test before bulk.** Always draft 3–5 pages first, get Kevin's approval,
  then proceed to the rest. The first batch should test diverse registers
  (family, partner, coworker, friend, classmate).

## Pipeline

### 1. Extract (Kevin runs in Terminal.app)

```bash
cd ~/Documents/GitHub/kevin-wiki && ./scripts/sync-imessage.sh
```

Outputs to `raw/imessage/<YYYY-MM-DD>/`:
- `top-contacts.json` — ranked 1:1 contacts (last 365d, ≥10 msgs)
- `contacts/<handle>.md` — per-contact metadata + recent message samples
- `contacts.json` — Address Book records for name resolution

Tunables via env vars: `LOOKBACK_DAYS_STATS`, `LOOKBACK_DAYS_SAMPLES`,
`MIN_MSG_COUNT`, `TOP_N`, `SAMPLES_PER_CONTACT`.

### 2. Resolve names + dedup handles

Use `scripts/resolve-imessage.py` (or recreate it) to:
- Match phone numbers / emails to AddressBook contacts
- Merge split handles (same person across iMessage+SMS+RCS services)
- Build `top-contacts-annotated.json`

### 3. Plan tiers

Use `scripts/build-people-plan.py` (or recreate it) to assign tiers:

| Tier | Threshold | Page depth |
|------|-----------|-----------|
| **1** | ≥400 msgs OR family/partner | Full STYLE pages, 50–80 lines, rich personal sections, multiple Kevin quotes woven in |
| **2** | 100–400 msgs with identifiable context | Medium pages, 30–45 lines, focused thread + 1–2 quotes |
| **3** | <100 msgs OR thin context | Stub pages, 15–25 lines, factual sketch only |

Promotion overrides:
- Family relationships → always Tier 1 regardless of msg count (Mom is
  118 msgs but Tier 1 by relationship)
- Dedalus / direct work coworkers → at least Tier 2

### 4. Read message samples + draft

For Tier 1 / Tier 2, ALWAYS read the contact's `contacts/<handle>.md` file
in full before drafting. The voice texture is in the messages.

For Tier 3, can use the stub generator: `scripts/gen-t3-stubs.py` (or
recreate it). Stubs auto-write factual metadata + 1-paragraph relationship
sketch using the first 3 sample messages.

### 5. Draft following STYLE.md

Read `wiki/people/STYLE.md` BEFORE writing. Two registers:

- **Factual sections** (Background): clean, encyclopedic, Wikipedia tone
- **Personal sections** (How Kevin Knows Them, Relationship): preserve
  Kevin's voice — convert his "I" to "Kevin" and "my" to "his" but the
  words stay his. Lead with his framing, weave direct quotes in
  paragraphs (not block-quote chunks).

The personal section should sound like Kevin talking about the person,
converted to third person — not the agent describing from outside.

### 6. Page format

```markdown
---
title: Full Name
type: person
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: raw/imessage/<date>/contacts/<handle>.md
tags: [person, ...context]
aliases: ["Nickname", "+phone", "email@example.com"]
tier: 1 | 2 | 3
related: ["[[USER]]", "[[other-page]]"]
---

# Full Name

> One-line summary in Kevin's framing.

## Background
{Factual register}

## How Kevin Knows Them
{Personal register, paragraphs, Kevin's voice}

## Relationship
{Personal register, paragraphs with direct quotes from Kevin and them}

## Notable
{Bullets OK here — quirks, opinions, catchphrases}

---

## Timeline

- **YYYY-MM-DD** | What happened. [Source: iMessage, YYYY-MM-DD]
```

### 7. Slug rules

- Default: `first-last.md` kebab-case
- Disambiguate name collisions: `david-liu-princeton.md` vs `david-li.md`
  vs Kevin's brother `matthew-liu.md`
- Family pages: use first name when surname is shared
  (`yu-liu.md`, `haiying-tang.md`)
- "Tal" → `tal-princeton.md` (disambiguate from any future Tals)

### 8. Update wiki + log

After writing pages:

1. Regenerate the People section of `wiki/_index.md` (use
   `gen-people-index.py`)
2. Append to `wiki/log.md` with `## [YYYY-MM-DD] ingest | iMessage sync`
3. Update `state.json` `syncs.imessage` to today's date
4. Update voice library in `wiki/people/STYLE.md` if new Kevin phrasings
   surfaced

### 9. Sensitivity rules

Some threads contain heavy emotional content (breakups, friend-group
conflicts, vulnerable disclosures). Default rules:

- **Quote sparingly** — preserve emotional texture but don't dump entire
  vulnerable exchanges verbatim. Characterize the dynamic; quote
  Kevin's framing of it.
- **Don't expose other people's deepest disclosures** without Kevin's
  go-ahead — paraphrase someone else's pain, quote Kevin's response
- **Romantic content** — Maryanne's page goes deep because she's the
  girlfriend; other quasi-romantic exchanges (Simon's flirty banter,
  ex contexts) get a single sentence at most
- **Sensitive entities** like Lili (Kevin's ex) get a wikilink but
  NO dedicated page unless Kevin says yes

## Notability Gate

Per AGENTS.md "Notability Gate":

- People Kevin texts ≥10 times in a year → eligible
- Mentioned across 2+ separate sources → eligible (iMessage counts as 1
  source; calendar / email / meeting transcripts add more)
- One-off mentions get a wikilink in someone else's page, NOT a dedicated
  page

## Future enhancements

- **AttributedBody decoder** — modern macOS sometimes nulls `m.text` and
  stores message in `m.attributedBody` binary plist. Add Python plist
  decoder to recover those.
- **Group-chat parsing** — currently only 1:1. Group chats reveal who's
  in which cluster.
- **Cross-source enrichment** — pair iMessage data with `raw/calendar/`,
  `raw/email/`, `raw/meetings/` to thicken person pages.
- **Automation** — once stable, schedule weekly via Codex automation:
  detect new contacts crossing the ≥10-msg threshold, draft pages, open
  PR for Kevin's review.

## Files

This skill expects (or creates) the following at the wiki repo:

- `scripts/sync-imessage.sh` — extraction (committed)
- `scripts/resolve-imessage.py` — name resolver (recreate as needed)
- `scripts/build-people-plan.py` — tier assignment (recreate as needed)
- `scripts/gen-t3-stubs.py` — stub generator (recreate as needed)
- `scripts/gen-people-index.py` — index regenerator (recreate as needed)

Recreate the helper scripts inline if missing — they're idempotent and
short. The shell extraction script is the only one that must persist.
