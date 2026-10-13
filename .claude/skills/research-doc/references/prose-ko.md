# Writing the Korean output

The document is Korean, in plain declarative (`~한다`, `~이다`). Technical terms a developer
would search for stay English: RAG, embedding, chunk, baseline, ablation, agent, tool call,
F1, commit, locator, and the like. Quotes, identifiers and paths stay verbatim. Where a plain
Korean phrase says the same thing, use it; a coined Korean rendering of an English term
(착지 for land, 곁 루프 for outer loop) reads as a second, unfamiliar concept.
`check-prose.mjs --help` lists the few forms the gate blocks.

## What it should read like

The owner chose these as the target. They are illustrative: the topic and length come from
your document, the way the sentences move comes from here.

A first screen. The title says what the whole document is about, one paragraph answers the
question, and a few points say what to do or remember.

> **Sonnet 5 코드를 Sonnet 5.5로 옮길 때 바꿔야 하는 곳**
>
> Sonnet 5로 돌던 Messages API 코드는 모델 ID만 바꾸면 바로 400을 받는 곳이 있다. thinking을
> 끄는 설정, 강제 tool_choice, 예전 computer use tool이 대표적인데, 첫 요청에서 바로 드러나니
> 찾기는 어렵지 않다. 더 조심할 쪽은 요청이 성공한 채로 달라지는 변화다. tool call 사이에 오던
> 메모가 빈 thinking 블록으로 바뀌고 effort는 이름이 같아도 쓰는 양이 달라져서, 테스트를 통과한
> 뒤에야 화면이 조용해지거나 청구액이 늘어난 것을 알게 된다.
>
> - thinking을 끄던 코드는 `between_tools`로 바꾸고 effort를 high 이하로 둔다.
> - tool_choice의 any와 tool은 auto와 `strict: true`로 옮긴다.
> - tool call 사이 메모를 화면에 보여 주던 코드는 beta 헤더와 `display: "updates"`를 켜야 메모가 다시 보인다.
> - effort는 작업 종류별 시작값에서 다시 잰다.

An explanatory paragraph. It starts from what the reader already knows, says what changed and
why it matters, and links each step to the next.

> Sonnet 5에서는 tool call 사이에 모델이 남기는 메모가 text 블록으로 왔다. 그래서 이 메모를
> 화면에 흘려 보여 주며 agent가 무엇을 하는지 알리던 코드가 많았다. Sonnet 5.5는 한두 문장보다
> 긴 메모를 thinking 블록에 담아 보내는데, 기본 display 설정에서는 이 블록이 비어서 온다. 요청은
> 여전히 성공하니 화면만 조용해진다. 메모를 다시 보이게 하려면 beta 헤더와 함께
> `display: "updates"`를 켜면 된다. 이때 청구액이 늘지 않을까 걱정할 수 있는데, Anthropic 문서는
> display 설정과 상관없이 청구액이 같고 보이는 것만 달라진다고 설명한다.

A limit, stated once and tied to what the reader can do about it.

> 400과 200의 구분은 migration guide와 What's new의 설명을 옮긴 것이라 실제 요청으로 확인하기
> 전이다. 옮기기 전에 스테이징에서 대표 요청을 한 번씩 보내 보면 이 목록이 실제 응답과
> 맞는지 바로 확인할 수 있다.

Chapter titles. Short, naming what the chapter holds.

> 모델 ID만 바꾸면 생기는 일 / thinking을 끄던 코드 / tool_choice를 강제하던 코드 / computer use
> tool 교체 / 조용해지는 tool call 사이 메모 / 늘어난 거절 부류 / effort 다시 재기 / 옮기는 순서

## Principles

**Start from the reader's situation, then the point, then an example.** A reader handed bare
facts has to build the chain of cause alone.

**Link causes with connectives** (그래서, ~인데, ~므로, 예를 들어). A run of short declaratives
leaves the reader assembling the logic; one sentence packing several facts between commas
leaves them parsing. One idea per sentence, joined to the next by its reason.

**Keep one caveat where it changes what the reader does, and tie it to that action.**
Everything else unknown, unread or self-reported goes once into the limits chapter. A caveat
repeated wherever a claim recurs buries the claim it protects.

**End on what follows for the reader.** A sentence that ends on an absence (`공개하지 않는다`,
`정할 수 없다`) leaves them nothing to do; say what the gap means for their use.

**A number carries its base, and a claim carries its condition.** 62.6 alone is unreadable
and 62.6 (baseline 56.3) can be judged; "문서 2개 이상이 필요한 질문에서" is part of the
claim, and without it the claim is false. This survives every rewrite.

**Unpack noun chains and English-order modifiers into clauses, and say it literally.** Korean
puts modifiers before the noun, so a stacked modifier cannot be parsed; a chain joined by `·`
or `의` hands the reader the particles to fill in. Metaphor and emphasis words (`중요한
전환점`, `~을 시사한다`) tell the reader how to feel instead of what changed. Repeat a term
rather than varying it.

## Pairs

The ✗ side is short on purpose; write toward the ✓ side.

- ✓ 이 설계는 캐시 키에 commit SHA를 넣는다. 커밋이 바뀌면 키도 함께 바뀌므로, 예전 항목은 따로 지우지 않아도 버려진다.
  ✗ 이 설계가 기존 방식과 다른 점은 둘이다.
  Counting announces structure instead of content, and the count goes stale when the items change.
- ✓ GPU를 늘리면 빨라질 거라고 예상하기 쉬운데, 프로파일을 열어 보면 요청 시간의 대부분이 토크나이저에서 쓰인다. 그래서 먼저 손댈 곳은 토크나이저다.
  ✗ 병목은 GPU가 아니라 토크나이저다.
  The contrast frame denies a claim nobody made; start from what the reader expects instead.
- ✓ 요약 방식으로 압축하면 정확한 이름과 관계가 빠진다. 그래프로 옮기면 그 정보는 남지만 트리플 형태라 사람이 다시 읽기 어렵다. 그래서 어느 쪽을 골라도 결국 원문 페이지를 다시 열게 된다.
  ✗ 요약 방식은 이름을 버리고, 그래프 방식은 읽기 어렵게 만든다.
  Two symmetric halves make the reader do the comparison; say what follows from it.
- ✓ 학습 데이터 구성이 논문에 나와 있지 않아서, 같은 결과를 내 보려면 데이터부터 직접 맞춰야 한다.
  ✗ 논문은 학습 데이터 구성을 공개하지 않는다.
  End on what the absence means for the reader.
- ✓ 이 동작은 코드에서 읽은 것이라, 운영에 넣기 전에 npm test로 한 번 확인하는 편이 안전하다.
  ✗ 이 문서는 테스트를 실행하지 않았다.
  Korean drops the subject; tie the limit to what the reader should do.
- ✓ 저자가 A100 한 장에서 잰 값이라, 소비자용 GPU에서 돌릴 계획이라면 모델이 24GB 메모리에 들어가는지부터 확인해야 한다.
  ✗ 저자 환경의 값이다. 재현은 확인되지 않았다. 유의성도 없다.
  Keep the caveat that changes the next step; the rest go to the limits chapter.
- ✓ RAG에서 chunk 크기를 줄이면 recall이 오른다. 대신 chunk 하나에 담기는 문맥이 짧아져서 답을 만들 때 이웃 chunk를 함께 넘겨야 한다.
  ✗ 검색 증강 생성에서 덩어리 크기를 줄이면 재현율이 오른다.
  Developers search for and say the English term.
- ✓ 외부 API가 가끔 503을 돌려주면 바로 다시 부르기보다 간격을 두고 재시도하는 편이 낫다. 재시도 자체는 흔한 기능인데, 핵심은 실패한 클라이언트들이 같은 순간에 다시 몰리지 않게 하는 것이다.
  ✗ Retry 정책: 지수 backoff. 최대 5회. jitter.
  Fragments leave the reader to rebuild the causes.
- ✓ (chapter title) Navigator가 비용을 계산하는 시점
  ✗ Navigator: 증거를 다 모으기 전에는 비용을 묻지 않는다
  A heading is for finding a chapter; the claim goes in `.key`.
- ✓ (document title) 사내 문서 검색에 쓸 embedding 모델 고르기
  ✗ 속도, 비용, 정확도: embedding 모델 세 개 비교
  The title says what the document helps the reader do, and a comma list names topics without the point.

## Forms readers take as machine-written

The owner flagged these in the published documents. Each shows the shape of the writing in
place of its content, and each has neighbours it turns into when one form is avoided:

- counting openers (`~은 셋이다`, `다른 점은 둘이다`, `세 가지로 나뉜다`)
- the contrast family (`A가 아니라 B`, `A라기보다 B`, `X도 Y도 아니다`, a trailing `~지 ~는 아니다`)
- paired parallel clauses (`X는 …하고, Y는 …한다`), in headings above all
- a label and a colon or period before a heading or sentence (`문제: …`, `결과 2. …`, `사례 1: …`)
- comma-list headings (`네 층: 지식, 추론, 평가, 개선`)
- a run of sentences ending in absence or negation
- the document talking about itself (`이 문서는`, `이 장에서는`, `이 대응은 이 문서가 만든 것이고`)

`check-doc.mjs` blocks the heading forms in titles, `h2` and `.key`. In the body they are
review findings, read in context: a contrast that corrects what the reader actually believes
stays.
