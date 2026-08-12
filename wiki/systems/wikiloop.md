---
type: system
aliases: [WikiLoop, 구축과 순회 공동 학습, Builder Navigator]
tags: [reinforcement learning, wiki, agent]
identity: "arXiv:2607.26604"
sources: [documents/2026-08-05-wikiloop-feedback-coupled-wiki]
code_available: false
confidence: medium
last_verified: 2026-08-13
---

# WikiLoop

편집이 나중의 검색 성능을 얼마나 바꾸는지를 보상으로 삼아 위키 구축 정책을 학습시킨다.
Navigator(검색)와 Builder(편집)를 역할 조건부 공유 정책 하나로 묶었다.

**WikiLoop 자체는 도입 대상이 아니다.** 코드·학습 데이터·보상 계수가 모두 비공개이고
RL 파이프라인이 필요하다.

## 학습 없이 바로 쓸 수 있는 것 넷

프롬프트와 평가 스크립트만으로 된다. 이 라이브러리가 실제로 쓰고 있는 것들이다.

1. **증거를 다 모으기 전에는 비용을 재촉하지 않는다.** 검색 agent 에 비용 페널티를
   상시로 걸면 일찍 멈추는 쪽을 학습한다. 조기 종료 24.2% → 11.1%
2. **편집은 전후 차이로 채점한다.** 결과 상태로 재면 개선을 절반으로 과소평가한다 (6.2 대 12.8)
3. **무관한 질문을 guard 로 함께 돌린다.** 손상 0.046 → 0.016 (65% 감소), 목표 이득은 거의 안 깎임
4. **평가 파이프라인을 실험 도중에 바꾸지 않는다.** 채점 기준이 같이 변하면 개선인지
   기준 변화인지 구분할 수 없다

## 이 계보가 빠뜨렸던 숫자

AuthTrace 코퍼스 860편 위키 구축에 **185.15M 토큰**, 문서당 약 21.5만 토큰.
[[systems/llm-wiki]] 는 194.00M 이다. 5월 시점에 계산할 수 없다고 적었던 손익분기를
자기 워크로드에 대입해 어림잡을 수는 있게 됐다.

다만 **비교 대상("위키 없이 같은 질문을 풀 때 드는 토큰")을 논문이 보고하지 않아서
손익분기는 여전히 계산할 수 없다.**

주의: [[findings/wiki-numbers-are-not-cross-comparable]] — 이 문서의 62.6 은 Qwen3.5-9B 다
