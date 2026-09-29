# Writing the Korean output

The documents and the review reports are Korean. Technical terms stay English: RAG,
embedding, chunk, corpus, baseline, ablation, agent, tool call, F1, multi-hop, commit,
locator; quotes, identifiers and paths stay verbatim. `check-prose.mjs --help` lists what is
counted and blocked (reaction words, promotional adjectives, vague attribution, monologue,
progress narration, unreasoned hedges, doubled passives, empty summaries, the polite
register), and `--counts` prints the rates beside the human band. This file is what neither
can count.

Plain declarative (`~한다`, `~이다`) in the document. Instructions are written in it too, so
they do not prime another register.

## Rules

Each entry: what to do, a ✗/✓ pair, and why the ✗ fails.

**1. Unpack nouns into a clause.** A chain joined by `·` or `의` hands the reader the
particles and the verb to fill in. `·` stays between proper names in a table cell.
- ✗ Scheduler 가 작업·상태·시도·결과를 다음 실행에 전달한다.
- ✓ Scheduler 는 작업마다 지금 상태와 지금까지의 시도, 그 결과를 적어 두었다가 다음 실행에 넘긴다.

**2. Put the limit in the clause it limits.** A disclaimer sentence after the claim
(`~라는 뜻은 아니다`, `~을 보장하지 않는다`) makes the limit real and its shape wrong.
- ✗ 이 원리가 이 제품의 실제 reward 라는 뜻은 아니다.
- ✓ 이 제품이 실제로 이 reward 를 쓰는지는 공개 자료에 없으므로, 아래는 원리 설명이다.

**3. No abstract nouns set in parallel** in a heading or a summary sentence. They have the
shape of a claim and no subject that does anything.
- ✗ 가치는 반복 조회의 비용에 있고, 남은 질문은 적중률의 품질에 있다
- ✓ 같은 조회를 반복할 때 비용은 줄어든다. 그 적중률을 믿어도 되는지는 아직 확인되지 않았다

**4. Name what is missing instead of hedging.** `~일 수도 있어 보인다` gives the reader
nothing to act on.
- ✗ 성능이 더 나을 수도 있어 보인다.
- ✓ 성능이 앞서지만 신뢰구간이 없어 차이가 유의한지는 알 수 없다.

**5. Work residue goes to `setup`; a limit stays beside its claim.** Decide by what the
sentence is about, not by whether it contains a negation.
- ✗ (in a mechanism chapter) 이 문서는 그 도구를 실행해 보지 않았다. → `setup`
- ✓ (beside the claim) 이 경로의 테스트는 찾지 못했다 (`grep -rn 'reconnect' **/*.test.ts` → 0건)
- ✗ 테스트 디렉터리를 찾다가 examples/ 에 오래된 노트북이 있는 것도 봤다. → cut

**6. `~가 아니라 ~다` only where the reader holds the wrong answer.** As a default frame it
doubles a sentence whose second half carries everything, and the discarded half smuggles in
a claim nobody made.
- ✗ 성능 문제가 아니라 정확도 문제다.
- ✓ 정확도 문제다. 처리량은 두 방식이 같다.
- ✓ 압축이 아니라 재작성이다. 원문 토큰을 하나도 재사용하지 않는다. (the reader assumed compression)

**7. Break an English-order modifier into two sentences, and predicate directly** instead of
`~하는 것은 ~이다`. Korean puts modifiers before the noun; stacked the English way, the
sentence cannot be parsed.
- ✗ 커밋에 고정된 원문에서 인용을 대조하는 것을 요구하는 검사를 통과하지 못한 주장
- ✓ 인용을 고정 커밋과 대조하는 검사가 있다. 이걸 통과하지 못한 주장은
- ✗ 이 구조를 채택하는 것은 검색 비용을 줄이는 것을 가능하게 한다.
- ✓ 이 구조를 쓰면 검색 비용이 줄어든다.

**8. Drop the pronoun context carries.** 그것은, 이것은 repeated across sentences read as
machine output.
- ✗ 이 게이트는 문서를 검사한다. 그것은 세 규칙을 적용한다.
- ✓ 이 게이트는 문서를 세 규칙으로 검사한다.

**9. `~들`, `~에 대한`, `~에 있어서`, `~를 통해`: keep them inside the band** that `--counts`
prints. `들` marks a definite or varied plural, so cut it only where a number already
carries the plural; `~를 통해` is ordinary Korean, cut only where a verb stands right there.
- ✗ 파일들 12개를 읽었고, 결과들이 모두 일치했다.
- ✓ 파일 12개를 읽었고 결과가 모두 일치했다.
- ✓ 남은 스킬들은 서로 다른 harness 를 겨냥한다.

**10. Commas after connective endings are a rate, read over the document.** The band is
two-sided: a document with none got there by deleting the joints and stacking nouns.
- ✓ 캐시는 커밋 단위로 잡히고 같은 버전은 다시 받아도 sha256 이 같다.
- ✓ 후보가 채택되면 다음 current skill 이 되고, 거절되면 문서는 그대로지만 시도는 이력에 남는다.

**11. Join short declaratives where one follows from another** (`그래서`, `~므로`, `~는데`).
Three in a row leave the reader assembling the list.
- ✗ 경계는 토큰 8개다. 그 아래는 keyword 다. 위는 embed 다.
- ✓ 경계는 토큰 8개라서, 그 아래는 keyword 경로로 가고 위는 embed 경로로 간다.

**12. A number carries its base, a claim carries its condition.** 62.6 alone is unreadable
and 62.6 (baseline 56.3) can be judged; "문서 2개 이상이 필요한 질문에서" is part of the
claim, and without it the claim is false. Where each goes is the chapter grammar in
`../SKILL.md`.

**13. Say it literally.** Mannered prose substitutes metaphor and flourish for direct
statement, and emphasis with no content (`중요한 전환점`, `~을 시사한다`, `여러 한계에도
불구하고 가능성은 열려 있다`) tells the reader how to feel instead of what changed. When a
literal phrase is available, use it. Repeat a term rather than varying it; in a document full
of technical terms a synonym reads as a second thing.
- ✗ 이 변경은 캐시 전략의 중요한 전환점을 시사한다.
- ✓ 이 변경으로 모든 요청이 캐시를 거친다. 전환점인지는 적중률이 나와야 안다.

**14. One paragraph, one claim: claim first, then evidence, then the qualifier.** Readers
scan these documents, so the main clause does not wait for the paragraph's end.

**15. A summary survives deleting the section above it.** Put in it the finding that section
established, with the numbers the body established and the counterexample it admits. Do not
tally the body's items into a new count; a count drifts the moment the list changes.

Review reports take their form from `../../research-verify/SKILL.md`.
