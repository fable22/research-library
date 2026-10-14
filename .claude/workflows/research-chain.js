export const meta = {
  name: 'research-chain',
  description: 'Pin a corpus, write the document, verify it with two separated lenses, fix until a round comes back clean, and open a PR, as a draft while anything waits on a person',
  whenToUse: 'One research target, already resolved to a concrete identity, that should go all the way to a reviewable PR without stopping to ask. Launch with args as a JSON object, never the request text: {"slug":"YYYY-MM-DD-slug","kind":"comparison|explainer|walkthrough","target":"<URL or arXiv ID+version>","question":"...","angle":"..."}, slug, kind and target required. Resolve a free-text request into that object in the main session first.',
  phases: [
    { title: 'Source and draft', detail: 'one agent, one context: pin the corpus and write the document' },
    { title: 'Verify', detail: 'lens B (numbers and quotes) and lens A (reader) in parallel' },
    { title: 'Fix', detail: 'apply, re-verify what changed, repeat until a round is clean' },
    { title: 'Ship', detail: 'branch, commit, push, draft PR' },
  ],
}

// The script holds the sequence; the skills hold the procedure. Where a prompt below and a
// skill disagree, the skill wins, so prompts point at skill files rather than restating
// them. Two copies drift. Before editing, read docs/workflow-authoring.md.
//
// args is resolved in the main session, where questions can still be asked. A workflow
// cannot ask, so it has to arrive fully formed. meta.whenToUse names the shape because it is
// the only part of this file a caller sees before launching; ARGS_SHAPE is what a launch that
// got it wrong is handed back. meta must be a literal, so the two cannot share a constant:
// change them together.
const ARGS_SHAPE = `args must be a JSON object (a JSON-encoded string of one also works):
  slug      required. YYYY-MM-DD-slug: a date, then lowercase letters, digits and hyphens.
            Names both research/<slug>/ and .research/<slug>/.
  kind      required. comparison | explainer | walkthrough: what the document is for.
            research-source has no default for it, and a workflow cannot ask.
  target    required. The resolved identity: a GitHub URL, an arXiv ID with its version,
            or a page URL.
  question  optional. The question the document has to settle.
  angle     optional. An angle the document is required to take.
Example:
  {"slug":"2026-10-07-example-topic","kind":"explainer","target":"https://github.com/owner/name","question":"...","angle":"..."}
Free text is not read into these fields. The slug and kind would have to be guessed, and a workflow
cannot ask, so resolve them in the main session and launch again.`

// Launches through this path have delivered args JSON-encoded, and also as the raw request
// text, so parse a string back before the guard runs. Every problem is reported in one pass, so
// one relaunch fixes them all. An unknown key is a problem rather than noise: a misspelled
// question would otherwise drop out of an unattended run without anyone seeing it.
let a = args
if (typeof a === 'string') {
  try { a = JSON.parse(a) } catch (e) {
    return { error: `args arrived as free text, not JSON (${e.message}).\n\n${ARGS_SHAPE}` }
  }
}
if (!a || typeof a !== 'object' || Array.isArray(a)) {
  const got = a === undefined ? 'nothing' : Array.isArray(a) ? 'an array' : JSON.stringify(a)
  return { error: `args must be an object; got ${got}.\n\n${ARGS_SHAPE}` }
}
{
  const problems = []
  const unknown = Object.keys(a).filter((k) => !['slug', 'kind', 'target', 'question', 'angle'].includes(k))
  if (unknown.length) problems.push(`keys this workflow does not read: ${unknown.join(', ')}`)
  // The same pattern scripts/new-doc.mjs enforces.
  if (typeof a.slug !== 'string' || !/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(a.slug)) {
    problems.push(a.slug === undefined ? 'slug is missing' : `slug is not YYYY-MM-DD-slug: ${JSON.stringify(a.slug)}`)
  }
  // The values research-source and scripts/new-doc.mjs take as the document's purpose.
  if (!['comparison', 'explainer', 'walkthrough'].includes(a.kind)) {
    problems.push(a.kind === undefined ? 'kind is missing' : `kind is not comparison, explainer or walkthrough: ${JSON.stringify(a.kind)}`)
  }
  if (typeof a.target !== 'string' || !a.target.trim()) problems.push('target is missing or empty')
  for (const k of ['question', 'angle']) {
    if (a[k] != null && typeof a[k] !== 'string') problems.push(`${k} must be a string when given`)
  }
  if (problems.length) {
    return { error: `args did not pass: ${problems.join('; ')}.\n\n${ARGS_SHAPE}` }
  }
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
Document kind: ${a.kind}. It was settled before launch; do not ask for it.
${a.question ? `The question the document has to settle: ${a.question}` : ''}
${a.angle ? `Required angle: ${a.angle}` : ''}

Read .claude/skills/research-source/SKILL.md and follow it, then, in this same context,
.claude/skills/research-doc/SKILL.md, and write ${DOC}/index.html. Enumerate what the
corpus contains before writing; the setup chapter and notRead are built from it. Pass
node scripts/check-doc.mjs ${DOC} and node scripts/check-prose.mjs ${DOC}, run
node scripts/build-index.mjs, and stop.

Output: JSON matching the schema.
Boundaries: do not commit, do not create a branch, do not touch claims.jsonl. Do not start
research-verify: phase 2 runs the lenses in contexts you cannot reach.`,
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
        // What was read, in the shape the setup chapter needs. Reporting these is what makes a
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
// and familiarity rather than authorship is what drives it, so no lens is the writer.
const NOT_THE_AUTHOR = `${HOUSE}

Document: ${DOC}/index.html
${a.question ? `The question the document exists to settle: ${a.question}` : ''}
What the document is for (comparison / explainer / walkthrough) is the purpose field of
${DOC}/meta.json; read it first, because what counts as missing depends on it.
Corpus identity: ${EVID}/sources.jsonl
Evidence the author recorded while reading: ${EVID}/evidence.jsonl
Checkout: ${draft.checkoutPath || '(none given; fetch it from the pinned identity)'}

You did not write this document. A finding is something that makes a claim in it wrong,
stops the reader from doing what its purpose promises, or, for the reader lens, costs the
reader the point. Things that would be nice to add,
sources that could also be read, and wording you would have chosen differently are not
findings; list them in one line each under 메모 or leave them out.

Do not edit the document. You find, the author fixes.
Do not delegate: a subagent reading for you reports what it concluded, not what it saw,
and that separation is the only reason you exist as a separate context.`

// The lens file owns the report's format; this adds only what the fix passes sort on.
const REPORT_SHAPE = `
Write your report in Korean, plain declarative, following
.claude/skills/research-doc/references/prose-ko.md, in the format your lens file gives.
Tag every item 고쳐야 (one correct answer exists: give the slide and the document's
sentence, plus the source value and the locator where a source applies) or 판단 (it changes
the document's conclusion or its size), and give your confidence. What you could not settle
goes under the heading your lens file uses for it, or 검증하지 못한 것 if it names none,
rather than being dropped. That heading is
never empty, because a report listing only findings reads as "everything else checked out". The fix passes check each item against
the source. Do not list what passed; give a count.`

const CHECKS = `    node scripts/check-doc.mjs ${DOC}
    node scripts/check-prose.mjs ${DOC}
    node .claude/skills/research-verify/scripts/check-claims.mjs ${DOC}${draft.checkoutPath ? ` --repo <owner/name>=${draft.checkoutPath}` : ' --repo <owner/name>=<path>'}
    node scripts/build-index.mjs`

const FIX_SCHEMA = {
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
}

// Round results accumulate. A later round is handed only the re-check's new findings, so
// what it returns under needsJudgment or rejected cannot include round 1's, and reading the
// last round alone dropped them from the PR and opened it ready for review.
const acc = { fixed: [], rejected: [], needsJudgment: [], unverified: [], wording: [] }
const take = (r) => { for (const k of ['fixed', 'rejected', 'needsJudgment', 'unverified']) acc[k].push(...(r[k] || [])) }
const list = (xs, none) => xs.map((x) => `- ${x}`).join('\n') || `- ${none}`

// B and A in parallel, blind to each other. B checks every number and quote against the
// pinned source; A reads as the developer the document is for. Structure is check-doc's.
const LENSES = [
  { key: 'B', label: 'lens:numbers', file: 'lens-numbers.md',
    extra: `Where evidence.jsonl holds a span for a number, check the document against the
span and the span against the source. A span that no sentence uses is worth reporting too:
either the reading found something the writing dropped, or the span was never needed.` },
  { key: 'A', label: 'lens:reader', file: 'lens-reader.md' },
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
const rounds = []

// ─── phase 3 ────────────────────────────────────────────────────────────────
// A loop, because research-verify says to stop when a round turns up nothing new rather
// than when the first round clears: fixes introduce their own errors and the second round
// is what finds them. Re-verification is scoped to the slides that moved. The cap is there
// so the loop terminates on cost even when the document does not converge.
phase('Fix')

// One round by default. A second opens only when re-verification names a defect with one
// correct answer (a number, a quote, a direction, a dead reference); a second round spent on
// wording rewrites the document toward the gate and away from the reader.
const MAX_ROUNDS = 2
let findings = got.map((r) => `### Lens ${r.key}\n${r.report}`).join('\n\n')
let fixed = null
let stoppedBecause = 'cap'
// Must-fix items the last round confirmed but had no round left to act on. Empty unless the
// loop ends on the cap.
let openFindings = []
// One-answer items the last re-check found, fixed once more without a further round.
let afterLastRecheck = []
// A lens that returned nothing is a perspective nobody applied. It goes under unverified,
// which also forces the PR to open as a draft.
const deadLenses = LENSES.map((L) => L.key).filter((k) => !got.some((r) => r.key === k))
for (const k of deadLenses) acc.unverified.push(`렌즈 ${k} 가 결과를 내지 못했다. 그 관점은 검토되지 않았다.`)

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

${round === 1 ? `Extract ${EVID}/claims.jsonl from the sentences as they now stand.` : `Update ${EVID}/claims.jsonl for the sentences you change.`} Then run:
${CHECKS}
Render the changed slides and read them after the fixes, not before.

Output: JSON matching the schema. touchedSlides decides what gets re-verified.
Boundaries: do not commit. Anything that changes the document's conclusion or its size is
not yours to decide; put it in needsJudgment and leave the document alone.`,
    { label: `fix:round-${round}`, schema: FIX_SCHEMA })

  if (!fixed || !fixed.gatesPassed) { stoppedBecause = 'gates'; break }
  rounds.push({
    round,
    applied: (fixed.fixed || []).length,
    rejected: (fixed.rejected || []).length,
    touched: (fixed.touchedSlides || []).length,
  })
  take(fixed)

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
a qualifier dropped while rewriting, a condition moved to the limits chapter that leaves the
body sentence false without it, a claim whose quote still verifies while the sentence
around it drifted. Check the rejections too: if one was in fact correct, say so.

Report only new must-fix items; anything already fixed is not new. An empty list ends the
loop, so return one when the changed slides are sound. Give each item a kind: number, quote,
direction, or reference when it has one correct answer; wording when it is about how a
sentence reads. Wording items are recorded and not acted on in a further round.

Output: JSON matching the schema. No prose report this round.`,
    {
      label: `recheck:round-${round}`,
      phase: 'Fix',
      schema: {
        type: 'object',
        required: ['newMustFix'],
        properties: {
          newMustFix: { type: 'array', items: { type: 'object', required: ['text', 'kind'], properties: {
            text: { type: 'string' },
            kind: { type: 'string', enum: ['number', 'quote', 'direction', 'reference', 'wording'] },
          } } },
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

  const hard = (recheck.newMustFix || []).filter((x) => x && x.kind !== 'wording').map((x) => x.text)
  const wording = (recheck.newMustFix || []).filter((x) => x && x.kind === 'wording').map((x) => x.text)
  const fresh = [...hard, ...(recheck.badRejections || [])]
  acc.wording.push(...wording)
  rounds[rounds.length - 1].recheck = { hard: hard.length, wording: wording.length, badRejections: (recheck.badRejections || []).length }
  if (fresh.length === 0) {
    stoppedBecause = 'dry'
    log(`round ${round}: re-verification found nothing new`)
    break
  }
  if (round === MAX_ROUNDS) {
    // research-verify: what the last re-check finds is handled by kind. An item with one
    // correct answer is fixed once more without a further round and recorded under
    // after_last_recheck; anything else is a confirmed defect out of budget, which phase 4
    // carries to the PR under its own heading so it is not read as clean.
    stoppedBecause = 'cap'
    if (hard.length) {
      const last = await agent(`${HOUSE}

Read the "Fix, then re-verify what changed" section of
.claude/skills/research-verify/SKILL.md for how to apply a finding. This is the fix after the
last re-check: act only on the items below, each of which has one correct answer. No
re-check follows, so change nothing else.

Document: ${DOC}/index.html
${list(hard, '(none)')}

Confirm each against the pinned source before you change it. Every item goes under fixed,
rejected (with the reason) or needsJudgment. Update the claims for the sentences you change,
then run:
${CHECKS}
Render the changed slides and read them after the fixes.

Output: JSON matching the schema.
Boundaries: do not commit. An item that turns out to change the document's conclusion or
its size goes in needsJudgment, and the document stays as it is.`,
        { label: 'fix:after-last-recheck', phase: 'Fix', schema: FIX_SCHEMA })
      if (!last) {
        return { stoppedAt: 'fix', reason: 'the fix after the last re-check returned nothing', draft, fixed, rounds, reports: got }
      }
      if (!last.gatesPassed) { fixed = last; break }
      take(last)
      afterLastRecheck = last.fixed || []
      // A rejection here has no re-check behind it, so it ships as open rather than as settled.
      openFindings.push(...(last.rejected || []))
      if ((last.fixed || []).length + (last.rejected || []).length + (last.needsJudgment || []).length < hard.length) {
        openFindings.push(`마지막 재검증 뒤 수정에 넘긴 정답 하나짜리 항목 ${hard.length}개 중 일부가 고침도 기각도 기록되지 않았다.`)
      }
    }
    openFindings.push(...(recheck.badRejections || []))
    log(`round ${round}: cap reached; ${afterLastRecheck.length} one-answer items fixed after the last re-check, ${openFindings.length} left open`)
    break
  }
  log(`round ${round}: ${fresh.length} new must-fix, going again`)
  findings = fresh.map((x) => `- ${x}`).join('\n')
}

if (!fixed || !fixed.gatesPassed) {
  return { stoppedAt: 'fix', reason: 'gates did not pass', draft, fixed, rounds, reports: got }
}

// ─── phase 4 ────────────────────────────────────────────────────────────────
// Draft while anything waits on a person, ready otherwise. Merging is the publishing call
// and stays manual either way, so this can reach a PR unattended without judging that the
// document is worth publishing.
phase('Ship')
const shipped = await agent(`${HOUSE}

Objective: put the document on a branch and open a PR.

First write ${EVID}/run.json (committed with the ledgers, a few KB) with this run's
record, so the next decision about the chain rests on numbers rather than memory. Add
finishedAt with the current time:
${JSON.stringify({ slug: a.slug, question: a.question || null, slides: draft.slides, evidenceCount: draft.evidenceCount, lensesReported: got.map((r) => r.key), deadLenses, fixRounds: rounds, stoppedBecause, after_last_recheck: afterLastRecheck, openFindings: openFindings.length, needsJudgment: acc.needsJudgment.length, unverified: acc.unverified.length, wordingRecorded: acc.wording })}

Branch doc/${a.slug} off main. Stage ${DOC}/, ${EVID}/ (.gitignore decides which of its
files go in), and the README.md and index.html that build-index.mjs rewrote. Write the
message per the Commits section of AGENTS.md, which also says what the PR is titled with
and the file link its body carries, then push and open the PR.

Open it as a draft when any list below has anything in it, because the document really is
waiting on a decision then; open it ready for review when all of them are empty.

Then open ${DOC}/index.html locally so the person can look at the rendering before deciding
anything. Most of what is wrong with a document is only visible once it is on screen. Use whatever opens a browser on this machine; if nothing does, say so and put
the path in your result rather than treating it as a failure.

Put these in the PR body, under headings of their own:

For a person to decide:
${acc.needsJudgment.map((x) => `- ${x}`).join('\n') || '- (none)'}

Not verified:
${acc.unverified.map((x) => `- ${x}`).join('\n') || '- (none)'}

Wording findings recorded and not acted on (the re-check named them; a further round on
wording rewrites toward the gate):
${acc.wording.map((x) => `- ${x}`).join('\n') || '- (none)'}

Found and not fixed:
${openFindings.map((x) => `- ${x}`).join('\n') || '- (none)'}
${openFindings.length && stoppedBecause === 'cap' ? `
Say in the PR body that the fix loop stopped at its round cap of ${MAX_ROUNDS} rather than
on a clean round. The items above were confirmed by the round-${MAX_ROUNDS} re-verification${afterLastRecheck.length ? `, and
${afterLastRecheck.length} one-answer item${afterLastRecheck.length === 1 ? '' : 's'} it found ${afterLastRecheck.length === 1 ? 'was' : 'were'} fixed afterwards without being re-read (after_last_recheck in run.json)` : ''}.
They are known defects, not open questions — do not file them under either of the other two
headings.` : ''}

Output: JSON matching the schema.
Boundaries: do not merge, do not change the draft state after opening, do not push to main.`,
  {
    label: 'ship',
    schema: {
      type: 'object',
      required: ['branch', 'prUrl'],
      properties: { branch: { type: 'string' }, prUrl: { type: 'string' }, commit: { type: 'string' }, isDraft: { type: 'boolean' }, docPath: { type: 'string' } },
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
  deadLenses,
  rejectedFindings: acc.rejected,
  needsJudgment: acc.needsJudgment,
  unverified: acc.unverified,
  wordingRecorded: acc.wording,
  afterLastRecheck,
  openFindings,
}
