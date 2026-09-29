---
name: research-verify
description: Adversarially reviews a finished research document draft. Four lenses
  (reader, number checker, structure auditor, completeness critic) read the draft in
  separate contexts, claims are extracted from the sentences that shipped, and
  check-claims.mjs machine-verifies them against the pinned corpus. Usually this runs as a
  phase of the /research-chain workflow; invoke it directly when a draft already exists.
  Separation is the mechanism, but losing it reduces the review rather than cancelling it,
  so verification never gets skipped for want of subagents.
when_to_use: After finishing or editing a draft under research/<slug>/, before committing
  or publishing, and when asked to review, fact-check, or confirm a document is correct.
---

# Adversarial review of a research document

The report you produce is Korean. These instructions are English; the product is not.
Read `../research-doc/references/prose-ko.md` before writing the report.

## Two rules that shape everything below

**Review the draft, not the working notes.** A reversed direction, a misread unit, a claim
repeated six times and an anchor pointing at the wrong chapter exist only once sentences
do. So `claims.jsonl` is extracted from the draft rather than carried forward from research,
and the verifier reads the same text the reader will.

**Run lenses A, B and C as separate subagents that cannot see each other.** A context that
wrote a sentence knows why, and re-reading it reaches the same conclusion by the same route;
if one lens reports a section fine, another stops looking there. Lens D is the exception by
design: it reads their three reports, because what it examines is the shape of their output.

## Where this runs

`.claude/workflows/research-chain.js` holds this procedure as phase 2, so usually the
workflow has already launched the lenses and you are reading this because one of them is
you. Follow the lens file you were handed and ignore the orchestration below.

Run the steps below yourself when a draft already exists and no workflow is going: a
document edited by hand, a review asked for after the fact, or a build with workflows turned
off. A script cannot decide to skip a phase and a context can, and the failure is invisible
afterwards, since a document never verified looks exactly like one that passed.

## Procedure

### 1. Establish the target

Run from the repo root:

```bash
ls research/<slug>/index.html          # the draft
ls .research/<slug>/sources.jsonl      # corpus identity (may be absent)
cat research/<slug>/meta.json          # `purpose` says what the document was meant to do
```

`sources.jsonl` fixes what the numbers are checked against: `repo` + `commit` for code,
`arxiv_id` + `version` for papers, and no local paths. `../research-source/SKILL.md` owns
that rule, and here a path that leaked in is a finding.

**If `sources.jsonl` is missing, run a reduced review instead of stopping.** Documents
written before this harness existed do not have one.

- Lens C (structure) runs unchanged, since it needs only the document.
- Lens A (reader) runs. That the sources exist only inside the document is itself worth
  reporting.
- Lens B (numbers) cannot run, because there is nothing to check against. If `meta.json` has
  `source.url`, reconstruct from it and say so; otherwise state plainly that numbers were not
  verified, because passing over this silently reads as verified.
- `check-claims.mjs` cannot run either, so state that too.

Say what was skipped at the top of the report, before the findings.

The `setup` chapter states what was read and what was not. The author wrote it, so lens A
audits it: check the stated numbers against each other and against `sources.jsonl`. A
document claiming 23 of 65 files with four unread directories totalling 34 has eight files
unaccounted for, and that is a finding. A long unread list is not a defect
(`../research-source/SKILL.md` §8); a list that does not add up is.

### 2. Extract claims from the shipped sentences

Walk the visible text of `research/<slug>/index.html`, skipping CSS and JS, and write
`.research/<slug>/claims.jsonl`. Include `figcaption` and table cells, where qualifiers like
"the paper does not make this comparison" live. One claim per line:

```json
{"id":"c1","kind":"numeric","text":"Ours 전체 AC 62.6 으로 baseline 56.3 을 앞선다",
 "verdict":"confirmed","scope":"arXiv:2601.00000v1 표 1 기준",
 "evidence":[{"source":"p1","locator":"Table 1",
              "quote":"Ours 69.1 54.8 47.5 62.6 / Baseline 66.0 51.2 44.8 56.3"}]}
```

Three fields have a fixed form:

- `locator` follows the source's own notation. In a paper: `Table N`, `Figure N`, `§N.N`,
  `Section N`, `Appendix X`, `Algorithm N`, `Listing N`, `Abstract`, in Latin as the source
  prints it (`표 1` is rejected). In a repository: `path:line`. `scope` beside it is prose and
  stays Korean.
- `quote` runs 40 to 400 characters: the sentence or table row that carries the claim. A
  paragraph pins nothing, because it always contains the sentence the claim needs, and the
  gate rejects anything longer.
- `verdict` is `confirmed`, `unverified` or `derived`. A finer distinction goes in `note`.

`kind` values are in `check-claims.mjs --help`. `derived` marks a number the source never
printed and this document computed; it takes `derived_from` and a `note`, and it is the only
kind exempt from the quote-in-source check, so the same number filed as `numeric` is
blocked. `code` means the implementation does this, and a claim whose evidence is the
project's own README or `docs/` is `doc`, which is what the maintainers wrote and may not
match the code. The gate blocks the mislabel, because a quote check cannot tell the two
apart.

**Extract numbers, comparisons, causal claims, anything an adoption decision rests on,
calculations the source did not make, absence claims and conditional behavior claims.** Skip
background, term definitions, navigation text and common knowledge. Checking the right
sentences plainly beats checking the wrong ones carefully. Drop a sentence too ambiguous to
pin down, and leave each one whole, since one sentence per claim is where a verifier's
confidence peaks and finer splits make verification worse.

### 3. Launch the lenses

Read A, B and C from `references/` and hand each to a separate subagent, all in the same
message. Spawning them is the step; asking permission for it is not. If they truly cannot be
spawned, the review is reduced instead of skipped: run what you can and declare the gap at
the top of the report, as a missing `sources.jsonl` is declared.

| Lens | File | Looks at |
|---|---|---|
| A | `references/lens-adoption.md` | Can the reader do what the document's `purpose` promises? What is missing? |
| B | `references/lens-numbers.md` | Every number against the pinned source: value, direction, unit, range |
| C | `references/lens-prose.md` | Structure: repetition, internal references, headings that name nothing, accessibility. Sentence quality belongs to the author's read pass |
| D | `references/lens-completeness.md` | What none of the others could see: a claim no lens covered, a pinned source nothing leans on, a modality never run, a quote that is accurate while the reading built on it is not |

D owns the last item because nothing else reaches it. `check-claims.mjs` confirms the quote
sits at its locator, and a quote can be verbatim while the sentence around it widens a narrow
fact or joins two facts the source keeps apart. Give D the reading to attack as well as the
citation, and run it after A, B and C, handing it their reports with the document.

Each lens needs the document path, `sources.jsonl`, the corpus checkout location and the
`setup` chapter, and lens B has to reopen the source itself, so without a checkout or a
retrievable paper it cannot work. Each lens writes its findings in Korean.

### 4. Machine checks

```bash
node .claude/skills/research-verify/scripts/check-claims.mjs research/<slug> \
  --repo <owner/name>=<path>
node scripts/check-doc.mjs research/<slug>
```

`check-claims.mjs` confirms each quote appears at its locator in the pinned commit, which is
stricter than confirming the file exists and the line is in range. Both scripts are pass or
fail, and `--help` lists their rules.

### 5. Report

Merge the lens reports and the script output into one Korean report, following `prose-ko.md`:

```
## 고쳐야 하는 것
- [렌즈B] 장 11: 표 4 격차가 6.2/5.1/3.4 로 좁아지는데 문서는 넓어진다고 썼다.
  해석까지 얹혀 있어 문단 전체를 다시 써야 한다.
- [check-claims] c14: quote 가 validators.py 안에 있으나 200행 ±15 밖이다.

## 판단이 필요한 것
- [렌즈A] 도입 판단 장에 라이선스가 없다. 실물은 AGPLv3 인데 문서가 언급하지 않는다.

## 검증하지 못한 것
- 부재 주장 3건에 재실행 가능한 검색 명령이 없어 확인 불가.
- references/ 12개 파일 미확인 (setup 장).
```

**Include what could not be verified.** A report listing only findings reads as "everything
else checked out", and the items that quietly slipped through are the riskiest part of the
document. Leave out what passed and give a count if the scale matters.

State four limits of this procedure beside the findings, so the reader knows the shape of
the gap. Absence claims have no location to cite, so without an empty search on record they
sit outside the verified set. Behavioral claims cannot be established from code, since no
step here executes anything. A claim about what a function does, written from the caller
alone, is a guess about the callee, and catching it means opening the callee. And the method
itself, claim extraction and quote checking, comes from fact-checking prose against web
sources; nobody has shown it works for `file:line` code analysis, so do not report its
output as proof.

### 6. Fix, then re-verify what changed

The report is not the end of the chain. Findings go back to the author, who fixes them, and
the changed chapters, not the document, go through the lenses again.

**Must-fix items are the author's to resolve without asking.** A wrong number, a flipped
direction, a truncated quote and a dead cross-reference each have one correct answer, so
asking only moves the work to the user.

**Needs-judgment items are the author's too, except where the fix changes what the document
concludes or how much of it exists.** Retitling, cutting a chapter, adding one and reopening
the corpus are the user's; collect them and ask once, not one at a time as they surface.
Do not wait for every lens before fixing, since a lens that returns first has must-fix items
that are already actionable.

Re-run the machine checks after fixing, and re-run a lens over the chapters it touched. Stop
when a round turns up no new must-fix item with one correct answer: a number, a quote, a
direction, a dead reference. Fixes introduce their own errors and the second round finds
them. Wording is different: each pass rewrites the document toward the gate and away from
the reader, so wording findings from a re-check are recorded and left alone. Say whether the
rendered page was opened after the fixes and not before, and put the remaining
needs-judgment items to the user in one message.

**A round only the author has read is not finished, the last one included.** A run that
stops on a budget or a round cap still re-verifies what it just changed, and reports what
that turned up as found-and-unfixed, a category of its own, not folded into what was
verified.

## When the procedure is tempting to skip

| The excuse | Why it fails |
|---|---|
| Subagents cannot be spawned here | Step 1 has a reduced path; a judgment reached without opening the skill is not a judgment |
| I wrote this document, so I know where it is weak | The lenses are separated for exactly that reason |
| Both gates passed | They are static, and a truncated quote and a flipped direction pass both |
| I checked the number against the document's own explanation | That checks the document against itself; reopen the source |
| The report is written | Step 6 is inside this skill, and the changed chapters still need their second look |

**Lenses find and the author fixes.** When the finder is also the fixer, the review ends at
"close enough". Split findings into must-fix and needs-judgment only; a warning tier drains
into warnings that all ship.
