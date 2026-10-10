// Write: parallel research readers, one writer, one hard critic, then the
// writer revises and records every change it rejects with a reason. Used for
// a spec or a document that a later build or a reader depends on. Reduced
// from a gt-cloud research-and-spec workflow of 2026-10-09
// (references/sources.md): structure and schemas kept, prompts reduced to
// one-line stubs, the notes folder passed in through args.

export const meta = {
  name: 'write-example',
  description: 'Research in parallel, write one document, have a critic tear it apart, revise',
  phases: [
    { title: 'Research', detail: 'readers in parallel, one per question' },
    { title: 'Write', detail: 'one writer, one critic, one revision' },
  ],
}

const NOTES = args.notes // a durable folder outside the scratchpad: the ask, the research notes and the document

// Opens with Kevin's words for the work, verbatim (SKILL.md section 2).
const CTX = `Kevin's request, in his own words: <quote>. His full ask is in ${NOTES}/ASK.md. <the repository, worktree and branch>. Read-only until the Write phase.`

const REPORT = {
  type: 'object',
  required: ['summary', 'facts', 'sources', 'risks'],
  properties: {
    summary: { type: 'string' },
    facts: { type: 'array', items: { type: 'string' }, description: 'measured or quoted facts, each with file:line or a URL' },
    sources: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
  },
}

// One reader per question; four in the original.
const LANES = [
  { key: 'codebase', prompt: 'Map <the code area the document governs>, with file and line.' },
  { key: 'prior-art', prompt: 'Survey <how others solve this>, with links, and what to take from each.' },
  { key: 'constraints', prompt: 'List <the rules, lints and decisions the document must respect>.' },
  { key: 'risks', prompt: 'Find <what has gone wrong with this kind of work before>.' },
]

phase('Research')
const research = await parallel(
  LANES.map((l) => () =>
    agent(`${CTX}\n\n${l.prompt} Write your notes to ${NOTES}/research/${l.key}.md and return the summary.`, {
      label: `research:${l.key}`,
      phase: 'Research',
      schema: REPORT,
    }).then((r) => (r ? { lane: l.key, ...r } : null)),
  ),
)
const reports = research.filter(Boolean)
const missing = LANES.filter((l) => !reports.some((r) => r.lane === l.key)).map((l) => l.key)
if (missing.length > 0) log(`research lanes without a result: ${missing.join(', ')}`)

phase('Write')
await agent(`${CTX}\n\nYou are the writer. Write ${NOTES}/SPEC.md from the research below. It must decide <the decisions, with numbers>, give <the file plan and the API between lanes>, and list <the acceptance criteria and the cut list>.\n\nRESEARCH:\n${JSON.stringify(reports, null, 1)}`, {
  label: 'write:draft',
  phase: 'Write',
  effort: 'high',
})

const critique = await agent(`${CTX}\n\nYou are a hard critic of ${NOTES}/SPEC.md. Attack it on <the failure modes that matter for this document>. Return a numbered list of required changes, each with its reason.`, {
  label: 'write:critic',
  phase: 'Write',
  effort: 'high',
})

await agent(`${CTX}\n\nYou wrote ${NOTES}/SPEC.md. Apply every change below that you agree with. For each one you reject, add a line to the document's "Rejected" section with the reason.\n\nCRITIQUE:\n${critique ?? '(the critic returned nothing; reread the document once for gaps)'}`, {
  label: 'write:revise',
  phase: 'Write',
  effort: 'high',
})

return { reports: reports.map((r) => ({ lane: r.lane, summary: r.summary, risks: r.risks })), missing, document: `${NOTES}/SPEC.md` }
