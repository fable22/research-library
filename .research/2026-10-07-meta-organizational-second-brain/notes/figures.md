# 원문이 그리거나 표로 적은 것

w1 의 그림 세 장은 alt 가 비어 있어 이미지를 직접 열어 글자를 옮겼다. 2026-10-07T08:00Z 수신. sha256 은 sources.jsonl 의 figures_sha256.
처리: 그림 = 문서가 다시 그렸다 / 이름 = setup 에 이름과 빠진 이유를 적었다.

| 식별자 | 무엇을 보이나 | 어디서 | 처리 |
|---|---|---|---|
| w1 Domain-Expert-AI-Table.png | 네 층 × (Problem It Solves, Key Insight) 표 | w1 §The Architecture at a Glance, "four layers" 문장 바로 뒤 | 그림: layers 장 표 |
| w1 Domain-Expert-AI-knowledge-system.png | "Sample structure of knowledge base + front-matters", 디렉터리 트리와 position 파일 하나의 YAML frontmatter | w1 §Building the Organizational Second Brain | 그림: files 장 트리와 frontmatter |
| w1 Domain_Expert_AI_Graph1-FINAL | 자기 개선 루프 4 phase 흐름도, 재시도 귀환선과 test suite 보강 귀환선 | w1 §The Self-Improvement Flywheel | 그림: flywheel 장 SVG |
| w1 Domain-Expert-AI-Hero-1.png | 장식용 뇌 일러스트 | w1 머리 | 이름: setup 에 장식이라 뺐다고 적음 |
| w2 bottleneck 그림 (90fb4ed0…png) | Before/After agents 막대: Build 가 줄고 나머지 단계는 같은 길이 | w2 §Code is no longer the bottleneck | 이름: setup. 본문 문장 "Human-speed stages keep their length while build collapses to hours" 로 대신함 |
| w2 line vs loop 그림 (75c8e050…png) | 전통 SDLC 직선 6단계 대 Claude 를 가운데 둔 6단계 순환 | w2 §What is an AI-native SDLC? | 그림: sdlc-borrow 장의 두 루프 비교 SVG 안에 순환 쪽만 |
| w2 shift 표 | Stage × Traditional SDLC × AI-native SDLC 6행 | w2 §The shifts across the six stages | 이름: setup. 이 문서는 단계마다 짝을 맞추는 대신 두 수명주기가 갈라지는 곳을 설명하므로 표를 옮기지 않고 필요한 행만 인용 |
| w2 play 의존 그래프 (4c40f7b7…png) | 5개 시작 play 에서 Closing the loop 까지의 채택 순서 화살표 | w2 §Plays | 이름: setup |
| w2 #inc-checkout 대화 그림 (c84d8383…png) | Claude Tag 가 롤백하고 lessons 파일에 post-mortem 을 쓰는 가상 대화 | w2 §Claude on call with Claude Tag | 이름: setup |

## w1 Domain-Expert-AI-Table.png (글자 그대로)

| Layer | Problem It Solves | Key Insight |
|---|---|---|
| Knowledge System | Institutional knowledge is scattered and inaccessible to AI. | LLMs are better at managing knowledge than people. Structure knowledge as a navigable filesystem, optimized for LLM consumption. |
| Reasoning Pipeline | Expert analysis follows structured methodologies that monolithic prompts cannot capture. | Separate what the agent knows from how it reasons, using composable procedures we call recipes. This enables progressive disclosure, where the agent doesn't have to remember all the instructions at once. |
| Evaluation Framework | You cannot improve what you cannot measure. | Develop automated benchmarks that grow with each improvement cycle to enable confident iteration. |
| Self-Improvement Loop | Manual feedback cycles take weeks and do not scale. | Treat knowledge maintenance as a compilation problem with automated verification. |

## w1 Domain-Expert-AI-knowledge-system.png (글자 그대로)

Sample structure of knowledge base + front-matters
Generalized example — any domain expert agent

knowledge_system/
SKILL.md ← "Homepage" — routes to the right workflow
references/
references/recipe/ ← "How-To Guides" (procedures)
recipe/investigation/recipe-steps.md ← Step-by-step procedure (7 steps)
recipe/investigation/reasoning-process.md ← Chain-of-thought decomposition
recipe/investigation/grounding-rules.md ← Validation rules
recipe/risk-assessment/pipeline.md ← 4-phase pipeline orchestration
recipe/risk-assessment/strength-assessment.md
recipe/risk-assessment/rebalancing.md
recipe/citation-protocol.md ← How to cite sources
recipe/retrieval-protocol.md ← How to look up external sources
references/knowledge/ ← "Reference Articles" (facts/rules)
knowledge/positions/ ← Supreme authority articles
positions/_domains.md ← Registry (table of contents)
positions/product-safety/ps-position-1.md ← Individual position "articles"
positions/product-safety/ps-position-2.md
positions/product-safety/... (12 total)
knowledge/investigation/ ← Domain reference material
investigation/risk-categories.md
investigation/classification-criteria.md
investigation/ps-position-routing-index.md ← "See Also" links
knowledge/external-sources/ ← External authorities
external-sources/external-source-routing-index.md ← Topic → source mapping
external-sources/case-law/ ← Court decision cards
external-sources/regulatory-guidance/ ← Regulator guidance cards
external-sources/industry-standards/ ← Standards body cards
knowledge/risk-assessment/ ← Analysis rules & frameworks
risk-assessment/scoring/
risk-assessment/requirements/
risk-assessment/risk-levels/

yaml:
id: ps-position-1 # Unique identifier
name: "Review Required for High-Risk Features" # Human-readable title
type: position # What kind of page is this
domain: shared # Which domain it belongs to
category: product-safety-positions # Classification
triggers: # WHEN to load this page
  - third-party integration
  - in-app purchases
  - hardware device launch
depends_on: # What this page NEEDS
  - ps-position-5
  - ps-position-8
referenced_by: # What NEEDS this page
  - ps-position-routing-index
  - ra-scoring-criteria
  - ra-requirement-catalog

캡션(w1 본문): An illustration of the knowledge system: files are organized as a navigable filesystem (left), and each file's YAML frontmatter (right) declares when it applies (the triggering scenarios) plus its dependencies and consumers, forming a bidirectional dependency graph the agent can traverse and maintain easily.

메모: 그림의 트리에는 gateway 파일이라는 이름의 파일이 없다. 본문은 네 종류(position, taxonomy/vocabulary, routing index, gateway)를 말하지만 그림은 "Generalized example" 이다.

## w1 Domain_Expert_AI_Graph1-FINAL (글자 그대로, 왼쪽에서 오른쪽)

Expert Conversations With Agent → Phase 1: Diagnosis [Parse Conversations → Attribute Failures To Recipe Or Knowledge Files → Weight By Frequency And Severity] → Improvement Briefs → Phase 2: Compilation [Generate Minimal Changeset → Update Cross-Refs, Token Budgets Etc.] (점선 "Independent Review" → Adversarial Validator) → Phase 3: Evaluation [Targeted Verification: Replay Failures → Regression Testing: Eval Suite] → Pass? — ✗ No (Retry) → Phase 2 로 귀환 / ✓ Yes → Phase 4: Landing And Enrichment [Validated Changeset Landed In Production → Failure → New Test] (점선 "Enriches Test Suite" → Phase 3 Regression Testing 으로 귀환)

캡션(w1 본문): The self-improvement loop. Expert corrections are diagnosed to their root cause, compiled into minimal verified edits, and evaluated against replay and regression tests before they are reviewed and landed. Each fix is then folded back into the regression suite, so the gain is permanent.

메모: 본문 목록의 네 phase 는 Diagnose / Compile / Validate / Have domain experts review 이고, 그림의 네 phase 는 Diagnosis / Compilation / Evaluation / Landing And Enrichment 다. 사람 검토는 그림에 상자로 없다. "Weight By Frequency And Severity" 는 본문에 없고 그림에만 있다.

## w2 그림 글자

bottleneck: "Before agents — every stage runs at human speed" / "After agents — build runs at agent speed" / Plan, Design, Build, Test, Deploy, Maintain / "cycle time reclaimed" / 아래 라벨 requirements, review, release
line vs loop: "Traditional — the line. One slow loop back is a new release cycle." / "AI-native — the loop. Hours, not weeks, with humans above the loop instigating, directing and governing."
play 그래프: 1 · START ANYWHERE — PLAN Capture intent, BUILD CLAUDE.md, TEST Feedback loop, DEPLOY Hooks, BUILD Plan mode / 2 — BUILD Skills, BUILD Subagents, TEST Evals / 3 — DESIGN Requirements & design, DEPLOY PR review / 4 — DEPLOY CI/CD / 5 — MAINTAIN Closing the loop
#inc-checkout: "Rolled back. The 5xx rate is back inside its band, and the post-mortem is written to lessons/2026-06-checkout-cache.md."

## 2026-10-07 개정에서 더한 출처의 표와 그림

| 식별자 | 무엇을 보이나 | 어디서 | 처리 |
|---|---|---|---|
| c5 아키텍처 비교 표 | Rule-based LLM workflow / Single agent reviewer / Orchestrator agent with subagents × Quality, Latency, Complexity | c5 §The Multi-Agent System | 이름: 사례 본문에 결과만 인용 |
| c5 Eval Results 표 | Risk classification 59%→77% (+18%), Redline rubric 53%→87% (+34%), Average latency 2.6→3.8분 (+47%) | c5 §Eval Results | 인용: 07장 사례 1 문장과 첨언. 막대는 그리지 않았다 |
| c6 (그림 없음) | 본문에 차트가 없다. 수치는 문장 안에만 있다 | c6 | 해당 없음 |
| p1 Figure fig_evolution | R0~R12 non-correct 비율 곡선, 승격과 퇴역 표시 | p1 §5.4 | 이름: setup. 곡선은 옮기지 않았다 |
| p1 R0–R12 ledger 표 | 라운드별 제안/채택, Dev 300 중 / Final 200 중 non-correct 수: R0 90/40, R12 55/25. 제안 33, 승격 6 | p1 부록 Twelve-Round Evolution Record | 인용: 14장 그림 설명(제안 33, 승격 6, 감시 세트 20.0% → 12.5%) |
| p1 Lifecycle 표 | 승격된 6개 버전의 대체, 퇴역 이력 | p1 부록 | 그림: 14장 표. 인용: 21장 |
| p1 Conflict handling 표 | Conflict-C1~C6, 정적 검사 거절, 우선순위 규칙, 범위 축소 | p1 부록 | 그림: 충돌 장 표 |
| p1 Judge–Human Agreement 표 | A–B 82.0/.687, 92.7/.853; Qwen3-Max–A 90.7/.820, 91.3/.827 등 | p1 부록 | 인용: 판정자 장 |
| p2 Table failure→guardrail, telemetry, cost | 11가지 실패와 다섯 층 대응, 거절 기록, gate 비용 | p2 §5 | 이름: setup. 본문 문장의 수치만 썼다 |
| p3 main results 표 | 방법별 일반화, 유지, 규칙 수정 지표 | p3 §4.2 | 이름: setup. 저자의 결론 문장만 썼다 |
| p4 Ablation 2 표 | Full Exploration 96/83/67, Passive 90/33/62 (Op Acc / KB Op Acc / Recovery), 60 traces | p4 부록 Ablation 2 | 그림: 진단 장 막대 |
| p4 Component Type 표 | Skill 100%, Knowledge Base 83.3%, Tool 66.7%, System Prompt 100% | p4 부록 | 인용: 진단 장 첨언 |
| w5 (그림 없음) | OKF v0.2 명세는 YAML 예시뿐이다 | w5 | 해당 없음 |
