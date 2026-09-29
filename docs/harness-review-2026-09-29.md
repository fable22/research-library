# 하네스 설계 검토 (2026-09-29)

검토 대상은 연구 문서 생성 하네스 전체다. AGENTS.md, CLAUDE.md, README.md, AUTHORING.md, 스킬 셋과 references 전부, `research-chain.js`, `scripts/` 와 `scripts/test`, verify 스킬의 스크립트 둘과 테스트, `docs/` 두 편, 커밋 95fc1e4 와 b95684c, 실제 문서 두 편(jev-system-one, skilladam)의 `index.html` 과 `.research/` 원장을 읽었다.

읽기만 하지 않고 돌린 것도 있다. `check-doc.mjs` 와 `check-prose.mjs` 를 문서 28편 전체에, `check-claims.mjs` 를 28편 각각에, `check-prose.test.mjs` 와 `paper-path.test.mjs` 를 돌렸다. 스캐폴드를 하나 찍어 게이트에 통과시켜 봤고, 조작한 원장 두 개로 `check-claims.mjs` 의 구멍을 재현했다. 측정용 스크립트는 `/tmp/rev/` 에 두었고 저장소에는 넣지 않았다. 워크플로 코드는 실행하지 못했다. 그쪽 결함은 코드를 읽어 찾은 것이라 "코드 읽기"로 표시한다. 토큰 수는 어디에도 기록되어 있지 않아서 전부 바이트에서 환산한 추정이다.

## 1. 결론

골격은 목표에 맞다. 저자가 조사와 집필을 한 컨텍스트에서 하고, 근거를 원장으로 커밋하고, 검증을 분리된 컨텍스트에 맡기고, 셀 수 있는 규칙은 스크립트로 막는다. 문제는 골격과 세 요건 사이의 이음매에 있다. 가장 큰 문제 셋은 이렇다.

**1. `check-claims.mjs` 의 "통과"가 실제보다 강하게 읽힌다.** 웹 근거는 검사하지도 보존하지도 않고 통과시킨다. 원장 전체 claims 1,359개 중 287개(21%)가 웹 근거뿐이다. 가장 최근 문서인 jev 는 105개 중 55개(52%), claude-platform 은 57개 중 41개(72%)다. jev 의 웹 출처 55개 가운데 보존본(archive)이 있는 것은 0개다. 이 상태에서 게이트는 "통과. 인용이 고정 원문과 일치한다"를 찍는다. 수치 대조는 paper 에만 있어서 repo 주장의 잘못된 수치도 통과한다. 두 경우 모두 조작한 원장으로 재현했다(H1, H2). 이 게이트가 다른 기계에서 다시 확인할 수 있다는 약속의 유일한 기계적 근거인데, 약속이 닿는 범위를 출력이 말해 주지 않는다.

**2. 가독성 요건을 담보하는 고리가 끊겨 있다.** 2026-09-29 에 넣은 `.key` 와 `details.more` 문법을 스캐폴드(`new-doc.mjs:90-91` 은 여전히 `.dek` 에 "2~4문장"을 적는다), 게이트(슬라이드 문법 검사가 없다), 코퍼스(28편 중 `.key` 0편, `details.more` 0편, `.dek` 542개), 평가(`evals.json:8` 은 dek 를 기대한다) 어느 것도 따르지 않는다. 스킬이 내세우는 독자 시험("소스가 보여 주지 않은 사례에서 동작을 예측할 수 있는가", `research-doc/SKILL.md:29-31`)은 어느 렌즈도 확인하지 않는다. 렌즈 A 는 다른 시험(adopt/hold 를 고를 수 있는가)을 친다. 독자 정의는 여섯 곳에 흩어져 있고 `oss.md:6` 은 `SKILL.md:29` 와 반대로 말한다. `--counts` 의 "사람 밴드"는 중앙값 두 줄이라 어디서 멈추는지 정해져 있지 않다. 결국 가독성을 판정하는 것은 사용자의 눈 하나이고, 그 반응이 규칙 추가로 돌아오면서 저자 컨텍스트의 굵은 글씨 지시가 약 100개에 이르렀다. 저장소 자신이 인용한 붕괴 지점(약 80개, `method-provenance.md:274`)을 넘어선다.

**3. 워크플로가 자기 실행 결과를 잃고, 그래서 비용을 줄일 근거도 없다.** 라운드가 돌 때마다 `fixed` 를 덮어써서 1라운드의 `needsJudgment`, `unverified`, `rejected` 가 PR 에 실리지 않고, 그 목록이 비면 PR 이 ready 로 열린다(`research-chain.js:199`, `326`, `357-363`). 렌즈가 죽어도 조용히 다음 단계로 간다(`:158`, `:189`). `run.json` 은 조기 종료 경로에서 안 써지고, 쓰더라도 gitignore 된 `notes/` 에 한 기계에만 남고, 시간·토큰·렌즈별 발견 수가 없다. 한 편에 에이전트가 8~10번 돈다. 렌즈 네 개가 모두 문서 원본과 저자의 `evidence.jsonl` 을 받는데, 문서 바이트의 70~91%가 base64 그림인 문서가 28편 중 10편이다. 검증 라운드를 줄이자는 결정(95fc1e4)은 이 기록 없이 내려졌고, 지금도 그 결정의 효과를 잴 수 없다.

## 2. 세 요건은 어디서 담보되고 어디서 새는가

| 요건 | 담보하는 곳 | 담보하지 못하는 곳 (근거) |
|---|---|---|
| 두괄식 | `tl-dr` eyebrow 필수 (`check-doc.mjs:28`), 스킬의 "첫 두 문장에 발견" (`research-doc/SKILL.md:59`) | 내용은 아무도 안 본다. tl-dr 슬라이드가 발견으로 시작하는지 게이트도 렌즈도 확인하지 않는다 |
| 핵심과 첨언 구분 | 슬라이드 문법 6요소 (`SKILL.md:120-151`), `--counts` 의 슬라이드당 보이는 한글 수 | `.key`, `details.more` 를 검사하는 규칙이 없다. 스캐폴드가 옛 문법을 찍는다. 코퍼스에 새 문법으로 쓴 문서가 없어 문법이 한 번도 끝까지 돌지 않았다. 300~400자 기준은 슬라이드 두 장에서 나왔다 (`method-provenance.md:238`) |
| 문장이 읽히는가 | `check-prose` 차단 11개, 저자의 읽기 패스 (`SKILL.md:285-299`) | 읽기 패스는 끝나는 조건이 없다. 밴드는 중앙값 두 줄이고 기준 표본은 합쇼체·해요체가 82%인 회사 블로그다. 보고서나 문서 유형의 분포가 아니다 |
| 수치 검증 | 논문 수치는 원문 표에서 대조 (`check-claims.mjs:540`), 렌즈 B | repo 수치는 기계 대조가 없다 (H2). 정수 단독 수치는 논문에서도 건너뛴다 (`:415-418`). 문서 문장과 claims 를 잇는 검사가 없다 |
| 인용 검증 | 고정 커밋과 논문 sha256 에 대한 quote-match (`:568-586`, `:525`) | 웹은 무검사 (H1). quote 길이 상한이 없어 문단째 인용이 통과한다 (H4). 렌즈 B 는 claims.jsonl 을 읽지 않으므로 claims 는 스크립트 외에 두 번째 독자가 없다 |
| 다른 기계에서 재확인 | 원장 커밋, 로컬 경로 금지 (`:177-190`), `pin-paper.mjs` | 이 기계에서 check-claims 는 28편 중 24편이 실패한다. 21편은 체크아웃이나 논문 캐시를 찾지 못해서이고, 나머지 3편은 원장이 비었거나 깨졌다(omo 는 원장 없음, wikiloop 는 claims 없음, opsharness 는 출처 p2 에 arxiv_id 없음). 한 번에 받아 오는 명령이 없다 |
| 비용 | 단일 저자 에이전트, 라운드 상한 2, D 는 sonnet, 재검증을 바뀐 슬라이드로 한정 | 측정이 없다. 렌즈 입력이 부풀어 있고 claims 를 통째로 다시 적는다 (5절) |

단계 관점에서 보면 source 는 검증 가능성을, doc 은 가독성을, verify 는 검증 가능성을 맡는다. fix 는 두 요건을 다 건드리는데 자기가 고친 결과를 다시 읽는 것은 다른 컨텍스트(recheck)뿐이다. ship 은 요건을 담보하지 않고 기록만 남겨야 하는데 기록이 가장 약한 단계다.

## 3. 결함 목록

심각도는 높음(요건을 깨거나 결과를 잃는다), 중간(어긋나거나 구멍이 있다), 낮음(낡은 문구, 잠재 버그) 순이다. 재현은 저장소 루트에서 한다. "코드 읽기"는 실행하지 못했다는 뜻이다.

### 높음

**H1. 웹 근거가 검사도 보존도 없이 통과한다.**
위치: `check-claims.mjs:550` (`if (src.kind !== 'repo') continue;  // web 은 아직 대조 수단이 없다`), `:203-205` (web 출처는 url 과 retrieved_at 만 본다), `research-source/SKILL.md:79-82` (archive URL 을 권하지만 필드 이름이 없다).
재현: 웹 출처 하나와 지어낸 quote 를 가진 claim 을 `--evidence` 임시 디렉터리에 넣고 `node .claude/skills/research-verify/scripts/check-claims.mjs research/2026-09-21-jev-system-one --evidence <dir>` 를 돌리면 `OK ... 통과. 인용이 고정 원문과 일치한다.` 가 나온다. `verdict:"unverified"` 에 evidence 가 빈 claim 도 같은 실행에서 통과한다.
크기: 웹 근거뿐인 claims 는 전체 1,359개 중 287개(21%). jev 55/105, claude-platform 41/57. jev 의 웹 출처 55개는 `archive_url` 0개이고 `archive_status` 값이 실패 종류로 채워져 있다. 코퍼스에서 보존 관련 필드 이름이 셋으로 갈렸다 (`archive_url` 110, `archive_status` 93, `archive_unavailable` 2). 스키마에 없어서 생긴 결과다.
영향: 요건 2(다른 기계에서 다시 확인)가 가장 최근 문서들에서 절반 넘게 비어 있다. 출력이 그 사실을 말하지 않는다.

**H2. repo 주장의 수치는 기계 대조가 없다.**
위치: `check-claims.mjs:540` 의 `numeric-match` 는 paper 분기 안에 있다. repo 분기(`:552-586`)는 quote 위치만 본다. 스킬은 "같은 수치를 `numeric` 으로 올리면 게이트가 원문에서 찾아 막는다"고 쓴다 (`research-verify/SKILL.md:106-110`). paper 에서만 참이다.
재현: 이 저장소를 `self/x` 로 고정하고 `scripts/check-doc.mjs:25` 의 `const SIZE_LIMIT = 1024 * 1024;` 를 quote 로, 텍스트를 "파일 크기 한도는 9,999KB 다" 로 하는 `numeric` claim 을 만들면 통과한다.
영향: OSS 문서의 파일 수, 줄 수, 지연 같은 수치는 렌즈 B 한 곳에만 기댄다. 렌즈 B 는 프롬프트된 LLM 이다.

**H3. 워크플로가 라운드마다 `fixed` 를 덮어쓴다.**
위치: `research-chain.js:199` (`fixed = await agent(...)`), `:357-363` (PR 본문의 `needsJudgment`, `unverified`), `:392-394` (반환값), `:342-343` (draft 판정).
내용: 라운드 2의 프롬프트에는 재검증이 낸 새 결함만 들어간다(`:323`). 라운드 2가 돌려주는 `needsJudgment` 는 1라운드 항목을 모른다. 결과적으로 1라운드에서 사용자 결정이 필요하다고 표시한 항목이 PR 본문에서 사라지고, 목록이 비었으니 "ready for review" 로 열린다. `rejected` 도 마지막 라운드 것만 남는다.
재현: 코드 읽기. 1라운드 `needsJudgment` 1건과 재검증의 hard 1건이면 2라운드가 돈다.
같은 곳의 자매 결함: 재검증의 `wording` 항목은 개수만 남고 본문이 버려진다 (`:306`, `:308`). 스킬은 "기록한다"고 쓴다 (`research-verify/SKILL.md:219-221`).

**H4. quote 길이에 상한이 없다.**
위치: `check-claims.mjs:37` (`QUOTE_MIN = 40` 만 있다).
측정: skilladam 의 quote 94개는 중앙값 297자이고 26개가 500자를 넘으며 최대 1,827자다. jev 는 176개 중 46개가 500자를 넘고 최대 2,604자다. 첫 claim(c2)의 quote 는 논문 한 단락 전체다.
영향: 주장 한 문장의 근거로 단락을 통째로 인용하면 quote-match 는 무조건 맞는다. 어느 문장이 그 주장을 받치는지는 아무도 핀하지 못한다. 이 검사가 잡으려던 "인용이 그럴듯한데 위치가 다르다"를 놓친다.

**H5. 스킬과 워크플로가 저자에게 서로 다른 것을 시킨다.**
위치: `research-doc/SKILL.md:296-303` ("두 게이트가 통과하면 research-verify 로 이어 가라. 멈추고 묻지 마라"), `research-chain.js:13-15` ("프롬프트와 스킬이 어긋나면 스킬이 이긴다"), `:79-81` (경계: claims.jsonl 에 손대지 마라). `research-verify/SKILL.md:32-39` 는 렌즈로 호출된 에이전트만 오케스트레이션을 무시하라고 한다.
내용: 워크플로 규칙대로라면 phase 1 의 저자가 스킬을 따라 검증을 자기 컨텍스트에서 시작한다. 진단 문서는 PR #45 본문이 A 3회, B 4회, C 2회, D 1회를 적어 워크플로 밖에서 렌즈가 다시 돌았다고 기록한다 (`readability-diagnosis-2026-09-29.md:139-142`). 이 이중 실행이 원인이라는 증거는 없다. 원인일 수 있는 조건이 코드에 있다.
재현: 코드 읽기와 두 파일 대조.

**H6. 게이트가 실행되는 곳이 없다.**
위치: `.github/` 없음, `package.json` 없음, AGENTS.md 의 Commands(`AGENTS.md:60-70`)에 테스트 명령 없음.
재현: `node scripts/check-doc.mjs` 는 발행된 문서 1편을 막는다 (`2026-08-30-oversight-degradation-vs-auto-approval`, `title-subject`). `method-provenance.md:405` 의 "게이트가 발행 문서 19편 중 0편을 막는다"는 check-prose 에 대한 말이고 check-doc 은 아니다. `check-claims` 는 발행 문서 중 `2026-08-28-opsharness-self-evolving-rca` 의 출처 p2 에 `arxiv_id` 가 없다는 이유로 스스로 실패한다. `.gitignore:20` 과 `AGENTS.md:26` 은 원장이 없으면 "CI 도" 수치를 확인할 수 없다고 쓰는데 CI 가 없다.

### 중간

**M1. 게이트가 안 보는 것.** 전부 재현했다.
- 스캐폴드의 `TODO` 52개가 `check-doc` 과 `check-prose` 를 통과한다. `node scripts/new-doc.mjs 2026-09-29-zzz oss` 후 두 게이트를 돌리면 둘 다 OK 다. 실패하는 것은 나중에 `check-claims` 의 `empty-ledger` 뿐이다. 워크플로 phase 1 의 게이트는 앞의 둘이다 (`research-chain.js:66-67`).
- 슬라이드 문법: `check-doc.mjs:274-297` 는 eyebrow, svg, stat 만 본다. `.key`, `details.more`, `.note`, h2 는 안 본다.
- `setup` eyebrow 는 필수가 아니다 (`check-doc.mjs:28`). 스킬은 "매번 넣어라"고 한다 (`research-doc/SKILL.md:89-90`). 28편 중 4편에 없다 (wikikv, wikiloop, omo, claude-code-session-cost-model).
- 제목 네 곳(`meta.json`, `<title>`, `og:title`, `h1`)이 같아야 한다는 규칙 (`SKILL.md:116-118`)은 기계로 검사할 수 있는데 검사가 없다. 5편이 어긋난다 (세 편은 옛 h1, 두 편은 h1 없음).
- 문서 안의 `#pN` 링크는 안 본다 (`check-doc.mjs:246` 은 `../` 로 시작하는 링크만). 지금은 74개 모두 범위 안이라 결함은 아직 없다.
- 문서 문장과 claims 의 연결. 두 문서에서 본문 수치(소수와 퍼센트) 중 claims 텍스트에 나오는 비율은 skilladam 88%(81개 중 71개), jev 93%(101개 중 94개)다. 이 비율은 어디서도 계산되지 않는다.

**M2. claims 필드가 자유 형식이라 게이트가 아무것도 강제하지 못한다.**
- `verdict` 는 코퍼스에서 10종이다 (confirmed 1,253, bounded 30, computed 19, unverified 15, proposed 15, inference 12, measured 7, derived 4, observed 3, partial 1). 게이트는 `confirmed` 만 특별 취급한다 (`check-claims.mjs:444`).
- `scope` 는 비어 있지만 않으면 통과한다 (`:434`). skilladam 은 73개 중 66개가 같은 문장("고정된 원문/commit의 명시 범위.")이다.
- `absence` 의 `search` 는 있기만 하면 통과하고 재실행하지 않는다 (`:448`).
- 논문 출처의 `text_sha256` 누락은 캐시가 있는 기계에서만 잡힌다 (`:307-309`). 출처 검사 루프(`:198-202`)는 이 필드를 안 본다. 규칙 설명은 필수라고 적는다 (`:45`).

**M3. 렌즈 프롬프트의 좌표와 슬롯이 어긋난다.**
- "Coverage: chapter 7": `lens-adoption.md:13`, `:30`, `lens-numbers.md:14`, `research-verify/SKILL.md:74`, `research-source/SKILL.md:31`, `:235`, `research-chain.js:61`, `:92`. `setup` 이 일곱 번째 슬라이드인 문서는 28편 중 1편(insane-search)이다. jev 는 28번째, skilladam 은 23번째다. 렌즈 D 만 `setup` eyebrow 라고 맞게 쓴다 (`lens-completeness.md:19`). 렌즈 A 와 B 는 jev 에서 `calibration` 슬라이드를 열게 된다.
- `a.question` 은 초안과 수정 에이전트에만 가고 렌즈 네 개에는 안 간다 (`research-chain.js:54`, `:206`). `research-source` 는 문서가 답할 질문과 결론을 뒤집을 조건을 먼저 적으라고 하는데 (`SKILL.md:29-33`) 렌즈 A 는 그 질문을 모른 채 "도입을 결정할 수 있는가"를 판정한다.
- `a.kind` 는 선언만 있고 쓰이지 않는다 (`:19`). `new-doc.mjs` 를 부르라는 지시도 프롬프트에 없다. `draft.openQuestions` 는 수집만 하고 아무 데도 안 간다 (`:97`).
- `NOT_THE_AUTHOR` 가 모든 렌즈에 `evidence.jsonl` 경로를 준다 (`:118`). "저자의 확신은 넘기지 않았다"(`:121`)와 "초안을 검토하라, 작업 노트가 아니라"(`research-verify/SKILL.md:21`)에 어긋난다. A, C, D 는 그 파일을 읽을 이유가 없다.
- 렌즈 파일의 `{DOC_PATH}` 같은 슬롯은 워크플로가 채우지 않는다. 프롬프트의 `Document:` 라벨을 에이전트가 짝지어 읽는다. 지금은 통한다.

**M4. 워크플로의 조용한 실패.**
- 렌즈가 하나도 안 돌아와도 진행한다 (`research-chain.js:158-159`). `got` 이 빈 배열이면 수정 라운드가 빈 발견으로 돌고 `touchedSlides` 가 비면 `nothing-changed` 로 끝나 ready PR 이 열린다. 렌즈 성공 여부는 `run.json` 의 `lensesReported` 에만 있고 PR 의 draft 판정 목록에 없다 (`:357-363`).
- 렌즈 D 가 죽으면 `'(none)'` 으로 대체된다 (`:190`).
- ship 스키마에 `isDraft` 와 `docPath` 가 없는데 (`:377`) 반환값이 그것을 읽는다 (`:386-387`).
- 조기 종료 세 경로 (`:102-107`, `:326-328`)는 `run.json` 을 안 쓴다. 쓰는 주체가 마지막 ship 에이전트라서다.

**M5. 렌즈 D 의 "다른 모델" 논리가 세션 모델에 달려 있다.**
`research-chain.js:110-113` 는 판정자가 자기 출력에 관대하므로 D 는 다른 모델을 쓴다고 쓰고 `:176` 이 `model: 'sonnet'` 을 준다. 세션이 sonnet 이면 저자와 D 가 같은 모델이다. A, B, C 는 세션 모델을 상속한다. 가장 어려운 판정(인용은 맞는데 문장이 넓힌 경우)이 가장 싼 모델에 배정되어 있기도 하다.

**M6. claims 추출을 수정한 에이전트가 한다.**
`research-chain.js:215` 에서 수정 에이전트가 claims.jsonl 을 뽑는다. `research-verify/SKILL.md:22-24` 는 claims 를 "초안에서" 뽑으라고 하고 절차상 렌즈보다 앞이다 (`:82`). 워크플로에서는 편집을 한 컨텍스트가 편집 결과에서 뽑고, 검증 결과(verdict)도 스스로 적는다. 그 다음 그 claims 를 읽는 두 번째 독자가 없다.

**M7. 작은 스크립트 버그.**
- `check-doc.mjs:293`: `.stat` 안에 `<div>` 가 중첩되면 `.sub` 를 못 찾아 오탐한다. `<div class="stat"><div class="num">62.6</div><div class="sub">…</div></div>` 를 정규식에 넣으면 첫 `</div>` 에서 끊겨 `has .sub: false` 가 나온다. 재현했다. 현재 코퍼스는 span 형식이라 걸리지 않는다.
- `new-doc.mjs:235`: `rename` 이 `split(oldSlug).join(newSlug)` 로 모든 문서를 바꾼다. 옛 slug 가 다른 slug 의 접두어면 그 문서 링크가 망가진다. 같은 날짜에 접두어가 겹치는 슬러그는 아직 없다 (코드 읽기).
- `new-doc.mjs:111-130`: `nextSeq` 가 브랜치 로컬이다. 워크트리를 둘 띄워 각각 만들면 같은 seq 가 나오고 머지 뒤에야 `seq-unique` 가 잡는다 (코드 읽기).
- `pin-paper.mjs:31`: `tar xzf` 는 e-print 가 tar 라고 가정한다. 단일 파일 투고는 gzip 한 .tex 로 내려온다고 알고 있지만 이번 검토에서 확인하지 못했다.
- `check-prose.mjs:120`: 곧은따옴표 쌍(400자 이내)을 통째로 인용으로 보고 지운다. 저자가 강조용으로 따옴표를 쓴 문장도 검사에서 빠진다 (코드 읽기).
- `check-claims.mjs:104-106`: 아무 일도 하지 않는 반복문이다.

### 낮음 (낡은 문구)

- `check-prose.mjs:5`, `:15`, `:18`, `:76`, `:82`: 렌즈 C 가 판단한다고 쓴다. 같은 파일 `:20` 은 렌즈 C 는 구조만 본다고 쓴다. 헤더 주석 안에서 둘이 충돌한다.
- `research-verify/SKILL.md:63`: "Lens C (prose)". 렌즈 C 는 구조 감사인데 파일 이름 `lens-prose.md`, 워크플로 라벨 `lens:prose` (`research-chain.js:146`)도 그대로다.
- `prose-ko.md:6`: `lens-prose.md` 가 비유 금지를 담는다고 쓴다. 저장소 어디에도 비유 금지 규칙이 없다 (`metaphor` 검색은 이 한 줄뿐이다).
- `README.md:87`, `.gitignore:21`: 원장이 "문서당 수 KB"라고 쓴다. 실측은 0.3KB에서 406KB, 중앙값 약 51KB, 세 파일 합계 2.08MB다.
- `README.md:113` 은 게이트가 eyebrow 여섯 개만 본다고 하고 같은 파일 `:193` 은 덱 구조, 링크, 문안까지 본다고 한다. `research-doc/SKILL.md:49` 도 "구조는 그것 말고 안 본다"고 쓴다. `rail-count`, `dup-script`, `anchor-range`, `stat-sub` 가 있다.
- `README.md:115`, `new-doc.mjs:14`: "기존 세 문서"의 CSS. 지금은 28편이다.
- `AGENTS.md:99` 는 "커밋과 푸시는 요청받았을 때만"이라 하고 `research-chain.js` 의 ship 단계는 브랜치, 커밋, 푸시, PR 을 무인으로 한다 (`:334-371`). 워크플로 호출이 요청이라고 읽을 수 있지만 AGENTS.md 가 그 예외를 적지 않는다.
- `AGENTS.md`, `CLAUDE.md`, `README.md` 어디에도 `research-chain` 이 없다. 전체 체인의 진입점을 알려 주는 곳이 verify 스킬 본문 두 줄(`SKILL.md:7`, `:32`)과 `docs/` 뿐이다.
- `method-provenance.md:355`, `:447`: "사람 글 4.1~13.3%"가 이 저장소 측정값(30~38%)으로 바뀌었다는 표시 없이 남아 있다. `:217-218` 에 부분 주석이 있다.
- `docs/readability-diagnosis-2026-09-29.md:139` 는 에이전트 호출이 "최대 11회"라 쓰고 `:239` 는 `MAX_ROUNDS` 를 1로 제안하고 `:3-8` 은 2로 반영했다고 쓴다. 코드는 2다. 지금 최대는 10회다.

### 테스트가 없는 규칙

| 대상 | 규칙 수 | 시험이 있는 것 | 시험이 없는 것 |
|---|---|---|---|
| `check-prose.mjs` | 차단 11, 밀도 지표 11 | 차단 11개 전부 (41개 단언 통과, 실행 확인) | 밀도 지표 11개, `visiblePerSlide`, `HUMAN_BAND` |
| `check-doc.mjs` | 29 | 없음 | 전부 (`scripts/test/` 에 check-prose 것 하나뿐) |
| `check-claims.mjs` | 18 | 5개: `quote-match`, `locator-form`, `numeric-match`, `derived-inputs`, `source-drift` (13개 사례 통과, 실행 확인) | 13개: `empty-ledger`, `source-*`, `empty-evidence`, `quote-length`, `absence-search`, `behavioral-limits`, `history-claim`, `claim-kind-source`, repo 분기 전체 |
| 회귀 수정 | provenance 가 적은 것 넷 | 없음 | `empty-ledger`, LaTeX 천 단위 구분자(`fixNums`), 로마자 표 번호, 컴파일되지 않는 LaTeX 제거(`stripUncompiled`) |
| `new-doc.mjs`, `build-index.mjs`, `research-chain.js` | | 없음 | 전부 |

`paper-path.test.mjs` 는 `~/.research-papers` 캐시와 고정 sha 에 기대고 (`:26`, `:29`) 캐시가 없으면 `pin-paper.mjs` 를 네트워크로 먼저 돌려야 한다. 이 기계에는 캐시가 있어 13/13 이 통과했다.

## 4. 일관성

### 4.1 같은 것을 다르게 부르거나 다르게 말하는 곳

| 항목 | 파일별 표기 | 판정 |
|---|---|---|
| 독자 | `research-source/SKILL.md:24` 개발자, `research-doc/SKILL.md:27-31` 개발자이며 시험은 "예측", `visual.md:3` 개발자, `lens-adoption.md:7` "도입을 결정해야 하는 개발자", `lens-completeness.md:11` "개발자에게 빠진 것", `oss.md:6` "독자는 도입 여부를 판단한다" | 정의가 여섯 곳이고 `oss.md:6` 이 `SKILL.md:29`("도입은 한 각도이지 시험이 아니다")와 반대다. 렌즈 A 는 모든 문서에 adopt/hold 를 요구하고 논문 문서에도 라이선스와 유지 보수를 묻는다 |
| 렌즈 C 이름 | 파일 `lens-prose.md`, 라벨 `lens:prose`, 제목 "structure auditor" (`lens-prose.md:1`), `verify/SKILL.md:63` "(prose)", `:143` "Structure", `check-prose.mjs` 주석 두 종류, `prose-ko.md:6` "비유 금지를 담는다" | 세 가지 이름과 두 가지 임무가 섞여 있다 |
| `.dek` 와 `.key` | `SKILL.md:129-142` `.key` (1~2문장), `new-doc.mjs:90-91` `.dek` ("2~4문장"), `lens-prose.md:42` 둘 다, `evals.json:8` dek, `deck-shell.html` 둘 다 스타일 | 스캐폴드와 스킬이 다른 문법을 말한다. 코퍼스는 dek 542, key 0 |
| 라운드 규칙 | 스킬 `verify/SKILL.md:216-223` "hard 결함이 없을 때까지, wording 은 기록만", 워크플로 `research-chain.js:3` "라운드가 깨끗해질 때까지", `:179-182` "두 번째 라운드가 찾는다", `:185-187` "기본 한 라운드", `:188` 상한 2, 95fc1e4 제목 "한 라운드로 줄이다" | 동작은 "수정 1 + 재검증 1을 항상, hard 결함이 나오면 한 번 더"다. 메타 설명 문구만 "깨끗해질 때까지"로 남았다 |
| 렌즈 개수와 분리 | `provenance:13` "렌즈 셋이 서로 못 본다", AGENTS.md `:43` "렌즈 넷, 분리된 컨텍스트", `verify/SKILL.md:130` "A, B, C 를 읽어 각각 서브에이전트로", `:151` D 는 A/B/C 보고서를 받는다 | 실제로는 셋이 분리되고 넷째는 앞 셋을 본다. AGENTS.md 문구는 D 에 대해 틀린다 |
| 커버리지 장 | "chapter 7" 7곳, ⑦ 5곳, `setup` eyebrow 1곳 (`lens-completeness.md:19`) | 코퍼스에서 맞는 것은 `setup` 뿐이다 (3절 M3) |
| 게이트가 보는 구조 | `README.md:113`, `SKILL.md:49` 는 eyebrow 뿐, `README.md:193` 은 더 많음 | 게이트 코드는 후자다 |
| 원장 크기 | `README.md:87`, `.gitignore:21` 수 KB | 실측 0.3~406KB |
| 사람 밴드 | `prose-ko.md:173-178` 30~38%, 1.3~1.6/100자. `HUMAN_BAND` (`check-prose.mjs:95-105`) 29.8/37.7, 1.28/1.59 | 일치. 예외는 provenance 옛 문단 두 곳 |
| 슬라이드 분량 | `visual.md:30`, `check-prose.mjs:264` "300~400자" | `provenance:238` 이 "슬라이드 두 장의 값이지 코퍼스가 아니다"라고 적는다. 스킬 본문은 그 단서를 안 싣는다 |
| 같은 규칙의 복사본 | "일반으로 훑지 마라" `SKILL.md:218-220` 과 `oss.md:90-93`(같은 문장이 두 번), 경로가 프로세스 경계 안에서 끝나라 `SKILL.md:184-191`, `oss.md:34-35`, `research-source`, 런타임 주장 ✗/✓ 예시 `SKILL.md:199-203` 과 `oss.md:74-78` | AUTHORING.md:21 의 "규칙마다 소유자 하나"를 어긴다 |
| 사례 표본 재사용 | "표 9 격차 7.5/12.8/9.6 → 5.1/10.5/16.9" 가 `prose-ko.md:304`, `lens-numbers.md:32`, `:66`, `verify/SKILL.md:181`, `paper.md:31` 다섯 곳 | AUTHORING.md:15-16 은 특정 문서의 사실을 예시로 쓰지 말라고 한다 |
| 출처 서술이 스킬 안에 있다 | `prose-ko.md:174-175`("측정하면 30~38%"), `:192-193`, `:213-214`, `visual.md:29-32`("670~1,080자"), `paper.md:57`("A real case"), `lens-numbers.md:36-41`, `SKILL.md:155-158`("mature TypeScript monorepo") | AUTHORING.md:11-13 은 출처와 측정을 `docs/` 로 빼라고 한다 |
| 지시문의 대구 문형 | `research-doc/SKILL.md` 에 `is not`, `are not`, `does not` 20회. `verify/SKILL.md` 12, `prose-ko.md` 16 | AUTHORING.md:51-54 가 금지하는 문체다. 95fc1e4 는 이 규칙을 추가했지만 `SKILL.md` 를 이 기준으로 고치지 않았다 (`SKILL.md` 변경 15줄) |

### 4.2 지시문 분량

단어는 `wc -w` 다. 토큰은 단어 수에 1.35를 곱한 추정이다.

| 컨텍스트 | 구성 | 단어 | 토큰(추정) |
|---|---|---|---|
| 저자 (paper) | AGENTS 863, CLAUDE 38, source 2,143, doc SKILL 2,859, prose-ko 2,639, visual 1,709, paper 768 | 11,019 | 약 14,900 |
| 저자 (oss) | 위에서 paper 를 oss 903 으로 | 11,154 | 약 15,100 |
| 렌즈 A / B / C / D | AGENTS 863 + 렌즈 파일 609 / 554 / 794 / 483 + prose-ko 2,639 (`REPORT_SHAPE` 가 한국어 보고서 규칙으로 지정) | 4,111 / 4,056 / 4,296 / 3,985 | 각 약 5,400~5,800 |
| 수정 에이전트 | AGENTS 863 + verify SKILL 2,330 | 3,193 | 약 4,300 |
| 전체 스킬 파일 | 스킬 셋, references, AUTHORING, AGENTS, CLAUDE | 17,175 | |

규칙 수의 대용치로 굵은 글씨 지시를 세면 저자 컨텍스트(paper)에서 약 99개(prose-ko 36, doc SKILL 20, visual 19, source 12, AGENTS 9, paper 3), oss 는 약 110개다. 정확한 규칙 수가 아니라 굵게 표시된 지시의 수다. 진단 문서의 73개(`readability-diagnosis:112-114`)는 source 와 AGENTS 를 뺀 값이다. `method-provenance.md:274` 가 인용한 "약 80개에서 준수가 무너진다"(arXiv:2607.19257)는 이번에 열어 보지 못했다.

렌즈가 prose-ko 2,639단어를 읽는 이유는 보고서를 한국어로 쓰기 위해서다. 렌즈 C 는 이것을 "용어가 무슨 뜻인지"를 위해서도 읽는다(`lens-prose.md:16`). 필요한 것은 영어로 남길 용어 목록 한 줄과 보고서 형식이다.

## 5. 효율

### 5.1 문서 한 편에 드는 호출

`research-chain.js` 가 도는 호출은 표준 8회, 최대 10회다. 여기에 저자가 필요하다고 판단해 띄우는 압축 서브에이전트가 0회 이상 더해진다 (`research-doc/SKILL.md:153-182`).

표준 경로는 draft 1 + 렌즈 A, B, C 3 + D 1 + 수정 1 + 재검증 1 + ship 1 이다. 재검증이 hard 결함을 내면 수정과 재검증이 한 쌍 더 돈다(최대 10회). 직렬 단계는 표준 6개(draft, 렌즈 세 개 병렬, D, 수정, 재검증, ship), 최대 8개다.

### 5.2 호출별 입력과 출력 추정

토큰은 바이트를 3.5로 나눈 값이다(한글 3바이트와 영문 섞임 기준, ±40%로 본다). 문서는 base64 를 뺀 본문 기준이다. 두 열은 skilladam / jev 다.

| 호출 | 고정 지시문 | 문서 (`index.html`) | 원장 | 원문 읽기 | 출력 |
|---|---|---|---|---|---|
| draft | 14.9K | 쓰면서 늘어남 (셸 23KB 약 6.6K) | evidence 씀 | 논문 2편 LaTeX 172K자, 약 49K / 출처 72개 | 문서 23K / 42K, evidence 12K / 40K |
| 렌즈 A | 5.5K | 23K / 42K | sources 1K / 8K, evidence 12K / 40K | 없음 | 보고서 수 K |
| 렌즈 B | 5.4K | 23K / 42K | 같음 | 약 49K / (미상) | 보고서 수 K |
| 렌즈 C | 5.8K | 23K / 42K | 같음 | 없음 | 보고서 수 K |
| 렌즈 D (sonnet) | 5.4K | 23K / 42K | 같음 + 세 보고서 5~10K | 없음 | 보고서 수 K |
| 수정 1 | 4.3K | 23K / 42K | 보고서 4개 10~15K | 발견마다 원문 재확인 | claims.jsonl 19K / 45K + 수정 |
| 재검증 1 | 1.2K | 바뀐 슬라이드 | | 바뀐 주장의 원문 | JSON 소량 |
| 수정 2 + 재검증 2 (조건부) | 5.5K | | | | |
| ship | 1.2K | | | | PR 본문 |

렌즈 단계의 입력만 합치면 skilladam 약 215K 토큰(렌즈 4 × 41.5K + 논문 49K), jev 약 380K 토큰(렌즈 4 × 95K, B 의 원문 읽기 제외)이다. 첫 읽기만 센 하한이고, 렌즈가 문서를 여러 번 다시 읽는 비용은 뺐다.

**렌즈가 원본 HTML 을 그대로 읽으면 이 수치의 몇 배가 된다.** 프롬프트는 `Document: research/<slug>/index.html` 만 준다. 28편 중 10편은 base64 그림이 문서 바이트의 70~91%이고(skilladam 912KB 중 832KB, jev 657KB 중 511KB), 같은 환산으로 원본 전체는 skilladam 약 261K, jev 약 188K 토큰이다. 렌즈가 실제로 이 파일을 어떻게 열었는지는 기록이 없어서 모른다. 프롬프트가 base64 를 피하라고 말하지 않는다는 것만 사실이다. 검토 중에 `grep TODO` 한 번이 그림 한 장의 base64 를 그대로 쏟아냈다.

**claims.jsonl 이 quote 를 다시 적는다.** 코퍼스 claims.jsonl 1.32MB 중 quote 가 46%이고, 그 quote 바이트의 58% 이상이 `evidence.jsonl` 에 이미 있는 문장의 복사다 (evidence 가 없는 문서는 분자에서 0이므로 하한). claims 출력 토큰의 약 27%가 재복사다. 수정 에이전트가 이 출력을 만든다.

### 5.3 줄일 수 있는 곳

| # | 무엇을 | 근거 | 예상 효과 | 위험 |
|---|---|---|---|---|
| E1 | 렌즈 C 를 에이전트에서 스크립트로 내린다. 제목 네 곳 일치, 문서 내부 `#pN`, 슬라이드 요소 순서, aria-label 최소 길이와 "그림 N" 금지, `TODO` 잔재를 `check-doc.mjs` 에 넣는다. 반복 감지(`lens-prose.md:20-24`)와 h2 판정은 저자의 읽기 패스나 렌즈 D 로 넘긴다 | C 의 항목 중 기계로 판정되는 것이 다섯이다 (M1 의 세 개 포함). C 는 자기 파일이 선언하듯 취향을 발견으로 내는 자리다 (`lens-prose.md:9-12`) | 호출 8→7, 렌즈 입력 약 1/4 감소 (skilladam 약 42K, jev 약 95K 토큰) | 반복 감지가 저자 읽기에 떨어진다 |
| E2 | 렌즈 D 의 임무 다섯 중 셋을 스크립트로 내린다. "쓰이지 않은 출처"는 `sources.jsonl` id 와 claims 의 evidence id 의 차집합이다. "사라진 검색 실패"는 `archive_status` 와 문서 전문 대조, "실행하지 않은 양식"은 run.json 필드다. 남는 "인용은 맞고 문장이 넓힌 경우"는 렌즈 B 로 옮긴다. B 는 이미 원문을 다시 열고 외부 신호(check-claims)가 붙어 있다 | D 는 A/B/C 보고서를 기다려 직렬이고 (`research-chain.js:164`), 가장 어려운 판정을 가장 싼 모델이 맡는다 (M5) | 호출 7→6, 직렬 단계 1개 감소, D 입력 40~100K 토큰 제거 | B 의 프롬프트가 길어진다. 한 렌즈가 두 임무를 갖는다 |
| E3 | 렌즈를 A(논증)와 B(수치와 인용)만 남긴다. `verify/SKILL.md:275` 의 "렌즈를 합치지 마라"는 관점의 혼합을 막는 규칙이다. E1, E2 는 관점을 합치지 않고 기계 항목을 스크립트로 내린다 | 진단 문서가 인용한 문헌은 프롬프트된 LLM 피드백만으로는 자기 교정이 안 된다고 정리한다 (`readability-diagnosis:148-154`). 외부 신호가 붙은 것은 B 뿐이다 | E1+E2 합계: 호출 8→6 (25% 감소), 렌즈 단계 입력 skilladam 약 83K, jev 약 190K 토큰 감소 | A 도 프롬프트된 LLM 판정이다. 2주 뒤 telemetry 로 A 의 발견이 실제로 고쳐지는지 봐야 한다 |
| E4 | 텍스트 뷰를 표준화한다. `scripts/doc-text.mjs research/<slug>` 가 슬라이드 번호가 붙은 보이는 텍스트를 내고, data URI 는 `[img 279KB]` 로 접고, `details.more` 는 표시한다. 모든 렌즈가 이것을 읽는다 | 10편이 70% 넘게 base64 다 | 렌즈가 원본을 열고 있었다면 렌즈당 skilladam 약 238K, jev 약 146K 토큰 감소. 이미 피하고 있었다면 0 | 그림 alt 확인은 원본으로 가야 한다 |
| E5 | `evidence.jsonl` 은 렌즈 B 에만 넘긴다 (`research-chain.js:118`) | A, C, D 에 줄 이유가 없고 독립성을 해친다 (M3) | 렌즈 셋 × 12~40K 토큰 (skilladam 약 37K, jev 약 119K) | 없음 |
| E6 | claims 가 quote 대신 evidence id 를 참조한다. `check-claims` 가 evidence.jsonl 에서 quote 를 가져와 대조하고, quote 는 400자 이하로 제한한다 | 코퍼스에서 재복사 27% 이상. 상한이 없어 문단이 통째로 들어간다 (H4) | 수정 에이전트 출력 약 27~46% 감소 (jev 약 12~20K 토큰), 원장 크기 감소 | 기존 원장 마이그레이션 |
| E7 | 보고서 형식 카드를 만든다. 렌즈와 수정 에이전트는 prose-ko 전체 대신 영어로 남길 용어 목록과 보고서 예시 20줄만 읽는다 | 렌즈는 산문을 쓰지 않고 목록을 낸다. 진단이 찾은 압축체는 문서 문제이고 보고서에는 다른 요구가 있다 | 호출 6회 × 약 3.6K 토큰 | 보고서 문체가 달라질 수 있다 |
| E8 | 문서 종류에 따라 경로를 나눈다. `category: note` 같은 짧은 문서는 렌즈 A 와 D 를 건너뛴다. 지금은 `a.kind` 가 죽어 있고 (`research-chain.js:19`) 경로는 하나뿐이다 | 코퍼스 28편 중 메모 2편, 슬라이드 13~31장이 같은 절차를 지난다 | 짧은 문서는 호출 8→5 | 종류 판단이 입력이 되어야 한다 |

없애도 되는 단계는 없다. 재검증은 남겨야 한다. `method-provenance.md:132-142` 가 deepseek 문서에서 마지막 라운드의 편집이 만든 결함 셋을 재검증이 찾은 사례를 적고 있다. 수정 2 + 재검증 2 는 존재 이유가 telemetry 에 달렸다. 실행 기록 5건이 쌓이면 두 번째 라운드가 hard 결함을 얼마나 찾는지 보고 정한다.

### 5.4 수정 에이전트의 몫을 나눈다

수정 에이전트는 발견 확인, 문서 수정, claims 추출, 스크립트 네 개, 렌더링을 한 번에 한다 (`research-chain.js:199-224`). claims 추출을 별도의 싼 호출로 떼면 (a) 편집한 컨텍스트가 자기 결과를 뽑는 문제가 줄고 (M6), (b) 수정 에이전트의 출력이 줄고, (c) claims 를 뽑는 쪽이 evidence id 를 고르는 일이 된다(E6). 호출이 하나 늘지만 그 호출은 sonnet 으로 충분하다.

## 6. 놓친 것

**독자 목적별 분기.** 사용자는 자기 자신과 동료가 읽는다고 했다. 두 독자는 다른 것을 원한다. 자신은 몇 달 뒤 "이게 무엇이었고 무엇을 확인했나"를 찾고, 동료는 "우리 쓰는 데 맞나"를 본다. 하네스는 독자를 "개발자" 한 종류로 정의하고 렌즈 A 는 모든 문서에 adopt/hold 를 요구한다. 코퍼스 28편 중 9편이 `topic` 인데 `new-doc.mjs:133` 은 `paper` 와 `oss` 만 만들고 `references/` 에 topic 용 안내가 없다. 가장 최근 문서(jev)가 topic 이다. `meta.json` 에 `purpose`(`decide`, `understand`, `reference`) 를 두고 스캐폴드의 ⑩장과 렌즈 A 의 질문을 그것에 따라 바꾸는 것이 가장 작은 분기다.

**스캔 독자의 시험.** 두괄식과 핵심 구분은 지금 사용자 판단으로만 확인된다. 취향을 묻지 않고 복원 가능성을 재는 시험이 하나 있다. 문서에서 접힌 `details.more` 를 빼고 `tl-dr` 슬라이드와 슬라이드별 `h2` 와 `.key` 만 남긴 스캔 뷰를 만들어 새 컨텍스트에 주고, "이 문서가 주장하는 것 다섯 개와 그 조건"을 쓰게 한 뒤, 저자의 claims 와 맞춘다. 진단 문서가 인용한 한국어 자연스러움 평가의 낮은 일치도(ICC .091)는 취향 질문에만 걸린다. 이 시험은 정답(claims)이 있는 질문이다. 비용은 입력 1만 자 안팎의 짧은 호출 하나다.

**문서 간 갱신과 상호 링크.** 코퍼스에서 다른 문서로 링크하는 문서는 12편이고 `series` 를 쓰는 문서는 3편이다. `meta.json` 에 `updated`, `status`, `supersedes` 가 없어서(0편) 목록도 문서도 "이 문서가 아직 유효한가"를 말하지 않는다. `sources.jsonl` 은 고정된 커밋을 알고 있으므로 `git ls-remote` 로 upstream HEAD 와의 거리(커밋 수는 못 얻어도 sha 가 다른지)를 재는 `check-drift.mjs` 를 만들 수 있다. 오래된 OSS 문서(경로를 추적한 ⑥장이 있는 문서)가 가장 먼저 낡는다.

**실행 기록의 집계.** `run.json` 은 있는데 읽는 스크립트가 없다. `notes/` 가 gitignore 라 다른 기계의 기록은 볼 수 없다. 시간, 토큰, 렌즈별 발견 수와 반영 수, 라운드에서 hard 결함이 나온 비율이 없다. 진단 문서의 제안 F 가 "렌즈별 발견·기각 수와 단계별 소요 시간"을 적었는데 구현된 것은 라운드별 개수뿐이다 (`research-chain.js:352`).

**검증 상태의 표시.** 발행 페이지도 목록도 그 문서가 검증을 통과했는지 말하지 않는다. 코퍼스에는 원장이 없는 문서(omo), claims 가 비어 있는 문서(wikiloop), evidence 가 없는 문서 10편, 웹 근거가 절반인 문서(jev)가 섞여 있고 독자는 구별할 수 없다. `meta.json` 의 `verification` 한 줄(`ledger: full | partial | none`, `web_unarchived: N`)이면 충분하다.

**다른 기계에서 한 번에 재확인.** 다른 기계에서 `check-claims` 를 돌리려면 저장소를 하나씩 clone 하고 논문마다 `pin-paper.mjs` 를 돌려야 한다. 이 기계에서 24편이 실패했고 그 가운데 21편이 그 때문이었다. `--fetch` 옵션이 고정 커밋 clone 과 `pin-paper` 를 대신하면 "다른 기계에서 확인"이 명령 하나가 된다.

## 7. 제안

효과는 위 절의 추정과 재현에서 나온다. 수정 파일은 그 제안이 건드리는 것들이다.

### 우선순위 1: 결과를 잃거나 잘못 통과시키는 것

| # | 제안 | 예상 효과 | 바꿀 파일 |
|---|---|---|---|
| P1 | `check-claims` 가 웹 근거뿐인 claim 을 "미검증 N건"으로 출력하고 기본으로 막는다 (`--allow=web-unchecked`). 웹 출처 스키마에 `archive_url` 과 `text_sha256` 를 정의한다. `pin-web.mjs` 가 보존본을 받아 해시를 남기고 quote-match 를 한다 | 21% claims 의 검증이 생기거나 그 부재가 출력에 드러난다 | `check-claims.mjs`, 새 `pin-web.mjs`, `research-source/SKILL.md`, `new-doc.mjs` (scaffold 주석) |
| P2 | repo 주장에도 수치 대조를 넣는다. quote 상한 400자, `verdict` 열거형(`confirmed`, `unverified`, `derived`, 나머지는 note), `scope` 중복 경고, `text_sha256` 누락을 출처 루프에서 잡는다 | H2, H4, M2 | `check-claims.mjs`, `research-verify/SKILL.md` |
| P3 | 워크플로 수정: 라운드 결과를 누적하고, 렌즈가 하나라도 안 돌아오면 draft PR 로 열며 `unverified` 에 적는다. wording 본문을 남긴다. ship 스키마에 `isDraft`, `docPath` 를 넣는다. 조기 종료에도 `run.json` 을 쓴다 | H3, M4 | `research-chain.js` |
| P4 | phase 1 프롬프트에 "게이트 통과 후 멈춘다. 검증은 phase 2 가 한다"를 넣고 `research-doc/SKILL.md:296-303` 의 hand-off 를 워크플로 밖 경로로 한정한다 | H5 | `research-chain.js`, `research-doc/SKILL.md` |
| P5 | CI 를 둔다. `.github/workflows/gates.yml` 에서 `check-doc`, `check-prose`, 두 테스트를 돌린다. 지금 막히는 문서 1편(`title-subject`)과 원장이 깨진 문서를 먼저 정리한다 | H6 | `.github/workflows/`, `package.json`, `AGENTS.md` (명령 한 줄) |

### 우선순위 2: 요건과 이음매를 맞춘다

| # | 제안 | 예상 효과 | 바꿀 파일 |
|---|---|---|---|
| P6 | 스캐폴드를 새 문법으로 바꾼다 (`.key` 1~2문장, `details.more` 자리). `check-doc` 에 `todo-left`, `title-agree`, `slide-grammar`(h2 와 `.key` 존재, `.dek` 는 경고 없이 허용하되 `.key` 없는 새 문서 차단은 날짜 기준)를 넣는다. 각각 시험을 추가한다 | M1, `.dek/.key` 불일치, 가독성 요건이 게이트에 닿는다 | `new-doc.mjs`, `check-doc.mjs`, 새 `scripts/test/check-doc.test.mjs`, `evals.json` |
| P7 | 독자 정의를 `research-doc/SKILL.md` 한 곳에 두고 나머지는 포인터로 바꾼다. `oss.md:6` 을 고친다. 렌즈 A 가 "예측 시험"을 판정 항목으로 흡수하거나, 그 시험의 소유자를 스캔 독자 시험(6절)에 준다 | 독자 정의 6곳 → 1곳, 독자 시험의 주인이 생긴다 | `research-doc/SKILL.md`, `visual.md`, `oss.md`, `lens-adoption.md`, `lens-completeness.md`, `research-source/SKILL.md` |
| P8 | "chapter 7" 을 "`setup` eyebrow 슬라이드"로 바꾸고 `a.question` 을 렌즈 프롬프트에 넣는다. `a.kind` 를 쓰거나 지운다 | M3 | `lens-adoption.md`, `lens-numbers.md`, `research-verify/SKILL.md`, `research-source/SKILL.md`, `research-chain.js` |
| P9 | 낡은 문구를 한 번에 고친다. `check-prose.mjs` 주석의 렌즈 C 표기, `lens-prose.md` 의 이름 정리(파일은 그대로 두고 라벨만 `lens:structure`), `prose-ko.md:6`, README 두 곳과 `.gitignore:21`, AGENTS.md 에 `research-chain` 진입점과 "워크플로 ship 은 요청된 커밋이다" 한 줄 | 낮음 전체 | 위 열거된 파일 |

### 우선순위 3: 비용과 확장

| # | 제안 | 예상 효과 | 바꿀 파일 |
|---|---|---|---|
| P10 | E1~E3 로 렌즈를 A, B 둘로 줄이고 기계 항목을 스크립트로 내린다. E4, E5 로 렌즈 입력을 정리한다. 이 순서로 적용하고, 적용 전후 `run.json` 을 비교한다 | 호출 8→6, 렌즈 입력 절반 이하 | `research-chain.js`, `check-doc.mjs`, `lens-*.md`, `verify/SKILL.md`, 새 `doc-text.mjs` |
| P11 | E6 으로 claims 가 evidence id 를 참조하게 한다. claims 추출을 별도 호출로 뗀다 | 원장 크기와 수정 에이전트 출력 감소 | `check-claims.mjs`, `research-chain.js`, `verify/SKILL.md`, `research-source/SKILL.md` |
| P12 | telemetry: 각 단계가 시작과 끝 시각, 렌즈별 발견 수와 반영 수를 `run.json` 에 남기고, `.research/<slug>/run.json` 을 커밋한다(수 KB). `scripts/runs.mjs` 가 표로 모은다 | "오래 걸린다"와 "두 번째 라운드가 무엇을 찾나"에 숫자로 답한다 | `research-chain.js`, 새 `scripts/runs.mjs`, `.gitignore` |
| P13 | 스캔 독자 시험을 phase 2 에 하나 더한다 (6절) | 두괄식과 핵심 구분에 정답이 있는 시험이 생긴다 | `research-chain.js`, 새 렌즈 파일 |
| P14 | `meta.json` 에 `purpose`, `verification`, `updated`, `status` 를 도입한다. `check-drift.mjs` 와 `check-claims --fetch` 를 만든다. topic 유형 스캐폴드와 안내를 둔다 | 6절의 놓친 것 다섯 | `new-doc.mjs`, `build-index.mjs`, `check-doc.mjs`, `research-doc/references/topic.md`(새) |
| P15 | AUTHORING.md 기준으로 스킬 본문을 정리한다. 복사된 규칙, 표 9 표본, 출처 서술, 대구 문형을 걷어낸다. 저자 컨텍스트의 굵은 글씨 지시를 80개 아래로 줄이는 것을 목표로 잡는다. `skill-creator` 로 고친다 | 저자 컨텍스트 약 11,000 → 10,000단어 안팎(중복 항목을 손으로 합산한 추정) | 스킬 파일 전반 |

먼저 할 순서는 P3, P1, P2(H1~H4 를 막는 것), P6, P5, P10 이다. P12 를 P10 보다 먼저 넣으면 줄인 효과를 잴 수 있다.

## 8. 이 검토가 보지 못한 것

- 워크플로 코드를 실행하지 않았다. H3, M4, M5, M6 과 5절의 호출 수는 코드를 읽은 결과이고 실행 로그가 아니다.
- 실제 렌즈 에이전트가 문서를 어떻게 열었는지, 그 입력이 얼마였는지 알 수 없다. 5절의 렌즈 입력은 바이트 환산이고 E4 의 효과는 조건부다.
- `~/.research-papers` 에 없는 논문과 체크아웃하지 않은 저장소는 열지 않았다. 그 문서들의 quote-match 결과는 모른다. 웹 근거 21%는 원장의 출처 종류로 센 것이고, 웹 페이지 내용은 열어 보지 않았다.
- 렌더된 페이지는 열지 않았다. 슬라이드 분량과 가독성은 `--counts` 와 HTML 구조로만 봤다.
- 사람 밴드의 표본(회사 블로그 86편)이 보고서형 기술 문서를 대표하는지는 이번에 재지 않았다.
- `method-provenance.md` 가 인용한 논문들(arXiv:2607.19257 등)은 이번에 열지 않았다.
- 문서 두 편의 본문 문장을 정독해 품질을 평가하지 않았다. 구조와 원장만 봤다.
