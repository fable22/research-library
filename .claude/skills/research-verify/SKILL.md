---
name: research-verify
description: Adversarially reviews a finished research document draft. Four lenses
  (adoption decider, number checker, prose auditor, completeness critic) read the draft in
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

**Review the draft, not the working notes.** A reversed direction, a misread unit, a
claim repeated six times, an anchor pointing at the wrong slide — none of these exist
until sentences do. So `claims.jsonl` is extracted **from the draft** rather than carried
forward from research, and the verifier reads the same text the reader will.

**Run the lenses as separate subagents, and do not let them see each other.** A
context that wrote a sentence knows why, and re-reading it reaches the same conclusion by
the same route. If one lens reports a section is fine, another stops looking there.

## Where this runs

`.claude/workflows/research-chain.js` holds this procedure as phase 2, so the usual
path is that the workflow has already launched the lenses and you are reading this because
one of them is you. Follow the lens file you were handed and ignore the orchestration
below.

Run it here instead when a draft already exists and no workflow is going: a document
someone edited by hand, a review asked for after the fact, or a build where workflows are
turned off. The steps below are that path.

The difference is only who holds the sequence. A script cannot decide to skip a phase; a
context can, and the failure is invisible afterwards because a document that was never
verified looks exactly like one that passed.

## Procedure

### 1. Establish the target

Run from the repo root:

```bash
ls research/<slug>/index.html          # the draft
ls .research/<slug>/sources.jsonl      # corpus identity (may be absent)
```

`sources.jsonl` fixes what the numbers are checked against: `repo` + `commit` for code,
`arxiv_id` + `version` for papers, and no local paths. `../research-source/SKILL.md` owns
that rule; here a path that leaked in is a finding.

**If `sources.jsonl` is missing, do not stop — run a reduced review.** Documents written
before this harness existed do not have one.

- Lens C (prose) runs unchanged. It only needs the document.
- Lens A (adoption) runs. That the sources exist only inside the document is itself
  worth reporting.
- Lens B (numbers) **cannot run**, because there is nothing to check against. If
  `meta.json` has `source.url`, reconstruct from it and say so. If not, state plainly
  that numbers were not verified. Passing over this silently reads as verified.
- `check-claims.mjs` cannot run. State that too.

When the review is reduced, say what was skipped at the top of the report, before the
findings.

Chapter 7 states what was read and what was not. It is written by the author, so **lens A
audits it**: check the stated numbers against each other and against `sources.jsonl`. A
document claiming 23 of 65 files with four unread directories totalling 34 has eight files
unaccounted for, and that is a finding.

Coverage is disclosure, not a requirement (`../research-source/SKILL.md` §8). A long unread
list is not a defect; a list that does not add up is.

### 2. Extract claims from the shipped sentences

Walk the **visible text** of `research/<slug>/index.html` and write
`.research/<slug>/claims.jsonl`. Skip CSS and JS. Include `figcaption` and table cells;
captions are where qualifiers like "the paper does not make this comparison" live.

One claim per line:

```json
{"id":"c1","kind":"numeric","text":"AuthTrace 전체 AC 62.6 으로 LLM-Wiki base 56.3 을 앞선다",
 "verdict":"confirmed","scope":"arXiv:2607.26604v1 표 1 기준",
 "evidence":[{"source":"p1","locator":"표 1","quote":"WikiLoop 69.1 54.8 47.5 62.6"}]}
```

`kind` is one of `code`, `numeric`, `absence`, `behavioral`, `history`, `doc`, `web`.

`code` means the implementation does this. A claim whose evidence is the project's own
README or `docs/` is `doc` — what the maintainers wrote, which may or may not match the
code. `check-claims.mjs` blocks the mislabel, because a quote check cannot tell the two
apart on its own.

Deciding what to extract is the judgment call that matters most.

**Extract:** numbers, comparisons, causal claims, anything an adoption decision rests
on, calculations the source did not make, absence claims ("there is no X"), and
conditional behavior claims.

**Skip:** background, term definitions, navigation text, common knowledge.

**Choosing well matters more than checking hard.** A verifier that checks the wrong
sentences carefully is worse than one that checks the right sentences plainly. When a
sentence is too ambiguous to pin down, drop it rather than downgrading its confidence.

Do not shred sentences into minimal units. Each verifier has an atomicity where its
confidence peaks, and going finer makes verification worse. One sentence, one claim is
usually right.

### 3. Launch the lenses

Read A, B and C from `references/` and hand each one to a **separate subagent**, all in the
same message so none of them sees another's work.

Spawning them is the step, not a permission to go and ask for. The separation is the
mechanism: a review run inside the authoring context returns the author's own conclusions.
If they genuinely cannot be spawned, the review is reduced, not skipped. Run what you can
and declare the gap at the top of the report, the same way a missing `sources.jsonl` is
declared.

| Lens | File | Looks at |
|---|---|---|
| A | `references/lens-adoption.md` | Can a developer decide adopt/hold from this? What is missing? |
| B | `references/lens-numbers.md` | Every number against the pinned source: value, direction, unit, range |
| C | `references/lens-prose.md` | Repo writing rules, repetition, internal references, accessibility |
| D | `references/lens-completeness.md` | What none of the others could see: a claim no lens covered, a pinned source nothing leans on, a modality never run, **a quote that is accurate while the reading built on it is not** |

D owns that last one because nothing else can reach it. `check-claims.mjs` confirms the
quote sits at its locator, and a quote can be verbatim while the sentence around it says
something the source never said, usually by widening a narrow fact or joining two facts
the source keeps apart. Give D the reading to attack, not just the citation.

D runs **after** A, B and C report, because what it examines is the shape of their output.
Hand it their three reports along with the document.

Each lens needs: the document path, `sources.jsonl`, the corpus checkout location, and
the coverage chapter. Lens B has to reopen the source itself, so without a checkout or a
retrievable paper it cannot work.

Each lens writes its findings in Korean.

### 4. Machine checks

```bash
node .claude/skills/research-verify/scripts/check-claims.mjs research/<slug> \
  --repo <owner/name>=<path>
node scripts/check-doc.mjs research/<slug>
```

`check-claims.mjs` confirms each quote appears at its locator in the pinned commit, which
is stricter than confirming the file exists and the line number is in range.

Both scripts are pass/fail. `--help` lists their rules, so do not restate the rules
here — they change with the code.

### 5. Report

Merge the lens reports and the script output into one Korean report. Follow
`../research-doc/references/prose-ko.md`. Shape:

```
## 고쳐야 하는 것
- [렌즈B] 슬라이드 11: 표 9 격차가 7.5/12.8/9.6 → 5.1/10.5/16.9 로 좁아지는데
  문서는 넓어진다고 썼다. 해석까지 얹혀 있어 문단 전체를 다시 써야 한다.
- [check-claims] c14: quote 가 validators.py 안에 있으나 200행 ±15 밖이다.

## 판단이 필요한 것
- [렌즈A] 도입 판단 장에 라이선스가 없다. 실물은 AGPLv3 인데 문서가 언급하지 않는다.

## 검증하지 못한 것
- 부재 주장 3건에 재실행 가능한 검색 명령이 없어 확인 불가.
- references/ 12개 파일 미확인 (7장).
```

**Always include what could not be verified.** A report listing only findings reads as
"everything else checked out", and the items that quietly slipped through are the
riskiest part of the document.

Do not list what passed. Give a count if the scale matters.

### 6. Fix, then re-verify what changed

The report is not the end of the chain. Findings go back to the author, the author fixes,
and the changed slides go through the lenses again. The changed slides, not the document.

**Must-fix items are the author's to resolve without asking.** A wrong number, a flipped
direction, a truncated quote, a dead cross-reference: each has one correct answer, so
asking about it only moves the work to the user.

**Needs-judgment items are the author's too, except where the fix changes what the document
concludes or how much of it exists.** Retitling, cutting a chapter, adding one, reopening
the corpus: those are the user's. Collect them and ask once, rather than one at a time as
they surface.

Do not wait for every lens before fixing. A lens that returns first has must-fix items
that are already actionable, and the others will not change them.

Re-run the machine checks after fixing, and re-run a lens over the slides it touched. Stop
when a round turns up no new must-fix item, not when the first round is cleared. Fixes
introduce their own errors and it is the second round that finds them. Say whether the
rendered page was opened after the fixes, not before them, and put the remaining
needs-judgment items to the user in one message.

**A round only the author has read is not finished, and that includes the last one.** A run
that stops on a budget or a round cap still re-verifies what it just changed, and reports
what that turned up as found-and-unfixed — a category of its own, not folded into what was
verified. Stopping one step earlier leaves the freshest edits as the only unread ones.

## What this procedure structurally cannot catch

Say these alongside the findings so the reader knows the shape of the gap.

**Absence claims.** "This is not configurable", "there is no retry path" have no location
to cite, so the only evidence available is a search that came back empty. Without one the
claim is outside the verified set, and that fact belongs in the report.

**Behavioral claims.** Reading code cannot establish runtime behavior; asserting it from
source is checking the README against the README. There is no execution step here, so only
"the code is written this way" is established.

**Claims that depend on unread code.** A claim about what a function does, written from
the caller alone, is a guess about the callee. Catching these means following the symbols
a claim leans on and opening them.

**The method itself is unvalidated here.** Claim extraction and quote checking come from
fact-checking natural-language prose against web sources. Nobody has shown they work for
`file:line` code analysis. Use the procedure; do not report its output as if the procedure
were proven.

## Common rationalizations

| The excuse | Why it does not hold |
|---|---|
| Subagents cannot be spawned here, so this skill cannot run | Step 1 has a reduced path. A judgment reached without opening the skill is not a judgment |
| I wrote this document, so I already know where it is weak | That is the reason the lenses are separated — the second rule at the top of this file |
| Both gates passed, so the document is correct | The gates are static. A truncated quote and a flipped direction pass both |
| This one needs judgment, so it goes to the user | Step 6 assigns the owner. Only what changes the conclusion or the size of the document is theirs |
| I checked the number against the document's own explanation | That is checking the document against itself. Reopen the source |
| The report is written, so verify is finished | Step 6 is inside this skill. Fixing and re-checking the changed slides is not something that happens after it |

## Red flags

- The report has findings and an empty `검증하지 못한 것` section.
- A lens ran once, and not again over the slides its findings changed.
- A number passed because the document explained where it came from.
- The rendered page was opened before the fixes and not after.
- Needs-judgment items went to the user one at a time as they surfaced.

## Do not

**Do not introduce a warning tier.** Everything drains into warnings and every warning
ships. Split findings into must-fix and needs-judgment only.

**Do not merge the lenses.** Merged, the perspectives blur and none goes deep.

**Do not let the reviewer edit the document.** Lenses find; the author fixes. When the
finder is also the fixer, the review ends at "close enough".
