---
type: finding
aliases: [위키만 만들면 안 된다, Progressive Traversal ablation, 순회 제거]
tags: [RAG, wiki, ablation, 도입판단]
kind: prescriptive
sources: [documents/2026-08-05-llm-wiki-retrieval-as-reasoning]
claims: [c24, c25, c26, c27, c10, c11, c12]
confidence: high
last_verified: 2026-08-13
---

# 위키만 만들고 기존처럼 쓰면 RAG 보다 낮아진다

> 마크다운 위키로 컴파일하는 것과 agent 가 여러 번 순회하는 것은 **둘 중 하나만으로는
> 효과가 없다.** 위키를 만들어 놓고 top-k 로 한 번 뽑아 쓰면 이득이 줄어드는 정도가
> 아니라 Dense RAG 아래로 떨어진다.

## 판단에 쓸 것

**도입하려면 tool call 예산과 반복 재계획을 함께 줘야 한다.** 위키만 만들 예산밖에
없으면 만들지 않는 편이 낫다.

| 구성 | HotpotQA | MuSiQue | 2Wiki |
|---|---|---|---|
| Dense RAG | 0.764 | 0.611 | 0.815 |
| **위키 + 단발 조회** | **0.722** | **0.601** | **0.789** |
| 원문 청크 + 순회 | 0.778 | 0.669 | 0.844 |
| 위키 + 순회 | 0.839 | 0.739 | 0.911 |

<!-- claim:c27 · 논문에 이 비교는 없다. 표 3 의 ablation 행과 표 1 의 Dense RAG 행을 겹친 것 -->

굵은 행이 이 페이지의 요점이다. 위키 페이지는 원문을 요약·재구성한 결과라 정보가
줄어 있는데, 링크를 따라갈 수 없으면 그 손실만 남는다.

## 구성 요소별 기여

순회 제거가 구조 제거의 약 두 배다. <!-- claim:c25 c26 -->

```
순회 제거        −11.7 ~ 13.8 F1
구조 제거        −6.1  ~ 7.0
Error Book 제거  −3.4  ~ 4.0
```

**구현 순서가 여기서 나온다.** 순회부터 만들고, 링크 검증은 코드로 하고, Error Book 은
마지막에 한다. 효과가 가장 작은 것을 먼저 만들 이유가 없다.

## 안 쓰는 게 나은 경우

- 사실 하나만 찾는 질문이 대부분일 때. 문서 1개로 답하는 질문에서는 HippoRAG 2 에
  **2.3 AC 진다** <!-- claim:c20 -->
- 원문 표현 그대로가 중요할 때. 컴파일에서 세부가 빠진다
- corpus 가 자주 바뀔 때. 재컴파일 방법이 논문에 없다
- 질문당 tool call 10~15회를 감당할 수 없을 때

## 이 판단이 기대는 근거의 강도

ablation 은 같은 시스템 안에서 같은 모델로 구성 요소만 뺀 대조라, baseline 선택이나
corpus 선택과 무관하게 성립한다. **다만 순회 제거 변형은 검색 1회·읽기 1회로 줄인
것이라 예산도 함께 줄었다.** 순회의 기여와 예산의 기여가 완전히 갈라지지는 않는다.

수치는 arXiv:2605.25480v2 표 1·표 3 에 고정돼 있고 `check-claims.mjs` 가 대조한다.

## 관련

[[findings/schema-must-not-be-frozen]] — 만들기로 했다면 그다음 함정
[[findings/wiki-numbers-are-not-cross-comparable]] — 이 표를 다른 논문 표와 겹치지 말 것
[[systems/llm-wiki]]
