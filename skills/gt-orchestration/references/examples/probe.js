// Probe: one hunter per input class against a running server, an INTENDED
// list that suppresses known behaviour, then one skeptic per claimed finding.
// Reduced from a gt-cloud routing hunt of 2026-08-20 (references/sources.md):
// the structure and schemas are kept, every prompt is a one-line stub, and
// the base URL comes in through args. Fill the stubs before running.

export const meta = {
  name: 'probe-example',
  description: 'Hunt for wrong behaviour across the real input space, then verify each finding adversarially',
  phases: [
    { title: 'Probe', detail: 'one hunter per input class against the running server' },
    { title: 'Verify', detail: 'one skeptic per claimed finding' },
  ],
}

const BASE = args.base // the running server, for example a worktree's dev server; never started or stopped here

// Every hunter and every skeptic reads this. A finding that matches a line here is not reported.
const INTENDED = `KNOWN AND INTENDED behaviours (do not report): <one line per designed behaviour, with an example>.
WHAT IS A REAL FINDING: <the defect archetype that started the hunt, and its neighbours>.`

// How to observe one input without changing anything.
const HOWTO = `The server runs at ${BASE}; do not start or stop it. <the one command that records an observation>. Enumerate real inputs from <the source of truth>; never invent them. Budget about 25 to 45 inputs. Modify no files.`

const FINDINGS = {
  type: 'object',
  additionalProperties: false,
  required: ['findings', 'tested', 'notes'],
  properties: {
    tested: { type: 'integer', description: 'how many inputs were actually observed' },
    notes: { type: 'string', description: 'what was covered, and anything notable that was not a finding' },
    findings: {
      type: 'array',
      maxItems: 12,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['input', 'observed', 'expected', 'why', 'severity'],
        properties: {
          input: { type: 'string' },
          observed: { type: 'string', description: 'exactly what the tool reported' },
          expected: { type: 'string' },
          why: { type: 'string', description: 'why it is wrong, and who would hit it' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
      },
    },
  },
}

const VERDICT = {
  type: 'object',
  additionalProperties: false,
  required: ['real', 'reasoning', 'observed'],
  properties: {
    real: { type: 'boolean' },
    reasoning: { type: 'string' },
    observed: { type: 'string', description: 'what the skeptic observed when it reproduced the claim' },
  },
}

// One hunter per input class; six in the original.
const HUNTERS = [
  { label: 'short-name-collisions', prompt: 'Hunt for <inputs whose short names collide with longer ones>.' },
  { label: 'cross-section-leakage', prompt: 'Hunt for <corrections that cross a boundary they should keep>.' },
  { label: 'locale-consistency', prompt: 'Compare <the same input shape across locales or modes>.' },
  { label: 'structural-edges', prompt: 'Hunt for crashes on <odd encodings, lengths and shapes>.' },
  { label: 'hygiene', prompt: 'Audit <chains, loops, dead targets and status consistency>.' },
]

phase('Probe')

const results = await pipeline(
  HUNTERS,
  (h) => agent(`${h.prompt}\n\n${INTENDED}\n${HOWTO}`, { label: h.label, phase: 'Probe', schema: FINDINGS }),
  (res, h) => {
    if (!res || res.findings.length === 0) return { label: h.label, tested: res?.tested ?? 0, notes: res?.notes ?? '', verified: [] }
    return parallel(
      res.findings.map((f) => () =>
        agent(
          `You are a skeptic. Refute this claimed defect if you can: ${JSON.stringify(f)}. Reproduce it yourself. Refute it when it is INTENDED, does not reproduce, is a reasonable answer, or is harmless and implausible. Default to refuted when uncertain.\n\n${INTENDED}\n${HOWTO}`,
          { label: `verify:${f.input.slice(0, 40)}`, phase: 'Verify', schema: VERDICT },
        ).then((v) => ({ ...f, verdict: v })),
      ),
    ).then((verified) => ({ label: h.label, tested: res.tested, notes: res.notes, verified: verified.filter(Boolean) }))
  },
)

const done = results.filter(Boolean)
const confirmed = done.flatMap((r) => r.verified.filter((f) => f.verdict && f.verdict.real))
const refuted = done.flatMap((r) => r.verified.filter((f) => f.verdict && !f.verdict.real))
log(`${confirmed.length} confirmed, ${refuted.length} refuted`)

return {
  tested: done.reduce((n, r) => n + (r.tested || 0), 0),
  confirmed,
  refuted: refuted.map((f) => `${f.input}: ${f.verdict.reasoning.slice(0, 140)}`),
  coverage: done.map((r) => ({ label: r.label, tested: r.tested, notes: r.notes })),
}
