#!/usr/bin/env node
// check-claims.mjs 의 규칙 시험. 논문 캐시가 필요 없는 것만 여기서 돌린다.
// repo 근거는 이 저장소 자신을 고정 커밋으로 삼는다. 수치는 NUMERIC 규칙대로 구분자·소수·% 가 있는 것만 잡는다.
//   node .claude/skills/research-verify/scripts/test/claims-rules.test.mjs
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync, execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = (() => {
  let d = dirname(fileURLToPath(import.meta.url));
  for (;;) { if (existsSync(join(d, '.git'))) return d; const up = dirname(d); if (up === d) return process.cwd(); d = up; }
})();
const CHECK = join(ROOT, '.claude/skills/research-verify/scripts/check-claims.mjs');
const HEAD = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
// 이 저장소의 한 줄을 quote 로 쓴다. 파일이 바뀌면 시험도 같이 고친다.
const FILE = 'scripts/check-doc.mjs';
const lineOf = (needle) => execSync(`grep -n -F ${JSON.stringify(needle)} ${FILE}`, { cwd: ROOT }).toString().split(':')[0];
const Q_SIZE = 'const SIZE_LIMIT = 1024 * 1024;';
const L_SIZE = Number(lineOf(Q_SIZE));
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));

const REPO = { id: 'r1', kind: 'repo', repo: 'self/self', commit: HEAD };
const WEB = { id: 'w1', kind: 'web', url: 'https://example.com/post', retrieved_at: '2026-09-29T00:00:00Z' };
const claim = (o) => ({ verdict: 'confirmed', scope: `self/self@${HEAD.slice(0, 7)} 기준`, ...o });
// SIZE_LIMIT 줄 앞뒤 15줄 안에 있는 긴 quote 가 필요하다. 그 줄 자체를 40자 이상으로 늘린다.
const Q_LONG = pad(Q_SIZE, 40);

const cases = [
  ['통과', 'repo 근거의 올바른 수치', [claim({ id: 'c1', kind: 'numeric', text: '파일 크기 한도는 1,024 KB 다',
    evidence: [{ source: 'r1', locator: `${FILE}:${L_SIZE}`, quote: Q_LONG }] })], []],
  ['차단', 'repo 근거의 틀린 수치', [claim({ id: 'x1', kind: 'numeric', text: '파일 크기 한도는 9,999 KB 다',
    evidence: [{ source: 'r1', locator: `${FILE}:${L_SIZE}`, quote: Q_LONG }] })], ['numeric-match']],
  ['차단', 'web 출처만 근거인 confirmed 주장', [claim({ id: 'x2', kind: 'web', text: '블로그가 그렇게 말한다',
    evidence: [{ source: 'w1', locator: 'https://example.com/post', quote: 'I made this sentence up and nobody can check it against anything at all' }] })], ['web-unchecked']],
  ['통과', 'web 만 근거인데 --allow=web-unchecked 로 명시', [claim({ id: 'c2', kind: 'web', text: '블로그가 그렇게 말한다',
    evidence: [{ source: 'w1', locator: 'https://example.com/post', quote: 'I made this sentence up and nobody can check it against anything at all' }] })], [], '--allow=web-unchecked'],
  ['차단', '400자를 넘는 quote', [claim({ id: 'x3', kind: 'code', text: '주장',
    evidence: [{ source: 'r1', locator: `${FILE}:${L_SIZE}`, quote: 'x'.repeat(401) }] })], ['quote-length']],
  ['차단', '열거형 밖의 verdict', [claim({ id: 'x4', kind: 'doc', verdict: 'bounded', text: '주장',
    evidence: [{ source: 'r1', locator: `${FILE}:${L_SIZE}`, quote: Q_LONG }] })], ['verdict-form']],
];

let pass = 0, fail = 0;
for (const [want, name, claims, rules, extra] of cases) {
  const dir = mkdtempSync(join(tmpdir(), 'claims-rules-'));
  writeFileSync(join(dir, 'sources.jsonl'), [REPO, WEB].map((s) => JSON.stringify(s)).join('\n') + '\n');
  writeFileSync(join(dir, 'claims.jsonl'), claims.map((c) => JSON.stringify(c)).join('\n') + '\n');
  writeFileSync(join(dir, 'evidence.jsonl'), '');
  const args = [CHECK, 'research/2026-09-21-jev-system-one', '--evidence', dir, `--repo`, `self/self=${ROOT}`];
  if (extra) args.push(extra);
  const r = spawnSync('node', args, { cwd: ROOT, encoding: 'utf8' });
  const out = r.stdout + r.stderr;
  const blocked = r.status !== 0;
  const hit = rules.every((id) => out.includes(`[${id}]`));
  const ok = want === '차단' ? (blocked && hit) : !blocked;
  if (ok) { pass++; continue; }
  fail++;
  console.log(`FAIL  ${want}해야 한다: ${name}${rules.length ? ` [${rules.join(', ')}]` : ''}`);
  console.log(out.split('\n').map((l) => '      ' + l).join('\n'));
}
console.log(`\n${pass}개 통과, ${fail}개 실패`);
process.exit(fail ? 1 : 0);
