# Operating principles

General Translation (GT) is a localization platform for developers. Kevin Liu does design, website and product work at GT, and he runs it through several Claude Code and Codex sessions at once. The eighteen rules below come from his corrections to that work between 2026-07-20 and 2026-10-05. Read them before the first task of any GT work with him.

Each rule names the skill or document that holds its procedure. Where the two disagree, the skill is right and this page needs a fix. The [glossary](glossary.md) defines working terms such as lane and feature flag. The [quality bar](quality-bar.md) sets the bar for each kind of artifact, and the [product map](gt-product-map.md) describes what GT sells and how its products fit together.

## 1. Keep going until everything is done

Run every wave of a plan to completion without stopping between waves to ask for permission. "Continue", "continue all" and "keep going" resume every open lane and every unfinished item. When an agent dies on a usage limit, an outage or a closed app, check the working tree, then resume the agent with its brief intact (`gt-orchestration` section 6). Do the hard items as well and report each one. Spend the time on the fixes, and write tests to prove them.

Kevin, 2026-09-09: "can we just do all of our updates? why are you holding back". He said the same on 2026-07-24 and 2026-09-12.

## 2. Do the work yourself and ask once for what only Kevin can do

Do every step an agent can do, including console setup through a CLI (`vercel`, `gh`, `gcloud`) or the browser page Kevin already has open. Collect what only he can do (a login, a payment, a credential consent, an approval, a Linear issue id) into one numbered list with the exact file, line or URL for each item. A blanket approval covers the plan it answers. The safety lines still hold. Before a step that cannot be undone, such as a merge over recent work, check that nothing is lost. Wait for his word on a force push, a production deploy to GT's Vercel team, new spend, or landing an exploration round on Prototemplate main (`gt-ship` section 8).

Kevin, 2026-10-05: "anything approved is approved from me." Also 2026-07-20 and 2026-10-02.

## 3. Change only what was asked

Make the smallest literal change that answers the request. "Move it down" means translate it and keep its angle and easing. When a request could mean a small or a large change, make the small one or ask. When a fix spreads into neighbouring behaviour, assets or metadata, revert the extra changes exactly and apply the narrow change. An image Kevin pastes is the whole spec.

Kevin, 2026-08-06: "why did so much change, i just wanted to alter the connectors and line coming up". On 2026-08-07 a landing update had also redone the OG image, the favicon and the metadata, and he said there was no need.

## 4. Keep approved work

Before changing a surface, list what Kevin praised on it and carry every item forward, because a rewrite that drops an approved element is a regression. When he rejects a direction, restore the files to exactly their state before the rejected change and rebuild from there, since the rejected version is never the base of the next attempt. Commit early in each round on a local branch so git holds the restore point, and archive each published version before overwriting it. The dated verdicts are in `gt-aesthetic` section 2, and the restore and archive steps are in `gt-explorations` section 6 (After a rejection) and section 7 (Archive before overwriting).

Kevin, 2026-08-07: "lets redo this to before i started asking for this change and rebuild". Also 2026-07-30 and 2026-10-03.

## 5. Fix the whole class

When Kevin flags one instance (an icon, a footer, a flag chip, a double border), enumerate the class programmatically with grep, a registry, a lint or a measurable check, fix every member, verify each one and report the count. The sweep repeats the requested change on each instance of the same defect, and rule 3 still holds for everything around them. When he likes a treatment in one place, apply it to the sibling components. The cross-app sweep is in `gt-components` (Standardization), and the fixes by failure class are in `gt-lints` section 6.

Kevin, 2026-09-28: "look for ANYWHERE ELSE icons nneed to be synced". Also 2026-08-03.

## 6. Find the root cause and guard it

Diagnose before editing: read the computed values of the element Kevin selected, read the full log, and reproduce with the deployed environment. Fix the cause, then add the regression test or lint that keeps the class from returning (`gt-lints` section 4). Error handling keeps the underlying error in its message and never substitutes a guessed cause.

Kevin, 2026-08-18: "right but why is the fetch failing". Also 2026-08-05.

## 7. Measure the rendered result

A fix is reported only with visual or measured proof of the rendered result at the place Kevin flagged: computed styles on the live element, 2x crops of corners and junctions, and every animation state. A code change does not prove the render, and neither does a green proxy check (the page loads, the sizes match) or a settings panel that shows the right value. When a tool reads badly, switch to another one, such as a Playwright capture, and finish the verification yourself. The methods are in `gt-verify`, and the [quality bar](quality-bar.md) (Done) states when work counts as finished.

Kevin, 2026-07-30: "no, the borders are still sstraight black, still padding, and borders wrong color". The fix before it had been reported as verified from a screenshot.

## 8. Show the result

Results reach Kevin as something he can see or hear: before and after crops at the same viewport, the localhost URL with its server running, a page open in his browser, or a small HTML page for a set of images or audio takes. Send them before he asks. The formats are in `gt-reporting` section 1, the review servers and the steps for letting him try a build are in `gt-local-dev` sections 1 and 5, and the crop and PR rules are in `gt-aesthetic` (Showing the work) and `gt-ship` section 4.

Kevin, 2026-10-05: "i cant listen to the voices, make it in html so i can go through and listen to em".

## 9. Real content and real assets

Copy and numbers come from production, the benchmark and data files, or GT's published pages. Never invent testimonials, quotes, metrics, prices or feature promises, and mark placeholder content as placeholder. Marks, logos, flags and scans are the real files, sourced and credited: third-party logos from thesvg.org (`gt-brand` section 5), pictures with their source, license and credit (`gt-dither` section 5), and the search for an asset continues until the real one is found (`gt-brand` section 8, Third-party material).

Kevin, 2026-08-05: "like these arent real quotes", about a testimonial block an agent had written.

## 10. Ask only real decisions, with a recommendation

Ask Kevin only what is his to decide: spend, naming, licensing, scope, or an instruction that reads two ways. Ask each as a multiple-choice question with the recommended option first, and batch several into one numbered list with short ids so he can answer inline (`gt-reporting` section 6). When a new state resembles an existing one, reuse the existing behaviour and say so instead of asking. A gate that blocks a requested change is a question for him, and bypassing it silently is a defect.

Kevin, 2026-09-25: "no need to ask me anythiing just do this all for me please".

## 11. Correct from the first frame

Treat a gap at startup, a flash on reload and lag on the first interaction as defects, even when the page settles a moment later. Check the first frame and the first interaction after a cold load and after a reload, and reserve space so nothing shifts (`gt-verify`, `gt-performance`).

Kevin, 2026-08-08: "if i reload i briefly see 3 layers stacked on top of each other". Also 2026-08-04, on an animation that had to start "without a startup lag".

## 12. Nothing unnecessary ships

A release carries no development code. Keep galleries, stand-ins, test-only hooks, dev routes, temporary tests, recorded fixtures and harnesses off the release branch (`gt-ship` section 3). Add no dependency that existing code can replace, keep comments to one or two lines, and keep an unready dashboard feature behind a feature flag.

Kevin, 2026-10-01: "we cant ship anythign unnnecessary". On 2026-08-28 he questioned three packages added for one feature, and since 2026-09-03 a dashboard page that is not ready ships behind a feature flag.

## 13. Prefer free and cheap

Challenge any design that adds paid infrastructure, and lay out the free alternative with numbers first. Use the cheapest model that performs well enough, put spend caps on paid model runs (`gt-orchestration` section 7), and turn off git-triggered preview deploys where they only cost money: the landing builds main and staging only (`gt-website` section 8). Check which account a cost lands on before acting.

Kevin, 2026-09-15: "make a new pr to not allow preview deployments from git in landing, this is running up a lot of costs".

## 14. Secrets stay in protected files

Keys and tokens live in a protected config file or a gitignored env file. They never appear in chat, URLs, prompts, commits, docs or PR bodies, and briefs and docs name them by variable name only. When Kevin pastes a key into chat, move it into the env or config file, never echo it or commit it, and tell him it now sits in a transcript so he can rotate it. Never ask him to paste a key into chat.

Kevin's brief, 2026-08-03: "never print a key value".

## 15. "Fully" means complete

When Kevin asks to build out, enhance or update something fully, cover every section and capability with real diagrams, visuals and code, and state why the design works. A placeholder or a partial pass does not count.

Kevin, 2026-08-05: "show actual diagrams and visuialzations and code in these. enhance fully". Also 2026-08-04.

## 16. Codify what worked

After something works once, turn it into a skill, a doc, a lint or saved parameters: the prompts that worked and how they were structured, a lint for each standard, and generation parameters saved next to each asset. Every tool and skill belongs to a workflow with a routing doc. A new skill follows the contract in `prototemplate` section 10, and a new lint follows `gt-lints` section 4.

Kevin, 2026-10-05: "create docs and skills for audio creation and generation, what prompts worked and how u structured it". Also 2026-07-24 and 2026-08-06.

## 17. Vendor-agnostic agent tooling

Agent tools, skills and scripts work with Codex, Claude Code and local models alike. Skills use the Agent Skills frontmatter fields only, so every loader accepts them (`prototemplate` section 10), and no script hard-wires one provider.

Kevin, 2026-09-10: "be vendor agnostic, dont just ennforce claude code".

## 18. Privacy on public surfaces

Prototemplate is public at www.prototemplate.com and github.com/Kevin-Liu-01/Prototemplate. Nothing in it carries keys, account ids, email addresses, personal details, customer names beyond BRAND.md section 9, unannounced plans, or business numbers such as funding, revenue and headcount (`gt-brand` section 8, `gt-voice` "Facts and public surfaces"). Colleagues appear by role.

The rule dates from the brand questionnaire round (2026-08-06 and 2026-08-11) and from 2026-10-05, when Kevin made Prototemplate his public hub for GT work.

## Where the procedures live

| Rules | Skill or document |
| --- | --- |
| 1, 13 | [`gt-orchestration`](../../skills/gt-orchestration/SKILL.md): resuming agents, briefs, fan-out, spend caps |
| 1, 2 | [Multi-session playbook](multi-session-playbook.md): lanes, broadcast messages, relays between Claude and Codex |
| 2, 4, 12 | [`gt-ship`](../../skills/gt-ship/SKILL.md): PR shape, release hygiene, Prototemplate landing and deploys |
| 3, 4 | [`gt-aesthetic`](../../skills/gt-aesthetic/SKILL.md): the reference, the dated verdicts, reading Kevin's asks |
| 4 | [`gt-explorations`](../../skills/gt-explorations/SKILL.md): exploration rounds, archive and restore |
| 5, 6, 16 | [`gt-lints`](../../skills/gt-lints/SKILL.md) and [`gt-components`](../../skills/gt-components/SKILL.md): lints, sweeps, fixes by class |
| 6, 7, 11 | [`gt-verify`](../../skills/gt-verify/SKILL.md): measurement, the viewport matrix, live checks |
| 7, 15 | [Quality bar](quality-bar.md): the bar for each kind of artifact and for done |
| 8, 10 | [`gt-reporting`](../../skills/gt-reporting/SKILL.md): crops, galleries, status lines, decision lists |
| 8 | [`gt-local-dev`](../../skills/gt-local-dev/SKILL.md): review servers, letting Kevin try a build |
| 9 | [`gt-brand`](../../skills/gt-brand/SKILL.md) (Third-party material) and [`gt-dither`](../../skills/gt-dither/SKILL.md): real assets, provenance, credits, licences |
| 11, 13 | [`gt-performance`](../../skills/gt-performance/SKILL.md): frame cost, first interaction, Lighthouse |
| 13 | [`gt-website`](../../skills/gt-website/SKILL.md): landing deploys |
| 16, 17 | [`prototemplate`](../../skills/prototemplate/SKILL.md): the skill contract and the hub |
| 18 | [`gt-brand`](../../skills/gt-brand/SKILL.md), [`gt-voice`](../../skills/gt-voice/SKILL.md) and [BRAND.md](../../BRAND.md): public surfaces |

Kevin's wiki skill `agent-iteration-loop` holds the general loop of implementing, verifying, reviewing and shipping, and these rules apply inside it.

## Sources

- Kevin's messages to Claude Code and Codex from 2026-07-20 to 2026-10-05, about 5,800 in all. Quotes keep his spelling. Rules 1, 4, 5 and 8 recur most: about 90 messages ask to continue or resume, 137 to revert or restore an earlier state, 177 for a change "everywhere" or "for all", and 86 to be shown the result. The counts include copies in forked sessions.
- Prototemplate: BRAND.md section 9; `skills/gt-aesthetic` sections 2 and 5; `skills/gt-ship` sections 3, 4 and 8; `skills/gt-lints` sections 1, 4 and 6; `skills/gt-components` (Standardization); `skills/gt-brand` sections 5 and 8; `skills/gt-dither` section 5; `skills/gt-voice` (Hard rules, Facts and public surfaces); `skills/gt-website` section 8; `skills/gt-local-dev` sections 1 and 5; `skills/prototemplate` sections 8 and 10; `docs/handbook/quality-bar.md` and `docs/handbook/glossary.md`.
- Kevin's gt-cloud memory notes `redesign-v0-verdict`, `pr-size-discipline`, `explorations-stay-local`, `plain-technical-english` and `sentence-order-rules`, which hold earlier statements of rules 2, 3, 4 and 12 and the writing rules this page follows.
