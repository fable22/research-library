# Prompt audit (2026-09-29)

`/claude-api prompt-audit` 절차(Step 0~6)를 이 저장소의 지시문 표면에 적용한 결과다. 보고서와
제안 diff 둘 다 여기 있고, 파일에는 아무것도 적용하지 않았다.

## Step 0. 전제

- **범위**: 저장소의 지시문 표면 전부. `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**/*.md`
  (스킬 3개, references 8개, `AUTHORING.md`), `.claude/workflows/research-chain.js` 안의 에이전트
  프롬프트. `~/.claude/` 등 저장소 밖은 제외. `.claude/settings*.json`, `.mcp.json` 은 읽지 않았다.
- **대상 모델**: 워크플로 에이전트는 이름을 고정하지 않으므로 이 검토를 돌리는 모델(Claude
  Fable 5.1)과 오늘 실제로 문서를 쓴 모델(Claude Opus 5.5) 둘을 대상으로 본다. 렌즈 D 는
  `research-chain.js` 가 `sonnet` 으로 고정하므로 Claude Sonnet 5.5 기준.
- **근거 문서**: Anthropic 의 Prompting best practices, Prompting Claude Opus 5.5, Prompting
  Claude Fable 5.1, Claude Code best practices, Skill authoring best practices, 그리고 `claude-api`
  스킬의 `prompt-audit.md`. 오늘(2026-09-29) 열어 읽었다.

## 요약

지시문 총량 17,889단어. 옛 모델용 압박 문구는 없다. 대문자 `MUST/NEVER/ALWAYS` 0건, "think step
by step" 류 0건, 수치 상한("N단어 이하") 0건, "try to / if possible" 0건. 이 저장소의 지시문은
2세대·3세대 모델용 습관에서는 깨끗하다.

문제는 다른 축에 있다. 셋이 크다.

1. **같은 것을 두 파일이 반대로 말한다 (Group 2, 높음).** 장마다 `.note` 면책을 요구하는
   `research-doc/SKILL.md:151` 과 면책 문장 형태를 금지하는 `prose-ko.md:162`. 조건을 문장에
   남기라는 `prose-ko.md:184` 와 조건을 접으라는 `SKILL.md:131~139`. 모델은 둘 다 지켜서 문장이
   길어진다. 오늘 v2 문서에서 문장 119개 중 63개가 h2·key·note 틀이었던 것이 이 결과다.
2. **판단 과제에 근거 서술이 규칙보다 많다 (Group 1c, 중간).** `prose-ko.md` 2,026단어 중 ✗/✓
   쌍은 3분의 1이고 나머지는 "이 부류가 가장 오래 살아남는 이유" 같은 설명이다. `AUTHORING.md:11`
   이 근거를 `docs/` 로 보내라고 정해 두고 정작 지키지 않는다. Anthropic 의 skill 지침은 "Claude
   is already very smart. Only add context Claude doesn't already have" 이고, 5세대 프롬프팅
   지침은 "Positive examples showing the desired level … tend to be more effective than negative
   examples or instructions telling the model what not to do" 다.
3. **리뷰어에게 "찾아내라"만 있고 "무엇이 발견인가"가 없다 (Group 4 재기준, 중간).**
   `research-chain.js:128` "Do not assume it is right; start from where it would be wrong." Claude
   Code best practices 는 같은 구조를 두고 이렇게 적는다: "A reviewer prompted to find gaps will
   usually report some, even when the work is sound … Tell the reviewer to flag only gaps that
   affect correctness or the stated requirements, and treat the rest as optional." 오늘 run.json 의
   렌즈 A needs_judgment 11건, C 10건이 그 결과다.

부류별 건수: Group 1 (dated text) 7, Group 2 (skill/config) 6, Group 3 (tool descriptions)
해당 없음, Group 4 (request/architecture) 3, 재기준 추가(keep-list 11) 3.

## 발견 (신뢰도 순)

### 높음

**F1.** `research-doc/SKILL.md:135-136, 151` ↔ `prose-ko.md:162-168`
- 근거: SKILL "`.note` one sentence that closes the chapter with what it does not cover … A chapter
  with no `.note` qualifier has usually overclaimed." / prose-ko "**A disclaimer sentence after the
  claim.** `~라는 뜻은 아니다` … make the limit real and its shape wrong. Put it in the clause it
  limits."
- 패턴: Group 2, 지시문끼리 모순.
- 왜: 한 파일은 장 끝 면책 문장을 요구하고 다른 파일은 그 형태를 금지한다. 둘 다 2026-09-29
  에 쓰였으므로 blame 으로 순서를 가를 수 없다. 오늘 문서의 note 17개 중 13개가 면책이다.
- 조치: `rewrite`. `.note` 를 선택 요소로 바꾸고 "독자의 행동을 바꾸는 단서만" 으로 한정한다.
  "no `.note` … has usually overclaimed" 문장 삭제.

**F2.** `prose-ko.md:184-195` ↔ `research-doc/SKILL.md:131-139`
- 근거: prose-ko "**Keep these even when they make a sentence longer:** … Conditions on a claim …
  Where a number came from … What was not checked." / SKILL "`details.more` takes … the
  condition in full … A stat card's `.sub` is one line and the second sentence it wanted goes to
  the fold."
- 패턴: Group 2, 모순.
- 왜: 조건과 출처 위치를 보이는 문장에 남기라는 규칙과 첨언으로 접으라는 규칙이 동시에
  살아 있다. 모델은 양쪽에 다 쓴다.
- 조치: `rewrite`. prose-ko 의 「Keep the content while trimming」을 "무엇을 잃지 말 것"(수치의
  비교 기준, 조건, 반례)만 남기고 **어디에 둘지**는 SKILL 의 장 문법 한 곳이 정하게 한다.

**F3.** `research-doc/SKILL.md:120-152` (장 문법) ↔ `prose-ko.md:197-208` (「Paragraph shape」)
- 근거: 장 문법 "h2 a claim sentence / .key one or two sentences / … / .note"; 문단 형태 "주장 한
  문장. 근거 한두 문장. 단서가 있으면 마지막에."
- 패턴: Group 1c, 중복 구조(padding: 같은 규칙을 두 층에서).
- 왜: 주장→근거→단서가 문단 단위와 장 단위에 겹으로 있어 한 장에 같은 주장이 세 번 나온다
  (h2, key, 본문 첫 문장). 측정: v2 문서에서 틀 문장 53%.
- 조치: `rewrite`. h2 는 8어절 이하 표제로, 주장은 `.key` 한 곳에만. 「Paragraph shape」는
  "한 문단 한 주장" 한 줄로 줄이고 순서 규칙은 삭제.

**F4.** `AGENTS.md:45-56` ↔ `research-doc/SKILL.md:270-289` ↔ `research-verify/SKILL.md:14-22`
- 근거: "Do not break context between research-source and research-doc … research-verify is the
  opposite: always break it" 가 AGENTS 에, 같은 규칙이 research-doc Hand off 와 verify 「Two rules」
  에 각각 이유까지 붙어 세 번 있다.
- 패턴: Group 2, 중복 (keep-list 8 의 "working redundancy" 이지만 셋의 문구가 서로 다르고
  하나는 워크플로 안/밖 분기까지 다르게 적는다).
- 조치: `move`. 컨텍스트 규칙은 AGENTS 한 곳, 다른 둘은 한 줄 포인터.

### 중간

**F5.** `prose-ko.md:16-17, 38-40, 68-69` 등 근거 서술 문단
- 근거: "This family survives longest because every sentence in it is true." / "These arrive
  assembled and read as decoration, because a claim carried by an adjective has no evidence
  behind it."
- 패턴: Group 1c, 설명 padding + `AUTHORING.md:11` 자기 규칙 위반.
- 왜: Skill authoring best practices "Does this paragraph justify its token cost?" 5세대 모델은
  ✗/✓ 쌍과 한 줄 이유면 충분하고, 분류학적 설명은 출력의 문체를 지시문의 문체로 끌어온다
  (prompt-audit 1a: "the prompt's register becomes the output's register").
- 조치: `rewrite`. 각 항목을 "규칙 한 줄 + ✗/✓ + 이유 한 문장" 으로. 나머지는
  `docs/method-provenance.md` 로 `move`. 목표 500단어.

**F6.** `prose-ko.md:221-236` 「A worked example」, `prose-ko.md:210-219` 「Sentence ending」 둘째 문단
- 근거: 검증 보고서 예시("수치 42개를 원문과 대조해 1건이 어긋난다")와 보고서 문체 규칙이
  문서 작성 파일에 있다.
- 패턴: Group 2, 정보가 한 곳에 있지 않음 (verify 의 것이 doc 에).
- 조치: `move` → `research-verify/SKILL.md` 5절 보고 형식 옆으로.

**F7.** `research-doc/SKILL.md:154-173` 「Compression subagents」, `:175-181` 「The trace chapter」
- 근거: OSS 코드베이스에만 해당하는 절 두 개가 공통 SKILL 에 있다.
- 패턴: Group 2, progressive disclosure 위반 (Skill best practices: "organize by domain to avoid
  loading irrelevant context").
- 조치: `move` → `references/oss.md`. paper 문서를 쓸 때 400단어를 안 읽는다.

**F8.** `research-doc/SKILL.md:95-118` 「The title says what the document is on」
- 근거: 제목 규칙 한 개에 예시 넷과 설명 세 문단(약 300단어). `check-doc.mjs` 의
  `title-subject` 가 절반을 기계로 잡는다.
- 패턴: Group 1c, 이미 게이트가 세는 것을 산문으로 재서술.
- 조치: `rewrite`. ✓ 둘 ✗ 하나와 "네 곳이 같아야 한다" 한 줄로.

**F9.** `research-verify/SKILL.md:210-218` 「When the procedure is tempting to skip」 표
- 근거: "| The excuse | Why it fails |" 5행.
- 패턴: Group 1c, 변명 선제 반박 = 모델의 특성을 전제한 문구("you tend to"의 표 형태).
  prompt-audit 1a: "`you (tend to|often|sometimes)` trait claims" 신호. 5세대 모델은 절차를
  건너뛰지 않는다고 지시하면 건너뛰지 않는다.
- 조치: `remove`. 대신 3절 첫 줄 "Spawning them is the step" 하나로 충분.

**F10.** `research-verify/SKILL.md:173-179` "State four limits of this procedure beside the findings"
- 근거: 부재 주장, 행동 주장, callee, 방법론 미검증 네 문단을 모든 보고서에 넣으라고 한다.
- 패턴: Group 1f 유사(고정 출력 상용구) + Group 2 (보고서마다 같은 100단어).
- 조치: `move`. 네 한계는 5절 보고 형식의 `## 검증하지 못한 것` 아래 고정 문구 넷으로
  템플릿에 한 번 넣고, 본문 설명은 `docs/method-provenance.md` 로.

**F11.** `research-chain.js:125-131` `NOT_THE_AUTHOR`, `:144` `REPORT_SHAPE`
- 근거: "Do not assume it is right; start from where it would be wrong." / "Do not report what
  you are unsure of. Do not list what passed; give a count."
- 패턴: Group 4 재기준 + Group 1c (무엇이 발견인지 정의 없이 발견을 요구).
- 왜: Claude Code best practices 의 리뷰어 주의("A reviewer prompted to find gaps will usually
  report some … flag only gaps that affect correctness or the stated requirements"). 오늘 run 에서
  A 11건·C 10건의 needs_judgment 대부분이 범위 확장 제안이었다.
- 조치: `add`. 렌즈 공통 프롬프트에 발견의 정의 한 줄: "발견은 문서의 주장을 틀리게 하거나
  purpose 의 과업을 막는 것이다. 있으면 좋을 것, 더 읽으면 좋을 출처는 발견이 아니라 한 줄
  메모다."

**F12.** `research-chain.js:60-73` phase 1 프롬프트 "Steps: 1. … 5." + "Steps 2 and 3 are what stops a thin read …" 문단
- 근거: 판단 과제(연구·집필)에 번호 절차 다섯 개와 그 이유 두 문단.
- 패턴: Group 1c, step-by-step choreography ("Skills and prompts written for prior models are
  often too prescriptive for current ones").
- 왜: 순서가 실제로 고정인 것은 "source 뒤 doc, 같은 컨텍스트" 하나뿐. 나머지는 스킬이 이미
  말한다.
- 조치: `rewrite`. "Read research-source, then research-doc in the same context. Pass the two
  gates. Stop." 세 줄과 경계.

**F13.** `lens-adoption.md:29-36`
- 근거: 괄호 셋이 중첩된 한 문장 90단어("the license read from the file rather than a badge …
  (an AGPL-family … ), maintenance vitality (if … cannot have a source, and asserting them is a
  finding; the gate catches it only when …), dependency risk …").
- 패턴: Group 2, `oss.md:34-48` 의 체크리스트 복사본이 압축돼 들어옴 (keep-list 8 의
  중복이지만 문장이 읽히지 않는다).
- 조치: `rewrite`. "comparison 이면 `oss.md` §The adoption call 의 항목을 문서에 대조한다" 한 줄.

**F14.** `AGENTS.md:87-105` 「Rules」
- 근거: 다섯 규칙 중 "Do not publish a number you have not opened the source to confirm",
  "Say plainly whether you looked at the rendered page" 는 스킬 셋에 각각 다시 있다.
- 패턴: Group 2, 중복 (Claude Code best practices: "only include things that apply broadly … If
  Claude already does something correctly without the instruction, delete it").
- 조치: `remove` 두 항목. 나머지 셋(generated files, commit only when asked, quotable
  override)은 유지.

### 낮음 (flag)

**F15.** `research-doc/SKILL.md:125` "The class name stayed from the deck days; it marks a chapter."
- 패턴: Group 1d, migration-relative phrasing ("no longer / stayed from"). 조치: `rewrite` →
  "A chapter is `<section class="slide">`." 한 줄. 낮음인 이유: 해로운 행동을 유발하지 않는다.

**F16.** `research-source/SKILL.md:103` "One commit and zero tags beside a HEAD message citing PR #2943"
- 패턴: Group 2, 특정 사건 서사(incident narrative). 조치: `rewrite` → "a HEAD message that
  references a high PR number".

**F17.** `research-source/SKILL.md:204` "Three or four spans is a thin read … fifty usually means copying"
- 패턴: Group 1c, 전략 코칭. 지우는 편이 안전하나 근거가 약해 flag.

**F18.** `visual.md:164-170` 「Do not」, `lens-*.md` 「Do not」 절 넷
- 패턴: Group 1c, 금지 나열. 각 항목에 이유가 붙어 있어(keep-list 5) 유지. flag 만.

## 재기준 추가 (keep-list 11: 새 모델의 실패 양상에 맞춰 더하는 것)

**R1.** `research-doc/references/prose-ko.md`, 「Borrowed emphasis」 대체
- Prompting Claude Fable 5.1 「Writing density」의 검증된 지시문을 한국어 산출물에 맞게 한 문단
  넣는다: "Mannered prose substitutes metaphor and flourish for direct statement … When a literal
  phrase is available, use it." 이 한 문단이 비유·과장·대구 항목 셋을 대신한다.

**R2.** `research-verify/SKILL.md` 5절 또는 렌즈 공통 프롬프트
- 「Quoting retrieved sources」: Fable 5.1 은 원문 구절을 인용 표시 없이 재생산하는 경향이
  있다고 Anthropic 이 적었다. 우리 게이트는 인용을 `.q`/`.wl`/`<cite>` 에 넣어야 산문에서
  빼 준다. 한 장짜리 올바른 예(요청, 응답, 왜 맞는가) 하나를 research-doc 에 넣는다.

**R3.** `research-chain.js` 렌즈 프롬프트
- F11 의 발견 정의. 그리고 Opus 5.5 「Time signals」: 렌즈에 경과 시간을 주면 병렬 검토가
  빨리 끝난다("elapsed 340s / 1200s"). 워크플로가 시각을 갖고 있으므로 한 줄 추가 가능.

## Group 3, 4 메모

- Group 3 (tool descriptions): 이 저장소는 tool 정의를 갖지 않는다. 해당 없음.
- Group 4: 요청 코드는 없다. 서브에이전트 명단(`research-chain.js` LENSES + D)은 검토했다.
  A(reader)와 D(completeness)는 둘 다 "purpose 의 과업에서 무엇이 빠졌나"를 묻는다. D 가
  A·B·C 보고서를 읽는 것이 유일한 차이이고, 그 차이는 D 의 "아무도 보지 않은 것" 항목 하나다.
  `harness-review` 의 P10(A·B 둘로) 과 같은 결론: **D 를 A 에 흡수**하고 A 가 B·C 보고서를 받은
  뒤 마지막에 돈다. 호출 1회 절감. token accounting 은 오늘 `run.json` 으로 생겼다.

## 제안 diff

파일별 hunk. 한 hunk 가 발견 하나다. 적용하지 않았다.

### `research-doc/SKILL.md`

```
@@ 장 문법 (F1, F2, F3)
-h2              a claim sentence, not a noun label
-.key            one or two sentences: what the reader does with the claim, or what it
-                changes. Not a summary of the body
+h2              a heading of eight 어절 or fewer that names what the chapter holds
+.key            the chapter's one claim, in one or two sentences. This is the only place
+                the claim is stated; the body supports it and does not restate it
 body            stat cards, a figure, a table, or a short fact list, each item one line
 details.more    첨언: the calculation, the source's paragraph structure, the quoted
-                original, the condition in full. Folded by default
-.note           one sentence that closes the chapter with what it does not cover
+                original, the conditions under which the claim holds. Folded by default
+.note           optional. One sentence, only when it changes what the reader does next.
+                What the document did not check goes to `critique` or `setup`, once
@@
-`h2` reads as a statement (`결과 2. 단계가 많은 질문일수록 차이가 커진다`); a plain label
-is fine where the content is one (`결과 5. ablation`). Name what the chapter holds and what
-it does, and avoid headings that inflate (`가장 중요한 표`) or set two abstract nouns
-against each other, which `prose-ko.md` explains. A chapter with no `.note` qualifier has
-usually overclaimed.
+`h2` names the content (`effort 재측정`, `thinking 끄기`). The claim lives in `.key`.
@@ (F15)
-A chapter is `<section class="slide">`. The class name stayed from the deck days; it marks
-a chapter. Inside it, six elements in this order:
+A chapter is `<section class="slide">`. Inside it, in this order:
@@ (F7) 「Compression subagents」와 「The trace chapter」 두 절을 references/oss.md 로 이동
@@ (F8) 「The title says what the document is on」을 아래로 대체
+## The title
+
+Lead with the thing's name, then what it is. The same string goes in `meta.json` `title`,
+`<title>`, `og:title` and the cover `h1`; no gate compares them.
+
+- ✓ Foo 5.0: 플러그인을 떠나 자기 호스트를 갖는다
+- ✓ Bar: vector 검색 옆에 그래프 갈래를 하나 더 두는 컨텍스트 인프라
+- ✗ 그래프는 RAG 위에 얹히고, 벤치마크는 저장소에 없다   (finding, not identity → summary)
@@ (F4) Hand off 에서 컨텍스트 규칙의 이유 두 문단 삭제, "AGENTS.md 가 정한 대로" 포인터
```

### `prose-ko.md` (F2, F3, F5, F6, R1)

```
@@ 파일 전체를 다음 골격으로 다시 쓴다 (목표 500단어)
 # Writing the Korean output
 Technical terms stay English: (목록). Quotes, identifiers, paths verbatim.
 `check-prose.mjs --help` lists what is counted; this file is what it cannot count.

 ## 규칙 (각각 한 줄 + ✗/✓ + 이유 한 문장)
 1. 명사를 ·나 의로 잇지 말고 동사로 편다              ✗/✓
 2. 한계는 면책 문장이 아니라 주장의 조건절로            ✗/✓
 3. 제목·요약에 추상명사 대구 금지                       ✗/✓
 4. 반응어·과장·독백·빈 요약은 게이트가 센다 (포인터)
 5. 이유 없는 유보 금지, 빠진 근거를 이름으로            ✗/✓
 6. 작업 잔여물은 setup 으로, 한계는 주장 옆으로          ✗/✓ 둘
 7. ~가 아니라 ~다 는 독자가 틀린 답을 쥐고 있을 때만     ✗/✓
 8. 영어 어순 관형절은 두 문장으로                       ✗/✓
 9. ~들·~에 대한·~에 있어서는 사람 밴드 안이면 둔다       ✗/✓
 10. 연결어미 뒤 쉼표는 밴드(--counts)로 본다             ✓ 셋
 11. 짧은 평서문 나열에는 이음을 넣는다                   ✗/✓
 12. 수치는 비교 기준과, 조건은 주장과 함께 (어디에 둘지는 SKILL 의 장 문법)
 13. Mannered prose (R1 문단, Fable 5.1 지침 그대로)
 14. 평서형 ~한다. 보고서 문체는 verify 가 정한다 (포인터)

 - 「Paragraph shape」 → "한 문단 한 주장" 한 줄로
 - 「A worked example」 → research-verify/SKILL.md 5절로 이동
 - 각 부류의 설명 문단("This family survives longest …") → docs/method-provenance.md
```

### `research-verify/SKILL.md` (F9, F10, F6, R2)

```
@@ (F9)
-## When the procedure is tempting to skip
-| The excuse | Why it fails |
-| ... 5행 ... |
@@ (F10)
-State four limits of this procedure beside the findings, so the reader knows the shape of
-the gap. Absence claims … (네 문단)
+The report's `## 검증하지 못한 것` always carries these four lines, filled in or marked 해당 없음:
+- 부재 주장 N건: 재실행 검색 명령이 있는 것 M건
+- 행동 주장 N건: 코드만 읽었고 실행하지 않았다
+- callee 를 열지 않은 주장 N건
+- (이 절차는 코드 file:line 검증에 검증된 방법이 아니다) ← 한 줄 고정
@@ (F6) prose-ko 에서 옮겨 온 보고서 예시("수치 42개 …")를 5절 보고 형식 아래에
@@ (R2) 인용 재생산 예시 한 장
```

### `research-chain.js` (F11, F12, Group 4)

```
@@ phase 1 프롬프트 (F12)
-Steps:
-1. Read .claude/skills/research-source/SKILL.md and follow it.
-2. Before writing prose, enumerate what the corpus contains: …
-3. Fill ${EVID}/evidence.jsonl as you read, per that skill. …
-4. Staying in the same context, continue with .claude/skills/research-doc/SKILL.md …
-5. Pass node scripts/check-doc.mjs … then run node scripts/build-index.mjs.
-
-Steps 2 and 3 are what stops a thin read. Reading and writing share one context window, …
-
-Delegation: research-doc describes when to hand reading to a compression subagent …
+Read .claude/skills/research-source/SKILL.md and follow it, then, in this same context,
+.claude/skills/research-doc/SKILL.md. Pass check-doc.mjs and check-prose.mjs, run
+build-index.mjs, and stop.
@@ NOT_THE_AUTHOR (F11)
-You did not write this document. The author's confidence was not passed to you and should
-not be. Do not assume it is right; start from where it would be wrong.
+You did not write this document. A finding is something that makes a claim in it wrong or
+stops the reader from doing what its purpose promises. Things that would be nice to add,
+sources that could also be read, and wording you would have chosen differently are not
+findings; list them in one line each under 메모 or leave them out.
@@ LENSES (Group 4)
-const LENSES = [A, B, C]  + D after
+const LENSES = [B, C]; then A (reader + completeness) after, handed B and C's reports
```

### `AGENTS.md` (F4, F14)

```
@@ 「Which skill to use」 아래 컨텍스트 규칙 두 문단은 유지 (여기가 단일 소유자)
@@ 「Rules」
-**Do not publish a number you have not opened the source to confirm.** …
-**Say plainly whether you looked at the rendered page.** …
 (스킬이 각각 갖고 있다)
```

### `lens-adoption.md` (F13)

```
-For a `comparison`, check what a developer checks against the document: the license read
-from the file rather than a badge … (90단어 한 문장)
+For a `comparison`, check the document against the adoption checklist in
+`../../research-doc/references/oss.md` §The adoption call, one item at a time.
```

### `research-source/SKILL.md` (F16, F17)

```
-One commit and zero tags beside a HEAD message citing PR #2943 means the history was cut.
+One commit and zero tags beside a HEAD message that references a high PR number means
+the history was cut.
-… Three or four spans is a thin read of anything substantial and fifty usually means
-copying rather than choosing; neither is a target.
+(삭제)
```

## Step 7. 검증 계획

- F1~F3, F11, F12 는 행동을 바꾸는 변경이므로 같은 corpus(Sonnet 5.5 migration) 로 v3 를 한 편
  뽑아 v2 와 나란히 본다. 측정: 장당 틀 문장 비율(53% →), note 중 면책 비율(13/17 →), 렌즈
  needs_judgment 수(A 11, C 10 →), run.json 의 호출 수와 시간.
- F5~F10, F13~F16 은 텍스트 이동·삭제라 행동 회귀 위험이 낮다. 적용 후 `git grep` 으로
  옮긴 문구를 가리키던 포인터가 남아 있지 않은지 확인한다.
- 한 번에 하나씩 적용하지 않고 묶어 적용한다. 이유: 오늘 하루 세 번 부분 수정을 했고, 부분
  수정은 모순을 하나씩 옮기기만 했다. 묶음 적용 뒤 v3 한 편으로 판정한다.
