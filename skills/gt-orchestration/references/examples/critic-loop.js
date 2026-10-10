// Critic loop: parallel builders on disjoint files, each followed by a fresh
// critic that scores the build from captures against Kevin's directives,
// for a fixed number of rounds or until the bar holds (SKILL.md section 4).
// Reduced from a redesign workflow of 2026-07-30 (references/sources.md):
// the round structure, the pass rule and the verdict schema are kept, the
// tasks and prompts are one-line stubs, and the server and capture command
// come in through args.

export const meta = {
  name: 'critic-loop-example',
  description: 'Build each task on its own files, then score it with a fresh critic until it passes or the rounds run out',
  phases: [
    { title: 'Build', detail: 'parallel builders, disjoint files' },
    { title: 'Critique', detail: 'screenshot verdicts, up to MAX_ROUNDS per task' },
  ],
}

const BASE = args.base // the review server the captures read
const SHOOT = (tag) => `${args.shoot} ${tag}` // the capture command; writes shots and a summary with an error count
const MAX_ROUNDS = 2 // a budget stop: what still fails after it goes into the report as open
const PASS = 8.5 // the bar, out of 10: "exactly what I asked"

// Each task names its own files; no two tasks share one.
const SCOPE = (files) => `Touch only ${files}. Other builders run at the same time on other files. Put new styles in your own new file.`
const TASKS = [
  { key: 'task-a', files: '<files for task a>', directive: "Kevin's words for task a, verbatim" },
  { key: 'task-b', files: '<files for task b>', directive: "Kevin's words for task b, verbatim" },
]

const VERDICT = {
  type: 'object',
  required: ['score', 'pass', 'specGaps', 'problems', 'strengths'],
  properties: {
    score: { type: 'number' },
    pass: { type: 'boolean' },
    specGaps: { type: 'array', items: { type: 'string' }, description: 'one per directive not met' },
    problems: { type: 'array', items: { type: 'string' }, maxItems: 8, description: 'each anchored to a capture' },
    strengths: { type: 'array', items: { type: 'string' } },
  },
}

const results = await parallel(
  TASKS.map((t) => async () => {
    const rounds = []
    let verdict = null
    let prior = ''
    for (let r = 1; r <= MAX_ROUNDS; r += 1) {
      const built = await agent(
        `Kevin's request for this task, in his own words: ${t.directive}\n${SCOPE(t.files)}\nBuild it on ${BASE}. Self-check with ${SHOOT(`${t.key}-self-r${r}`)}: error count 0, and every directive visible in a still. Return a numbered map of directive to change.${prior}`,
        { label: `${t.key}:build:r${r}`, phase: 'Build' },
      )
      if (built === null) {
        rounds.push({ round: r, note: 'builder died' })
        break
      }
      verdict = await agent(
        `You are a harsh critic who did not build this. Capture ${SHOOT(`${t.key}-critic-r${r}`)} and judge it against Kevin's words: ${t.directive}. Write the gaps and problems before the score. Score 0 to 10; pass = score >= ${PASS} and no spec gaps and an error count of 0.`,
        { label: `${t.key}:critic:r${r}`, phase: 'Critique', schema: VERDICT, effort: 'high' },
      )
      if (verdict === null) {
        rounds.push({ round: r, note: 'critic died' })
        break
      }
      rounds.push({ round: r, score: verdict.score, pass: verdict.pass })
      log(`${t.key} round ${r}: ${verdict.score}/10, ${verdict.specGaps.length} gaps, ${verdict.pass ? 'pass' : 'fail'}`)
      if (verdict.pass) break
      prior = `\n\nThe critic's round ${r} verdict (${verdict.score}/10). Fix all of it.\nGaps:\n${verdict.specGaps.join('\n')}\nProblems:\n${verdict.problems.join('\n')}`
    }
    return { key: t.key, rounds, finalScore: verdict ? verdict.score : null, passed: verdict ? verdict.pass : false }
  }),
)

return { results: results.filter(Boolean) }
