---
name: research-verify
description: Adversarially reviews a finished research document draft. Runs three lenses
  (adoption decider, number checker, prose auditor) in separate fresh contexts, extracts
  claims from the sentences that shipped, and machine-verifies them against the pinned
  corpus with check-claims.mjs and check-doc.mjs.
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

**Run the three lenses as separate subagents, and do not let them see each other.** A
context that wrote a sentence knows why, and re-reading it reaches the same conclusion by
the same route. If one lens reports a section is fine, another stops looking there.

## Procedure

### 1. Establish the target

Run from the repo root:

```bash
ls research/<slug>/index.html          # the draft
ls .research/<slug>/sources.jsonl      # corpus identity (may be absent)
```

`sources.jsonl` fixes what the numbers are checked against: `repo` + `commit` for code,
`arxiv_id` + `version` for papers. **No local paths.** A stored path makes the document
verifiable on one machine only, and nobody else can pull the same commit and check it.

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

Coverage is disclosure, not a requirement. A long unread list is not a defect.

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

### 3. Launch the three lenses together

Read the three files in `references/` and hand each one to a **separate subagent**,
all in the same message so none of them sees another's work.

| Lens | File | Looks at |
|---|---|---|
| A | `references/lens-adoption.md` | Can a developer decide adopt/hold from this? What is missing? |
| B | `references/lens-numbers.md` | Every number against the pinned source: value, direction, unit, range |
| C | `references/lens-prose.md` | Repo writing rules, repetition, internal references, accessibility |

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

Merge the three lenses and the script output into one Korean report. Follow
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

## What this procedure structurally cannot catch

Say these alongside the findings so the reader knows the shape of the gap.

**Absence claims.** "This is not configurable", "there is no retry path" have no
location to cite. `check-claims.mjs` therefore requires a re-runnable search command.
Without one the claim is outside the verified set, and that fact belongs in the report.

**Behavioral claims.** Reading code cannot establish runtime behavior; asserting it from
source is checking the README against the README. There is no execution step here, so
only "the code is written this way" is established. That is why `kind:"behavioral"`
requires a `limits` field.

**Claims that depend on unread code.** A claim about what a function does, written from
the caller alone, is a guess about the callee. Catching these means following the symbols
a claim leans on and opening them.

**The method itself is unvalidated here.** Claim extraction and quote checking come from
fact-checking natural-language prose against web sources. Nobody has shown they work for
`file:line` code analysis. Use the procedure; do not report its output as if the procedure
were proven.

## Do not

**Do not introduce a warning tier.** Everything drains into warnings and every warning
ships. Split findings into must-fix and needs-judgment only.

**Do not merge the lenses.** Merged, the perspectives blur and none goes deep.

**Do not let the reviewer edit the document.** Lenses find; the author fixes. When the
finder is also the fixer, the review ends at "close enough".
