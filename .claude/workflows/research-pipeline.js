export const meta = {
  name: 'research-pipeline',
  description: 'Pin a corpus, write the document, verify it with four separated lenses, fix, and open a draft PR',
  whenToUse: 'One research target, resolved to a concrete identity, that should go all the way to a reviewable PR without stopping to ask.',
  phases: [
    { title: 'Source and draft', detail: 'one agent, one context: pin the corpus and write the document' },
    { title: 'Verify', detail: 'lenses A/B/C in parallel, then D over their reports' },
    { title: 'Fix', detail: 'apply must-fix, re-extract claims, re-run both gates, re-render' },
    { title: 'Ship', detail: 'branch, commit, push, draft PR' },
  ],
}

// These instructions are English. The document they produce is Korean, and so are the
// lens reports, because those are read by a person. AGENTS.md draws the same line.
//
// args is resolved in the main session, where questions can still be asked. A workflow
// cannot ask, so it must arrive fully formed. Shape:
//   { slug, kind, target, question, angle }
// e.g. { slug: '2026-08-13-a2e-agent-auditing-engine', kind: 'paper',
//        target: 'arXiv 2608.07346v2, code datamllab/A2E',
//        question: 'Does the harness change what the model can do?',
//        angle: 'Include how this reads from a Claude Code perspective' }
const a = args || {}
if (!a.slug || !a.target) {
  return { error: 'args.slug and args.target are required. Resolve the target before launching.' }
}

const REPO = '/home/samsung/github/research-library'
const DOC = `research/${a.slug}`
const EVID = `.research/${a.slug}`

// Every agent gets the four things Anthropic found necessary to stop subagents
// duplicating each other: an objective, an output format, tool and source guidance, and
// explicit boundaries.
const HOUSE = `
Repository: ${REPO}. Read AGENTS.md first and follow it.

The document you produce is written in Korean. Technical terms stay English (harness,
corpus, tool call, commit, embedding). These instructions are English; the product is not.

Do not write a number you have not opened the source to confirm. When a claim is too
ambiguous to pin down, drop it rather than hedging it: a wrong finding costs more than a
missing one.
`.trim()

// ─── phase 1 ────────────────────────────────────────────────────────────────
// One agent, deliberately. research-source and research-doc must share a context: when a
// sentence goes shaky mid-paragraph the writer has to reopen the source, and that ability
// does not survive an agent boundary. The resume risk this creates is covered by disk.
// sources.jsonl, notes/ and index.html all land as files, so a re-run picks up from them
// rather than from zero.
phase('Source and draft')
const draft = await agent(`${HOUSE}

Objective: produce a publishable research document at ${DOC}/.

Target: ${a.target}
${a.question ? `The question the document has to settle: ${a.question}` : ''}
${a.angle ? `Required angle: ${a.angle}` : ''}

Steps:
1. Read .claude/skills/research-source/SKILL.md and follow it. Pin the corpus to a
   portable identity (arxiv_id + version, repo + commit). Keep the checkout outside the
   repository. Write ${EVID}/sources.jsonl before you open anything, so the commit you
   cite is the commit you read.
2. Staying in the same context, continue with .claude/skills/research-doc/SKILL.md and
   write ${DOC}/index.html chapter by chapter. For a paper, read the numbers from the
   LaTeX tables in the arxiv.org/e-print tarball. Rendered HTML drops and merges cells,
   so a number taken only from HTML is one you have not confirmed.
3. Pass node scripts/check-doc.mjs ${DOC} and run node scripts/build-index.mjs.

Delegation: when a trace crosses files large enough that loading them leaves nothing to
write with, hand that reading to a subagent, as research-doc describes. Give it no
judgment to make: ask for extraction and quotes with file:line locators, never for a
conclusion. You stay the one who decides what the document says. Reading that fits in
context is faster read directly.

Output format: JSON matching the schema.
Boundaries: do not commit, do not create a branch, do not touch claims.jsonl. Claims are
extracted later, from the sentences that actually shipped.`,
  {
    label: `draft:${a.slug}`,
    schema: {
      type: 'object',
      required: ['slides', 'gatesPassed', 'summary'],
      properties: {
        slides: { type: 'integer' },
        gatesPassed: { type: 'boolean' },
        checkoutPath: { type: 'string' },
        summary: { type: 'string' },
        openQuestions: { type: 'array', items: { type: 'string' } },
      },
    },
  })

if (!draft || !draft.gatesPassed) {
  return { stoppedAt: 'draft', reason: 'check-doc.mjs did not pass', draft }
}
log(`draft complete: ${draft.slides} slides`)

// ─── phase 2 ────────────────────────────────────────────────────────────────
// Separation is the mechanism, not a formality. On programmatically verifiable rubrics a
// judge is over 50% more likely to mark its own failing output as satisfied, and the
// cause is familiarity rather than authorship, so a lens must not be the writer and
// should not share its model family where avoiding that is cheap.
const LENS_BASE = `${HOUSE}

Document: ${DOC}/index.html (read all of it)
Corpus identity: ${EVID}/sources.jsonl
Checkout: ${draft.checkoutPath || '(none given; fetch it yourself from the pinned identity)'}

You did not write this document. The author's confidence was not passed to you, and it
should not be. Do not assume the document is right. Start from where it would be wrong.

Write your report in Korean, plain declarative (~한다/~이다), following
.claude/skills/research-doc/references/prose-ko.md. Shape:

  ## 고쳐야 하는 것      one correct answer exists. slide number, the document's sentence,
                        the source value, the locator
  ## 판단이 필요한 것    changes the document's conclusion or its size
  ## 검증하지 못한 것    never leave this empty. A report that lists only findings reads
                        as "everything else checked out"

Do not report what you are unsure of. Do not list what passed; give a count.
Do not edit the document. You find; the author fixes.

Do not delegate this review. You are reading one document against one pinned corpus, so
there is nothing here that needs compressing, and a subagent reading on your behalf would
report back what it concluded rather than what it saw. The separation is the whole reason
you exist as a separate context; keep it in one pair of hands.

Budget: aim to finish inside roughly 30k tokens. Depth on the claims that carry the
document beats coverage of every sentence.`

const LENSES = [
  {
    key: 'A', label: 'lens:adoption',
    file: '.claude/skills/research-verify/references/lens-adoption.md',
    focus: `Audit the coverage chapter. Check its file and directory counts against the
            real checkout and see whether they add up. Find what an adopter needs and the
            document does not give: license, runtime requirements, maintenance signals.`,
  },
  {
    key: 'B', label: 'lens:numbers',
    file: '.claude/skills/research-verify/references/lens-numbers.md',
    focus: `Reopen every number in the pinned source. Check value, direction, unit, range
            and base. Recompute anything the document says it derived itself. Re-run any
            grep or command the document quotes and confirm the hit count matches.`,
  },
  {
    key: 'C', label: 'lens:prose',
    file: '.claude/skills/research-verify/references/lens-prose.md',
    focus: `Judge the writing against prose-ko.md and visual.md. Verify every circled
            chapter cross-reference resolves to the chapter that actually holds what is
            claimed. Check svg aria-labels, image alt text, and anywhere colour carries
            meaning on its own.`,
  },
]

const reports = await parallel(LENSES.map((L) => () =>
  agent(`Read ${L.file} and review through that lens.

${LENS_BASE}

What this lens looks at in particular:
${L.focus}`,
    { label: L.label, phase: 'Verify' })
      .then((r) => ({ key: L.key, label: L.label, report: r }))
))

const got = reports.filter(Boolean).filter((r) => r.report)
log(`${got.length}/${LENSES.length} lenses reported`)

// Lens D runs last because what it examines is the shape of the other three. It also owns
// the failure mode nobody else is assigned: a quote that is accurate while the reading
// built on it is not. A different model is requested here on the finding that the gain
// from a panel comes from family separation rather than scale.
const dReport = await agent(`Read .claude/skills/research-verify/references/lens-completeness.md and review through that lens.

${LENS_BASE}

The three earlier reports:
${got.map((r) => `### Lens ${r.key} (${r.label})\n${r.report}`).join('\n\n')}

What this lens looks at in particular:
1. A claim no lens covered. Work out what the three above did not look at, then go there.
2. A quote that is verbatim while the sentence around it says something the source never
   said. This is the one thing the machine check cannot reach, because it confirms the
   quote sits at its locator and stops. Look for a narrow fact stated broadly, and for two
   facts joined into a connection the source keeps apart.
3. A source pinned in sources.jsonl that the document never leans on, and the reverse:
   something the document leans on that was never pinned.
4. A kind of checking that was never attempted at all: running the thing, rendering the
   page, opening the source's own figures.`,
  { label: 'lens:completeness', phase: 'Verify', model: 'sonnet' })

// ─── phase 3 ────────────────────────────────────────────────────────────────
// A loop, not a single pass. research-verify is explicit that fixes introduce their own
// errors and that it is the second round that finds them, so stopping the moment the
// first round clears would ship exactly the defects that round created. Re-verification
// is scoped to the slides that changed, because re-reading the whole document each round
// costs the same as the first review and finds less. The cap exists because the loop has
// to terminate on cost even when the document does not converge.
phase('Fix')

const MAX_ROUNDS = 3
let findings = got.map((r) => `### Lens ${r.key}\n${r.report}`).join('\n\n') +
  `\n\n### Lens D\n${dReport || '(none)'}`
let fixed = null
const rounds = []
let stoppedBecause = 'cap'

for (let round = 1; round <= MAX_ROUNDS; round++) {
  fixed = await agent(`${HOUSE}

Read the "Fix, then re-verify what changed" section of
.claude/skills/research-verify/SKILL.md and follow it. That file owns this procedure; this
prompt only says which round you are in and what to act on, so where the two differ, the
skill wins.

Objective: apply the must-fix findings and get both gates passing again.
This is round ${round} of at most ${MAX_ROUNDS}.

Document: ${DOC}/index.html
${a.question ? `The question this document exists to settle: ${a.question}` : ''}

Findings to act on:
${findings}

Steps:
1. Do not take a finding at face value. Confirm each must-fix against the pinned source
   before you change anything. Lenses are wrong often enough that acting on one unchecked
   can delete a correctly sourced claim. Record the ones you rejected and why.
2. Extract ${EVID}/claims.jsonl from the sentences that shipped, not from research notes.
   Give each claim its own locator and a quote of 40 characters or more. Evidence is
   aligned per claim; handing the whole document to every claim makes verification worse.
3. Run:
     node scripts/check-doc.mjs ${DOC}
     node .claude/skills/research-verify/scripts/check-claims.mjs ${DOC} --repo <owner/name>=<path>
     node scripts/build-index.mjs
4. Render the changed slides and read them AFTER the fixes. A render from before proves
   nothing, and this is where defects that pass both gates show up.

Output format: JSON matching the schema. touchedSlides lists the slide numbers you
actually changed, which decides what gets re-verified.
Boundaries: do not commit. Anything that changes the document's conclusion or its size is
not yours to decide; put it in needsJudgment and leave the document as it is.`,
    {
      label: `fix:round-${round}`,
      schema: {
        type: 'object',
        required: ['fixed', 'gatesPassed', 'rendered', 'touchedSlides'],
        properties: {
          fixed: { type: 'array', items: { type: 'string' } },
          rejected: { type: 'array', items: { type: 'string' } },
          needsJudgment: { type: 'array', items: { type: 'string' } },
          unverified: { type: 'array', items: { type: 'string' } },
          touchedSlides: { type: 'array', items: { type: 'integer' } },
          gatesPassed: { type: 'boolean' },
          rendered: { type: 'boolean' },
        },
      },
    })

  if (!fixed || !fixed.gatesPassed) { stoppedBecause = 'gates'; break }
  rounds.push({
    round,
    applied: (fixed.fixed || []).length,
    rejected: (fixed.rejected || []).length,
    touched: (fixed.touchedSlides || []).length,
  })

  if (!fixed.touchedSlides || fixed.touchedSlides.length === 0) {
    stoppedBecause = 'nothing-changed'
    log(`round ${round}: nothing changed, stopping`)
    break
  }
  if (round === MAX_ROUNDS) {
    log(`round ${round}: cap reached with slides still changing`)
    break
  }

  // A fresh context re-reads only what moved. It is told what the previous round did so it
  // can look for the damage a fix causes rather than re-deriving the original review.
  const recheck = await agent(`${LENS_BASE}

You are re-verifying after a fix round, not reviewing the whole document. Round ${round}
changed these slides: ${fixed.touchedSlides.join(', ')}.

What the author says they changed:
${(fixed.fixed || []).map((x) => `- ${x}`).join('\n') || '- (nothing recorded)'}

What they rejected rather than applying:
${(fixed.rejected || []).map((x) => `- ${x}`).join('\n') || '- (none)'}

Read those slides against the pinned source and look for what the edits broke: a number
that no longer matches its neighbours, a cross-reference that now points at the wrong
chapter, a qualifier dropped while rewriting, a claim whose quote still verifies while the
sentence around it drifted. Also check the rejections: if the author rejected a finding
that was in fact correct, say so.

Report only NEW must-fix items. A finding already fixed is not new. If the changed slides
are sound, say so and return an empty list, which is what ends the loop.`,
    {
      label: `recheck:round-${round}`,
      phase: 'Fix',
      schema: {
        type: 'object',
        required: ['newMustFix'],
        properties: {
          newMustFix: { type: 'array', items: { type: 'string' } },
          badRejections: { type: 'array', items: { type: 'string' } },
          note: { type: 'string' },
        },
      },
    })

  const fresh = [...((recheck && recheck.newMustFix) || []), ...((recheck && recheck.badRejections) || [])]
  if (fresh.length === 0) {
    stoppedBecause = 'dry'
    log(`round ${round}: re-verification found nothing new`)
    break
  }
  log(`round ${round}: ${fresh.length} new must-fix, going again`)
  findings = fresh.map((x) => `- ${x}`).join('\n')
}

if (!fixed || !fixed.gatesPassed) {
  return { stoppedAt: 'fix', reason: 'gates did not pass after fixes', draft, fixed, rounds, reports: got, dReport }
}

// ─── phase 4 ────────────────────────────────────────────────────────────────
// Draft, not ready for review. The pipeline can reach a PR without a human in the loop;
// it cannot judge that the document is worth publishing. Draft keeps that call a person's.
phase('Ship')
const shipped = await agent(`${HOUSE}

Objective: put the document on a branch and open a draft PR.

Steps:
1. Branch doc/${a.slug} off main.
2. Stage ${DOC}/ plus the README.md and index.html that build-index.mjs rewrote.
   .research/ is gitignored and will not be staged.
3. Write the message per the Commits section of AGENTS.md: one subject line saying what
   was done, and a body recording the document's topic and the sources it rests on.
4. Push and open it with gh pr create --draft. In the PR body, put what verification
   turned up and what a person still has to decide.

For a person to decide:
${(fixed.needsJudgment || []).map((x) => `- ${x}`).join('\n') || '- (none)'}

Not verified:
${(fixed.unverified || []).map((x) => `- ${x}`).join('\n') || '- (none)'}

Output format: JSON matching the schema.
Boundaries: do not merge, do not mark the PR ready for review, do not push to main.`,
  {
    label: 'ship',
    schema: {
      type: 'object',
      required: ['branch', 'prUrl'],
      properties: { branch: { type: 'string' }, prUrl: { type: 'string' }, commit: { type: 'string' } },
    },
  })

return {
  slug: a.slug,
  slides: draft.slides,
  pr: shipped && shipped.prUrl,
  branch: shipped && shipped.branch,
  fixRounds: rounds,
  stoppedBecause,
  rejectedFindings: fixed.rejected || [],
  needsJudgment: fixed.needsJudgment || [],
  unverified: fixed.unverified || [],
  note: 'Verification reduces error; it does not remove it. Separated review still misses most injected errors, and LLM judgement is weakest on exactly the code-grounded claims these documents are full of. The machine quote check is what carries. Hence a draft PR.',
}
