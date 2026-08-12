---
type: finding
aliases: [AuthTrace 수치 비교, fan-in 구간 정의, 백본 불일치]
tags: [AuthTrace, benchmark, comparability, 함정]
kind: prescriptive
sources: [documents/2026-08-05-llm-wiki-retrieval-as-reasoning, documents/2026-08-05-wikikv-hierarchical-kb-storage, documents/2026-08-05-wikiloop-feedback-coupled-wiki]
confidence: high
last_verified: 2026-08-13
---

# 세 논문의 AuthTrace 수치를 한 표에 놓지 말 것

> 같은 벤치마크 이름, 같은 지표 이름, 같은 저자 팀. 그런데 세 논문의 숫자는 서로
> 비교할 수 없다. 이 라이브러리에서 가장 하기 쉬운 실수다.

## 하지 말 것

- **세 문서의 AuthTrace AC 를 한 표에 모으지 말 것.** 백본도 구간 정의도 다르다.
- LLM-Wiki 의 70.4 와 WikiLoop 의 62.6 을 빼서 차이를 계산하지 말 것. 다른 모델의 점수다.
- 구간별 값(Single / Low / High)을 논문 사이에서 대응시키지 말 것. 구간의 뜻이 다르다.

## 왜

**백본이 다르다.** LLM-Wiki 와 WikiKV 는 답변 모델을 GLM-5.1 로 통일했고, WikiLoop 은
Qwen3.5-9B 로 통일했다. WikiLoop 의 절대 수치가 전반적으로 낮은 것은 방법이 나빠서가
아니라 모델이 작아서다. WikiLoop 표 4 에 GLM-5.1 참고 수치가 함께 실려 있지만, 논문이
직접 "맥락용이며 같은 백본 비교에 쓰지 말라"고 명시한다.

**fan-in 구간 정의가 논문마다 다르다.**

| | Low | High |
|---|---|---|
| AuthTrace 원 논문 | 문서 2~3개 | 4개 이상 |
| WikiKV | 2개 | 3개 이상 |
| WikiLoop | 2개 | 3개 이상 |

WikiKV 와 WikiLoop 둘 다 "공식 구간을 그대로 쓴다"고 적으면서 원 논문과 다른 수를
적었다. 전체 합(2,099 문항)은 같으므로 **All 열만 같은 모집단**이고, 구간별 값은
논문 사이에서 대응하지 않는다.

## 그러면 무엇을 비교할 수 있나

- **같은 논문 안의 방법 간 비교**는 성립한다. 통제가 그 논문 안에서만 걸려 있기 때문이다.
- **순위**는 대체로 옮겨간다. 세 논문 모두에서 multi-hop 이 늘수록 격차가 커지는 방향은 같다.
- 굳이 가로질러 읽어야 하면 **All 열끼리**, 그것도 백본을 명시해서.

## 어디에 적혀 있나

- LLM-Wiki 문서 ⑲ 「해석의 한계」 3번: 벤치마크와 검증이 모두 내부에서 나왔다
- WikiKV 문서 ⑬ 「해석의 한계」 4번: 구간 정의가 앞 논문과 다르다
- WikiLoop 문서 ⑧ 「결과 1」 말미: 이 표를 LLM-Wiki 문서의 표와 나란히 두면 안 된다

세 문서가 각자 자기 자리에서 같은 경고를 한다. **한 문서만 읽으면 그 문서의 경고만 본다.**

## 아직 확인 안 된 것

`.research/2026-08-05-llm-wiki-retrieval-as-reasoning` 은 원 논문을 **v2** 로,
`.research/2026-08-05-wikiloop-feedback-coupled-wiki` 는 같은 논문을 **v1** 로 고정했다.
두 버전 사이에 수치가 바뀌었는지는 확인하지 않았다. 확인하려면
`node .claude/skills/research-verify/scripts/pin-paper.mjs 2605.25480 v1` 로 v1 을 받아
두 sha256 을 비교하면 된다.

## 관련

[[findings/compile-and-traverse-are-a-set]] · [[systems/llm-wiki]] · [[systems/wikikv]] · [[systems/wikiloop]]
