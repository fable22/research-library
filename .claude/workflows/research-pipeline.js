export const meta = {
  name: 'research-pipeline',
  description: 'Pin a corpus, write the document, verify it with four separated lenses, fix, and open a draft PR',
  whenToUse: 'One research target, resolved to a concrete identity, that should go all the way to a reviewable PR without stopping to ask.',
  phases: [
    { title: 'Source and draft', detail: 'one agent, one context: pin the corpus and write the document' },
    { title: 'Verify', detail: 'lenses A/B/C in parallel, then D over their reports' },
    { title: 'Fix', detail: 'apply must-fix, re-extract claims, re-run both gates, re-render' },
    { title: 'Ship', detail: 'branch, commit, push, draft PR' },
  ],
}

// args is resolved in the main session, where questions can still be asked. The workflow
// cannot ask, so it must arrive fully formed. Shape:
//   { slug, kind, target, question, angle }
// e.g. { slug: '2026-08-13-a2e-agent-auditing-engine', kind: 'paper',
//        target: 'arXiv 2608.07346v2, code datamllab/A2E',
//        question: '...', angle: 'Claude Code 관점을 포함할 것' }
const a = args || {}
if (!a.slug || !a.target) {
  return { error: 'args.slug and args.target are required. Resolve the target before launching.' }
}

const REPO = '/home/samsung/github/research-library'
const DOC = `research/${a.slug}`
const EVID = `.research/${a.slug}`

// Every agent gets the four things Anthropic found necessary to stop subagents
// duplicating each other: an objective, an output format, tool/source guidance, and
// explicit boundaries.
const HOUSE = `
저장소: ${REPO}. 먼저 AGENTS.md 를 읽고 그 규칙을 따를 것.
문서는 한국어로 쓴다. 기술어(harness, corpus, tool call, commit)는 영어로 둔다.
확인하지 않은 수치는 쓰지 않는다. 확신이 서지 않으면 주장을 버린다.
너는 위임하지 않는다. subagent 를 띄우지 말고 직접 읽고 직접 쓴다.
`.trim()

// ─── phase 1 ────────────────────────────────────────────────────────────────
// One agent, deliberately. research-source and research-doc must share a context:
// when a sentence goes shaky mid-paragraph the writer has to reopen the source, and
// that ability does not survive an agent boundary. The resume risk this creates is
// covered by disk: sources.jsonl, notes/ and index.html all land as files, so a
// re-run picks up from them rather than from zero.
phase('Source and draft')
const draft = await agent(`${HOUSE}

목표: ${DOC}/ 에 발행 가능한 연구 문서를 만든다.

대상: ${a.target}
${a.question ? `문서가 답해야 할 질문: ${a.question}` : ''}
${a.angle ? `반드시 포함할 관점: ${a.angle}` : ''}

절차:
1. .claude/skills/research-source/SKILL.md 를 읽고 그대로 따른다.
   코퍼스를 이식 가능한 신원으로 고정한다(arxiv_id+version, repo+commit).
   체크아웃은 저장소 밖에 둔다. ${EVID}/sources.jsonl 을 읽기 전에 쓴다.
2. 같은 context 를 유지한 채 .claude/skills/research-doc/SKILL.md 로 넘어가
   ${DOC}/index.html 을 장별로 쓴다. 논문이면 수치는 arxiv.org/e-print 의
   LaTeX 원본 표에서 읽는다. HTML 변환본은 셀을 흘린다.
3. node scripts/check-doc.mjs ${DOC} 와 node scripts/build-index.mjs 를 통과시킨다.

출력 형식: 아래 스키마의 JSON.
경계: 커밋하지 않는다. 브랜치를 만들지 않는다. claims.jsonl 은 건드리지 않는다.
      그건 초고가 나온 뒤 검증 단계가 실린 문장에서 뽑는다.`,
  {
    label: `draft:${a.slug}`,
    schema: {
      type: 'object',
      required: ['slides', 'gatesPassed', 'summary'],
      properties: {
        slides: { type: 'integer' },
        gatesPassed: { type: 'boolean' },
        checkoutPath: { type: 'string' },
        summary: { type: 'string' },
        openQuestions: { type: 'array', items: { type: 'string' } },
      },
    },
  })

if (!draft || !draft.gatesPassed) {
  return { stoppedAt: 'draft', reason: 'check-doc.mjs did not pass', draft }
}
log(`초고 완료: 슬라이드 ${draft.slides}개`)

// ─── phase 2 ────────────────────────────────────────────────────────────────
// Separation is the mechanism, not a formality. On programmatically verifiable
// rubrics a judge is >50% more likely to mark its own failing output as satisfied
// (arXiv 2604.06996), and the cause is familiarity rather than authorship
// (2410.21819), so a lens must not be the writer and should not share its model
// family where that is cheap to avoid.
const LENS_BASE = `${HOUSE}

문서: ${DOC}/index.html (전체를 읽는다)
근거: ${EVID}/sources.jsonl
체크아웃: ${draft.checkoutPath || '(sources.jsonl 의 신원으로 직접 받을 것)'}

너는 이 문서를 쓰지 않았다. 저자의 확신은 너에게 전달되지 않았고, 전달되어서도 안 된다.
문서가 옳다고 가정하지 말고, 틀렸다면 어디서 틀렸을지부터 찾는다.

보고 형식(한국어):
  ## 고쳐야 하는 것      정답이 하나뿐인 것. 슬라이드 번호 + 문서의 문장 + 원문 값 + locator
  ## 판단이 필요한 것    문서의 결론이나 분량을 바꾸는 것
  ## 검증하지 못한 것    비워두지 말 것. 못 본 것이 없다는 보고는 신뢰할 수 없다

확실하지 않으면 지적하지 않는다. 잘못된 지적 하나가 맞는 지적 하나보다 비싸다.
통과한 것은 나열하지 않는다. 개수만 적는다.
문서를 수정하지 않는다. 너는 찾고, 저자가 고친다.`

const LENSES = [
  {
    key: 'A', label: 'lens:adoption',
    file: '.claude/skills/research-verify/references/lens-adoption.md',
    focus: `⑦(읽은 범위) 장을 감사한다. 파일 수와 디렉터리 수를 실제 체크아웃과 대조해
            합이 맞는지 본다. 도입 판단에 필요한데 없는 것(license, 실행 요건, 유지보수 신호)을 찾는다.`,
  },
  {
    key: 'B', label: 'lens:numbers',
    file: '.claude/skills/research-verify/references/lens-numbers.md',
    focus: `모든 수치를 고정 원문에서 다시 연다. 값·방향·단위·범위·기준을 본다.
            문서가 스스로 계산했다고 밝힌 값은 재계산한다.
            문서에 적힌 grep 이나 명령은 실제로 다시 돌려 결과 수가 맞는지 본다.`,
  },
  {
    key: 'C', label: 'lens:prose',
    file: '.claude/skills/research-verify/references/lens-prose.md',
    focus: `references/prose-ko.md 와 visual.md 기준으로 문장을 본다.
            원문자 상호참조(⑦⑨⑫ 등)가 실제로 그 내용이 있는 장을 가리키는지 전부 확인한다.
            svg 의 aria-label, 이미지 alt, 색이 혼자 의미를 나르는 곳을 본다.`,
  },
]

const reports = await parallel(LENSES.map((L) => () =>
  agent(`${L.file} 를 읽고 그 렌즈로 검토한다.

${LENS_BASE}

이 렌즈가 특히 볼 것:
${L.focus}`,
    { label: L.label, phase: 'Verify' })
      .then((r) => ({ key: L.key, label: L.label, report: r }))
))

const got = reports.filter(Boolean).filter((r) => r.report)
log(`렌즈 ${got.length}/${LENSES.length} 회수`)

// Lens D runs last because what it examines is the shape of the other three. It also
// owns the failure mode nobody else is assigned: a claim whose quote is accurate but
// whose interpretation is not. STORM names this (red herring / overspeculation),
// SciFact-Open names it (evidence supports only a special case of the claim), and
// automatic reviewers are measured as unable to detect it (arXiv 2508.21422).
// A different model is requested here on the PoLL finding that the gain comes from
// family separation rather than scale.
const dReport = await agent(`.claude/skills/research-verify/references/lens-completeness.md 를 읽고 그 렌즈로 검토한다.

${LENS_BASE}

앞선 세 렌즈의 보고서:
${got.map((r) => `### 렌즈 ${r.key} (${r.label})\n${r.report}`).join('\n\n')}

이 렌즈가 특히 볼 것:
1. 아무 렌즈도 다루지 않은 주장. 위 셋이 무엇을 안 봤는지부터 세운 뒤 그 자리를 본다.
2. **인용은 정확한데 해석이 틀린 곳.** 기계 대조가 원리상 못 잡는 종류다.
   근거가 주장의 좁은 경우만 뒷받침하는데 문서가 넓게 쓴 곳,
   서로 다른 두 사실 사이에 근거 없는 연결을 만든 곳을 찾는다.
3. sources.jsonl 에 고정됐는데 문서가 실제로 기대지 않는 출처.
   반대로 문서가 기대는데 고정되지 않은 출처.
4. 아예 시도되지 않은 확인 방식(실행, 렌더, 원문 그림 열기).`,
  { label: 'lens:completeness', phase: 'Verify', model: 'sonnet' })

// ─── phase 3 ────────────────────────────────────────────────────────────────
phase('Fix')
const fixed = await agent(`${HOUSE}

목표: 검증 보고서의 must-fix 를 문서에 반영하고 두 gate 를 다시 통과시킨다.

문서: ${DOC}/index.html

보고서:
${got.map((r) => `### 렌즈 ${r.key}\n${r.report}`).join('\n\n')}

### 렌즈 D
${dReport || '(없음)'}

절차:
1. 지적을 그대로 받지 않는다. 각 must-fix 를 고정 원문에서 직접 확인한 뒤 고친다.
   렌즈가 틀린 경우가 실제로 있다. 틀렸으면 고치지 말고 그 사실을 기록한다.
2. ${EVID}/claims.jsonl 을 **실린 문장에서** 추출한다. 초고 단계의 메모를 옮기지 않는다.
   주장마다 자기 locator 와 40자 이상 인용을 붙인다. 문서 전체를 증거로 쓰지 않는다.
3. node scripts/check-doc.mjs ${DOC}
   node .claude/skills/research-verify/scripts/check-claims.mjs ${DOC} --repo <owner/name>=<path>
   node scripts/build-index.mjs
4. 수정 **후에** 렌더를 확인한다. 수정 전 렌더는 의미가 없다.

출력 형식: 아래 스키마.
경계: 커밋하지 않는다. 문서의 결론이나 분량을 바꾸는 판단 건은 고치지 말고
      needsJudgment 에 담아 사람에게 넘긴다.`,
  {
    label: 'fix',
    schema: {
      type: 'object',
      required: ['fixed', 'gatesPassed', 'rendered'],
      properties: {
        fixed: { type: 'array', items: { type: 'string' } },
        rejected: { type: 'array', items: { type: 'string' } },
        needsJudgment: { type: 'array', items: { type: 'string' } },
        unverified: { type: 'array', items: { type: 'string' } },
        gatesPassed: { type: 'boolean' },
        rendered: { type: 'boolean' },
      },
    },
  })

if (!fixed || !fixed.gatesPassed) {
  return { stoppedAt: 'fix', reason: 'gates did not pass after fixes', draft, fixed, reports: got, dReport }
}

// ─── phase 4 ────────────────────────────────────────────────────────────────
// Draft, not ready-for-review. The pipeline can reach a PR without a human in the
// loop; it cannot judge that the document is worth publishing. Draft keeps the last
// step a person's.
phase('Ship')
const shipped = await agent(`${HOUSE}

목표: 문서를 브랜치에 올리고 draft PR 을 연다.

절차:
1. main 에서 doc/${a.slug} 브랜치를 만든다.
2. ${DOC}/ 와 build-index.mjs 가 다시 쓴 README.md, index.html 을 담는다.
   .research/ 는 gitignore 되어 있으므로 담기지 않는다.
3. AGENTS.md 의 Commits 절대로 메시지를 쓴다. 제목 한 줄, 본문에 주제와 근거 출처.
4. push 하고 gh pr create --draft 로 연다.
   PR 본문에 검증에서 나온 것과 사람이 판단해야 할 것을 적는다.

사람이 판단해야 할 것:
${(fixed.needsJudgment || []).map((x) => `- ${x}`).join('\n') || '- (없음)'}

확인하지 못한 것:
${(fixed.unverified || []).map((x) => `- ${x}`).join('\n') || '- (없음)'}

출력 형식: 아래 스키마.
경계: merge 하지 않는다. draft 를 ready 로 바꾸지 않는다. main 에 직접 쓰지 않는다.`,
  {
    label: 'ship',
    schema: {
      type: 'object',
      required: ['branch', 'prUrl'],
      properties: { branch: { type: 'string' }, prUrl: { type: 'string' }, commit: { type: 'string' } },
    },
  })

return {
  slug: a.slug,
  slides: draft.slides,
  pr: shipped && shipped.prUrl,
  branch: shipped && shipped.branch,
  fixed: (fixed.fixed || []).length,
  rejectedFindings: fixed.rejected || [],
  needsJudgment: fixed.needsJudgment || [],
  unverified: fixed.unverified || [],
  note: '검증은 오류를 줄이지 없애지 않는다. 분리된 검토도 주입 오류의 상당수를 놓친다는 것이 측정돼 있고, 코드 근거 주장에서는 LLM 판정이 특히 약하다. draft PR 인 이유다.',
}
