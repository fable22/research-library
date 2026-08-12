---
type: system
aliases: [WikiKV, path-as-key, 계층형 지식베이스 저장 계층]
tags: [storage, key-value, production, WeChat]
identity: "arXiv:2606.14275"
sources: [documents/2026-08-05-wikikv-hierarchical-kb-storage]
code_available: false
confidence: medium
last_verified: 2026-08-13
---

# WikiKV

[[systems/llm-wiki]] 의 위키를 실제 서비스에서 굴리는 저장 계층. 검색 방법은
LLM-Wiki 것을 그대로 쓴다고 명시한다. **이 계보에서 유일하게 프로덕션 데이터가 있다.**

## 가져올 수 있는 것

- **path-as-key**: 페이지 경로를 키로 삼고 디렉터리 레코드에 자식 목록을 함께 담아
  디렉터리 나열이 스캔 없이 단일 점 조회가 된다 (`Ls(π) ≡ Get(π)`)
- **parent-after-child 쓰기 + skip-on-miss 읽기**: 읽기에 잠금 없이 부분 쓰기 상태를 막는다
- [[findings/schema-must-not-be-frozen]] — 이 문서에서 가장 옮겨 쓸 만한 결과

논문 스스로 "새 저장소가 아니라 점 조회와 접두사 스캔을 지원하는 어떤 백엔드 위에든
얹는 얇은 경로 인덱싱 계층"이라고 적는다. **도입 판단의 대상은 저장소가 아니라 키 인코딩 규약이다.**

## 프로덕션 수치

WeChat 공식계정 AI 어시스턴트, 실사용 1,000건 표본. 위키 도구 지연 평균 0.432초,
P99 0.966초. 전체 6.856초의 대부분은 LLM 생성이다. **검색은 병목이 아니다.**

사람 평가 2.86/3 (3인 블라인드, Krippendorff α=0.71).

## 받아들이면 안 되는 것

**배포는 정확도의 증거가 아니다.** 대조군이 없다. 같은 트래픽을 Dense RAG 로 처리했을
때의 사람 평가가 없으므로, 2.86 은 "쓸 만하다"의 근거이지 "다른 방식보다 낫다"의
근거가 아니다.

표 IV 에 HippoRAG 2 와 LightRAG 가 빠져 있다. 앞선 논문에서 가장 강한 baseline 이었던
상대를 뺀 비교다.

주의: [[findings/wiki-numbers-are-not-cross-comparable]]
