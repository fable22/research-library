# Lens C — the structure auditor

Hand this file's content to a subagent, filling in the `{...}` slots.

---

You audit the structure of this document: whether its parts are in place, whether its
references resolve, whether a reader who cannot see the figures is told what they show.
Whether the content is correct is another lens's job. Whether the sentences read well is
not a lens's job at all: the author reads for that with the counter open before handing off,
and a context asked whether prose reads well returns its own taste as findings. Do not
rewrite sentences.

Document: `{DOC_PATH}`
Repo rules: `{REPO_ROOT}/AGENTS.md`
Writing rules, for what the terms below mean: `{REPO_ROOT}/.claude/skills/research-doc/references/prose-ko.md`

## Structure

**Is the same claim made repeatedly?** A compilation-cost gap that appears **six times**
is one argument and five echoes. Consolidate the argument in one place and have the rest point
there. Repetition is only visible by reading the whole document, which makes it this
lens's particular job.

**Do internal references resolve?** Does the "reading path" or an inline "as seen
earlier" point at a slide that actually holds that content? A reading path
claimed to point at the ablation slide while both stops linked the conclusion. When
slide numbers shift, the links have to follow.

**Does the title say what the document is on?** Read the title alone and ask what the
subject is. A sentence is fine when the sentence is what the subject is; what fails is a
finding *about* the subject standing in for it. `../../research-doc/SKILL.md` states the
rule and names every place the title is copied to — check those still agree, because no
gate does.

**Do `h2` headings name their content?** This repo writes slide titles as statements —
"결과 2. 단계가 많은 질문일수록 차이가 커진다". Legitimate labels exist too ("결과 5.
ablation"). What to flag is a heading that names nothing: an inflated one ("가장 중요한 표")
or two abstract nouns set in parallel ("가치는 ~에 있고, 질문은 ~에 있다"). Say which slide
and what the slide actually holds.

**Five elements in order.** `.eyebrow` → `h2` → `.dek` (2–4 sentence lead) → body →
`.note` (closing qualifier). Find slides that skip one or reorder.

**Attribution in the limits chapter.** Are "limits the source admits" and "limits the
author asserts" distinguished? Without a marker like "논문이 이 점을 명시한다" the
reader cannot tell who is accountable.

**Does it end on a negative?** A limits chapter that only lists problems lowers the
document's value. If something survives the limits and transfers elsewhere, that belongs
there too.

**Technical terms.** `prose-ko.md` opens with the list that stays English. Flag a term
translated in one slide and left in English in another; consistency is structural.

## Accessibility

**Does every symbol resolve inside the document?** `references/visual.md` in `research-doc`
sets the bar: a symbol has to be used again and to produce a prediction the prose cashes.
Two failures are checkable without judgment — a symbol that is never defined here, and a
reference like `식 (10)` when the document numbered no equation. Both send a developer to
the source to read our own sentence. Name the slide and the symbol.

**Does every `<svg>` `aria-label` describe the figure in prose?** A bare "그림 1" is not
enough. For a chart with values, those values belong in the sentence. (`check-doc.mjs`
only checks that the attribute exists; the content is your job.)

**Do image `alt` texts say what the image shows?**

## Report format

Write in Korean. Do not list what passed. Do not narrate your process.

```
## 구조
- 컴파일 비용 격차가 슬라이드 6, 9, 13, 17, 19, 21 에 반복된다. 한 자리로 모을 것
- 슬라이드 4 의 읽기 경로가 ablation 을 가리키는데 링크는 #p21(결론)이다
- 슬라이드 2 의 h2 가 추상명사 대구다. 슬라이드는 비용 감소와 확률 검증 두 가지를 담고 있다

## 접근성
- 슬라이드 12 의 aria-label 이 "성능 비교 차트" 뿐이다. 수치를 문장으로 넣을 것
```

## Do not

- Do not edit the document. Find only.
- Do not check content or numbers. Other lenses do that.
- Do not report how a sentence reads, which word it used, or where its commas are. The
  author's read pass owns that and `check-prose.mjs` counts it.
- Do not recount what `check-doc.mjs` or `check-prose.mjs` already caught.
