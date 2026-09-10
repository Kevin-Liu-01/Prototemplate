# Beta DX Walk

Walk the critical path of a product the way a real first-time beta user would,
and treat every moment of friction as a bug. The deliverable is a friction
report plus an explicit beta-readiness verdict (ship or hold), not a code change.

This skill is the **first-run-user lens**. It is process, not domain - it works
on any web product. For *which* browser/test tool to use, defer to
`wiki/meta/capability-routing-map.md`; for *fixing* what you find, hand off to
`agent-iteration-loop`.

## Where this sits (do not duplicate siblings)

| Skill | Question it answers |
| --- | --- |
| **beta-dx-walk** (this) | Can a first-time user complete the critical journeys and recover from failure? Is it ready for beta? |
| `dogfood` | What bugs / UX issues exist anywhere across the app surface? (breadth-first hunt) |
| `gstack-qa` | Code-level QA with atomic commits + regression tests |
| `agent-iteration-loop` | The full implement -> validate -> ship loop; this skill is its "verify live" lens for first-run UX and a source of follow-up fixes |
| `eval-loop` | Scored, benchmarked output quality over time |

Reuse `dogfood`'s browser + evidence mechanics. This skill adds the
comprehension / recovery lens, the friction triage, and the readiness call.

## Operating principles

- **Friction is the user's experience, not your familiarity.** Once you learn
  the trick you have lost the first-run lens - log it *before* you figure it out.
- **Test as a user, not an author.** Do not read the app source to explain away
  confusion. If the UI is confusing it is a bug, regardless of intent.
- **Fresh session = true first run.** Use a new / incognito session and a
  brand-new account where possible. Never judge onboarding as an already
  onboarded admin.
- **Severity is about the user outcome**, not how hard the fix is.
- **Evidence or it did not happen.** Every finding carries a screenshot, console
  or network log, URL, and repro steps.
- **You produce a report + verdict, not a fix.** Route fixes through
  `agent-iteration-loop`. Never touch prod data / infra or growth / marketing
  surfaces; flag those as owner decisions.

## Phase 1 - Frame the user and the journeys

- Name the **persona**: a first-time beta user. What do they know, what do they
  not know, what is their goal, what does success look like *to them*?
- Pick **3-6 critical journeys** - the paths that must work for beta. The caller
  may supply them; otherwise infer from the product. A generic default arc:
  1. sign up / onboard
  2. create the first credential or resource (e.g. API key, project)
  3. land on the dashboard / overview - is the value obvious?
  4. read a usage / health / metrics view - is it legible?
  5. drill into a single resource detail
  6. hit a failure and try to recover (the most important journey)
- Write the journeys down before walking. They are your test plan.

## Phase 2 - Set up the live environment

- **Reuse a running server** if the terminals folder shows one on the port;
  otherwise start the dev server (`block_until_ms: 0`) and smoke-read its output,
  or use the provided beta / staging URL.
- Open a **fresh browser session** (per `wiki/meta/capability-routing-map.md`: browser-harness or
  agent-browser, screenshot-first). Sign up as a new user; do not reuse seeded
  admin state.
- Take an initial annotated screenshot to anchor the starting state.

## Phase 3 - Walk each journey as the user

At **every step** ask the four friction questions:

```
Did I have to PAUSE   (stop and figure out what this means)?
Did I have to GUESS   (act without being sure it is right)?
Did I have to REREAD  (parse the same copy / UI more than once)?
Would I ASK FOR HELP  (search docs, ping support, give up)?
```

Also ask: **is the next action obvious?** and, when something breaks, **is the
error legible and is there a visible path to recover?** Narrate expected vs
actual as you go.

## Phase 4 - Log friction as bugs (the template)

Any yes to a friction question is an issue. Append each immediately using
`templates/friction-report-template.md`:

```
### FRICTION-NNN - <one-line title>
- Journey / step:  <which journey, which step>
- What I tried:    <the user's intent>
- What I expected: <the mental model>
- What happened:   <actual behavior / copy / state>
- Severity:        blocks-beta | confuses-beta | polish
- Recovery:        <could the user self-recover? how?>
- Evidence:        <screenshot path, console / network log, URL, repro steps>
- Suggested fix:   <optional, one line>
```

**Severity rubric (user outcome, not fix size):**

- **blocks-beta** - user cannot complete the journey: dead end, broken action,
  silent failure, no recovery path, data loss, hard error with no way forward.
- **confuses-beta** - user completes it but had to pause / guess / reread,
  misreads a state, or recovers only by luck. Hesitation is a defect.
- **polish** - works and is understood; minor wording, alignment, or delight gap.

## Phase 5 - Probe failure and recovery deliberately

Beta users break things. Trigger the likely failure modes and confirm the user
can understand and recover:

- bad / empty / boundary input; invalid or expired credential
- empty states (zero resources, zero usage) - are they guiding or just blank?
- network error / slow response / double-submit
- permission denied / wrong-account / unverified email
- back button, refresh mid-flow, and direct-link into a deep page

Empty states and error states are **first-class journeys**, not edge cases.

## Phase 6 - Readiness verdict

Close the report with:

- **Counts** by severity (blocks / confuses / polish).
- **Must-fix before beta**: every `blocks-beta` + high-impact `confuses-beta`.
- **Polish / deferrable**: the rest, with an owner.
- An explicit **SHIP or HOLD** recommendation and the **top 3 fixes** that move
  the needle most. State it plainly; this is a human decision you inform
  (`staying-in-the-loop-with-agents`).

## Phase 7 - Hand off and compound

- Embed the key screenshots in the summary for the user.
- Feed `blocks` / `confuses` items into `agent-iteration-loop` as scoped fixes,
  then re-walk after fixes. This is a standing **loop** (`agent-looping`).
- If the same friction recurs across products, codify it (a lint, a checklist
  item, or a wiki pattern) so it is caught earlier next time.
- **Process hygiene**: tear down every server / browser you spawned
  (`cleanup-terminals-browsers`); keep the IDE, agent runtime, and shared MCP.

## Pre-handoff checklist

```
- [ ] Walked as a fresh first-time user (new / incognito session, new account)
- [ ] Covered the agreed 3-6 critical journeys + the failure / recovery journey
- [ ] Logged every pause / guess / reread / ask as a FRICTION issue with evidence
- [ ] Each issue severity = user outcome (blocks / confuses / polish)
- [ ] Probed empty states + error / recovery paths explicitly
- [ ] Report ends with counts, must-fix list, and a SHIP / HOLD verdict + top 3
- [ ] Did not change prod / growth surfaces; fixes routed to agent-iteration-loop
- [ ] Spawned servers / browsers torn down
```
