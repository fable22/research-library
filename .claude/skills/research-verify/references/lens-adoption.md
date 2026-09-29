# Lens A — the reader

Hand this file's content to a subagent, filling in the `{...}` slots.

---

You are the reader `../../research-doc/SKILL.md` defines (§The reader, and the three kinds):
a developer who has to do something with this document next week. What that is depends on
the document's `purpose`, which `meta.json` beside the document records. Take on that task
and report whether the document lets you do it.

Document: `{DOC_PATH}`
Corpus identity: `{SOURCES_PATH}`
Coverage: the `setup` chapter of the document itself
Checkout: `{CHECKOUT}`

Read the document end to end, then answer.

## 1. Can you do the task from this?

| `purpose` | Your task | The main output is |
|---|---|---|
| `comparison` | pick adopt / trial / assess / hold, and explain the call to your team | what is missing that stops you |
| `explainer` | take a case the source never shows, predict what the mechanism does, and say where you would be unsure | which prediction you could not make, and the sentence that should have let you |
| `walkthrough` | find the code you would change to extend it, and follow the path to it | the hop where the trace loses you, and what a change would touch |

If `purpose` is absent, infer the task from the `tl-dr` chapter and say which you took.

For a `comparison`, check what a developer checks against the document: the license read
from the file rather than a badge or API field (an AGPL-family license changes the decision
and is sometimes absent from the README badges), maintenance vitality (if `{SOURCES_PATH}` or
the `setup` chapter shows a shallow clone, commit frequency, contributor spread and release
cadence cannot have a source, and asserting them is a finding; the gate catches it only when
the claim is filed as `kind:"history"`, and issue response time is never in a checkout),
dependency risk, extension points, tests and release discipline, what installing it leaves
behind, and reversibility. `../../research-doc/references/oss.md` explains each.

## 2. Does the argument hold?

Someone else checks whether the numbers are right, so assume they are and examine the
bridge from the numbers to the conclusion.

- Did a controlled comparison vary only the one thing? An ablation that cuts the budget as
  well as the mechanism does not escape a budget-asymmetry objection, however the document
  reads it.
- Do the limits the document admits reduce its conclusion, or are they listed and then
  ignored?
- If the claim is "good under conditions", is there enough here to tell whether your
  situation meets them?
- Are limits the source admits distinguished from limits the author asserts? Blurred
  together, the reader cannot tell who is accountable for which.

## 3. What is missing?

List what is not here that would send you looking elsewhere. This is usually the most
valuable part of the review.

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
```

For a `comparison`, open with `결정: adopt / trial / assess / hold / 결정 불가` in place of
the first line.

## Do not

- Edit the document; the author fixes.
- Judge prose quality, which the author's read pass owns, or check numbers, which lens B owns.
