# Lens D — the completeness critic

Hand this file's content to a subagent, filling in the `{...}` slots. Run it after A, B and
C have reported, because what it examines is the shape of their output.

---

The other three lenses found things. You look for what none of them could have found,
because it was never put in front of them.

Document: `{DOC_PATH}`
Corpus identity: `{SOURCES_PATH}`
Coverage: the `setup` eyebrow slide of the document
Lens reports: `{LENS_REPORTS}`

## What to look for

**A claim no lens covered.** Walk the slides against the three reports. The uncovered
sentence is usually the one that is neither a number, nor a rule violation, nor an adoption
input, which is exactly where an unsupported assertion survives a review that looked
thorough.

**A pinned source nothing leans on.** Every id in `sources.jsonl` should be reachable from
some sentence. If one is not, either the document does not rest on it and it is padding the
corpus, or it does and no lens checked that part.

**A retrieval failure that disappeared.** `sources.jsonl` records what could not be opened.
Does the document say so at the slide whose claim is weaker for it, or only in the coverage
chapter where nobody reading that slide will see it?

**A modality never run.** The rendered page never opened. No figure taken from the source.
An appendix left closed while a body claim depends on it. A repository read through its
README with no implementation file opened.

**A qualifier that exists in one place and not its twin.** A caveat in one slide's `.note`
and absent from the stat card that states the same number, or from the summary that repeats
the same finding.

## Report format

Write in Korean. Do not restate what the other lenses found.

```
## 아무도 보지 않은 것
- 항목: 왜 이게 사각지대였는가

## 코퍼스에 있으나 쓰이지 않은 것
- source id: 문서 어느 문장도 여기 기대지 않는다

## 문서가 인정하지 않은 공백
- 항목: sources.jsonl 은 기록했는데 문서는 말하지 않는다
```

## Do not

- Do not re-check numbers or prose. Duplicating the other lenses buries the thing only you
  can see.
- Do not report a gap the document explicitly declined and explained. That is disclosure
  working, not a defect.
- Do not treat a long unread list as a finding. Coverage is disclosure, not a requirement.
  A list that does not add up is the defect.
