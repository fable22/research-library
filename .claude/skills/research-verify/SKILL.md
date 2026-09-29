---
name: research-verify
description: Adversarially reviews a finished research document draft. Three lenses read
  it in separate contexts (the number checker and the structure auditor in parallel, then
  the reader, who also reads their reports), claims are extracted from the sentences that
  shipped, and check-claims.mjs verifies them against the pinned corpus. Usually a phase
  of the /research-chain workflow; invoke it directly when a draft already exists. Losing
  the separation reduces the review rather than cancelling it.
when_to_use: After finishing or editing a draft under research/<slug>/, before committing
  or publishing, and when asked to review, fact-check, or confirm a document is correct.
---

# Adversarial review of a research document

The report is Korean; these instructions are English. Read
`../research-doc/references/prose-ko.md` before writing it.

## Three rules that shape everything below

**Review the draft, not the working notes.** A reversed direction, a misread unit and a
dead anchor exist only once sentences do, so `claims.jsonl` is extracted from the draft
and the verifier reads the text the reader will.

**Run the lenses as separate subagents that cannot see the author's context.** A context
that wrote a sentence re-reads it by the same route and reaches the same conclusion. B and
C run in parallel, blind to each other; A runs last and reads their reports, because part
of what it looks for is what the other two could not have seen.

**A finding makes a claim in the document wrong, or stops the reader from doing what its
`purpose` promises.** Things that would be nice to add, sources that could also be read,
and wording you would have chosen differently are not findings: one line each under 메모,
or leave them out.

## Where this runs

`.claude/workflows/research-chain.js` holds this procedure as phase 2, so usually the
workflow has already launched the lenses and you are reading this because one of them is
you. Follow the lens file you were handed and ignore the orchestration below.

Run the steps below yourself when a draft already exists and no workflow is going: a
document edited by hand, a review asked for after the fact, or a build with workflows turned
off. A document never verified looks exactly like one that passed.

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
  verified.
- `check-claims.mjs` cannot run either, so state that too.

Say what was skipped at the top of the report, before the findings.

### 2. Launch the lenses

Read B and C from `references/` and hand each to a separate subagent in the same message.
When both have reported, hand A its file and their reports. Spawning them is the step;
asking permission for it is not. If they cannot be spawned, run what you can and declare
the gap at the top of the report, as a missing `sources.jsonl` is declared.

| Lens | File | Looks at |
|---|---|---|
| B | `references/lens-numbers.md` | Every number against the pinned source: value, direction, unit, range, base |
| C | `references/lens-prose.md` | Structure: repetition, references, headings, chapter grammar against the kind's specimen, a claim only in the fold, accessibility |
| A | `references/lens-reader.md` | Can the reader do what `purpose` promises, and what is missing, including what B and C could not see: a pinned source nothing leans on, a modality never run, a quote that is verbatim while the sentence around it widens it |

Each lens needs the document path, `sources.jsonl` and the corpus checkout, and reviews the
whole document; the `setup` chapter is where the document says what it read. B reopens the source itself, so without a checkout or a retrievable paper it
cannot work. Each lens writes its findings in Korean.

### 3. Extract claims from the shipped sentences, while the lenses run

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
  paragraph pins nothing, because it always contains the sentence the claim needs.
- `verdict` is `confirmed`, `unverified` or `derived`. A finer distinction goes in `note`.

`kind` values are in `check-claims.mjs --help`. `derived` marks a number the source never
printed and this document computed; it takes `derived_from` and a `note`, and it is the only
kind exempt from the quote-in-source check. `code` means the implementation does this, and a
claim whose evidence is the project's own README or `docs/` is `doc`, which is what the
maintainers wrote and may not match the code.

**Extract numbers, comparisons, causal claims, anything the reader's task rests on,
calculations the source did not make, absence claims and conditional behavior claims.** Skip
background, term definitions, navigation text and common knowledge. Drop a sentence too
ambiguous to pin down, and leave each one whole; one sentence per claim is where a
verifier's confidence peaks.

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

Merge the lens reports and the script output into one Korean report:

```
## 고쳐야 하는 것
- [렌즈B] 장 11: 표 4 격차가 6.2/5.1/3.4 로 좁아지는데 문서는 넓어진다고 썼다.
  해석까지 얹혀 있어 문단 전체를 다시 써야 한다.
- [check-claims] c14: quote 가 validators.py 안에 있으나 200행 ±15 밖이다.

## 판단이 필요한 것
- [렌즈A] 도입 판단 장에 라이선스가 없다. 실물은 AGPLv3 인데 문서가 언급하지 않는다.

## 검증하지 못한 것
- 부재 주장 3건 중 재실행 검색 명령이 있는 것 1건.
- 행동 주장 5건: 코드만 읽었고 실행하지 않았다.
- callee 를 열지 않은 채 쓴 주장 2건.
- references/ 12개 파일 미확인 (setup 장).
- 주장 추출과 인용 대조는 산문 fact-checking 에서 온 방법이고 file:line 코드 검증에 검증된 방법이 아니다.
```

The last section is never empty. It always carries the first three counts (or 해당 없음)
and the last line, because a report listing only findings reads as "everything else
checked out". Leave out what passed and give a count if the scale matters.

One finding, three ways:

> ✗ 이제 수치 검증 결과를 살펴보겠습니다. 흥미롭게도, 여러 수치들 중에서 일부에 대한
> 확인이 이루어진 결과, 표 4 와 관련된 부분에 있어서 문제가 발견되어졌다고 말할 수
> 있을 것 같습니다.
>
> ✗ 표 4 틀림.
>
> ✓ 수치 42개를 원문과 대조해 1건이 어긋난다. 장 11 에서 표 4 의 격차가 6.2/5.1/3.4 로
> 좁아지는데 문서는 넓어진다고 썼다. 거기에 "작은 모델이 구조에서 더 이득을 본다"는
> 해석까지 얹혀 있어서 방향을 고치면 그 문단 전체를 다시 써야 한다.

### 6. Fix, then re-verify what changed

Findings go back to the author, who fixes them, and the changed chapters, not the document,
go through the lenses again.

**Must-fix items are the author's to resolve without asking.** A wrong number, a flipped
direction, a truncated quote and a dead cross-reference each have one correct answer.

**Needs-judgment items are the author's too, except where the fix changes what the document
concludes or how much of it exists.** Retitling, cutting a chapter, adding one and reopening
the corpus are the user's; collect them and ask once. Do not wait for every lens before
fixing, since a lens that returns first has must-fix items that are already actionable.

Re-run the machine checks after fixing, and re-run a lens over the chapters it touched. Stop
when a round turns up no new must-fix item with one correct answer: a number, a quote, a
direction, a dead reference. Two rounds at most; what the second re-check still finds is
reported as found-and-unfixed. Fixes introduce their own errors and the second round finds
them. Wording is different: each pass rewrites the document toward the gate and away from
the reader, so wording findings from a re-check are recorded and left alone. Say whether the
rendered page was opened after the fixes, and put the remaining needs-judgment items to the
user in one message.

**A round only the author has read is not finished, the last one included.** A run that
stops on a budget or a round cap still re-verifies what it just changed, and reports what
that turned up as found-and-unfixed, a category of its own.

**A fact lens A reports missing goes into the chapter whose `.key` it supports**, as a
fact-list line or in the fold; that is support, not a second claim. When no chapter's claim
covers it, it needs a chapter, and that is a needs-judgment item rather than a line squeezed
into the nearest one.

**Lenses find and the author fixes.** When the finder is also the fixer, the review ends at
"close enough". Split findings into must-fix and needs-judgment only; a warning tier drains
into warnings that all ship.
