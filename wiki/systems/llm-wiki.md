---
type: system
aliases: [LLM-Wiki, Retrieval as Reasoning, agent-native retrieval]
tags: [RAG, wiki, multi-hop QA, WeChat]
identity: "arXiv:2605.25480v2"
sources: [documents/2026-08-05-llm-wiki-retrieval-as-reasoning]
code_available: false
confidence: high
last_verified: 2026-08-13
---

# LLM-Wiki

문서를 양방향 링크가 있는 마크다운 위키로 컴파일하고, agent 가 `wiki_search` ·
`wiki_read` 두 도구로 직접 순회하게 한 검색 시스템. WeChat, Tencent.

## 고정된 신원

`arXiv:2605.25480v2` · sha256 `ea85e814…` · **코드 공개 없음**

## 설정 (재현하려면 필요한 값)

| | |
|---|---|
| tool call 예산 `T_max` | 15 |
| 빈 검색 인내 `P` | 3회 연속 |
| `SelectPages` 선택 상한 `k` | 5 |
| Error Book 재검증 주기 | 컴파일 배치 10회마다 |
| 답변 모델 | GLM-5.1 (전 방법 통일) |
| 문항 수 | 벤치마크당 앞 500개 |

<!-- claim:c1 c2 c3 c4 -->

## 컴파일 결과물

원본 문단 3,440개 → 지식 페이지 5,825개(6개 주제 디렉터리) + 출처 페이지 6,840개.
<!-- claim:c6 c7 -->

페이지는 YAML frontmatter(type·aliases·tags), 한 줄 설명, Key Facts, 양방향 위키링크,
Related Sources 를 갖는다. **vector 도 triple 도 요약문도 아니고 사람이 열어 확인할 수
있는 파일 트리다.**

## 무엇이 성립하고 무엇이 안 하나

성립: [[findings/compile-and-traverse-are-a-set]]
주의: [[findings/wiki-numbers-are-not-cross-comparable]]

## 이 계보에서의 자리

LLM-Wiki (검색 방법) → [[systems/wikikv]] (저장 계층) → [[systems/wikiloop]] (구축 정책 학습).
셋 다 같은 팀, 셋 다 코드 비공개, 외부 재현 없음.

Karpathy 의 LLM Wiki gist 에서 갈라진 다른 갈래는 TencentDB Agent Memory 이고,
**두 갈래는 서로를 인용하지 않는다.** (이 라이브러리의 tencentdb 문서 ⑩장)
