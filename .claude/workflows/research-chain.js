export const meta = {
  name: 'research-chain',
  description: 'Pin a corpus, write the document, verify it with four separated lenses, fix until a round comes back clean, and open a draft PR',
  whenToUse: 'One research target, already resolved to a concrete identity, that should go all the way to a reviewable PR without stopping to ask.',
  phases: [
    { title: 'Source and draft', detail: 'one agent, one context: pin the corpus and write the document' },
    { title: 'Verify', detail: 'lenses A/B/C in parallel, then D over their reports' },
    { title: 'Fix', detail: 'apply, re-verify what changed, repeat until a round is clean' },
    { title: 'Ship', detail: 'branch, commit, push, draft PR' },
  ],
}

// The script holds the sequence; the skills hold the procedure. Where a prompt below and a
// skill disagree, the skill wins, so prompts point at skill files rather than restating
// them. Two copies drift.
//
// args is resolved in the main session, where questions can still be asked. A workflow
// cannot ask, so it has to arrive fully formed:
//   { slug, kind, target, question, angle }
const a = args || {}
if (!a.slug || !a.target) {
  return { error: 'args.slug and args.target are required. Resolve the target before launching.' }
}

const DOC = `research/${a.slug}`
const EVID = `.research/${a.slug}`

// No absolute path here. A workflow script cannot read the filesystem, so one written in
// would be whichever machine the author happened to be on, and the agents already start in
// the repository root. The repo bans stored local paths in sources.jsonl for the same
// reason; a harness that breaks its own rule breaks it on someone else's checkout.
const HOUSE = `Repository root: your working directory. Read AGENTS.md there first and
follow it; it governs everything below. All paths below are relative to that root.`

// ─── phase 1 ────────────────────────────────────────────────────────────────
// One agent on purpose. research-source and research-doc share a context because a writer
// has to be able to reopen the source mid-sentence, and that does not survive an agent
// boundary. The resume risk is covered by disk: sources.jsonl, notes/ and index.html all
// land as files, so a re-run resumes from them rather than from zero.
phase('Source and draft')
const draft = await agent(`${HOUSE}

Objective: produce a publishable research document at ${DOC}/.

Target: ${a.target}
${a.question ? `The question the document has to settle: ${a.question}` : ''}
${a.angle ? `Required angle: ${a.angle}` : ''}

Steps:
1. Read .claude/skills/research-source/SKILL.md and follow it.
2. Before writing prose, enumerate what the corpus contains: a paper's section list, a
   repository's tree by directory. You cannot report what you did not read without first
   knowing what there was to read, and chapter 7 is built from this.
3. Fill ${EVID}/evidence.jsonl as you read, per that skill. Quotes and locators, taken
   while the file is open. Do not begin a chapter with it still empty.
4. Staying in the same context, continue with .claude/skills/research-doc/SKILL.md and
   write ${DOC}/index.html.
5. Pass node scripts/check-doc.mjs ${DOC} and node scripts/check-prose.mjs ${DOC}, then
   run node scripts/build-index.mjs.

Steps 2 and 3 are what stops a thin read. Reading and writing share one context window,
and the first thing to give out under that pressure is the ability to find a passage again
rather than the memory of having seen it. A span copied out when you found it costs nothing
later; one you must go back for costs a re-read you will not budget.

Delegation: research-doc describes when to hand reading to a compression subagent and what
to constrain it to. Follow that, with one exception: extract the evidence spans yourself.
A subagent returns what it concluded, and the conclusion is what you were meant to reach
from the words.

Output: JSON matching the schema.
Boundaries: do not commit, do not create a branch, do not touch claims.jsonl. Claims are
extracted later, from the sentences that shipped.`,
  {
    label: `draft:${a.slug}`,
    schema: {
      type: 'object',
      required: ['slides', 'gatesPassed', 'summary', 'evidenceCount', 'corpusEnumerated', 'notRead'],
      properties: {
        slides: { type: 'integer' },
        gatesPassed: { type: 'boolean' },
        checkoutPath: { type: 'string' },
        summary: { type: 'string' },
        // What was read, in the shape chapter 7 needs. Reporting these is what makes a
        // thin read visible; a prompt line asking for depth is not.
        evidenceCount: { type: 'integer' },
        corpusEnumerated: { type: 'array', items: { type: 'string' } },
        notRead: { type: 'array', items: { type: 'string' } },
        openQuestions: { type: 'array', items: { type: 'string' } },
      },
    },
  })

if (!draft || !draft.gatesPassed) {
  return { stoppedAt: 'draft', reason: 'check-doc.mjs did not pass', draft }
}
if (!draft.evidenceCount) {
  return { stoppedAt: 'draft', reason: 'evidence.jsonl is empty; the document was written without recorded spans', draft }
}
log(`draft complete: ${draft.slides} slides, ${draft.evidenceCount} evidence spans`)

// ─── phase 2 ────────────────────────────────────────────────────────────────
// A judge marks its own failing output as satisfied far more often than someone else's,
// and familiarity rather than authorship is what drives it, so a lens must not be the
// writer and lens D asks for a different model.
const NOT_THE_AUTHOR = `${HOUSE}

Document: ${DOC}/index.html
Corpus identity: ${EVID}/sources.jsonl
Evidence the author recorded while reading: ${EVID}/evidence.jsonl
Checkout: ${draft.checkoutPath || '(none given; fetch it from the pinned identity)'}

You did not write this document. The author's confidence was not passed to you and should
not be. Do not assume it is right; start from where it would be wrong.

Do not edit the document. You find, the author fixes.
Do not delegate: a subagent reading for you reports what it concluded, not what it saw,
and that separation is the only reason you exist as a separate context.`

const REPORT_SHAPE = `
Write your report in Korean, plain declarative, following
.claude/skills/research-doc/references/prose-ko.md:

  ## 고쳐야 하는 것      one correct answer exists. slide number, the document's sentence,
                        the source value, the locator
  ## 판단이 필요한 것    changes the document's conclusion or its size
  ## 검증하지 못한 것    never empty. A report listing only findings reads as
                        "everything else checked out"

Do not report what you are unsure of. Do not list what passed; give a count.`

const LENSES = [
  { key: 'A', label: 'lens:adoption', file: 'lens-adoption.md' },
  { key: 'B', label: 'lens:numbers', file: 'lens-numbers.md',
    extra: `Where evidence.jsonl holds a span for a number, check the document against the
span and the span against the source. A span that no sentence uses is worth reporting too:
either the reading found something the writing dropped, or the span was never needed.` },
  { key: 'C', label: 'lens:prose', file: 'lens-prose.md' },
]

const reports = await parallel(LENSES.map((L) => () =>
  agent(`Read .claude/skills/research-verify/references/${L.file} and review through that lens.

${NOT_THE_AUTHOR}
${REPORT_SHAPE}
${L.extra || ''}`, { label: L.label, phase: 'Verify' })
    .then((r) => ({ key: L.key, label: L.label, report: r }))
))

const got = reports.filter(Boolean).filter((r) => r.report)
log(`${got.length}/${LENSES.length} lenses reported`)

// D runs last because what it examines is the shape of the other three, and it owns the
// one failure the machine check cannot reach: a quote that verifies while the sentence
// built on it says something the source never said.
const dReport = await agent(`Read .claude/skills/research-verify/references/lens-completeness.md and review through that lens.

${NOT_THE_AUTHOR}
${REPORT_SHAPE}

The three earlier reports:
${got.map((r) => `### Lens ${r.key} (${r.label})\n${r.report}`).join('\n\n')}

Beyond what that file says, this run assigns you one thing specifically: find a quote that
is verbatim while the sentence around it widens a narrow fact, or joins two facts the
source keeps apart. check-claims.mjs confirms the quote sits at its locator and stops
there, so nothing else in this pipeline can catch it.`,
  { label: 'lens:completeness', phase: 'Verify', model: 'sonnet' })

// ─── phase 3 ────────────────────────────────────────────────────────────────
// A loop, because research-verify says to stop when a round turns up nothing new rather
// than when the first round clears: fixes introduce their own errors and the second round
// is what finds them. Re-verification is scoped to the slides that moved. The cap is there
// so the loop terminates on cost even when the document does not converge.
phase('Fix')

const MAX_ROUNDS = 3
let findings = got.map((r) => `### Lens ${r.key}\n${r.report}`).join('\n\n') +
  `\n\n### Lens D\n${dReport || '(none)'}`
let fixed = null
const rounds = []
let stoppedBecause = 'cap'
// Must-fix items the last round confirmed but had no round left to act on. Empty unless the
// loop ends on the cap.
let openFindings = []

for (let round = 1; round <= MAX_ROUNDS; round++) {
  fixed = await agent(`${HOUSE}

Read the "Fix, then re-verify what changed" section of
.claude/skills/research-verify/SKILL.md and follow it. That file owns this procedure; this
prompt only says which round you are in and what to act on.

Round ${round} of at most ${MAX_ROUNDS}. Document: ${DOC}/index.html
${a.question ? `The question this document exists to settle: ${a.question}` : ''}

Findings to act on:
${findings}

Confirm each finding against the pinned source before you change anything. Lenses are
wrong often enough that acting on one unchecked can delete a correctly sourced claim.
Record the ones you rejected and why.

Extract ${EVID}/claims.jsonl from the sentences that shipped. Then run:
    node scripts/check-doc.mjs ${DOC}
    node scripts/check-prose.mjs ${DOC}
    node .claude/skills/research-verify/scripts/check-claims.mjs ${DOC}${draft.checkoutPath ? ` --repo <owner/name>=${draft.checkoutPath}` : ' --repo <owner/name>=<path>'}
    node scripts/build-index.mjs
Render the changed slides and read them after the fixes, not before.

Output: JSON matching the schema. touchedSlides decides what gets re-verified.
Boundaries: do not commit. Anything that changes the document's conclusion or its size is
not yours to decide; put it in needsJudgment and leave the document alone.`,
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
    break
  }

  // The cap is checked below, after this runs, not before it. A fix round is finished when
  // a context that did not make the edits has read them, so the last round needs re-reading
  // exactly like the others — and the last round is the one carrying the freshest edits.
  const recheck = await agent(`${NOT_THE_AUTHOR}

You are re-verifying after a fix round, not reviewing the whole document. Round ${round}
changed slides ${fixed.touchedSlides.join(', ')}.

Applied:
${(fixed.fixed || []).map((x) => `- ${x}`).join('\n') || '- (nothing recorded)'}

Rejected rather than applied:
${(fixed.rejected || []).map((x) => `- ${x}`).join('\n') || '- (none)'}

Read those slides against the pinned source and look for what the edits broke: a number
that no longer matches its neighbours, a cross-reference now pointing at the wrong chapter,
a qualifier dropped while rewriting, a claim whose quote still verifies while the sentence
around it drifted. Check the rejections too: if one was in fact correct, say so.

Report only new must-fix items; anything already fixed is not new. An empty list ends the
loop, so return one when the changed slides are sound.

Output: JSON matching the schema. No prose report this round.`,
    {
      label: `recheck:round-${round}`,
      phase: 'Fix',
      schema: {
        type: 'object',
        required: ['newMustFix'],
        properties: {
          newMustFix: { type: 'array', items: { type: 'string' } },
          badRejections: { type: 'array', items: { type: 'string' } },
        },
      },
    })

  // A dead agent returns null, and null must not arrive here as an empty finding list: that
  // is a round nobody read wearing the shape of a round that came back clean.
  if (!recheck) {
    stoppedBecause = 'recheck-failed'
    openFindings = [`라운드 ${round}의 재검증이 결과를 내지 못했다. 그 라운드가 고친 슬라이드 ${fixed.touchedSlides.join(', ')} 는 편집한 컨텍스트 말고는 아무도 읽지 않았다.`]
    log(`round ${round}: re-verification agent returned nothing; not treating that as clean`)
    break
  }

  const fresh = [...(recheck.newMustFix || []), ...(recheck.badRejections || [])]
  if (fresh.length === 0) {
    stoppedBecause = 'dry'
    log(`round ${round}: re-verification found nothing new`)
    break
  }
  if (round === MAX_ROUNDS) {
    // Read, confirmed, and out of budget to fix. That is a different thing from unverified,
    // and phase 4 carries it to the PR under its own heading so it is not read as clean.
    stoppedBecause = 'cap'
    openFindings = fresh
    log(`round ${round}: cap reached with ${fresh.length} must-fix confirmed and unfixed`)
    break
  }
  log(`round ${round}: ${fresh.length} new must-fix, going again`)
  findings = fresh.map((x) => `- ${x}`).join('\n')
}

if (!fixed || !fixed.gatesPassed) {
  return { stoppedAt: 'fix', reason: 'gates did not pass', draft, fixed, rounds, reports: got, dReport }
}

// ─── phase 4 ────────────────────────────────────────────────────────────────
// Draft, not ready for review. This can reach a PR unattended; it cannot judge that the
// document is worth publishing.
phase('Ship')
const shipped = await agent(`${HOUSE}

Objective: put the document on a branch and open a draft PR.

Branch doc/${a.slug} off main. Stage ${DOC}/ plus the README.md and index.html that
build-index.mjs rewrote. Write the message per the Commits section of AGENTS.md, which also
says what the PR is titled with, then push and open the PR.

Open it as a draft when any list below has anything in it, because the document really is
waiting on a decision then; open it ready for review when all of them are empty.

Then open ${DOC}/index.html locally so the person can look at the rendering before deciding
anything. The document is a deck and most of what is wrong with one is only visible once it
is on screen. Use whatever opens a browser on this machine; if nothing does, say so and put
the path in your result rather than treating it as a failure.

Put these in the PR body, under headings of their own:

For a person to decide:
${(fixed.needsJudgment || []).map((x) => `- ${x}`).join('\n') || '- (none)'}

Not verified:
${(fixed.unverified || []).map((x) => `- ${x}`).join('\n') || '- (none)'}

Found and not fixed:
${openFindings.map((x) => `- ${x}`).join('\n') || '- (none)'}
${openFindings.length ? `
Say in the PR body that the fix loop stopped at its round cap of ${MAX_ROUNDS} rather than
on a clean round, and that the items above were confirmed by a re-verification that ran
after the last fix round. They are known defects, not open questions — do not file them
under either of the other two headings.` : ''}

Output: JSON matching the schema.
Boundaries: do not merge, do not mark it ready for review, do not push to main.`,
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
  isDraft: shipped && shipped.isDraft,
  docPath: shipped && shipped.docPath,
  evidenceCount: draft.evidenceCount,
  notRead: draft.notRead || [],
  fixRounds: rounds,
  stoppedBecause,
  rejectedFindings: fixed.rejected || [],
  needsJudgment: fixed.needsJudgment || [],
  unverified: fixed.unverified || [],
  openFindings,
}
