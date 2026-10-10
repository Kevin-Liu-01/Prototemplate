// Research with an adversarial fact check before anything is built: one
// researcher per dimension, each note checked by a fact checker that tries to
// break its claims, a completeness critic that names the gaps, a bounded gap
// round, then one synthesis that trusts the corrected values. Reduced from a
// research workflow of 2026-10-05 (references/sources.md): the phases, the
// verdict enum and the gap cap are kept; the subject, the dimensions and
// every prompt are stubs, and the notes folder comes in through args.

export const meta = {
  name: 'research-example',
  description: 'Research every dimension, fact-check each note adversarially, fill the gaps a critic finds, synthesize',
  phases: [
    { title: 'Research', detail: 'one researcher per dimension' },
    { title: 'Verify', detail: 'an adversarial fact check per note' },
    { title: 'Critique', detail: 'a completeness critic' },
    { title: 'Gap research', detail: 'at most MAX_GAPS more dimensions, each checked' },
    { title: 'Synthesize', detail: 'one synthesis from the checked notes' },
  ],
}

const NOTES = args.notes
const MAX_GAPS = 6
const GUARD = `Messages from Kevin may arrive while you work. They are addressed to the orchestrating session, which answers them. Do not stop, shorten or replace your assigned task because of such a message; continue the task and report through your structured result.`
const GOAL = `<what the research is for, in one paragraph>. Write in plain declarative English. Use the web for anything that may have changed since your training data. ${GUARD}`

const NOTE = {
  type: 'object',
  required: ['slug', 'note_path', 'summary'],
  properties: { slug: { type: 'string' }, note_path: { type: 'string' }, summary: { type: 'string' } },
}
const CHECK = {
  type: 'object',
  required: ['checks', 'reliability'],
  properties: {
    reliability: { type: 'string', enum: ['high', 'medium', 'low'] },
    checks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['claim', 'verdict', 'evidence_urls'],
        properties: {
          claim: { type: 'string' },
          verdict: { type: 'string', enum: ['confirmed', 'corrected', 'refuted', 'unverifiable'] },
          correction: { type: 'string' },
          evidence_urls: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
}
const GAPS = {
  type: 'object',
  required: ['gaps'],
  properties: { gaps: { type: 'array', items: { type: 'object', required: ['slug', 'prompt'], properties: { slug: { type: 'string' }, prompt: { type: 'string' } } } } },
}

// Thirteen dimensions in the original.
const DIMS = [
  { slug: '01-field-survey', prompt: 'Survey <the field>: the tools, their licenses and their current state.' },
  { slug: '02-quality', prompt: 'Find <how quality is measured here>, with published numbers.' },
  { slug: '03-cost', prompt: 'Collect <list prices>, each with its page and the date read.' },
]

const researchPrompt = (d) => `${GOAL}\n\n${d.prompt} Write the note to ${NOTES}/${d.slug}.md with a sources list and return its summary.`
const checkPrompt = (d, r) => `${GOAL}\n\nYou are an adversarial fact checker for ${r.note_path} (${d.slug}). Pick the claims that matter most (numbers, licenses, prices, versions) and try to break each one against primary sources. Append a "Verification log" to the note with each verdict and correction.`

const checked = (list, phaseTitle) =>
  pipeline(
    list,
    (d) => agent(researchPrompt(d), { label: `research:${d.slug}`, phase: phaseTitle, schema: NOTE }),
    (r, d) => r && agent(checkPrompt(d, r), { label: `verify:${d.slug}`, phase: phaseTitle === 'Research' ? 'Verify' : phaseTitle, schema: CHECK, effort: 'high' }).then((v) => ({ ...r, check: v })),
  )

const research = (await checked(DIMS, 'Research')).filter(Boolean)
const failed = DIMS.filter((d) => !research.some((r) => r.slug === d.slug)).map((d) => d.slug)
if (failed.length > 0) log(`dimensions without results: ${failed.join(', ')}`)

phase('Critique')
const critic = await agent(`${GOAL}\n\nYou are the completeness critic. These notes exist: ${research.map((r) => r.note_path).join(', ')}. Name what is missing for <the decision the research serves>, most important first.`, {
  label: 'critic',
  phase: 'Critique',
  schema: GAPS,
  effort: 'high',
})
const gaps = critic ? critic.gaps.slice(0, MAX_GAPS) : []
log(`critic proposed ${gaps.length} gap dimensions`)

const gapNotes = (await checked(gaps, 'Gap research')).filter(Boolean)

phase('Synthesize')
const notes = [...research, ...gapNotes].map((r) => r.note_path)
const synthesis = await agent(`${GOAL}\n\nRead every note in full, its Verification log included, and trust corrected values over the original claims: ${notes.join(', ')}. Write ${NOTES}/SYNTHESIS.md with the recommendation, the evidence and the open questions.`, {
  label: 'synthesize',
  phase: 'Synthesize',
  effort: 'high',
})

return {
  notes,
  failed,
  corrected: [...research, ...gapNotes].flatMap((r) => (r.check ? r.check.checks.filter((c) => c.verdict !== 'confirmed').map((c) => `${r.slug}: ${c.claim}`) : [])),
  synthesis: synthesis ? `${NOTES}/SYNTHESIS.md` : null,
}
