# Critic-scored convergence

Detail for section 4 of `gt-orchestration`: the full loop with its examples. The summary in SKILL.md keeps every rule; this file keeps the reasons and the numbers.

Quality work converges through a separate harsh critic that scores the work against a named reference.

1. **Name the exemplar and the bar in the brief.** `gt-aesthetic` section 1 names the reference for each surface: the brand deck for product surfaces, the shipped generaltranslation.com for the site (the Dossier until 2026-10-07), and the Blue Marble for dithered pictures. In July 2026 the references were live sites. Kevin, 2026-07-30: "remember the bar is generaltranslation.com and resend.com. literally rereview and continuously score yourself until it look sright". For a set, the bar is the best item Kevin has accepted.
2. **Capture both at the same geometry.** The work and the reference share the viewport, theme, camera and crop, side by side. Reset to the same viewport or camera presets after every edit, so before and after stay comparable.
3. **A fresh critic scores blind.** The critic did not build the work, is told to be harsh, and is not told which image is the work. It writes concrete mismatch notes before it scores, cites what the reference does that the work does not, keeps the lower score when unsure, and judges the worst item as harshly as the best.
4. **Refiners fix only the named gaps.**
5. **Repeat until the bar holds everywhere.** Prefer a number per view and per dimension, and state it in the brief. The July GT diagram rounds used 8.5 of 10 from the rubric in `docs/research/DESIGN_STANDARD.md` section 8, and `gt-explorations` section 6 holds that rubric and its composites for design rounds. Kevin's own long loops used 8.5 of 10 per dimension, 90 of 100 overall and in every view, and "until 100" for research loops (July to September 2026).
6. **Close the ways to game the score.**
   - The bar ends the loop. A cap on rounds is a budget stop, and the report lists the gaps still open.
   - One strong view or component never averages away a weak one.
   - The builder never scores its own work. A lane's "pass" counts only with its captures.
   - The reference is checked first: it renders, it is the right variant, and it is complete. A rubric's anchor composites live in the repository (`docs/composites/`), because a scratchpad path disappears.
   - Work from the worst item upward, so showcase items cannot hide failures, and run the whole set. A sample proves nothing about the items it skipped.
   - When a shared base changes, rerun every item built on it.
   - Kevin's note outranks a critic's pass. An item he called wrong stays open until he says otherwise (`gt-films` section 9).
7. **Change the method when scores stop rising.** Measure the references and rebuild from the measurements. `gt-films` holds the same rule for films: when a move fails twice, change the idea.
8. **Say which kind of check passed.** A structural audit (loads, hierarchy, dimensions) read 91 of 91 while 0 of 72 items passed a visual bar of 90 in every view (2026-07-30). Report each kind of check on its own line, and call a structural pass structural (`gt-verify`).
