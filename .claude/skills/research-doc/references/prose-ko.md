# Writing the Korean output

Everything the reader sees is Korean: the research documents and the review reports. The
instructions are English and the product is Korean. `check-doc.mjs` blocks em dashes and
process narration, and `check-prose.mjs` counts the rules below that carry a number, on the
visible text with quotes skipped (`--help` lists both). This file covers what neither can
count.

Keep technical terms in English. This is the one list the other files point at: RAG,
embedding, chunk, corpus, baseline, ablation, agent, tool call, F1, multi-hop, commit,
locator. Translating them produces coinages harder to read than the English. Quotes,
identifiers and file paths stay verbatim too.

## Cut the slop

The reader wants findings, and anything that narrates the act of producing them is noise.

**Narrating instead of delivering.** Progress narration (이제 ~보자, 먼저 ~부터), reaction
words (흥미롭게도, 놀랍게도, 주목할 점은), monologue (여기서 잠깐), vague attribution
(업계에서는, 전문가들은), promotional adjectives (강력한, 획기적인, 탄탄한) and empty
summaries (요컨대 ~중요하다, 종합하면 장단점이 있다) each stand where the thing itself
should be. The reader is told how to feel, or who agrees, or that a property is impressive,
and never gets the property to size for themselves. Look for that move. The script holds
the handful of words that recurred, so passing it says nothing about the family, which is
open. A summary has to survive deleting the section above it, so put in it the finding that
section established, with its numbers.

**Hedging without a reason.** ~일 수도 있어 보인다 and ~라고 볼 여지가 있다 give the
reader nothing to act on. When the evidence is weak, name what is missing.

- ✗ 성능이 더 나을 수도 있어 보인다.
- ✓ 성능이 앞서지만 신뢰구간이 없어 차이가 유의한지는 알 수 없다.

Three upsides do not oblige three downsides; write what the evidence supports and stop.

## Residue of the work

This family survives longest because every sentence in it is true. It is in the document
because of how the document was made, and no reader needs it.

**Work residue outside `setup`.** An incidental finding, something you learned while looking
for something else, is real to you and weightless to a reader deciding anything. Sourcing
narration (which tool fetched it, which route failed, how many tries) belongs in `setup`.

- ✗ 테스트 디렉터리를 찾다가 examples/ 에 오래된 노트북이 있는 것도 봤다.
- ✓ (자르거나, 그 사실이 실제로 바꾸는 주장 옆으로 옮긴다)
- ✗ 이 문서는 그 도구를 실행해 보지 않았고 규격 본문까지 확인하지도 않았다.
- ✓ (`setup` 으로. 그 자리에는 그림이 무엇을 보여주는지만 남긴다)

The line between residue and a limit falls on what the sentence bounds. A sentence about how
the document was made goes to `setup`. A sentence about what the evidence cannot support
stays beside the claim it weakens, the only position from which it stops a reader
over-reading. Decide by what the sentence is about and ignore whether it contains a
negation.

- `setup` 로: 이 문서는 그 도구를 실행해 보지 않았다
- 주장 옆에: 이 경로의 테스트는 찾지 못했다 (`grep -rn 'reconnect' **/*.test.ts` → 0건)

**Asides and visible self-correction.** A parenthesis that interrupts the sentence for
something it did not need is either a sentence or gone. When a later sentence corrects an
earlier one (앞에서 A 라고 했는데 정확히는 B 다), fix A and write B.

- ✗ 탐지는 z 검정으로 한다(참고로 이 검정은 단측이다).
- ✓ 탐지는 단측 z 검정으로 한다.

## Borrowed emphasis

These arrive assembled and read as decoration, because a claim carried by an adjective has
no evidence behind it.

**Emphasis with no content.** 중요한 전환점, ~을 시사한다, ~의 상징적인 사례, and the
close 여러 한계에도 불구하고 가능성은 열려 있다. Say what changed and let the reader size
it. A paragraph that would be true of anything is about nothing. What the `critique` chapter
needs is a named result that survives the limits and transfers somewhere; vague optimism is
the slop, and the named result is told apart by whether a reader could act on it.

- ✗ 이 변경은 캐시 전략의 중요한 전환점을 시사한다.
- ✓ 이 변경으로 모든 요청이 캐시를 거친다. 전환점인지는 적중률이 나와야 안다.

**Elegant variation.** Swapping in a synonym to avoid repeating a term reads, in a document
full of technical terms, as two different things. Repeat the term.

**`~가 아니라 ~다` as a default frame.** It doubles a sentence whose second half carries all
the information, and the discarded half often smuggles in a claim nobody made.

- ✗ 성능 문제가 아니라 정확도 문제다.
- ✓ 정확도 문제다. 처리량은 두 방식이 같다.

Keep it where the reader holds the wrong answer and the document corrects it (`압축이 아니라
재작성이다. 원문 토큰을 하나도 재사용하지 않는다`), where the correction is about
attribution (`원문이 아니라 그 글을 인용한 쪽의 읽기다`), and inside a quote, which is
never edited. No count separates those from the decorative kind, so `check-prose.mjs` only
reports the rate. Delete the first half: if the sentence says the same without it, the
frame was decoration.

## Write Korean, not translated English

The commonest tell is a sentence that parses as English with Korean particles attached.

**English frames.** `~하는 것은 ~이다` where Korean can predicate directly, and stacked
passives (확인되어진다, ~라고 말해질 수 있다, ~에 의해 수행된다) where Korean has one
passive already. Write the actor as the subject. The gate blocks the doubled forms and the
`~에 의해` one.

- ✗ 이 구조를 채택하는 것은 검색 비용을 줄이는 것을 가능하게 한다.
- ✓ 이 구조를 쓰면 검색 비용이 줄어든다.

**Pronouns Korean drops, and modifiers in English order.** 그것은, 이것은, 그들은 repeated
across sentences read as machine output, since Korean omits a subject that context carries.
Korean puts modifiers before the noun, so stacking them the way English stacks after the
noun produces a sentence nobody can parse; break it into two.

- ✗ 이 게이트는 문서를 검사한다. 그것은 세 규칙을 적용한다. 그것들은 서로 독립적이다.
- ✓ 이 게이트는 문서를 세 규칙으로 검사한다. 규칙끼리는 서로의 결과를 모른다.
- ✗ 커밋에 고정된 원문에서 인용을 대조하는 것을 요구하는 검사를 통과하지 못한 주장
- ✓ 인용을 고정 커밋과 대조하는 검사가 있다. 이걸 통과하지 못한 주장은

**`~들`, `~에 대한` and `~에 있어서` as filler.** `들` can mark that the reference is
definite or that the members are various, so deleting it on sight changes the sentence; drop
it where a number or the context already carries the plural. `~에 대한` and `~에 있어서`,
stacked, push the verb out of a sentence that had room for one. `~를 통해` is ordinary Korean:
cut it only where a verb stands right there, as in the last example.

- ✗ 파일들 12개를 읽었고, 결과들이 모두 일치했다.
- ✓ 파일 12개를 읽었고 결과가 모두 일치했다.
- ✓ 남은 스킬들은 서로 다른 harness 를 겨냥한다.  (여럿이 제각각이라는 뜻이 살아 있다)
- ✗ 검증에 있어서 가장 중요한 것은 근거에 대한 확인을 통해 이루어진다.
- ✓ 검증에서 제일 중요한 건 근거를 직접 확인하는 것이다.

**Connectives and commas.** 또한, 그러나, 따라서 opening one paragraph after another is
English rhythm; Korean links by content, so use one when the logical turn is real. A comma
after a connective ending (`~하고,` `~지만,` `~는데,`) is a rate. Models put one after
nearly every connective, people after some, and `--counts` prints the human band under the
column. A document with no such commas is as far from human Korean as one with a comma after
every one: it got there by deleting the commas that did work, then the connectives, then
stacking nouns. Read the rate over the document and ignore the single sentence.

- ✓ 캐시는 커밋 단위로 잡히고 같은 버전은 다시 받아도 sha256 이 같다.
- ✓ 경계는 토큰 8개다. 그 아래는 keyword, 위는 embed 경로로 간다.
- ✓ 후보가 채택되면 다음 current skill 이 되고, 거절되면 문서는 그대로지만 시도는 이력에 남는다.

The first needs no comma, the second's comma separates parallel items, and the third has
one after `되고` because the clause after it turns. Where one fact follows from another,
say so (`그래서`, `~므로`, `~는데`) and let the sentence run longer; three short declaratives
in a row leave the reader assembling the list, and the cost lies in the missing joint.

## Do not compress into nouns

Every sentence can pass the counter and the reader still stops, because the joints between
ideas have been taken out and the ideas packed into noun phrases. The reader has to supply
the particles and the causes.

**Nouns joined by `·` or `의` instead of a clause.** A list like `문제·상태·시도·결과` or a
chain like `사례별 개선량 분산의 EMA` hands the reader the particles to fill in. Say who
does what to what, with a verb. `·` stays between proper names in a table cell and in
`§3·Algorithm 1`.

- ✗ Scheduler 가 작업·상태·시도·결과를 다음 실행에 전달한다.
- ✓ Scheduler 는 작업마다 지금 상태와 지금까지의 시도, 그 결과를 적어 두었다가 다음
  실행에 넘긴다.

**A disclaimer sentence after the claim.** `~라는 뜻은 아니다`, `~을 뜻하지 않는다` and
`~을 보장하지 않는다` tacked onto a paragraph make the limit real and its shape wrong. Put
it in the clause it limits, and the reader gets claim and limit in one reading.

- ✗ 이 원리가 이 제품의 실제 reward라는 뜻은 아니다.
- ✓ 이 제품이 실제로 이 reward를 쓰는지는 공개 자료에 없으므로, 아래는 원리 설명이다.

**Abstract nouns set in parallel.** `가치는 A에 있고, 질문은 B에 있다`, `A와 B는 다르다`
and `문제는 X가 아니라 Y다`, used as a heading or a summary sentence, have the shape of a
claim and none of the content: no concrete subject, no verb that does anything, two nouns
to unpack. Name the thing and say what it does.

- ✗ 가치는 반복 조회의 비용에 있고, 남은 질문은 적중률의 품질에 있다
- ✓ 같은 조회를 반복할 때 비용은 줄어든다. 그 적중률을 믿어도 되는지는 아직 확인되지 않았다
- ✗ 평균이 낮아진 것과 분산이 줄어든 것은 다르다
- ✓ 평균 지연이 40ms 로 내려갔지만 분산이 함께 줄었는지는 표에 없어서, 꼬리 지연은 알 수 없다

## Keep the content while trimming

Trimming removes the mechanism before the conclusion, so a compressed document keeps
reading like a finished argument after the part a reader would check it with is gone.

**Keep these even when they make a sentence longer:**

- Numbers with their comparison base. 62.6 alone is unreadable; 62.6 (baseline 56.3) can be
  judged.
- Conditions on a claim. "문서 2개 이상이 필요한 질문에서" is part of the claim, and
  without it the claim is false.
- Counterexamples and limits. If the body says the method loses on single-document
  questions, the summary says so too.
- Where a number came from: 표 1(논문), `src/queue.ts:79`.
- Calculations the source did not make, said in the caption.
- What was not checked. A report that lists only findings reads as "everything else is
  verified".

## Paragraph shape

Lead with the conclusion, then the evidence, then the qualifier. Korean often defers the
main clause to the paragraph's end; these documents lead with it, because readers scan them.

```
주장 한 문장.
근거 한두 문장 (수치, 인용, 위치).
단서가 있으면 마지막에.
```

One paragraph carries one claim, since a paragraph with two gets skimmed and one is missed.

## Sentence ending

Research documents use the plain declarative (`~한다`, `~이다`), and `check-prose.mjs`
blocks the polite register at zero. An instruction written in `~습니다` primes the register
it is written in, so write instructions in the plain form too.

Review reports and other output addressed to the user are conversational rather than plain
declarative, whatever register the user writes in. A report is a work product carrying
findings, numbers and locations, and mirroring the conversation's tone drags its quality
along with the tone.

## A worked example

The same finding, three ways.

Slop:
> 이제 수치 검증 결과를 살펴보겠습니다. 흥미롭게도, 문서에 기재된 여러 수치들 중에서
> 일부에 대한 확인이 이루어진 결과, 표 4 와 관련된 부분에 있어서 문제가 발견되어졌다고
> 말할 수 있을 것 같습니다. 나머지 수치들은 대체로 문제가 없어 보입니다.

Over-compressed:
> 표 4 틀림.

Right:
> 수치 42개를 원문과 대조해 1건이 어긋난다. 장 11 에서 표 4 의 격차가 6.2/5.1/3.4 로
> 좁아지는데 문서는 넓어진다고 썼다. 거기에 "작은 모델이 구조에서 더 이득을 본다"는
> 해석까지 얹혀 있어서 방향을 고치면 그 문단 전체를 다시 써야 한다.
