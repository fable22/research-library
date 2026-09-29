# 연구 보고서와 지식 라이브러리의 산출물·harness 조사

조사일: 2026-09-29. 대상은 research-library의 **문장 표현이 아니라, 무엇을 한 문서로 만들고 어떻게 읽게 하며 어떻게 축적·검증하는가**이다.

검토 범위: 사용자 지시에 따라 subagent 없이 같은 맥락에서 검토했다. 독립 reviewer 검증과 실제 화면 렌더링은 수행하지 못했으며, 자세한 범위는 마지막 절에 적었다.

## 결론 먼저

1. **단일 HTML은 유효한 배포 형식이다. 모든 연구를 슬라이드 덱으로 읽게 하는 선택은 재검토할 만하다.** 조사한 research agent의 최종 산출물에는 Markdown 장문, wiki article, 짧은 답변이 있고, 발표 도구는 덱, 데이터 도구는 notebook·dashboard를 만든다. 공식 web artifact skill과 Archify는 단일 HTML도 사용한다. 이 저장소가 바꿀 핵심은 파일 확장자보다 기본 독서 방식이다. 스스로 읽고 나중에 검색할 연구는 연속 문서로, 설명회·발표는 덱으로 제공하는 편이 목적에 맞는다. 이는 비교 관찰에 따른 제안이지, 덱의 열등함을 입증한 사용자 실험 결과는 아니다. [LangChain prompt][lc-prompt] · [Anthropic artifact][artifact] · [Archify skill][archify]

2. **이 저장소는 요약이 없는 것이 아니라, 서로 다른 연구 목적을 공통 장 구성과 슬라이드 문법에 많이 맞춘다.** 이미 TL;DR, 접기, 도식, 출처 coverage가 있다. 다만 논문 이해, OSS 도입 판단, 구현 추적을 같은 전개로 다루면 독자에게 필요한 핵심이 장별로 흩어질 수 있다. OpenAI의 research skill은 brief·summary·comparison·comprehensive report를 먼저 선택하고, LangChain은 질문에 따라 문서 구조를 바꾼다. 공통으로 강제할 것은 근거·한계·요약의 존재이고, 목차와 길이는 독자의 작업에 맞춰 달라져야 한다. [현재 작성 skill](../.claude/skills/research-doc/SKILL.md) · [OpenAI 형식 선택][notion-format] · [LangChain prompt][lc-prompt]

3. **지금 형태는 ‘연구 출판물 라이브러리’로 맞다. ‘누적 지식 베이스’까지 하려면 갱신되는 주제 페이지가 별도로 필요하다.** 날짜가 붙은 연구 문서와 고정한 evidence를 보존하는 방식은 당시 판단을 남기기에 좋다. 반면 LLM wiki와 DeepWiki 계열은 source·concept·entity·코드 구성요소를 연결하고 기존 페이지를 다시 쓴다. 보고서를 폐기할 이유는 없지만, 같은 개념을 다음 보고서에서 재설명하기만 하면 축적 효과가 약하다. 보존할 연구 스냅샷과 갱신할 주제 페이지를 연결하는 이중 구조가 적합하다. 라이브러리의 목표가 출판물 보관뿐이라면 wiki 도입은 선택 사항이다. [Karpathy 원문][karpathy] · [갱신/보존을 구분한 구현][astro] · [DeepWiki-Open][deepwiki]

4. **근거 관리에서는 이 저장소가 비교 대상 다수보다 명시적이다. 유명 agent의 보고서 형식을 통째로 따라가면 오히려 후퇴할 수 있다.** 이 저장소는 source identity, evidence, claim과 coverage를 구분한다. 반면 방문 URL 목록을 붙이는 구현도 있고, WebThinker의 report prompt는 아예 인용 불필요를 명시한다. source 수나 참고문헌의 존재는 주장 검증과 다르다. 기존 evidence 체계를 보존하면서 본문의 핵심 주장 가까이 근거를 연결하고, 사실 검증·독자 이해·화면 품질을 서로 다른 항목으로 평가하는 것이 낫다. [현재 조사 skill](../.claude/skills/research-source/SKILL.md) · [dzhng 구현][dzhng] · [WebThinker prompt][webthinker] · [DeepResearch Bench][bench]

5. **상위 프로젝트의 공통 정답이 ‘더 짧게’ 또는 ‘리뷰어를 더 많이’인 것은 아니다. 목적 선택과 검증 가능한 제작 과정이 더 유용한 기준이다.** 장문을 장려하는 agent도 있고 짧은 CLI 답변을 요구하는 agent도 있다. 다중 reviewer 구현은 실제로 있지만, Anthropic은 연구 시스템의 평가에서 단일 judge 호출이 사람 판단과 더 잘 맞았다고 설명한다. 이 저장소의 다음 개선은 리뷰 횟수 증대보다 독자가 읽고 할 수 있어야 하는 일을 먼저 정하고, 그 일을 찾을 수 있는지 시험하는 쪽이다. 별은 이러한 품질을 대신 평가하지 못한다. [GPT Researcher][gptr-prompt] · [Dexter][dexter] · [학술 스킬의 복수 리뷰][academic] · [Anthropic 연구 시스템][anthropic-research]

## 조사 기준과 현재 저장소에서 확인한 것

### 범위·재현 방법

웹 검색과 GitHub repository search를 함께 사용했다. GitHub API에서는 `deep research in:name,description stars:>5000`, `claude skills research in:name,description stars:>1000`, `llm wiki in:name,description stars:>500`을 별 내림차순으로 조회했다. 요청에 명시된 프로젝트는 별 수와 관계없이 포함했고, 일반 ML 라이브러리처럼 검색어만 일치하는 결과는 제외했다. 추가 research agent는 Khoj, Dexter, dzhng, Gemini quickstart, MiroThinker, nickscamara, Jina를 살폈다. **전 세계 사용량 순위나 누락 없는 별 순위는 아니다.**

별 수는 조사일에 직접 응답을 연 GitHub REST API의 `stargazers_count`다. 최근 커밋은 `pushed_at`이 아니라, 조사 시점 기본 브랜치 HEAD를 고정한 뒤 실제 Git commit 객체의 committer 날짜를 UTC로 환산했다. 표의 날짜 링크에 전체 SHA를 넣었고, 코드·prompt 링크도 읽은 SHA에 고정했다. 별은 계속 변하며, linked API의 미래 값이 여기 기록한 값과 같을 필요는 없다. API 제한 등으로 숫자를 확보하지 못한 항목은 **미확인**으로 남겼다.

[GitHub Monthly Trending][trending]도 열어 탐색에 사용했다. 다만 웹 도구가 제공한 것은 캐시된 화면이므로 조사일 실시간 순위라고 쓰지 않았다. 2025~2026의 구현·변경을 우선하되, STORM과 slide framework처럼 기원은 더 오래된 주요 프로젝트도 비교에 포함했다. 기본 브랜치 마지막 커밋은 release의 안정성, maintainer 응답 속도, 실제 기능 개발 빈도를 뜻하지 않는다.

‘코드/프롬프트에서 확인한 지시’, ‘README가 설명하는 기능’, ‘저장된 예제의 관찰’, ‘작성자의 제안’을 구분했다. 도구를 설치해 동일 질문으로 성능을 재측정하지 않았다. 아래의 검증 방식은 **구현 또는 지침의 존재**이지, 그 프로젝트의 모든 결과가 사실임을 보증한다는 뜻이 아니다.

### 이 저장소의 출발점

[AGENTS.md](../AGENTS.md), [research-source](../.claude/skills/research-source/SKILL.md), [research-doc](../.claude/skills/research-doc/SKILL.md), [research-verify](../.claude/skills/research-verify/SKILL.md), [가독성 진단](readability-diagnosis-2026-09-29.md), [Jev 문서](../research/2026-09-21-jev-system-one/index.html)를 읽었다.

| 항목 | 현재 확인한 상태 | 이번 조사에서 구분할 문제 |
|---|---|---|
| 배포 | 외부 의존성이 없는 한국어 단일 HTML; 공통 deck shell 존재 | 단일 파일의 장점과 슬라이드 단위의 제약은 별개다 |
| 전개 | `index`, `tl-dr`, `problem`, `critique`, `conclusion`, `sources` 필수; 그 외 장 구성 지침 | 모든 문서가 고정된 동일 장 수라는 뜻은 아니다. 공통 전개가 목적별 최적 구조인지가 쟁점이다 |
| 읽기 | 핵심 문장, 도식/표, `details.more`, 보충 note | 요약/접기가 이미 있다. 이를 처음 도입하자는 처방은 부정확하다 |
| 사례 | Jev HTML은 `p1`~`p31` 슬라이드, 두 번째에 TL;DR; 활성 슬라이드를 선택해 읽는 구조 | 긴 인과 설명과 근거를 연속해서 따라가거나 문서 전체를 훑는 경험을 별도로 확인해야 한다 |
| 축적 | 날짜별 출판물, tag/series와 목록, 같은 slug의 evidence | 연결이 전혀 없는 것이 아니다. ‘같은 개념의 최신 상태’를 유지하는 페이지와는 역할이 다르다 |
| 검증 | 조사·작성의 맥락을 유지하고, 완료 후 별도 관점의 reviewer로 검증 | 사실 감사와 읽기 경험을 각각 측정할 필요가 있다 |

가독성 진단은 일부 개선이 이미 반영되었다고 기록한다. 따라서 과거 진단을 현재 미구현 목록으로 다시 제시하지 않는다. 이 조사도 문장 교정이나 기존 문서 전면 개편을 수행하지 않는다.

## 프로젝트 비교표

표가 넓은 것은 요청한 비교 항목을 보존하기 위해서다. 서로 다른 종류의 별 수를 하나의 제품 순위로 합치지 않도록 묶음을 나눴다. **framework의 별은 그 framework를 이용한 agent의 별이 아니며, skill 모음의 별은 개별 skill의 사용량이 아니다.**

### Research agent와 최종 답변 시스템

| 프로젝트 · URL | 별 | 최근 커밋 · UTC | 산출물 형태 | 보고서 구조 요약 | 독자 설정 | 검증 방식 |
|---|---:|---|---|---|---|---|
| [GPT Researcher](https://github.com/assafelovic/gpt-researcher) | [29,760](https://api.github.com/repos/assafelovic/gpt-researcher) | [2026-09-26](https://github.com/assafelovic/gpt-researcher/commit/0957c301ed06c2a5857b834358c7227c739041d4) | Markdown 보고서·문서 export | 주제별 H2/H3, 참고문헌 | 질문·tone·분야 역할 | 선택적 reviewer/reviser 반복 [코드][gptr-editor] |
| [STORM / Co-STORM](https://github.com/stanford-oval/storm) | [31,526](https://api.github.com/repos/stanford-oval/storm) | [2025-09-30](https://github.com/stanford-oval/storm/commit/fb951af7744dab086e34962e9bc6fe878e145f83) | Wikipedia형 문서·대화/마인드맵 | outline → 절별 초안 → 앞쪽 lead | 연구 관점 persona, 대화 참여자 | 다관점 수집·인용·선택적 중복 제거 [코드][storm-lead] |
| [LangChain open_deep_research](https://github.com/langchain-ai/open_deep_research) | [12,680](https://api.github.com/repos/langchain-ai/open_deep_research) | [2026-08-10](https://github.com/langchain-ai/open_deep_research/commit/1b7d2e80db9faa586165c60e09096dbbfd483a64) | Markdown 최종 보고서 | 질문에 맞춘 가변 구조 + Sources | clarification → research brief | 조사 충분성 판단, 최종 작성 [프롬프트][lc-prompt] |
| [DeerFlow](https://github.com/bytedance/deer-flow) | [83,199](https://api.github.com/repos/bytedance/deer-flow) | [2026-09-28](https://github.com/bytedance/deer-flow/commit/8a3a309d1ce8bac8418251be29d4e4297a20c5eb) | 범용 harness: 보고서·HTML·슬라이드 등 | 2.x는 skill별; 1.x는 고정 reporter | task/skill별; 구버전 style 선택 | 계획·도구·skill 지침; 만능 사실 검사 아님 [코드][deer-research] |
| [Tongyi DeepResearch](https://github.com/Alibaba-NLP/DeepResearch) | [19,994](https://api.github.com/repos/Alibaba-NLP/DeepResearch) | [2026-02-27](https://github.com/Alibaba-NLP/DeepResearch/commit/f72f75d8c3eb842f2bbbab096a12206ff66e270f) | research QA 최종 답변 | answer 태그; 문서 목차 계약 없음 | 주어진 연구 질문 | 검색/읽기 도구; 인용 감사는 해당 prompt에 없음 [코드][tongyi] |
| [local-deep-research](https://github.com/LearningCircuit/local-deep-research) | [9,140](https://api.github.com/repos/LearningCircuit/local-deep-research) | [2026-09-29](https://github.com/LearningCircuit/local-deep-research/commit/96a5144542211bca49d67e9f8c4eeacab0598860) | 웹 UI·Markdown 보고서 | 목차 → Research Summary → 동적 절 | 기술/비즈니스/학술 주제 적응 | 검색·source index·참고문헌 정리 [코드][local] |
| [WebThinker](https://github.com/RUC-NLPIR/WebThinker) | [1,471](https://api.github.com/repos/RUC-NLPIR/WebThinker) | [2025-12-08](https://github.com/RUC-NLPIR/WebThinker/commit/db387eb3261de9b5e2db7d2d7fb20af2aceb7882) | QA 또는 Markdown 장문 article | 계획·절 작성·check/edit | 과학적 설명, 질문 중심 | 자기 점검; report prompt는 인용 불필요 명시 [코드][webthinker] |
| [Khoj](https://github.com/khoj-ai/khoj) | [37,532](https://api.github.com/repos/khoj-ai/khoj) | [2026-08-02](https://github.com/khoj-ai/khoj/commit/ae229ca894c0b80ad84664afcfdde523b5e87057) | 개인 자료 기반 chat/research | 질문별 답변·보고서 | 사용자 문체·개인 지식 | 노트/웹 출처 연결 [프롬프트][khoj] |
| [Dexter](https://github.com/virattt/dexter) | [27,626](https://api.github.com/repos/virattt/dexter) | [2026-09-23](https://github.com/virattt/dexter/commit/534f6be455523c5926eba72bdaf4f914555be5c9) | 금융 research CLI 답변 | 간결한 답, 제한적 표 | 투자/금융 질문자 | 도구 근거·분석 반복; 독립 리뷰 확인 안 됨 [코드][dexter] |
| [dzhng/deep-research](https://github.com/dzhng/deep-research) | [19,739](https://api.github.com/repos/dzhng/deep-research) | [2026-04-11](https://github.com/dzhng/deep-research/commit/1f8f3e285bbc23e80b98a66a64effab9069f3ad4) | Markdown 보고서 또는 짧은 답 | 학습 내용 종합 + Sources | feedback/사용자 질문 | 재귀 검색, 방문 URL 첨부 [코드][dzhng] |
| [Gemini LangGraph quickstart](https://github.com/google-gemini/gemini-fullstack-langgraph-quickstart) | [18,338](https://api.github.com/repos/google-gemini/gemini-fullstack-langgraph-quickstart) | [2025-06-18](https://github.com/google-gemini/gemini-fullstack-langgraph-quickstart/commit/e34e569de465340e42f36cd3cab4fac0c3ce7036) | 검색 근거가 있는 웹 chat | reflection 이후 최종 답변 | 사용자 질문 | 정보 부족 reflection·grounding citations [코드][gemini] |
| [MiroThinker](https://github.com/MiroMindAI/MiroThinker) | [8,428](https://api.github.com/repos/MiroMindAI/MiroThinker) | [2026-03-23](https://github.com/MiroMindAI/MiroThinker/commit/1c4253f6774bf40314271a827304b842100e054c) | agentic QA·내부 조사 보고 | 최종 답과 하위 agent 보고 분리 | benchmark/문제 풀이 중심 | 검색·브라우징; 최종 문서 감사 계약 미확인 [코드][miro] |
| [nickscamara/open-deep-research](https://github.com/nickscamara/open-deep-research) | [6,292](https://api.github.com/repos/nickscamara/open-deep-research) | [2025-05-07](https://github.com/nickscamara/open-deep-research/commit/eea0962c8be343230d9571cbdeb82df12504ad72) | 웹 chat의 장문 분석 | 핵심 발견·통찰·결론·불확실성 | 질문자 | 조사 gap 분석·추가 조사 [코드][nick] |
| [Jina node-DeepResearch](https://github.com/jina-ai/node-DeepResearch) | [5,231](https://api.github.com/repos/jina-ai/node-DeepResearch) | [2026-05-01](https://github.com/jina-ai/node-DeepResearch/commit/fd323b521a51264d497bec333bfb997da1bf3210) | 인용 각주가 있는 답변 | 질문 맞춤 답 + numbered footnotes | 질문자 | evaluator feedback, 인용 형식 복구 [코드][jina-eval] |

LangChain 저장소는 조사 시점 API에서 **archived**였다. DeerFlow의 현행 기본 브랜치는 범용 harness이며, 과거 report pipeline은 별도 `main-1.x` 브랜치에 있다. 아래에서 두 버전을 섞지 않는다. MiroThinker와 Tongyi를 범용 출판 보고서 generator로 간주하는 것도 잘못이다. 이들은 research QA·모델/agent 연구라는 성격이 강하고, 최종 답변 계약이 장문의 보고서 계약과 다르다. [DeerFlow README][deer] · [Miro prompt][miro] · [Tongyi prompt][tongyi]

### 파일·슬라이드·HTML·분석 산출물

| 프로젝트 · URL | 별 | 최근 커밋 · UTC | 산출물 형태 | 보고서 구조 요약 | 독자 설정 | 검증 방식 |
|---|---:|---|---|---|---|---|
| [Anthropic skills](https://github.com/anthropics/skills) | [178,897](https://api.github.com/repos/anthropics/skills) | [2026-09-29](https://github.com/anthropics/skills/commit/8a1541c4a3ffa5a20a5a91de0dcf3f0bab1d1ef4) | DOCX/PPTX/PDF/HTML | 형식별 제작; coauthoring은 별도 | 문서 유형·대상·효과 intake | 파일/화면 QA, 새 독자 테스트 [스킬][coauthor] |
| [OpenAI skills](https://github.com/openai/skills) | [27,800](https://api.github.com/repos/openai/skills) | [2026-06-24](https://github.com/openai/skills/commit/49f948faa9258a0c61caceaf225e179651397431) | Notion 문서·notebook 등 | brief/summary/comparison/report 분기 | 결정·요약·계획 등 목적 | 출처·모순 표시, notebook 실행 확인 [스킬][notion] |
| [Presenton](https://github.com/presenton/presenton) | [10,840](https://api.github.com/repos/presenton/presenton) | [2026-09-29](https://github.com/presenton/presenton/commit/0449eaa7c9acf7fc0d4ce68b4787fea484c024af) | 편집 가능한 PPTX·PDF | slide outline → 구성 → 시각화 | 업무 발표·교육 등 사용자 요청 | 사용자 outline/편집 흐름 [코드][presenton-outline] |
| [Slidev](https://github.com/slidevjs/slidev) | [48,872](https://api.github.com/repos/slidevjs/slidev) | [2026-09-16](https://github.com/slidevjs/slidev/commit/30a0a54c8739b4b395d9b336a6304cc8ebcc3947) | Markdown/Vue 덱 | 슬라이드·코드·발표자 노트 | 개발자 발표/강의 | 프레임워크; 연구 사실 검증 아님 [스킬][slidev] |
| [Marp](https://github.com/marp-team/marp) | [12,573](https://api.github.com/repos/marp-team/marp) | [2026-07-29](https://github.com/marp-team/marp/commit/aaac2347ec65cd835c0ccd90ba3d866c9a75cb07) | Markdown → HTML/PDF/PPTX | 페이지별 Markdown | Markdown 작성자/발표자 | 변환 도구; 조사 agent는 별도 [README][marp] |
| [reveal.js](https://github.com/hakimel/reveal.js) | [72,357](https://api.github.com/repos/hakimel/reveal.js) | [2026-09-18](https://github.com/hakimel/reveal.js/commit/f8c9ec3bb3b288e061b166fba5e4975920dd5cd4) | 웹 프레젠테이션·scroll view | 슬라이드/세로 읽기 모드 | 발표·웹 콘텐츠 | 프레임워크; 근거 검증 아님 [문서][reveal-scroll] |
| [agentic-presentation-builder](https://github.com/neuromechanist/agentic-presentation-builder) | [1](https://api.github.com/repos/neuromechanist/agentic-presentation-builder) | 미확인 | reveal.js 기반 덱 | 구조화된 콘텐츠 → presentation | 발표 제작 | agent wrapper; 실제 품질 검증 미확인 [README][agent-slides] |
| [Archify](https://github.com/tt-a1i/archify) | 미확인 | [2026-09-29](https://github.com/tt-a1i/archify/commit/69cf672087289033af5138648d3875d3d73fc431) | 단일 HTML interactive diagram | 코드 근거 → 구조화 graph → 탐색 화면 | 아키텍처 이해/리뷰 | 구조 검증·browser check·선택적 시각 리뷰 [스킬][archify] |
| [Actionbook deep-research](https://github.com/actionbook/actionbook) | 미확인 | [2026-09-08](https://github.com/actionbook/actionbook/commit/0e31254cc10a1fe0b57faa318ac0823500f42a40) | JSON → HTML report | 주제 route → 조사 → report UI | 논문/URL/일반 주제 | 브라우저 원문 조사; claim 검증 보장 없음 [스킬][actionbook] |
| [Data Formulator](https://github.com/microsoft/data-formulator) | [17,479](https://api.github.com/repos/microsoft/data-formulator) | [2026-08-15](https://github.com/microsoft/data-formulator/commit/5477f0e236426dc8f74a498ec400414fba7fbc0f) | 데이터 탐색·차트·보고서 | 질문/분석 thread → 시각화 재사용 | 데이터 분석자 | 데이터/변환/시각화 상호 검토 [README][dataform] |

### Claude Code / Codex skill과 plugin 생태계

| 프로젝트 · URL | 별 | 최근 커밋 · UTC | 산출물 형태 | 보고서 구조 요약 | 독자 설정 | 검증 방식 |
|---|---:|---|---|---|---|---|
| [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | [75,812](https://api.github.com/repos/ComposioHQ/awesome-claude-skills) | [2026-07-24](https://github.com/ComposioHQ/awesome-claude-skills/commit/be2a406907dbc61b73e6827ded415c96139d13a2) | 스킬 모음; research writer | hook/outline → 절별 작성 → feedback | 독자·목표·길이·문체 | 인용/편집 협업 지침 [스킬][composio] |
| [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | [35,010](https://api.github.com/repos/VoltAgent/awesome-agent-skills) | [2026-09-28](https://github.com/VoltAgent/awesome-agent-skills/commit/ed106e8edc7c6d04fe3aedcbfaed1b43247f56a7) | agent 공통 스킬 카탈로그 | 개별 스킬에 따라 다름 | 개별 스킬에 따라 다름 | 목록 등재는 평가 인증 아님 [README][volt] |
| [scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) | [47,058](https://api.github.com/repos/K-Dense-AI/scientific-agent-skills) | [2026-09-28](https://github.com/K-Dense-AI/scientific-agent-skills/commit/065b734670d7d990627dbc06a05b5a99be33f1f1) | 문헌 리뷰·시장 보고서 등 | 질문 → 근거 → 종합 → 보고 | 학술/의사결정별 분기 | DOI 확인; 시장 보고서는 claim ledger [스킬][market] |
| [academic-research-skills](https://github.com/Imbad0202/academic-research-skills) | [49,842](https://api.github.com/repos/Imbad0202/academic-research-skills) | [2026-09-29](https://github.com/Imbad0202/academic-research-skills/commit/96a442eb2b4ed29ce6746348714f9632efcf2163) | 학술 report/brief/paper review | full/quick 등 모드별 계약 | 연구자·학술 독자 | 복수 reviewer + 수정 라운드 [스킬][academic] |
| [ECC](https://github.com/affaan-m/ECC) | [269,230](https://api.github.com/repos/affaan-m/ECC) | [2026-09-28](https://github.com/affaan-m/ECC/commit/d3b8a3e908904e242ed2dbe66af62cca71131419) | 범용 coding harness의 research skill | 요약 → 주제 → takeaways → 출처 → 방법 | 학습/결정/글쓰기 먼저 확인 | 교차 확인·단일 출처 표시 [스킬][ecc] |
| [Claude plugins community](https://github.com/anthropics/claude-plugins-community) | 미확인 | [2026-08-24](https://github.com/anthropics/claude-plugins-community/commit/a727be1c7bd6064419b6f60d71993a19198adc17) | 공식 community 배포 mirror | 개별 plugin별 | 개별 plugin별 | 등록 심사/security scan; 보고서 정확도 인증 아님 [README][community] |

### Wiki·노트·누적 지식

| 프로젝트 · URL | 별 | 최근 커밋 · UTC | 산출물 형태 | 보고서 구조 요약 | 독자 설정 | 검증 방식 |
|---|---:|---|---|---|---|---|
| [DeepWiki-Open](https://github.com/AsyncFuncAI/deepwiki-open) | [18,097](https://api.github.com/repos/AsyncFuncAI/deepwiki-open) | [2026-09-03](https://github.com/AsyncFuncAI/deepwiki-open/commit/d92819a9c9f3b99416e3580ff235fc9d3adf8b89) | 저장소 wiki·diagram·RAG chat | 개요/아키텍처/구성요소 페이지 | 코드 이해·구현·온보딩 | 코드 출처 참조; 사실 자동 보증 아님 [README][deepwiki] |
| [obsidian-skills](https://github.com/kepano/obsidian-skills) | [48,992](https://api.github.com/repos/kepano/obsidian-skills) | [2026-09-15](https://github.com/kepano/obsidian-skills/commit/3ccff5338ea700537839b21900aa5358a0402c98) | Markdown note·Canvas·Bases | 문서/블록 링크, 속성, 접는 callout | 개인 지식 사용자 | 형식·vault 조작 스킬 [스킬][obsidian] |
| [Logseq](https://github.com/logseq/logseq) | [45,080](https://api.github.com/repos/logseq/logseq) | 미확인 | 페이지·블록/노드 graph | outliner·참조·query | 개인 지식 사용자 | MCP 연동 존재; 검증 정책은 agent별 [문서][logseq-db] |
| [Open Notebook](https://github.com/lfnovo/open-notebook) | [39,612](https://api.github.com/repos/lfnovo/open-notebook) | [2026-09-12](https://github.com/lfnovo/open-notebook/commit/3127f14ea9dbb519f0e4ddc64a0742ca644ba6ef) | source/note/insight 기반 workspace | 자료 묶음 → 질문/노트/변환 | 여러 자료를 읽는 연구자 | 답변에서 source/note/insight 식별자 [코드][open-notebook-cite] |
| [llm_wiki](https://github.com/nashsu/llm_wiki) | [20,066](https://api.github.com/repos/nashsu/llm_wiki) | [2026-09-28](https://github.com/nashsu/llm_wiki/commit/48fd970e206a02a6d2028d1dbfc41b7a0345bf0b) | 로컬 Markdown wiki 앱 | raw → 연결된 페이지 → 질문/갱신 | purpose.md에 목표/질문 | 출처 추적·변경 감지·review 흐름 [README][nashsu] |
| [llm-wiki-agent](https://github.com/SamurAIGPT/llm-wiki-agent) | [3,588](https://api.github.com/repos/SamurAIGPT/llm-wiki-agent) | [2026-09-28](https://github.com/SamurAIGPT/llm-wiki-agent/commit/572c8eb06e7226567e55a9f186c0860d755a0d51) | coding agent용 wiki skill | index/log + source/concept/entity | 개인 지식 사용자 | ingest/query/lint 지침 [README][samurai] |
| [llm-wiki-compiler](https://github.com/atomicstrata/llm-wiki-compiler) | [2,150](https://api.github.com/repos/atomicstrata/llm-wiki-compiler) | [2026-09-29](https://github.com/atomicstrata/llm-wiki-compiler/commit/30f86ddc1c3b92fddb5051cd875973fee6da164e) | 컴파일되는 Markdown wiki | source → 개념/종합, stale refresh | 지식 작업별 profile | review gate·provenance, 실행 효과는 미검증 [README][compiler] |
| [claude-obsidian](https://github.com/AgriciDaniel/claude-obsidian) | [15,287](https://api.github.com/repos/AgriciDaniel/claude-obsidian) | [2026-09-10](https://github.com/AgriciDaniel/claude-obsidian/commit/32ac5a02c4e082e4a5628ca810776375e134708e) | source/claim ledger + 연결 노트 | capture → ground → connect → reuse | 개인 vault 사용자 | 검토 상태·모순·갱신 기록 [README][claude-obsidian] |
| [karpathy-llm-wiki 구현](https://github.com/Astro-Han/karpathy-llm-wiki) | [2,383](https://api.github.com/repos/Astro-Han/karpathy-llm-wiki) | [2026-07-23](https://github.com/Astro-Han/karpathy-llm-wiki/commit/eafcc77001e496cc43499e4923b663aec722c813) | raw/wiki/archive | 기존 개념 갱신, archive 보존 | 누적 지식 사용자 | source-grounding·영향 페이지 확인 [스킬][astro] |

## 최종 보고서 프롬프트에서 실제로 요구하는 것

아래 따옴표는 해당 파일의 짧은 원문 인용이다. ‘없음/미확인’은 읽은 최종 작성 prompt 또는 generator에서 공통 규정을 찾지 못했다는 뜻이며, 제품의 모든 경로를 조사했다는 뜻은 아니다. 내부 search summary, 하위 agent의 조사 결과, 최종 사용자 보고서를 구분했다.

| 프로젝트 | 섹션 순서·TL;DR 위치 | 인용 표시 | 길이 기본값·독자 설정·실제 지시 |
|---|---|---|---|
| GPT Researcher | 제목과 주제별 H2/H3; 공통 TL;DR 위치 없음; 목차 작성 금지 | 문장/문단 근처 APA형 hyperlink, 마지막 참고문헌 | 기본 config `TOTAL_WORDS=1200`을 작성 호출에 전달. 함수 signature의 일반 1000/deep 2000과 혼동하면 안 된다. 상한이 아니라 최소 분량에 가까운 지시이며 “You should strive to write the report as long as you can”. tone/언어/분야 agent 설정이 독자 과업 설정과 동일하지는 않다. [prompt][gptr-prompt] · [config][gptr-config] · [호출][gptr-runtime] |
| STORM / Co-STORM | 질문과 outline에서 절 구성; 작성 후 lead를 문서 앞에 붙임 | `[1]` 등의 inline 번호. 절 작성에는 별도 References/Sources 절을 넣지 않도록 지시 | lead는 “no more than four well-composed paragraphs”. 읽은 모듈에서 전체 문서 공통 word cap은 미확인. persona는 취재 관점이며 독자 persona와 다르다. Co-STORM은 인간이 대화에 참여할 수 있다. [lead][storm-lead] · [절 생성][storm-article] · [설명][storm] |
| LangChain open_deep_research | 비교/목록/개요/단답에 따라 달라짐. 목록형은 도입·결론 생략 가능; Sources는 끝 | 연결된 출처와 순차적인 `[n]`; 최종 `### Sources` | 고정 분량 대신 충분히 자세하게; “Section is a VERY fluid and loose concept.” 질문 확인과 research brief에서 요구를 정한다. 문단 중심이며 모든 내용을 bullet로 쓰지 않도록 지시한다. [prompt][lc-prompt] |
| DeerFlow 1.x | Title → Key Citations → Key Points → Overview → Detailed Analysis → 선택적 Survey Note; 말미 references 지침도 존재 | 제공된 URL만 사용; `[[n]](#ref-n)`로 source index 연결 | Key Points 4~6개, Overview 1~2문단. 일반 길이 상한 없음. academic/popular science/news/social media/investment style로 대상 조정. 투자 style에만 10,000~15,000 words minimum이라는 매우 긴 요구가 있다. 이를 전체 기본값으로 읽으면 안 된다. [legacy reporter][deer-legacy] |
| DeerFlow 2.x | 범용 deep-research skill 자체에 단일 최종 목차 없음. GitHub 전용은 저장소 정보 → Executive Summary → 연혁 → 분석 → 구조 → 영향/비교 → 장단점 → 출처·신뢰·방법 | GitHub template은 `[citation:Title](URL)` | skill 선택에 따라 달라진다. 별 수만 보고 1.x reporter가 현행 기본이라고 인용해서는 안 된다. [일반 skill][deer-research] · [GitHub template][deer-repo] |
| Tongyi DeepResearch | 고정 섹션·TL;DR·참고문헌 계약 없음 | 읽은 system prompt에 inline citation 형식 없음 | “enclose the entire final answer within <answer></answer> tags.” 도구를 이용한 조사 답변이며 문서 길이/독자 preset은 이 prompt에서 미확인. [prompt][tongyi] |
| local-deep-research | 목차 → Research Summary → 주제별 절 → 출처 정리. Summary라는 이름이 실제 핵심 발견 요약을 보장하지 않음 | source index를 사용하는 인용, 절별 중복 bibliography 정리 | “Determine the most appropriate detailed report structure”. 주제에 따라 기술/비즈니스/학술 구조를 고른다. 읽은 generator에서 전체 word cap 미확인. Research Summary의 기본 문장은 조사 방식 소개에 가깝다. [generator][local] |
| WebThinker | report outline을 만든 뒤 절 작성·check·edit; 공통 TL;DR 없음 | “No need to mention citations or references.” | 충분히 전개된 문단과 Markdown 표를 지시. 보고서 자체 검토 도구는 있으나, 출처가 독자에게 전달되는 계약은 약하다. [report prompt][webthinker] |
| Khoj | 질문별 답변; report 경로는 제목과 구획 사용, 공통 고정 목차 없음 | 사용자 문서/웹을 참조하는 numbered links | “tuned to the user's communication style”. 개인 자료·대화 맥락을 이용한다. 읽은 prompt에서 전체 공통 word budget은 미확인. [prompt][khoj] |
| Dexter | 금융 질문에 직접 답하는 CLI 형식; TL;DR이라는 별도 절 없음 | 도구로 얻은 자료에 근거하는 답변; 읽은 최종 지침에서 통일된 학술 bibliography 형식은 미확인 | “Do not use markdown headers”. 간결한 문장, 필요한 비교에만 작은 표. 보고서는 무조건 길어야 한다는 가정의 반례다. [prompt][dexter] |
| dzhng/deep-research | 연구 learnings 종합 → `Sources`에 방문 URL 추가 | URL 목록은 자동 첨부되지만 주장별 매핑을 보장하지 않음 | report는 “aim for 3 or more pages”. 별도 answer 경로는 아주 짧은 답을 요구한다. 페이지를 정밀한 word cap으로 환산할 수는 없다. [작성 함수][dzhng] |
| Gemini LangGraph quickstart | query → search → reflection → final answer; 고정 보고서 목차 없음 | 최종 prompt가 Markdown source links 요구 | “Include the sources you used from the Summaries”. 질문에 맞는 답변이며 길이/독자 preset은 읽은 prompt에서 미확인. [prompt][gemini] |
| MiroThinker | 최종 답변과 browsing 하위 agent의 상세 보고서를 구분 | 최종 답변 prompt에서 보고서 인용 양식 미확인 | “Wrap your final answer in \boxed{}.” 짧고 분명한 답을 요구하는 경로가 있다. 내부 상세 보고서 지침을 최종 보고서 양식으로 인용하면 오독이다. [prompt][miro] |
| nickscamara/open-deep-research | 연구 발견·통찰·결론·불확실성을 포함하는 최종 분석; 세부 목차 유동 | 적절한 citation을 지시 | “It is expected to be very long, detailed and comprehensive.” 수치화된 상한은 읽은 final-analysis prompt에 없음. [API route][nick] |
| Jina node-DeepResearch | 질문 맞춤 답변 → 평가 feedback → 개선 | `[^n]` 각주와 URL/인용문 처리; 형식 복구 함수 존재 | “Follow reviewer's feedback and improve your answer quality.” freshness/completeness 등의 필요성을 질의별로 판단한다. 독립된 학술 목차나 전체 word cap은 해당 코드에서 미확인. [agent][jina] · [평가][jina-eval] · [각주 처리][jina-cite] |

여기서 얻을 수 있는 결론은 **길고 짧음의 업계 단일 표준이 없고, research QA와 출판 문서를 먼저 구분해야 한다**는 것이다. 길이 기본값이 존재해도 대부분 prompt상의 목표이며 runtime의 강제 상한이 아니다. 한국어 문서에 영어 word budget을 그대로 옮기는 것도 별도 검증이 필요하다.

## 보고서·슬라이드·HTML을 고르는 기준

### 파일 형식별 공식 skill은 서로 다른 사용 목적을 전제한다

Anthropic의 `docx`는 편집 가능한 문서, 스타일·제목·목차·변경 이력 같은 문서 기능을 다룬다. `pptx`는 발표 장면에서 보이는 구성과 slide별 layout/overflow를 다룬다. `pdf`는 읽기·생성·변환 등 고정된 페이지 형식을 다룬다. `web-artifacts-builder`는 웹 UI를 구성한 다음 single HTML로 묶는다. **이 skill들은 하나의 정해진 연구 보고서 목차를 서로 다른 확장자로 내보내는 규약이 아니다.** 형식이 제공하는 편집·배포·상호작용의 차이에 대응한다. [DOCX][docx] · [PPTX][pptx] · [PDF][pdf] · [HTML][artifact]

`doc-coauthoring`은 이보다 앞 단계에서 문서 유형, 독자, 기대 효과, template을 확인한다. 맥락 수집 → 구조와 내용 정리 → 새로운 독자의 질문 테스트로 진행한다. 요약을 **작성하는 순서**는 뒤일 수 있지만, 독자가 **읽는 위치**는 앞일 수 있다. 이 구분은 이 저장소에도 유용하다. 처음부터 슬라이드별 결론을 채우기보다 논증을 완성한 뒤 앞부분을 압축할 수 있다. [coauthoring skill][coauthor]

OpenAI의 Notion research skill도 모든 작업을 하나의 장문 report로 만들지 않는다. quick brief는 200~400 words, 기본 research summary는 500~1000, comparison은 800~1200, comprehensive report는 1500+라는 가이드를 둔다. 앞의 요약은 독립적으로 이해 가능해야 하고, 핵심 근거 바로 뒤에 citation을 붙인다. 이 수치는 해당 skill의 작성 가이드이지 모든 Codex 출력의 상한이 아니다. [형식 가이드][notion-format]

### 덱은 실제로 널리 쓰이지만, 발표 프레임워크와 연구 agent를 구별해야 한다

Presenton은 outline과 시각 구성을 거쳐 사용자가 편집할 PPTX/PDF를 만든다. outline prompt의 concise/default/text-heavy는 각각 slide당 20/40/60 words를 요구한다. **이는 최종 발표물 전체 분량이나 실제 각 slide의 강제 상한이 아니라 outline 단계의 목표**다. title은 기본 포함, table of contents는 기본 미포함이다. 사람이 내용을 조정할 수 있는 파일을 내는 것이 제품의 중요한 선택이다. [outline 코드][presenton-outline] · [제품 설명][presenton]

Slidev의 공식 skill은 기술 발표, 코드 설명, 강의 같은 용도와 연결된다. Markdown/Vue 원본, 발표자 노트, 코드 표현을 함께 쓴다. Marp는 Markdown에서 여러 발표 형식으로 변환하며, reveal.js는 웹 발표와 scroll view를 제공한다. 따라서 ‘HTML이면 반드시 한 장씩 넘겨야 한다’는 제약은 없다. 실제 agent 사례로는 Marp/Slidev 등을 지원하는 community `presentation-kit`, reveal.js를 이용한 `agentic-presentation-builder`도 확인했다. 후자는 조사 시점 별이 1개였다. 이를 reveal.js의 큰 별 수와 합쳐 성숙한 research agent로 평가해서는 안 된다. [Slidev skill][slidev] · [Marp][marp] · [reveal scroll][reveal-scroll] · [presentation-kit][presentation-kit] · [agent builder][agent-slides]

### HTML·notebook·dashboard는 독자가 해야 하는 행동이 다르다

Archify는 코드를 읽어 source evidence와 구조화된 graph를 만든 뒤, 탐색 가능한 단일 HTML로 전달한다. 독자는 정해진 장 순서 대신 관계를 따라 노드와 근거를 확인한다. 이것은 이 저장소의 offline HTML 방향을 지지하는 사례지만, 연구를 모두 graph로 바꾸자는 근거는 아니다. Actionbook의 deep-research skill은 논문·URL·일반 주제를 분기하고 조사 결과를 JSON에서 HTML report UI로 만든다. 제공된 sample JSON은 화면 예시이며, 사실 검증을 마친 실측 보고서라고 확인하지 않았다. 보기 좋은 카드 배치와 근거의 신뢰성은 별개의 문제다. [Archify][archify] · [Actionbook skill][actionbook] · [sample JSON][actionbook-sample]

Data Formulator는 데이터를 변환하고 차트를 비교하는 분석 thread를 재사용해 보고서를 구성한다. Jupyter notebook skill은 experiment와 tutorial을 구분하고, 설명과 실행 가능한 작은 코드 조각을 함께 둔다. Open Notebook은 source·note·insight를 중심으로 자료를 묶고 질문한다. 이들은 읽기만 하는 완결된 원고보다 **분석을 재현하거나 질문을 이어가는 작업 공간**이다. 구현 재현이 목적일 때는 이런 산출물을 별도로 연결하는 것이 슬라이드에 코드를 길게 넣는 것보다 적합할 수 있다. [Data Formulator][dataform] · [notebook skill][notebook] · [Open Notebook][open-notebook]

## Research·writing skill과 plugin: 무엇이 실제 관행인가

| 사례 | 확인한 작성 방식 | 이 저장소와 비교할 지점 |
|---|---|---|
| Composio `content-research-writer` | 독자·목표·길이·문체를 확인하고 outline, 절별 작성, feedback을 반복 | 완성품 모양보다 글의 목적과 저자의 관여를 먼저 정한다. 모든 연구가 학술 보고서일 필요는 없다. [skill][composio] |
| K-Dense `literature-review` | 질문, 검색, 선별, 추출, 주제별 종합, 인용 확인, Markdown/PDF | 논문별 요약 나열보다 주제별 합성이 중심이다. DOI script는 서지·URL 검증이지 주장 진위 확인이 아니다. [skill][literature] · [script][doi-check] |
| K-Dense `market-research-reports` | 독자와 결정, source/claim ledger, 단위·분모·기간, 근거에 맞는 구조 | 고정된 장 수·길이·시각 자료 개수를 요구하지 않는다. 같은 bundle 안에서도 literature-review와 시각화 규정이 다르다. [skill][market] |
| `academic-research-skills` | full/quick/brief/paper-review/literature-review/fact-check 등의 작업 분기, 학술 report compiler | paper reading·review와 일반 briefing을 분리한다. full은 abstract부터 references/appendix까지 학술 구조, quick은 앞쪽 Executive Summary를 둔다. [research skill][academic] · [compiler][academic-compiler] |
| ECC `deep-research` | 학습·결정·글쓰기 목적을 먼저 확인; 앞쪽 요약, 주제별 분석, 핵심 사항, 출처, 방법 | 짧은 결과는 대화, 긴 것은 파일로 전달한다. research 기능은 거대한 coding harness 중 일부다. [skill][ecc] |
| DeerFlow `github-deep-research` | repo 정보, 요약, 연혁, 구조, 비교, 장단점, 근거·신뢰·방법 | OSS 분석은 chronology/architecture/도입 판단을 조합할 수 있다. 모든 절을 모든 repo에 강제할 필요가 있다는 뜻은 아니다. [template][deer-repo] |
| OpenAI `notion-research-documentation` | brief·summary·comparison·report를 선택하고 source와 함께 기존 page 갱신 | 문서 선택과 갱신이 작성 workflow에 들어 있다. [skill][notion] |

마켓과 후기에서 확인할 수 있는 신호의 수준도 다르다. awesome 목록의 등재는 구현을 찾는 데 유용하지만 정확도 평가 결과는 아니다. Anthropic의 community plugin 저장소는 심사·security scanning을 거친 배포 mirror라고 설명한다. 그 심사를 research 보고서의 사실성 인증으로 읽을 수 없다. [VoltAgent 카탈로그][volt] · [community README][community]

skills.sh에서 연 DeerFlow deep-research 페이지는 **2.6K installs**, Actionbook 페이지는 **154 installs**를 표시했다. 이 값은 열어 본 캐시 페이지의 표시값이며, API로 읽은 별 수와 시점도 다르다. 설치 표시는 활성 사용자, 작업 성공률, 보고서 품질을 뜻하지 않는다. [DeerFlow 페이지][installs-deer] · [Actionbook 페이지][installs-action]

사용 후기는 보조 근거로만 사용했다. LocalLLaMA의 비교 글에는 설치 난이도와 출처/답변 품질의 편차에 대한 사용 경험이 있고, Claude community 글에는 scientific skill 추천이 있다. 그러나 동일 모델·예산·질문을 통제한 비교가 아니며 실제로 실행했는지도 독립 검증하지 않았다. Obsidian community에는 LLM wiki의 초기 효용을 높게 보는 의견과, 시간이 지나며 파일이 너무 늘어 활용성이 떨어졌다는 의견이 함께 있었다. 이는 유지 비용을 시험해야 할 이유이지 특정 제품의 우열이나 실패율을 계산할 자료는 아니다. [research 도구 후기][review-research] · [skill 추천 글][review-skills] · [wiki 사용자 토론][review-wiki]

공식 OpenAI 글은 skill을 평가할 때 최종 artifact만이 아니라 실행 과정·검사·요구 준수도 보도록 설명하며, 최근 skill 설계 글은 필요한 세부 지침을 작업에 맞춰 불러오는 구조를 논한다. 이 저장소에서도 공통 evidence 규칙은 유지하고, 목적별 작성 지침을 나누는 근거로 삼을 수 있다. 특정 글의 조언이 한국어 연구 덱에 효과가 있는지는 별도 시험이 필요하다. [skill eval][openai-evals] · [skill 설계][openai-skills]

## 라이브러리와 wiki는 문서의 수명과 단위가 다르다

Karpathy의 원문은 특정 제품 소개가 아니라 LLM으로 유지하는 wiki의 제안이다. 원자료를 보존하고, entity·concept·비교·종합 페이지를 갱신하며, index와 변경 기록을 유지한다. 질의의 결과는 Markdown 설명, 표, deck, chart 등으로 만들 수 있고 필요한 것은 다시 wiki에 반영한다. 핵심 단위는 완결된 덱 한 편이 아니라 **다음 자료가 들어왔을 때 다시 참조하고 고칠 페이지**다. 사람은 어떤 자료를 넣고 무엇을 중요하게 볼지 계속 관여한다. [Karpathy 원문][karpathy]

| 방식 | 기본 단위 | 상호 링크 | 갱신·보존 방식 |
|---|---|---|---|
| 현재 research-library | 날짜가 있는 논문/OSS 연구 출판물과 evidence | 문서 URL, tag/series, 본문 연결 | 특정 source 상태에 대한 판단 보존에 적합; 주제별 최신 종합은 별도 정책이 필요 |
| Karpathy wiki 계열 | raw source, entity, concept, synthesis page | wikilink, index, source backlink | 새 source가 기존 페이지를 바꾸고, 모순·누락·오래된 내용을 점검 [원문][karpathy] |
| DeepWiki 계열 | repository 개요·subsystem·component 페이지 | page navigation, code reference, diagram | 코드와 설명을 연결; 업데이트 주기·보존 계약은 구현/서비스별로 확인해야 함 [OSS README][deepwiki] |
| Obsidian skill 계열 | Markdown note, heading/block, property | wikilink·embed·Canvas·Bases | 기존 vault 파일을 읽고 수정; 그 자체로 출처 검증이 자동화되지는 않음 [skill][obsidian] |
| Logseq와 MCP | page와 block/node, graph | 페이지/블록 참조, query | DB version도 있으므로 전부 Markdown 파일 기반이라고 일반화하면 안 됨. MCP로 읽기/쓰기 가능 [DB 문서][logseq-db] · [연동 구현][logseq-mcp] |
| Open Notebook | source·note·insight·notebook 묶음 | 답변에서 각 객체 식별자를 참조 | 원자료를 유지하며 대화·요약·파생 결과를 덧붙임 [설명][open-notebook] · [인용 prompt][open-notebook-cite] |

구현들도 동일하지 않다. nashsu의 앱은 목적과 질문을 `purpose.md`로 드러내고 source 변경을 감지하는 흐름을 설명한다. SamurAI 구현은 coding agent가 사용할 index·log·개념 페이지 규약에 가깝다. compiler 구현은 review와 stale refresh를 명령으로 노출한다. claude-obsidian은 source와 claim ledger, 모순과 review 상태를 갖는 누적 구조를 설명한다. 이 기능들의 실제 정확도·규모 한계는 실행해서 측정하지 않았다. [nashsu][nashsu] · [SamurAI][samurai] · [compiler][compiler] · [claude-obsidian][claude-obsidian]

특히 Astro-Han 구현은 새 자료를 new/update/disputed/no-material-change로 분류하고, 영향을 받는 페이지를 확인하되 archive snapshot에는 갱신을 전파하지 않는 규칙을 둔다. **현재 보고서를 보존하면서 최신 개념 페이지를 유지할 수 있다**는 구체적인 설계 예다. 업데이트가 있다는 이유로 과거 보고서의 근거 상태를 조용히 바꾸는 방식은 이 저장소의 provenance 원칙과 맞지 않는다. [skill][astro]

실제 [DeepWiki 페이지][deepwiki-live]도 열었다. 개요에서 architecture, backend/frontend, RAG, API 등 하위 페이지로 이동하고 설명 가까이에 source file 참조와 diagram을 둔다. 다만 이것은 Devin의 DeepWiki 서비스가 **DeepWiki-Open 저장소를 설명한 페이지**다. 이 화면을 OSS DeepWiki-Open 자체가 생성한 출력이라고 혼동하지 않았다.

## 실제 보고서 구조 사본

아래는 template 파일의 목차를 상상해 작성한 예가 아니라, 저장소에 공개된 **완성 보고서 파일을 직접 연 결과**다. 제목은 설명으로 대체하고 섹션 제목만 그대로 옮겼다. 최신 prompt를 재실행한 산출물은 아니므로 현재 기본 동작과 다를 수 있다. 기술적 주장과 숫자의 정확성을 이번에 별도 검증한 것은 아니다.

### 1. DeerFlow 1.x: MCP 설명 보고서

[실제 파일: examples/what_is_mcp.md][deer-sample]. H2/H3 제목을 파일 순서대로 모두 옮겼다.

```text
## Key Points
## Overview
## Detailed Analysis
### Definition and Purpose
### Performance
### Scalability
### User Testimonials and Case Studies
## Key Citations
```

처음에 요점을 bullet로 제시하고, 개요 다음에 주제별 설명이 이어진다. 출처는 끝에 모여 있고 본문의 주장마다 번호가 붙어 있지는 않다. 이 파일에는 표나 이미지가 없으며, 펼치기/접기 구문도 없다. 현행 `main-1.x` reporter prompt는 Key Citations를 제목 바로 뒤로 요구하므로 **예제와 읽은 prompt의 순서가 다르다**. 예제 하나로 현재 동작을 단정할 수 없다는 직접적인 사례다. [예제][deer-sample] · [prompt][deer-legacy]

### 2. LangChain: inference 공급자 비교 보고서

[실제 파일: examples/inference-market.md][lc-sample]. H2/H3 제목을 모두 옮겼다.

```text
## AI Inference Market Overview
### Sources
## Fireworks.ai Profile
### Sources
## Together.ai Profile
### Sources
## Groq Profile
### Sources
## Comparative Performance Analysis
### Sources
## Conclusion and Market Outlook
```

처음에는 시장 맥락을 설명하고 공급자별 절에서 굵은 요약 문장과 본문을 사용한다. 출처 묶음을 절마다 두며 비교와 최종 결론에는 표가 있다. 본문을 세로로 계속 읽을 수 있고, 그림이나 접기 UI에 의존하지 않는다. 앞쪽에 별도의 Executive Summary는 없다. 이 예제의 절별 Sources 배치는 현재 final prompt의 말미 Sources 규정과 같지 않다. 최신 경로의 출력을 대표한다기보다 **실제 비교 보고서의 한 구조**로 읽어야 한다. [예제][lc-sample] · [현재 prompt][lc-prompt]

### 3. WebThinker: Rails net/smtp 오류 설명

[실제 파일: outputs/glaive.qwq.webthinker/markdown.test/article_15.md][webthinker-sample]. 큰 구조를 비교하기 위해 **H2만** 그대로 옮겼다. 하위 H3가 더 있다.

```text
## Introduction
## Problem Description
## Conclusion
```

도입 안에 배경·발생 상황·원인·영향을 길게 두고, 정작 해결 단계와 고급 고려사항은 Conclusion의 하위 절로 들어간다. 코드 블록은 있지만 출처 citation과 참고문헌 목록은 보이지 않는다. 이 사례는 따라야 할 모범 목차가 아니다. **장문과 계층 제목이 있어도 과업 중심 구조와 근거 전달이 보장되지 않는다**는 반례다. 논문이나 agent의 평가 성적을 출판물 가독성 평가와 동일시하면 이런 차이를 놓친다. [실제 출력][webthinker-sample] · [인용 불필요 prompt][webthinker]

## 가독성 관행: 일치하는 것과 일치하지 않는 것

| 쟁점 | 실제 관찰 | 이 저장소에 대한 해석 |
|---|---|---|
| 두괄식 | STORM은 lead를 앞에, OpenAI research format은 독립적인 요약을 앞에 둔다. LangChain 비교 예제와 WebThinker 예제는 반드시 그렇지 않다 | 두괄식은 유용한 명시적 설계다. 유명 도구가 모두 자동으로 지키는 관행은 아니다. 기존 TL;DR의 존재보다 단독으로 쓸 수 있는지를 시험해야 한다 |
| 요약 → 상세 | brief/report 분기, heading hierarchy, 본문과 참고문헌 분리가 반복된다 | 모든 층을 같은 밀도로 쓰지 말고, 앞에서 판단·핵심 설명을 완료한 뒤 필요한 근거를 따라가게 한다 |
| 접기 | Obsidian은 접는 callout을 지원하고 HTML artifact는 상호작용이 가능하다. 조사한 Markdown sample은 접기를 필수로 쓰지 않는다 | 접기 비율을 업계 표준처럼 정할 근거는 없다. 답의 전제까지 숨기지 않고 긴 유도·코드·추가 자료를 접는 방식이 적합하다 |
| 본문 인용 | inline 번호, hyperlink, footnote, 절별 Sources, 말미 URL 목록이 혼재 | 인용이 보이는 형식보다 ‘이 주장에 어떤 출처가 대응하는가’를 우선한다. 본문의 의미를 분해할 수 있는 granularity가 필요하다 |
| 표·그림 | 공급자 비교에서는 표, 코드 구조에서는 diagram, 데이터 분석에서는 chart가 핵심이다. DeerFlow 예제는 그림 없이 설명한다 | 표·그림의 보편적인 비율은 확인하지 못했다. 문단을 장식할 시각 자료보다 독자가 비교하거나 추적해야 하는 관계가 있는지를 기준으로 한다 |
| 길이 | 짧은 CLI 답부터 여러 페이지 report, 매우 긴 특정 style까지 다양하다 | 공통 slide 수·word 수보다 작업별 budget이 적합하다. 부록이 본문을 대신해서도 안 된다 |
| 독자 | coauthoring은 대상과 기대 효과를 직접 묻는다. 여러 research agent는 질문만 받고, persona를 연구 관점에 쓴다 | ‘개발자’보다 ‘도입 판단을 할 사람/메커니즘을 이해할 사람/수정할 코드를 찾는 사람’이 구조 결정에 도움이 된다 |

위 표의 근거는 [STORM lead][storm-lead], [OpenAI 형식 선택][notion-format], [Obsidian 문법][obsidian], [실제 LangChain 보고서][lc-sample], [DeerFlow reporter][deer-legacy], [coauthoring][coauthor]이다. 보편적인 읽기 속도나 이해도 향상 수치는 측정하지 않았으므로 제시하지 않는다.

## 검증: citation 연결, 사실 확인, 사람 리뷰는 같은 단계가 아니다

| 구현/방법 | 실제로 확인한 단계 | 보장하지 않는 것 |
|---|---|---|
| GPT Researcher multi_agents | draft → reviewer → reviser → reviewer의 반복. reviewer는 `follow_guidelines` 설정의 영향을 받으며 revision limit 존재 | 서로 다른 사실·논리·독자·시각 reviewer를 모두 둔다는 뜻은 아니다. 제한에 도달해 반환한 결과가 무결하다는 뜻도 아니다. [reviewer][gptr-review] · [editor][gptr-editor] · [limit][gptr-limit] |
| academic-research-skills | 별도 Editor, Ethics, Devil's Advocate 관점을 사용하는 review 단계와 수정 단계. compiler는 최대 2 revision loops 지시 | 복수 reviewer의 존재만으로 정확도 향상이 실증되지는 않는다. 비용과 지연도 함께 평가해야 한다. [workflow][academic] · [compiler][academic-compiler] |
| STORM / Co-STORM | 다관점 질문·source 기반 작성·문서 polish; Co-STORM의 사용자 개입 | 다관점 **조사자**와 완료된 초안의 독립 **검증자**는 다르다. [README][storm] · [polish][storm-lead] |
| Jina | 질의에 필요한 freshness/completeness 등의 evaluator를 선택하고 feedback에 따라 재작성; footnote repair | 인용 형식이 맞는다는 것과 source가 주장을 실제로 지지한다는 것은 다르다. [evaluator][jina-eval] · [citation 처리][jina-cite] |
| K-Dense literature-review | DOI/URL과 Crossref metadata 확인 script | 존재하는 논문이라는 사실은 해당 문장·해석·수치를 뒷받침한다는 사실과 다르다. [script][doi-check] |
| K-Dense market report | source/claim ledger, unit consistency, citation audit 등을 분리 | 검사 항목을 통과했다는 이유만으로 시장 추정의 가정이 옳아지는 것은 아니다. [skill][market] |
| Anthropic research system | 종합 후 CitationAgent가 주장과 source 위치를 연결; 평가 rubric에 사실·인용·완전성·출처 품질·도구 효율 포함; 사람 리뷰로 문제 발견 | CitationAgent를 독립적인 사실 검증 완료로 해석하면 안 된다. 글의 다중 judge 실험은 평가 체계 설명이며 모든 사용자 report의 필수 review round 설명이 아니다. [공식 설명][anthropic-research] |
| DeepResearch Bench | RACE는 완전성·통찰·요구 준수·가독성; FACT는 claim–URL 추출 후 source 지지 여부 확인 | 출처 수나 겉모양 하나로 report 품질을 평가하지 않는다. benchmark 결과를 이번에 재현한 것은 아니다. [평가 설명][bench] |
| Anthropic doc-coauthoring | 맥락을 모르는 새 독자가 예상 질문에 답할 수 있는지 확인, 작성자 확인 | 사실 출처 감사의 대체가 아니다. subagent를 못 쓰면 별도 대화의 독자 테스트 경로도 설명한다. [skill][coauthor] |
| PPTX/DOCX와 HTML | 파일별 검증과 렌더링/화면 검토 지침. PPTX는 slide별 시각 QA. web-artifacts-builder의 testing은 선택적 | 모든 공식 artifact skill에 같은 필수 visual gate가 있다고 일반화하면 안 된다. [PPTX][pptx] · [DOCX][docx] · [HTML][artifact] |

사람의 개입 지점도 목적에 따라 다르다. Co-STORM은 조사 중 대화, coauthoring은 구조 협의와 독자 테스트, Presenton은 outline과 편집, wiki compiler는 지식 갱신의 review를 제공한다. 사람에게 모든 단계의 승인을 요구하는 하나의 표준 workflow는 확인되지 않았다. 이 저장소에서는 **연구 범위·해석상 큰 판단·최종 독서 경험**처럼 사람이 잘 판단할 지점을 고르는 편이 낫다.

## 이 저장소에 적용할 제안

아래 비용은 실제 투입 시간을 측정한 숫자가 아니라 **변경 범위에 대한 상대 추정**이다. 낮음은 지침/metadata/작은 template 변경, 중간은 renderer·탐색·검사 변경과 새 산출물의 확인, 높음은 저장 구조·갱신 정책·이관이 필요한 경우다. 기존 문서를 한 번에 전부 바꾸는 비용은 포함하지 않는다.

| 제안 | 구체적으로 바꿀 것 | 근거 프로젝트 | 예상 비용·먼저 확인할 것 |
|---|---|---|---|
| **1. 자율 독서용 기본값은 연속 HTML로, 덱은 선택 산출물로** | 단일 HTML·offline 배포는 유지한다. 기본 읽기 모드에 연속 본문, anchor 목차, heading 이동을 제공하고 발표가 필요할 때 덱 모드를 선택한다. 새 연구 한 편으로 먼저 시험한다 | [LangChain][lc-prompt], [reveal scroll][reveal-scroll], [Anthropic artifact][artifact] | **중간.** 공통 shell의 navigation/print/mobile 점검 필요. 독자가 요약→근거→다른 절로 이동할 수 있는지 실제 화면에서 시험한다 |
| **2. 작성 시작 전에 독자 과업과 산출물 종류를 고른다** | 도입 판단용 comparison, 지식 확보용 explainer, 구현용 walkthrough, 문헌 synthesis를 구분한다. 공통 필수 항목은 요약·근거·한계로 두고 목차를 과업별로 정한다. 현재의 developer 독자 설정을 더 구체화한다 | [OpenAI research format][notion-format], [coauthoring][coauthor], [ECC][ecc] | **낮음.** skill 분기와 선택 metadata를 먼저 설계. 복잡한 설정 폼보다 목적과 독자가 해야 할 일을 짧게 기록 |
| **3. 앞쪽의 짧은 독립 설명과 상세 본문의 계약을 나눈다** | 기존 TL;DR을 판단/핵심 메커니즘/조건/미확인으로 완결시킨다. 핵심 전제는 펼쳐 두고 긴 증명·코드·세부 근거를 접거나 부록에 둔다. 모든 slide의 `.key`를 이어 붙인 요약은 피한다 | [STORM lead][storm-lead], [OpenAI 요약 가이드][notion-format], [Obsidian callout][obsidian] | **낮음~중간.** 기존 TL;DR/접기 체계 재활용. 앞부분만 읽은 독자가 과장 없이 질문에 답하는지 확인 |
| **4. 출판 스냅샷 위에 선택적으로 주제 페이지를 둔다** | 자주 반복되는 개념·설계 선택·프로젝트 관계를 안정된 URL의 페이지로 종합하고 개별 연구와 양방향 연결한다. 과거 보고서와 evidence는 보존하고, 주제 페이지에 갱신일·변경 이유·근거를 남긴다 | [Karpathy][karpathy], [Astro-Han][astro], [claude-obsidian][claude-obsidian] | **높음.** 갱신 책임과 source 변경 영향 추적이 필요. 실제로 재사용할 주제가 있을 때 작게 시작하며, 단순한 보고서 보관이 목표라면 보류 |
| **5. evidence ledger를 본문의 claim anchor와 연결한다** | 기존 sources/evidence/claims를 유지한다. 핵심 주장 바로 뒤에서 source의 정확한 위치로 갈 수 있게 하고, 끝의 sources는 전체 목록/coverage로 사용한다. 추론과 미확인은 인용 유무와 별도로 표시한다 | [Anthropic CitationAgent][anthropic-research], [DeepResearch Bench FACT][bench], [K-Dense market][market] | **중간.** claim ID와 HTML anchor/출처 표시에 대한 규약·정적 검사 필요. 문장마다 장문의 링크가 붙어 가독성을 해치지 않도록 확인 |
| **6. 내용의 원본과 표시 방식을 더 분리한다** | 이미 있는 deck shell을 출발점으로, 의미 단위의 section/claim/figure/source를 담은 원고에서 article/deck를 만드는 작은 render 계층을 검토한다. 새 기능을 위해 기존 문서를 모두 구조화 데이터로 이관하지는 않는다 | [Slidev][slidev], [Marp][marp], [Archify][archify] | **중간~높음.** 고유 도식과 상호작용을 보존할 escape hatch 필요. renderer 도입 비용이 새 문서 제작·수정 비용 절감을 넘는지 시험 |
| **7. 리뷰어 수보다 검증 결과를 세 갈래로 기록한다** | 사실/인용, 목표 독자의 이해·탐색, 실제 렌더링을 구분해 pass/block 근거를 남긴다. 기존 독립 reviewer 원칙은 유지하되 반복 검토는 바뀐 주장·남은 blocker에 집중한다. 새 독자가 핵심 질문을 해결하는지 시험한다 | [coauthoring][coauthor], [Anthropic 연구 평가][anthropic-research], [PPTX QA][pptx], [DeepResearch Bench][bench] | **중간.** 독자 질문 세트와 headless browser 경로가 필요. static gate 통과와 화면 확인을 섞지 않으며, 렌더링을 못 했으면 그대로 표시 |
| **8. 길이는 과업별 budget으로, 시각 자료는 설명 필요로 결정한다** | 짧은 brief와 상세 설명의 기대 분량을 나누되 한국어 실제 문서로 조정한다. 그림·표는 비교/흐름/관계를 설명할 때 사용한다. 덱 장 수나 모든 문서의 그림 비율을 품질 지표로 삼지 않는다 | [OpenAI format][notion-format], [Dexter][dexter], [K-Dense market][market], [Data Formulator][dataform] | **낮음.** 지침 변경 후 완료 문서의 불필요한 반복과 빠진 핵심을 함께 점검. 해외 word 수를 한국어 상한으로 직수입하지 않음 |

우선 적용 순서는 목적 분기와 독립 요약을 정한 뒤, 연속 읽기 모드를 새 문서에 시험하고, 그 결과에 맞춰 검증을 조정하는 것이다. 주제 wiki와 다중 renderer는 재사용 수요가 확인된 다음 진행한다. **기존 덱을 전부 버리는 일보다, 앞으로 만드는 문서의 기본 읽기 방식과 수명 정책을 바꾸는 일이 먼저다.**

## 확인 못 한 것과 이 조사 자체의 한계

- **렌더링한 화면을 보지 않았다.** 이 환경에서 headless browser/Playwright를 확보하지 못했다. 로컬 HTML, 공개 Markdown/JSON, 코드·prompt, 웹 도구가 추출한 페이지를 읽었으며, Jev와 외부 보고서의 실제 화면·모바일·키보드 이동·overflow를 시각 검사하지 않았다.
- **실사용 세계 순위는 미확인이다.** 별과 GitHub 검색, Trending 캐시, marketplace 표시값을 조사했으며 활성 사용자·유료 도입·retention·실제 보고서 만족도를 확보하지 못했다. 마지막 commit이 문서/의존성 수정인 경우도 있다. archived 저장소와 framework를 활발한 report agent처럼 합산하지 않았다.
- **동일 조건의 실행 비교를 하지 않았다.** 확인한 것은 공개된 구현과 예제다. README의 성능/기능 주장, script의 존재, prompt 지시는 실제 실행 성공이나 사실 정확도를 보장하지 않는다. commercial DeepWiki 내부 pipeline도 검증하지 않았다.
- **샘플은 전형성을 통계적으로 대표하지 않는다.** 실제 보고서 구조를 확인하는 데 썼다. 일부 예제와 최신 prompt의 차이를 명시했으며, 샘플의 시장·성능·기술 주장 자체를 재검증하지 않았다. 표·그림 비율, 보편적 길이 상한, 덱 대비 이해도 향상의 실측값은 확보하지 못했다.
- **읽은 경로 밖의 기능은 단정하지 않았다.** 최종 prompt에 독자/인용/분량 규정이 없더라도 다른 UI나 설정에 있을 수 있다. 표의 미확인은 부재 판정이 아니다. repo 전체에서 가능한 모든 실행 경로를 감사한 것은 아니다.
- **별/커밋 일부는 미확인이다.** Archify, Actionbook, community mirror의 API 별 수와 Logseq/작은 reveal agent의 실제 HEAD commit 날짜는 표에 미확인으로 남겼다. `pushed_at`이나 검색 결과의 상대 날짜로 메우지 않았다.
- **독립된 reviewer 맥락은 사용하지 않았다.** 사용자가 서브에이전트를 금지했으므로 같은 맥락에서 수치·인용·구조·링크를 다시 확인하는 축소 검토를 했다. 이 저장소의 정상적인 독립 관점 검증과 동등하다고 주장하지 않는다.
- **출판용 정적 gate는 실행하지 않았다.** 이 산출물은 `research/<slug>/index.html`이 아닌 `docs/`의 조사 Markdown이므로 `check-doc`, `check-prose`, `check-claims`의 대상이 아니다. 대신 실제 인용문·표의 숫자·샘플 제목·링크 경로와 요청 범위를 확인했다.
- **조사 산출물은 요청한 이 Markdown 파일뿐이다.** 외부 코드의 SHA는 링크에 고정하고 숫자는 본문에 기록했다. 임시 수집 자료는 저장소 밖에 두었으며 `.research/` ledger, 기존 skill/문서, 생성된 index는 수정하지 않았다. 웹 서비스·후기·원문 gist는 고정된 Git blob과 보존 수준이 다르다.

## 출처 링크에 관하여

SHA가 포함된 GitHub 참조 링크는 조사 당시 읽은 코드를 고정한다. 일부 보조 README·문서와 웹 서비스 링크는 움직이는 페이지다. 별 링크는 조회 endpoint, 커밋 날짜 링크는 실제 commit이다. 로컬 규칙·진단 문서 링크는 이 보고서와 같은 checkout의 상대 경로다. 본문에서 외부 source의 설명과 조사자의 해석을 구분했으며, 제안의 비용은 상대 추정이다.

[gptr-prompt]: https://github.com/assafelovic/gpt-researcher/blob/0957c301ed06c2a5857b834358c7227c739041d4/gpt_researcher/prompts.py#L262
[gptr-config]: https://github.com/assafelovic/gpt-researcher/blob/0957c301ed06c2a5857b834358c7227c739041d4/gpt_researcher/config/variables/default.py#L24
[gptr-runtime]: https://github.com/assafelovic/gpt-researcher/blob/0957c301ed06c2a5857b834358c7227c739041d4/gpt_researcher/actions/report_generation.py#L258
[gptr-review]: https://github.com/assafelovic/gpt-researcher/blob/0957c301ed06c2a5857b834358c7227c739041d4/multi_agents/agents/reviewer.py
[gptr-editor]: https://github.com/assafelovic/gpt-researcher/blob/0957c301ed06c2a5857b834358c7227c739041d4/multi_agents/agents/editor.py
[gptr-limit]: https://github.com/assafelovic/gpt-researcher/blob/0957c301ed06c2a5857b834358c7227c739041d4/multi_agents/agents/draft_review.py
[storm-lead]: https://github.com/stanford-oval/storm/blob/fb951af7744dab086e34962e9bc6fe878e145f83/knowledge_storm/storm_wiki/modules/article_polish.py#L59
[storm-article]: https://github.com/stanford-oval/storm/blob/fb951af7744dab086e34962e9bc6fe878e145f83/knowledge_storm/storm_wiki/modules/article_generation.py
[storm]: https://github.com/stanford-oval/storm/blob/fb951af7744dab086e34962e9bc6fe878e145f83/README.md
[lc-prompt]: https://github.com/langchain-ai/open_deep_research/blob/1b7d2e80db9faa586165c60e09096dbbfd483a64/src/open_deep_research/prompts.py#L228
[lc-sample]: https://github.com/langchain-ai/open_deep_research/blob/1b7d2e80db9faa586165c60e09096dbbfd483a64/examples/inference-market.md
[deer]: https://github.com/bytedance/deer-flow/blob/8a3a309d1ce8bac8418251be29d4e4297a20c5eb/README.md
[deer-research]: https://github.com/bytedance/deer-flow/blob/8a3a309d1ce8bac8418251be29d4e4297a20c5eb/skills/public/deep-research/SKILL.md
[deer-repo]: https://github.com/bytedance/deer-flow/blob/8a3a309d1ce8bac8418251be29d4e4297a20c5eb/skills/public/github-deep-research/assets/report_template.md
[tongyi]: https://github.com/Alibaba-NLP/DeepResearch/blob/f72f75d8c3eb842f2bbbab096a12206ff66e270f/inference/prompt.py#L1
[local]: https://github.com/LearningCircuit/local-deep-research/blob/96a5144542211bca49d67e9f8c4eeacab0598860/src/local_deep_research/report_generator.py#L418
[webthinker]: https://github.com/RUC-NLPIR/WebThinker/blob/db387eb3261de9b5e2db7d2d7fb20af2aceb7882/scripts/prompts/prompts_report.py#L78
[webthinker-sample]: https://github.com/RUC-NLPIR/WebThinker/blob/db387eb3261de9b5e2db7d2d7fb20af2aceb7882/outputs/glaive.qwq.webthinker/markdown.test/article_15.md
[dzhng]: https://github.com/dzhng/deep-research/blob/1f8f3e285bbc23e80b98a66a64effab9069f3ad4/src/deep-research.ts#L135
[nick]: https://github.com/nickscamara/open-deep-research/blob/eea0962c8be343230d9571cbdeb82df12504ad72/app/(chat)/api/chat/route.ts#L614
[gemini]: https://github.com/google-gemini/gemini-fullstack-langgraph-quickstart/blob/e34e569de465340e42f36cd3cab4fac0c3ce7036/backend/src/agent/prompts.py#L81
[miro]: https://github.com/MiroMindAI/MiroThinker/blob/1c4253f6774bf40314271a827304b842100e054c/apps/miroflow-agent/src/utils/prompt_utils.py#L242
[khoj]: https://github.com/khoj-ai/khoj/blob/ae229ca894c0b80ad84664afcfdde523b5e87057/src/khoj/processor/conversation/prompts.py#L20
[dexter]: https://github.com/virattt/dexter/blob/534f6be455523c5926eba72bdaf4f914555be5c9/src/agent/prompts.ts#L132
[jina]: https://github.com/jina-ai/node-DeepResearch/blob/fd323b521a51264d497bec333bfb997da1bf3210/src/agent.ts#L96
[jina-eval]: https://github.com/jina-ai/node-DeepResearch/blob/fd323b521a51264d497bec333bfb997da1bf3210/src/tools/evaluator.ts
[jina-cite]: https://github.com/jina-ai/node-DeepResearch/blob/fd323b521a51264d497bec333bfb997da1bf3210/src/utils/text-tools.ts
[docx]: https://github.com/anthropics/skills/blob/8a1541c4a3ffa5a20a5a91de0dcf3f0bab1d1ef4/skills/docx/SKILL.md
[pptx]: https://github.com/anthropics/skills/blob/8a1541c4a3ffa5a20a5a91de0dcf3f0bab1d1ef4/skills/pptx/SKILL.md
[pdf]: https://github.com/anthropics/skills/blob/8a1541c4a3ffa5a20a5a91de0dcf3f0bab1d1ef4/skills/pdf/SKILL.md
[artifact]: https://github.com/anthropics/skills/blob/8a1541c4a3ffa5a20a5a91de0dcf3f0bab1d1ef4/skills/web-artifacts-builder/SKILL.md
[coauthor]: https://github.com/anthropics/skills/blob/8a1541c4a3ffa5a20a5a91de0dcf3f0bab1d1ef4/skills/doc-coauthoring/SKILL.md
[notion]: https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/notion-research-documentation/SKILL.md
[notion-format]: https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/notion-research-documentation/reference/format-selection-guide.md
[notebook]: https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/jupyter-notebook/SKILL.md
[presenton]: https://github.com/presenton/presenton/blob/0449eaa7c9acf7fc0d4ce68b4787fea484c024af/README.md
[presenton-outline]: https://github.com/presenton/presenton/blob/0449eaa7c9acf7fc0d4ce68b4787fea484c024af/servers/fastapi/utils/llm_calls/generate_presentation_outlines.py#L65
[slidev]: https://github.com/slidevjs/slidev/blob/30a0a54c8739b4b395d9b336a6304cc8ebcc3947/skills/slidev/SKILL.md
[marp]: https://github.com/marp-team/marp/blob/aaac2347ec65cd835c0ccd90ba3d866c9a75cb07/README.md
[reveal]: https://github.com/hakimel/reveal.js/blob/f8c9ec3bb3b288e061b166fba5e4975920dd5cd4/README.md
[archify]: https://github.com/tt-a1i/archify/blob/69cf672087289033af5138648d3875d3d73fc431/archify/SKILL.md
[actionbook]: https://github.com/actionbook/actionbook/blob/0e31254cc10a1fe0b57faa318ac0823500f42a40/playground/deep-research/skills/deep-research/SKILL.md
[actionbook-sample]: https://github.com/actionbook/actionbook/blob/0e31254cc10a1fe0b57faa318ac0823500f42a40/playground/deep-research/examples/sample-report.json
[dataform]: https://github.com/microsoft/data-formulator/blob/5477f0e236426dc8f74a498ec400414fba7fbc0f/README.md
[composio]: https://github.com/ComposioHQ/awesome-claude-skills/blob/be2a406907dbc61b73e6827ded415c96139d13a2/content-research-writer/SKILL.md
[volt]: https://github.com/VoltAgent/awesome-agent-skills/blob/ed106e8edc7c6d04fe3aedcbfaed1b43247f56a7/README.md
[literature]: https://github.com/K-Dense-AI/scientific-agent-skills/blob/065b734670d7d990627dbc06a05b5a99be33f1f1/skills/literature-review/SKILL.md
[doi-check]: https://github.com/K-Dense-AI/scientific-agent-skills/blob/065b734670d7d990627dbc06a05b5a99be33f1f1/skills/literature-review/scripts/verify_citations.py
[market]: https://github.com/K-Dense-AI/scientific-agent-skills/blob/065b734670d7d990627dbc06a05b5a99be33f1f1/skills/market-research-reports/SKILL.md
[academic]: https://github.com/Imbad0202/academic-research-skills/blob/96a442eb2b4ed29ce6746348714f9632efcf2163/deep-research/SKILL.md
[academic-compiler]: https://github.com/Imbad0202/academic-research-skills/blob/96a442eb2b4ed29ce6746348714f9632efcf2163/deep-research/agents/report_compiler_agent.md
[ecc]: https://github.com/affaan-m/ECC/blob/d3b8a3e908904e242ed2dbe66af62cca71131419/skills/deep-research/SKILL.md
[community]: https://github.com/anthropics/claude-plugins-community/blob/a727be1c7bd6064419b6f60d71993a19198adc17/README.md
[deepwiki]: https://github.com/AsyncFuncAI/deepwiki-open/blob/d92819a9c9f3b99416e3580ff235fc9d3adf8b89/README.md
[deepwiki-prompt]: https://github.com/AsyncFuncAI/deepwiki-open/blob/d92819a9c9f3b99416e3580ff235fc9d3adf8b89/api/prompts.py
[obsidian]: https://github.com/kepano/obsidian-skills/blob/3ccff5338ea700537839b21900aa5358a0402c98/skills/obsidian-markdown/SKILL.md
[claude-obsidian]: https://github.com/AgriciDaniel/claude-obsidian/blob/32ac5a02c4e082e4a5628ca810776375e134708e/README.md
[open-notebook]: https://github.com/lfnovo/open-notebook/blob/3127f14ea9dbb519f0e4ddc64a0742ca644ba6ef/README.md
[open-notebook-cite]: https://github.com/lfnovo/open-notebook/blob/3127f14ea9dbb519f0e4ddc64a0742ca644ba6ef/prompts/ask/final_answer.jinja
[nashsu]: https://github.com/nashsu/llm_wiki/blob/48fd970e206a02a6d2028d1dbfc41b7a0345bf0b/README.md
[samurai]: https://github.com/SamurAIGPT/llm-wiki-agent/blob/572c8eb06e7226567e55a9f186c0860d755a0d51/README.md
[compiler]: https://github.com/atomicstrata/llm-wiki-compiler/blob/30f86ddc1c3b92fddb5051cd875973fee6da164e/README.md
[astro]: https://github.com/Astro-Han/karpathy-llm-wiki/blob/eafcc77001e496cc43499e4923b663aec722c813/SKILL.md
[deer-legacy]: https://github.com/bytedance/deer-flow/blob/2ab28765803d4d9582aaa8f2f3355137d154e273/src/prompts/reporter.md
[deer-sample]: https://github.com/bytedance/deer-flow/blob/2ab28765803d4d9582aaa8f2f3355137d154e273/examples/what_is_mcp.md
[karpathy]: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
[anthropic-research]: https://www.anthropic.com/engineering/multi-agent-research-system
[bench]: https://github.com/Ayanami0730/deep_research_bench#evaluation-framework
[deepwiki-live]: https://deepwiki.com/AsyncFuncAI/deepwiki-open
[logseq-db]: https://github.com/logseq/docs/blob/master/db-version.md
[logseq-mcp]: https://github.com/joelhooks/logseq-mcp-tools
[reveal-scroll]: https://revealjs.com/scroll-view/
[agent-slides]: https://github.com/neuromechanist/agentic-presentation-builder
[presentation-kit]: https://github.com/dro42/presentation-kit
[review-research]: https://www.reddit.com/r/LocalLLaMA/comments/1t4e83m/current_state_of_local_research_tools_as_of_may/
[review-wiki]: https://www.reddit.com/r/ObsidianMD/comments/1uai1w2/karpathys_llm_wiki_setup/
[review-skills]: https://www.reddit.com/r/claude/comments/1s5qyef/best_claude_skills_i_use_in_2026/
[installs-deer]: https://www.skills.sh/bytedance/deer-flow/deep-research
[installs-action]: https://www.skills.sh/actionbook/actionbook/deep-research
[openai-evals]: https://developers.openai.com/blog/eval-skills
[openai-skills]: https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra
[trending]: https://github.com/trending?since=monthly
