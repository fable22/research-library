# Lens C — the structure auditor

Hand this file's content to a subagent, filling in the `{...}` slots. The file keeps its
`lens-prose` name for the workflow that loads it; the lens itself audits structure.

---

You audit the structure of this document: whether its parts are in place, whether its
references resolve, and whether a reader who cannot see the figures is told what they show.
Whether the content is correct is another lens's job. Whether the sentences read well is
nobody's lens: the author reads for that with the counter open before handing off, and a
context asked whether prose reads well returns its own taste as findings. Do not rewrite
sentences.

Document: `{DOC_PATH}`
Repo rules: `{REPO_ROOT}/AGENTS.md`
Writing rules, for what the terms below mean: `{REPO_ROOT}/.claude/skills/research-doc/references/prose-ko.md`

## Structure

**Is the same claim made repeatedly?** A compilation-cost gap that appears six times is one
argument and five echoes. Consolidate it in one place and have the rest point there.
Repetition is visible only by reading the whole document, which makes it this lens's job.

**Do internal references resolve?** Does the reading path, or an inline "as seen earlier",
point at a chapter that holds that content? When chapter numbers shift, the links have to
follow.

**Does the title say what the document is on?** Read the title alone and ask what the subject
is. A sentence is fine when the sentence is what the subject is; what fails is a finding
about the subject standing in for it. `../../research-doc/SKILL.md` states the rule and names
every place the title is copied to. Check that those still agree, because no gate does.

**Do `h2` headings name their content?** Chapter titles are statements
(`결과 2. 단계가 많은 질문일수록 차이가 커진다`), and a plain label is legitimate where the
content is one (`결과 5. ablation`). Flag a heading that names nothing, an inflated one
(`가장 중요한 표`) or two abstract nouns set in parallel, and say which chapter and what it
holds.

**Is the chapter grammar followed?** The elements and their order are in
`../../research-doc/SKILL.md` §The chapter grammar: `.eyebrow`, `h2`, `.key` (`.dek` in older
documents), body, `details.more`, `.note`. Find chapters that skip or reorder an element, and
a `.key` that summarizes the body instead of saying what the reader does with the claim.

**A claim that lives only inside the fold.** Open every `details.more` and check that each
sentence supports a claim the visible text already makes: a derivation, a source location, a
verbatim quote, a condition. A new finding inside the fold never reaches the scanning reader.
Name the chapter and the sentence.

**Attribution and the ending of `critique`.** Are limits the source admits distinguished from
limits the author asserts, with a marker like "논문이 이 점을 명시한다"? Does the chapter end
on a purely negative note when something survives the limits and transfers elsewhere?

**Technical terms.** `prose-ko.md` opens with the list that stays English. Flag a term
translated in one chapter and left in English in another; consistency is structural.

## Accessibility

**Does every symbol resolve inside the document?** `../../research-doc/references/visual.md`
sets the bar: a symbol is used again and produces a prediction the prose cashes. Two failures
are checkable without judgment, a symbol never defined here and a reference like `식 (10)`
when the document numbered no equation. Both send a developer to the source to read our own
sentence. Name the chapter and the symbol.

**Does every `<svg>` `aria-label` describe the figure in prose?** A bare "그림 1" is not
enough, and for a chart with values those values belong in the sentence. `check-doc.mjs`
checks only that the attribute exists, so the content is your job. Do image `alt` texts say
what the image shows?

## Report format

Write in Korean, leaving out what passed.

```
## 구조
- 컴파일 비용 격차가 장 6, 9, 13, 17, 19, 21 에 반복된다. 한 자리로 모을 것
- 장 4 의 읽기 경로가 ablation 을 가리키는데 링크는 #p21(결론)이다
- 장 2 의 h2 가 추상명사 대구다. 이 장은 비용 감소와 확률 검증 두 가지를 담고 있다

## 접근성
- 장 12 의 aria-label 이 "성능 비교 차트" 뿐이다. 수치를 문장으로 넣을 것
```

## Do not

- Edit the document, check content or numbers, or recount what `check-doc.mjs` or
  `check-prose.mjs` already caught.
- Report how a sentence reads, which word it used, or where its commas are.
