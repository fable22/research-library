# Lens A — the reader

Hand this file's content to a subagent, filling in the `{...}` slots. Run it after B and C
have reported, and hand it their reports.

---

You are the reader `../../research-doc/SKILL.md` defines (§The reader, and the three kinds):
a developer who has to do something with this document next week. What that is depends on
`purpose` in the `meta.json` beside the document. Take on that task and report whether the
document lets you do it.

A finding is something that stops you doing the task or makes a claim in the document
wrong. Things you would add, sources you would also read and wording you prefer are not
findings; one line each under 메모, or leave them out.

Document: `{DOC_PATH}`
Corpus identity: `{SOURCES_PATH}`
Where the document says what it read: its `setup` chapter. The review covers the whole document.
Checkout: `{CHECKOUT}`
Reports from lenses B and C: `{LENS_REPORTS}`

Read the document end to end, then answer.

## 1. Can you do the task from this?

| `purpose` | Your task | The main output is |
|---|---|---|
| `comparison` | pick adopt / trial / assess / hold, and explain the call to your team | what is missing that stops you |
| `explainer` | take a case the source never shows, predict what the mechanism does, and say where you would be unsure | which prediction you could not make, and the sentence that should have let you |
| `walkthrough` | find the code you would change to extend it, and follow the path to it | the hop where the trace loses you, and what a change would touch |

If `purpose` is absent, infer the task from the `tl-dr` chapter and say which you took.

For a `comparison`, check the document against the checklist in
`../../research-doc/references/oss.md` §The adoption call, one item at a time. A shallow
clone cannot source maintenance numbers, so a document that states them has invented them.

## 2. Does the argument hold?

Someone else checks whether the numbers are right, so assume they are and examine the
bridge from the numbers to the conclusion.

- Did a controlled comparison vary only the one thing? An ablation that cuts the budget as
  well as the mechanism does not escape a budget-asymmetry objection.
- Do the limits the document admits reduce its conclusion, or are they listed and ignored?
- If the claim is "good under conditions", is there enough here to tell whether your
  situation meets them?
- Are limits the source admits distinguished from limits the author asserts?

## 3. What is missing?

List what is not here that would send you looking elsewhere. This is usually the most
valuable part of the review.

Then look for what B and C could not have seen, because it was never in front of them:

- A pinned source nothing leans on. Every id in `sources.jsonl` should be reachable from a
  sentence; one that is not either pads the corpus or covers a part no lens checked.
- A retrieval failure `sources.jsonl` records that the document admits only in `setup`,
  not at the chapter whose claim is weaker for it.
- A modality never run: the rendered page never opened, an appendix left closed while a
  body claim depends on it, a repository read through its README with no implementation
  file opened.
- A qualifier in one chapter's `.note` and absent from the stat card or summary that
  repeats the same number.
- A quote that is verbatim while the sentence around it widens a narrow fact or joins two
  facts the source keeps apart. `check-claims.mjs` confirms the quote sits at its locator
  and stops there, so nothing else catches this.
- An entry in `.research/<slug>/notes/figures.md` (the source's charts, tables, figures) that
  the document neither redrew nor named. A benchmark the source charted and the document
  describes in a sentence is this.
- The `setup` chapter's numbers. 23 of 65 files with four unread directories totalling 34
  leaves eight unaccounted for. A long unread list is disclosure working; one that does not
  add up is the finding.

## Report format

Write in Korean, leading with the finding, then the evidence, then the qualifier. Report only
what blocks the task, and keep technical terms in English.

```
과업: <purpose>. 할 수 있는가: 예 / 일부 / 아니오
근거: (문서에서 인용)

## 과업을 막는 것
- 항목: 왜 필요한가, 문서 어디에 없는가

## 논증의 구멍
- 장 N: 무엇이 성립하지 않는가, 왜

## 빠진 것
- 항목: 개발자가 왜 이걸 찾게 되는가

## 아무도 보지 않은 것
- 항목: 왜 이게 사각지대였는가 (source id, 열지 않은 것, 인용은 맞는데 문장이 넓힌 곳)
```

For a `comparison`, open with `결정: adopt / trial / assess / hold / 결정 불가` in place of
the first line.

## Do not

- Edit the document; the author fixes.
- Judge how sentences read, which the author's read pass owns, or re-check numbers, which
  lens B owns. Leave out what B and C already found.
- Report a gap the document explicitly declined and explained. That is disclosure working.
