# Writing the Korean output

Everything the reader sees is Korean: the research documents and the review reports.
The instructions are English, the product is Korean. This file covers how to write that
Korean well. `check-doc.mjs` blocks em dashes and process narration, and
`../../research-verify/references/lens-prose.md` carries the ban on metaphors and inflated
headings; this file is about the failure modes those rules do not name.

`check-prose.mjs` counts the rules below that carry a number. It runs on the visible text
and skips quotes, so what it blocks is the document's own prose.

Keep technical terms in English. This list is the one the other files point at, so it is
the only place it should be written out: RAG, embedding, chunk, corpus, baseline, ablation,
agent, tool call, F1, multi-hop, commit, locator. Translating them produces coinages
that are harder to read than the English. Quotes, identifiers, and file paths also stay
verbatim.

## Cut the slop

The reader wants findings. Anything that narrates the act of producing findings is
noise, and it is the single most common way this output goes bad.

**Five that are a fixed list of words, so a script holds them.** Progress narration
(이제 ~보자, 먼저 ~부터), reaction words (흥미롭게도, 놀랍게도, 주목할 점은), monologue
(여기서 잠깐, 다시 말해), vague attribution (업계에서는, 전문가들은), promotional adjectives
(강력한, 획기적인, 정교한, 탄탄한). Each one stands where the thing itself should be: the
reader is told how to feel, or who agrees, or that a property is impressive, instead of being
given the property and left to size it. `check-prose.mjs` blocks all five, so what is left
here is the reason, not the list.

**Listing what passed.** In a review report, "나머지 수치는 모두 일치한다" is filler.
Give a count if the scale matters, then move on. Silence means fine.

- ✗ 슬라이드 3, 5, 7, 9 의 수치는 원문과 일치한다. 슬라이드 11 은 방향이 반대다.
- ✓ 수치 42개를 대조해 1건이 어긋난다. 슬라이드 11: 격차가 좁아지는데 넓어진다고 썼다.

**Empty summary sentences.** 요컨대 ~중요하다, 종합하면 장단점이 있다. A summary that
would survive deleting the section above it is not a summary; put the finding the section
established in it, with its numbers. `check-prose.mjs` blocks the openers.

**Hedging without a reason.** ~일 수도 있어 보인다, ~라고 볼 여지가 있다. If the
evidence is weak, name what is missing. That is useful; vagueness is not.

- ✗ 성능이 더 나을 수도 있어 보인다.
- ✓ 성능이 앞서지만 신뢰구간이 없어 차이가 유의한지는 알 수 없다.

**Forced symmetry.** Three upsides do not obligate three downsides. Write what the
evidence supports and stop.

## Residue of the work

A separate family, and the one that survives longest, because every sentence in it is
true. It is in the document because of how the document was made, not because a reader
needs it. Chapter ⑦ is the one place these belong; anywhere else they break the reader's
attention and hand back nothing.

**Incidental findings.** Something you learned while looking for something else. Real to
you, weightless to a reader deciding anything.

- ✗ SWEET 논문이 인용한 탐지기 목록에 GPTZero 도 들어 있다.
- ✓ (자르거나, 그 사실이 실제로 바꾸는 주장 옆으로 옮긴다)

**Sourcing narration outside ⑦.** Which tool fetched it, which route failed, how many
tries it took.

- ✗ 이 문서는 그 도구를 실행해 보지 않았고 규격 본문까지 확인하지도 않았다.
- ✓ (⑦로. 그 자리에는 그림이 무엇을 보여주는지만 남긴다)

**Where the line falls: what the sentence bounds.** A sentence about how the document was
made goes to ⑦. A sentence about what the evidence cannot support stays beside the claim it
weakens, because that is the only position from which it stops a reader over-reading. The
two look alike and do opposite jobs, so decide by what the sentence is about, not by
whether it contains a negation.

- ⑦ 로: 이 문서는 그 도구를 실행해 보지 않았다
- 주장 옆에: 이 경로의 테스트는 찾지 못했다 (`grep -rn 'reconnect' **/*.test.ts` → 0건)

**Asides.** A parenthesis that interrupts the sentence to add something the sentence did
not need. If it matters it is a sentence; if it does not it is gone.

- ✗ 탐지는 z 검정으로 한다(참고로 이 검정은 단측이다).
- ✓ 탐지는 단측 z 검정으로 한다.

**Visible self-correction.** 앞에서 A 라고 했는데 정확히는 B 다. Fix A and write B.

## Borrowed emphasis

These arrive already assembled and they read as decoration because they are. A claim
carried by an adjective is a claim with no evidence behind it.

**Manufactured significance.** 중요한 전환점, ~을 시사한다, ~의 상징적인 사례,
~을 보여주는 방증. Say what changed and let the reader size it.

- ✗ 이 결정은 AI 투명성 논의의 중요한 전환점을 시사한다.
- ✓ 이 결정으로 Claude 출력 전부에 마크가 붙는다. 전환점인지는 탐지기가 나와야 안다.

**The challenges-and-prospects close.** 여러 한계에도 불구하고 가능성은 열려 있다.
A paragraph that would be true of anything is about nothing. This is not the rule that ⑨
should not end on a purely negative note: that one asks for a **named** result that
survives the limits and transfers somewhere. Vague optimism is the slop; the named result
is the requirement, and the two are told apart by whether a reader could act on it.

**Elegant variation.** Swapping in a synonym to avoid repeating a term. In a document
full of technical terms this reads as two different things. Repeat the term.

**`~가 아니라 ~다` as a default frame.** Doubles a sentence whose second half carries all
the information, and the discarded half often smuggles in a claim nobody made.

- ✗ 성능 문제가 아니라 정확도 문제다.
- ✓ 정확도 문제다. 처리량은 두 방식이 같다.

Keep it where the reader actually holds the wrong answer and the document is correcting it
(`압축이 아니라 재작성이다. 원문 토큰을 하나도 재사용하지 않는다`), where the correction is
about attribution (`원문이 아니라 그 글을 인용한 쪽의 읽기다`), and inside a quote, which is
never edited.

There is no count that separates those from the decorative kind, so `check-prose.mjs` only
reports the rate. What tells them apart is whether deleting the first half loses anything: if
the sentence still says the same thing without it, the frame was decoration.

## Write Korean, not translated English

The most common tell is that the sentence parses as English with Korean particles
attached. Some patterns to watch:

**`~하는 것은 ~이다` as a default frame.** Korean can predicate directly.

- ✗ 이 구조를 채택하는 것은 검색 비용을 줄이는 것을 가능하게 한다.
- ✓ 이 구조를 쓰면 검색 비용이 줄어든다.

**Passive stacking.** 확인되어진다, ~라고 말해질 수 있다, ~에 의해 수행된다. Korean has
one passive already; the second is English word order looking for a place to land. Write the
actor as the subject. `check-prose.mjs` blocks the doubled forms and the `~에 의해` one.

**Pronouns that Korean would drop.** 그것은, 이것은, 그들은 repeated across sentences
reads as machine output. Korean omits the subject when context carries it.

- ✗ 이 skill 은 문서를 검사한다. 그것은 세 렌즈를 사용한다. 그것들은 서로 독립적이다.
- ✓ 이 skill 은 문서를 세 렌즈로 검사한다. 렌즈끼리는 서로의 결과를 모른다.

**Nested relative clauses in English order.** Korean puts modifiers before the noun, so
stacking them the way English stacks them after produces sentences nobody can parse.
Break into two sentences instead.

- ✗ 커밋에 고정된 원문에서 인용을 대조하는 것을 요구하는 검사를 통과하지 못한 주장
- ✓ 인용을 고정 커밋과 대조하는 검사가 있다. 이걸 통과하지 못한 주장은

**`~들` where the plural is already carried.** `들` is not noise: it can mark that the
reference is definite or that the members are various, so deleting it on sight changes what
the sentence says. Drop it where a number or the context already did the work.

- ✗ 파일들 12개를 읽었고, 결과들이 모두 일치했다.
- ✓ 파일 12개를 읽었고 결과가 모두 일치했다.
- ✓ 남은 스킬들은 서로 다른 harness 를 겨냥한다.  (여럿이 제각각이라는 뜻이 살아 있다)

**`~에 대한`, `~에 있어서` as connective filler.** Stacked, they push the verb out of a
sentence that could have used one.

- ✗ 검증에 있어서 가장 중요한 것은 근거에 대한 확인을 통해 이루어진다.
- ✓ 검증에서 제일 중요한 건 근거를 직접 확인하는 것이다.

`~를 통해` is not on this list. Korean written without translation uses it about twice as
often as translated Korean does, so cutting it on sight moves the prose away from Korean
rather than toward it. Cut it in the example above because the sentence has a verb standing
right there, not because the phrase is foreign.

**Connectives on every paragraph.** 또한, 그러나, 따라서 opening one paragraph after
another. Korean prose links by content more than by connective. Use them when the
logical turn is real.

**A comma after a connective ending.** `~하고,` `~지만,` `~는데,` `~어서,`. This is the
strongest measured difference between Korean a person wrote and Korean a model wrote, and
it is the one this repo's own documents break worst. The connective already joined the two
clauses; the comma is a second joint on top of it.

- ✗ 캐시는 커밋 단위로 잡히고, 같은 버전은 다시 받아도 sha256 이 같다.
- ✓ 캐시는 커밋 단위로 잡히고 같은 버전은 다시 받아도 sha256 이 같다.

The failure on the other side is a document with no commas at all. Korean written by a
person carries about one per ninety characters; the repair is to move the comma, not to
stop using it.

- ✓ 8 토큰을 넘는 질의는 embed 경로로 가고 캐시를 지나지 않는다.
- ✓ 경계는 토큰 8개다. 그 아래는 keyword, 위는 embed 경로로 간다.

The first joins two clauses with a connective and needs nothing after it. The second's comma
sits between two parallel items, which is not a connective ending at all — that is the
position where a Korean comma is doing work.
`check-prose.mjs --counts` prints both rates.

## Do not lose the content while trimming

Cutting slop and cutting substance look similar from the outside. They are not the same
thing, and over-compression is the failure mode on the other side.

**It is not random about what it takes.** Simplification deletes the mechanism and keeps
the conclusion, in that order, and it does it to human editors as well as to models. So a
compressed document keeps reading like a finished argument while the part a reader would
have used to check it is gone. The conclusion surviving is not evidence the chapter did.

**Connective tissue is not padding for this reader.** The idea that an expert does better
with the gaps left open holds for readers who are strong on the subject and weak at reading.
A reader who is strong at both does better when the text joins its own steps. So the
sentence that says how the previous claim reaches this one earns its place; what does not is
the connective that announces a turn the content is not making.

Keep these even when they make a sentence longer:

- **Numbers with their comparison base.** 62.6 alone is unreadable. 62.6 (LLM-Wiki base
  56.3) can be judged.
- **Conditions on a claim.** "문서 2개 이상이 필요한 질문에서" is not padding. Drop it
  and the claim becomes false.
- **Counterexamples and limits.** If the summary says the method wins and the body says
  it loses on single-document questions, the summary is wrong. Put the exception in the
  summary.
- **Where a number came from.** 표 1(논문), `validators.py:79`. The reader has to be
  able to check.
- **Calculations the source did not make.** Say so in the caption. The reader will look
  for it in the original and not find it.
- **What was not checked.** A report that only lists findings reads as "everything else
  is verified". Say what you could not verify and why.

## Paragraph shape

Lead with the conclusion, then the evidence, then the qualifier. Korean often defers the
main clause to the end of a paragraph; these documents do the opposite, because readers
scan them.

```
주장 한 문장.
근거 한두 문장 (수치, 인용, 위치).
단서가 있으면 마지막에.
```

One paragraph, one claim. If a paragraph has two claims, it will get skimmed and one of
them will be missed.

## Sentence ending

Research documents use the plain declarative (`~한다`, `~이다`), matching the existing
documents in `research/`. This is the register for anything published.

Review reports and other conversational output addressed to the user follow the
register of the conversation.

## A worked example

Same finding, written three ways.

**Slop:**
> 이제 수치 검증 결과를 살펴보겠습니다. 흥미롭게도, 문서에 기재된 여러 수치들 중에서
> 일부에 대한 확인이 이루어진 결과, 표 9 와 관련된 부분에 있어서 문제가 발견되어졌다고
> 말할 수 있을 것 같습니다. 나머지 수치들은 대체로 문제가 없어 보입니다.

**Over-compressed:**
> 표 9 틀림.

**Right:**
> 수치 42개를 원문과 대조해 1건이 어긋난다. 슬라이드 11 에서 표 9 의 격차가
> 7.5/12.8/9.6 에서 5.1/10.5/16.9 로 **좁아지는데** 문서는 넓어진다고 썼다. 거기에
> "약한 모델이 구조에서 더 이득을 본다"는 해석까지 얹혀 있어서, 방향을 고치면 그
> 문단 전체를 다시 써야 한다.
