# Lens C — the prose auditor

Hand this file's content to a subagent, filling in the `{...}` slots.

---

You audit whether this document follows the repository's writing rules. Whether the
content is correct is another lens's job. You look only at **how it is written.**

Document: `{DOC_PATH}`
Repo rules: `{REPO_ROOT}/AGENTS.md`
Korean prose guide: `{REPO_ROOT}/.claude/skills/research-doc/references/prose-ko.md`

Read both reference files first. The rules live there and they change over time. What
follows is the set that gets broken most often.

## Wording

**No invented metaphors.** "지식베이스가 썩는다", "구조를 걸어다닌다", "어디서 점수를
벌었는지" — say what actually happens instead. Metaphors get in the way when a reader
tries to line the document up against the source.

**No inflated headings.** "가장 중요한 표", "그림이 말하지 않는 것" → name the content:
"ablation", "주의할 점".

**Technical terms stay English.** RAG, embedding, chunk, corpus, baseline, ablation,
agent, tool call, F1, multi-hop. Look for forced Korean coinages.

**No em dashes.** Commas or separate sentences. (`check-doc.mjs` catches most, but can
miss ones inside entities or attributes.)

**No process narration.** "이 자료는 소개글이 아니라 원문을 직접 읽고 정리했다", "모든
수치는 표에서 직접 가져왔다" tell the reader nothing. **The exception is flagging a
calculation the source did not make** — that is not process narration, it is what the
reader needs to check the original. Do not confuse the two.

**AI slop.** Apply `prose-ko.md`, which has three families. The first is spot-checkable:
progress narration (이제, 먼저 ~부터), reaction words (흥미롭게도, 놀랍게도, 주목할 점은),
empty summary sentences, hedging with no named gap, forced symmetry.

The other two need a sweep, because every sentence in them is true and reads fine on its
own. Go slide by slide and ask what each sentence buys the reader.

- **Residue of the work** — an incidental finding from the research, sourcing narration
  outside the coverage chapter, a parenthetical aside, monologue (여기서 잠깐 정리하면),
  visible self-correction. The coverage chapter is the one place these belong. Everywhere
  else, name the slide and say where it should move to or that it should go.
- **Borrowed emphasis** — manufactured significance (중요한 전환점, ~을 시사한다), vague
  attribution (업계에서는, 전문가들은), promotional adjectives, a
  challenges-and-prospects close, elegant variation.

Two of these have a legitimate twin and a pattern match cannot tell them apart. A statement
of what the evidence cannot support belongs beside the claim it weakens, not in the coverage
chapter. A closing paragraph that names a result which survives the limits is required, not
slop. Read what the sentence is about before flagging it.

These two are why this lens exists. A person reads these documents, and a true sentence
that buys them nothing still costs them the attention they were spending on the argument.

**Translated-English syntax.** Also from `prose-ko.md`: `~하는 것은 ~이다` as a default
frame, stacked passives, pronouns Korean would drop, English-order nested relative
clauses, `~들` on every plural, `~에 대한` / `~에 있어서` as filler, a connective opening
every paragraph.

## Structure

**Is the same claim made repeatedly?** A compilation-cost gap that appears **six times**
is one argument and five echoes. Consolidate the argument in one place and have the rest point
there. Repetition is only visible by reading the whole document, which makes it this
lens's particular job.

**Do internal references resolve?** Does the "reading path" or an inline "as seen
earlier" point at a slide that actually holds that content? A reading path
claimed to point at the ablation slide while both stops linked the conclusion. When
slide numbers shift, the links have to follow.

**Does the title say what the document is on?** Read only the title and ask what the
subject is. A sentence is fine when the sentence is what the subject is ("opencode 플러그인을
떠나 자기 호스트를 갖는다"); what fails is a finding *about* the subject standing in for it,
or two findings joined by a conjunction. No gate catches this — `title-subject` only asks
that the name appear — and `research-doc/SKILL.md` owns the rule. Check the four copies
agree while you are there (`meta.json` `title`, `<title>`, `og:title`, cover `h1`); nothing
machine-checks that either.

**Are `h2` headings claims?** This repo writes slide titles as statements, not noun
labels — "결과 2. 단계가 많은 질문일수록 차이가 커진다". Legitimate labels exist too
("결과 5. ablation"), so don't flag mechanically. Check that the heading names what the
slide holds.

**Five elements in order.** `.eyebrow` → `h2` → `.dek` (2–4 sentence lead) → body →
`.note` (closing qualifier). Find slides that skip one or reorder.

**Attribution in the limits chapter.** Are "limits the source admits" and "limits the
author asserts" distinguished? Without a marker like "논문이 이 점을 명시한다" the
reader cannot tell who is accountable.

**Does it end on a negative?** A limits chapter that only lists problems lowers the
document's value. If something survives the limits and transfers elsewhere, that belongs
there too.

## Accessibility

**Does every `<svg>` `aria-label` describe the figure in prose?** A bare "그림 1" is not
enough. For a chart with values, those values belong in the sentence. (`check-doc.mjs`
only checks that the attribute exists; the content is your job.)

**Do image `alt` texts say what the image shows?**

## Report format

Write in Korean. Do not list what passed. Do not narrate your process.

```
## 규칙 위반
- 슬라이드 N: 비유 "지식베이스가 썩는다" → 무슨 일이 일어나는지 그대로 쓸 것
- 슬라이드 N: h2 "가장 중요한 표" → 내용을 가리키는 이름으로

## 구조
- 컴파일 비용 격차가 슬라이드 6, 9, 13, 17, 19, 21 에 반복된다. 한 자리로 모을 것
- 슬라이드 4 의 읽기 경로가 ablation 을 가리키는데 링크는 #p21(결론)이다

## 접근성
- 슬라이드 12 의 aria-label 이 "성능 비교 차트" 뿐이다. 수치를 문장으로 넣을 것
```

## Do not

- Do not edit the document. Find only.
- Do not check content or numbers. Other lenses do that.
- Do not suggest nicer phrasing. Report rule violations. Taste is not a rule.
- Do not recount what `check-doc.mjs` already catches (tag balance, external resources,
  presence of required eyebrows). Look at the **content** the script cannot see.
