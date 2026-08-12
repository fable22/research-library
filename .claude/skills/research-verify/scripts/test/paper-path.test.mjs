#!/usr/bin/env node
// 논문 검증 경로 시험. 통과해야 할 것과 막혀야 할 것을 나란히 돌린다.
//   node .claude/skills/research-verify/scripts/test/paper-path.test.mjs
// 전제: arXiv:2605.25480v2 가 고정돼 있을 것.
//   node .claude/skills/research-verify/scripts/pin-paper.mjs 2605.25480 v2
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync as readFileSyncCompat } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { dirname, join as j } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
// .git 을 찾을 때까지 올라간다. 스크립트를 어디로 옮겨도 같은 루트를 가리킨다.
const ROOT = (() => {
  let d = dirname(fileURLToPath(import.meta.url));
  for (;;) {
    if (existsSync(j(d, '.git'))) return d;
    const up = dirname(d);
    if (up === d) return process.cwd();
    d = up;
  }
})();
const SP = mkdtempSync(j(tmpdir(), 'paper-path-test-'));
const CHECK = join(ROOT, '.claude/skills/research-verify/scripts/check-claims.mjs');
const PAPERS = process.env.RESEARCH_PAPER_DIR || j(process.env.HOME, '.research-papers');
const WORK = join(SP, 'suite');

const SHA = 'ea85e814fc6666e2c687a76390aeabaf25ba7f6049997db3bf8a6ba0dd3656f9';
const SRC = { id: 'p1', kind: 'paper', arxiv_id: '2605.25480', version: 'v2', text_sha256: SHA };

const Q_SCALE = 'The 2WikiMHQA Wiki contains 5,825 knowledge pages across 6 thematic directories, plus 6,840 source pages';
const Q_COST = 'each source passage requires SelectPages and CompileWikiPages, making initial construction more expensive than chunk-and-embed approaches, though the cost is amortized over later queries';
const Q_ABL = 'Ablation study using F1 scores. Each row removes one component while keeping the others intact';

const claim = (o) => ({ verdict: 'confirmed', scope: 'arXiv:2605.25480v2 기준', ...o });

const cases = [
  // ---- 통과해야 하는 것 ----
  ['통과', '표 안의 수치를 인용한 numeric 주장', [
    claim({ id: 'c1', kind: 'numeric', text: 'HotpotQA 응답 시간은 14.9초, LightRAG 는 41.4초다',
      evidence: [{ source: 'p1', locator: 'Table 10', quote: 'Query latency in seconds per question on three benchmarks' }] }),
  ]],
  ['통과', '절 단위 인용 (문서 전체로 대조됨)', [
    claim({ id: 'c2', kind: 'doc', text: '논문은 자기 병목을 일회성 컴파일 비용이라고 적는다',
      evidence: [{ source: 'p1', locator: '§6', quote: Q_COST }] }),
  ]],
  ['통과', '원문에 없는 수치를 derived 로 밝힌 것', [
    claim({ id: 'c3', kind: 'derived', text: '순회를 제거하면 F1 이 11.7 떨어진다',
      derived_from: ['0.839', '0.722'], note: '논문에는 이 차이가 없다. 표 3 의 절대값에서 계산했다',
      evidence: [{ source: 'p1', locator: 'Table 3', quote: Q_ABL }] }),
  ]],

  // ---- 막혀야 하는 것 ----
  ['차단', '지어낸 인용문', [
    claim({ id: 'x1', kind: 'doc', text: '지어낸 주장',
      evidence: [{ source: 'p1', locator: 'Table 1', quote: 'This sentence does not exist anywhere in the paper and I invented it.' }] }),
  ]],
  ['차단', '없는 표를 가리키는 locator', [
    claim({ id: 'x2', kind: 'doc', text: '주장',
      evidence: [{ source: 'p1', locator: 'Table 99', quote: Q_SCALE }] }),
  ]],
  ['차단', 'locator 형태 자체가 틀림', [
    claim({ id: 'x3', kind: 'doc', text: '주장',
      evidence: [{ source: 'p1', locator: 'somewhere in the paper', quote: Q_SCALE }] }),
  ]],
  ['차단', '수치 한 자리 변조 (5,825 → 5,835)', [
    claim({ id: 'x4', kind: 'numeric', text: '지식 페이지가 5,835개다',
      evidence: [{ source: 'p1', locator: 'Appendix E', quote: Q_SCALE }] }),
  ]],
  ['차단', '맞는 수치인데 엉뚱한 표를 가리킴', [
    claim({ id: 'x5', kind: 'numeric', text: 'HotpotQA F1 은 0.839 다',
      evidence: [{ source: 'p1', locator: 'Table 10', quote: 'Query latency in seconds per question on three benchmarks' }] }),
  ]],
  ['차단', '인용문이 논문에 있으나 그 표 안에는 없음', [
    claim({ id: 'x6', kind: 'doc', text: '주장',
      evidence: [{ source: 'p1', locator: 'Table 1', quote: Q_COST }] }),
  ]],
  ['차단', 'derived 인데 note 가 없음', [
    claim({ id: 'x7', kind: 'derived', text: '순회 제거 시 11.7 하락',
      derived_from: ['0.839', '0.722'],
      evidence: [{ source: 'p1', locator: 'Table 3', quote: Q_ABL }] }),
  ]],
  ['차단', 'derived 인데 입력값이 그 표에 없음', [
    claim({ id: 'x8', kind: 'derived', text: '어떤 차이가 11.7 이다',
      derived_from: ['0.839', '0.999'], note: '논문에는 이 비교가 없다',
      evidence: [{ source: 'p1', locator: 'Table 3', quote: Q_ABL }] }),
  ]],
  ['차단', '원문 없이 검증 시도 (캐시 비어 있음)', [
    claim({ id: 'x9', kind: 'doc', text: '주장',
      evidence: [{ source: 'p1', locator: 'Table 1', quote: Q_SCALE }] }),
  ], { noPapers: true }],
  ['차단', '캐시가 고정된 해시와 다름 (원문 이동)', [
    claim({ id: 'x10', kind: 'doc', text: '주장',
      evidence: [{ source: 'p1', locator: 'Table 1', quote: Q_SCALE }] }),
  ], { tamper: true }],
];

let pass = 0, fail = 0;
console.log('결과   기대   사례                                            잡은 규칙');
console.log('─'.repeat(96));

for (const [expect, name, claims, opt = {}] of cases) {
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  writeFileSync(join(WORK, 'sources.jsonl'), JSON.stringify(SRC) + '\n');
  writeFileSync(join(WORK, 'claims.jsonl'), claims.map((c) => JSON.stringify(c)).join('\n') + '\n');

  let papers = PAPERS;
  if (opt.noPapers) {
    papers = join(SP, 'suite-empty');
    mkdirSync(papers, { recursive: true });
  }
  if (opt.tamper) {
    papers = join(SP, 'suite-tampered');
    mkdirSync(papers, { recursive: true });
    const src = join(PAPERS, '2605.25480v2.tex');
    writeFileSync(join(papers, '2605.25480v2.tex'),
      readFileSyncCompat(src, 'utf8') + '\n% tampered\n');
  }

  const r = spawnSync('node', [CHECK, 'research/2026-08-05-llm-wiki-retrieval-as-reasoning',
    '--evidence', WORK, '--papers', papers], { encoding: 'utf8', cwd: ROOT });

  const blocked = r.status !== 0;
  const got = blocked ? '차단' : '통과';
  const ok = got === expect;
  ok ? pass++ : fail++;

  const rules = [...new Set([...(r.stdout || '').matchAll(/\[([a-z-]+)\]/g)].map((m) => m[1]))];
  console.log(`${ok ? ' ✓ ' : ' ✗ '}   ${expect}   ${name.padEnd(46)} ${rules.join(', ') || '-'}`);
  if (!ok) console.log((r.stdout || r.stderr).split('\n').map((l) => '        ' + l).join('\n'));
}

console.log('─'.repeat(96));
console.log(`${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);
