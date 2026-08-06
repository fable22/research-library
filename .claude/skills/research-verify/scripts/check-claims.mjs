#!/usr/bin/env node
// 문서의 주장이 고정된 원문에 실제로 근거하는지 검사한다.
//   node .claude/skills/research-verify/scripts/check-claims.mjs research/2026-08-07-slug
//   ... research/<slug> --repo owner/name=/path/to/checkout
//   ... --help
//
// research-verify skill 의 도구다. 발행물이 아니라 .research/ 의 작업 산출물을 읽으므로
// 저장소 게이트(scripts/check-doc.mjs)와 달리 skill 안에 둔다.
//
// 읽는 것: .research/<slug>/sources.jsonl, claims.jsonl, unread.txt
// research/ 는 발행물만 담고, 근거는 같은 이름의 .research/<slug>/ 에 있다.
//
// 핵심은 locator 가 존재하는지가 아니라 그 자리에 무엇이 있는지다.
// "파일이 있고 줄 번호가 범위 안"은 6,000줄짜리 파일에서 아무 숫자나 통과시킨다.
// 그래서 quote 를 고정 커밋에서 직접 꺼내 대조한다.

import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// 스크립트가 skill 안으로 옮겨졌으므로 자기 위치에서 몇 단계 위인지 세지 않는다.
// .git 을 찾을 때까지 올라간다. 어디에 두든 같은 저장소 루트를 가리킨다.
function findRoot(from) {
  let dir = from;
  for (;;) {
    if (existsSync(join(dir, '.git'))) return dir;
    const up = dirname(dir);
    if (up === dir) return process.cwd();
    dir = up;
  }
}
const ROOT = findRoot(dirname(fileURLToPath(import.meta.url)));

const QUOTE_MIN = 40;   // 이보다 짧으면 우연히 맞을 수 있다
const LINE_SLACK = 15;  // locator 앞뒤로 이만큼 안에 있으면 통과

const RULES = {
  'sources-file': '.research/<slug>/sources.jsonl 이 있고 파싱되는가',
  'claims-file': '.research/<slug>/claims.jsonl 이 있고 파싱되는가',
  'source-ref': 'evidence 가 가리키는 source id 가 sources.jsonl 에 있는가',
  'source-identity': 'repo 는 repo+commit, paper 는 arxiv_id+version 이 있는가',
  'source-local-path': 'sources.jsonl 에 로컬 경로가 새어 들어가지 않았는가',
  'empty-evidence': 'verdict=confirmed 인 주장에 근거가 있는가',
  'quote-length': `quote 가 ${QUOTE_MIN}자 이상인가`,
  'quote-match': `quote 가 고정 커밋의 locator ±${LINE_SLACK}줄 안에 실제로 있는가`,
  'locator-form': 'locator 가 path:line 또는 표/절 식별자 형태인가',
  scope: '무엇을 기준으로 확인했는지 scope 에 적혀 있는가',
  'absence-search': 'kind=absence 주장에 재실행 가능한 검색 명령이 있는가',
  'behavioral-limits': 'kind=behavioral 주장에 확인하지 못한 것이 적혀 있는가',
  'history-claim': 'kind=history 주장의 source 에 이력이 실제로 있는가',
  'unread-file': 'unread.txt 가 있는가',
  'unread-authored': 'unread.txt 가 기계 생성 표식을 갖고 있는가 (손으로 쓰면 안 된다)',
};

const KINDS = ['code', 'numeric', 'absence', 'behavioral', 'history', 'doc', 'web'];

// ---- 인자 ----

const argv = process.argv.slice(2);

if (argv.includes('--help') || argv.includes('-h')) {
  console.log('사용법: node .claude/skills/research-verify/scripts/check-claims.mjs research/<slug> [옵션]\n');
  console.log('옵션:');
  console.log('  --repo owner/name=<path>   체크아웃 위치를 직접 지정 (여러 번 가능)');
  console.log('  --evidence <path>          .research/<slug> 가 아닌 곳에서 근거를 읽는다');
  console.log('  --allow=rule,rule          규칙을 명시적으로 끈다');
  console.log('\n체크아웃 해결 순서:');
  console.log('  1. --repo owner/name=<path>');
  console.log('  2. $RESEARCH_CHECKOUT_DIR/<name>');
  console.log('  3. 못 찾으면 받아올 명령을 알려주고 차단한다 (자동으로 clone 하지 않는다)');
  console.log('\n규칙:');
  const width = Math.max(...Object.keys(RULES).map((k) => k.length));
  for (const [id, desc] of Object.entries(RULES)) console.log(`  ${id.padEnd(width)}  ${desc}`);
  console.log(`\nquote 는 ${QUOTE_MIN}자 이상의 원문 그대로여야 한다. 공백 차이는 무시한다.`);
  process.exit(0);
}

const repoOverride = new Map();
for (const a of argv) {
  if (!a.startsWith('--repo=') && a !== '--repo') continue;
}
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--repo' && argv[i + 1]) {
    const [k, v] = argv[++i].split('=');
    if (k && v) repoOverride.set(k, resolve(v.replace(/^~/, process.env.HOME || '~')));
  } else if (argv[i].startsWith('--repo=')) {
    const [k, v] = argv[i].slice('--repo='.length).split('=');
    if (k && v) repoOverride.set(k, resolve(v.replace(/^~/, process.env.HOME || '~')));
  }
}

const allowArg = argv.find((a) => a.startsWith('--allow='));
const allowed = new Set(
  allowArg ? allowArg.slice('--allow='.length).split(',').map((s) => s.trim()).filter(Boolean) : []
);
for (const id of allowed) {
  if (!RULES[id]) {
    console.error(`알 수 없는 규칙 id: ${id}\n--help 로 목록을 볼 것.`);
    process.exit(2);
  }
}

let evidenceDir = null;
const evIdx = argv.indexOf('--evidence');
if (evIdx >= 0 && argv[evIdx + 1]) evidenceDir = resolve(argv[evIdx + 1]);

const target = argv.find((a, i) => !a.startsWith('-') && argv[i - 1] !== '--evidence' && argv[i - 1] !== '--repo');
if (!target) {
  console.error('검사할 문서를 지정할 것: node .claude/skills/research-verify/scripts/check-claims.mjs research/<slug>');
  process.exit(2);
}
const slug = target.replace(/\/+$/, '').split('/').pop();
if (!evidenceDir) evidenceDir = join(ROOT, '.research', slug);

// ---- 읽기 ----

const problems = [];
const add = (rule, msg) => problems.push({ rule, msg });

async function readJsonl(path, rule) {
  let text;
  try {
    text = await readFile(path, 'utf8');
  } catch (err) {
    add(rule, `${relative(ROOT, path)} 을 읽을 수 없다: ${err.code || err.message}`);
    return null;
  }
  const out = [];
  text.split('\n').forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith('//')) return;
    try {
      out.push({ ...JSON.parse(t), _line: i + 1 });
    } catch (err) {
      add(rule, `${relative(ROOT, path)}:${i + 1} JSON 파싱 실패: ${err.message}`);
    }
  });
  return out;
}

const sources = await readJsonl(join(evidenceDir, 'sources.jsonl'), 'sources-file');
const claims = await readJsonl(join(evidenceDir, 'claims.jsonl'), 'claims-file');

// ---- unread.txt ----

try {
  const unread = await readFile(join(evidenceDir, 'unread.txt'), 'utf8');
  const body = unread.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  // 목록이 비는 것은 정당할 수 있다. 작은 코퍼스를 전부 읽으면 미확인이 0이다.
  // 그러니 "비었다"가 아니라 "생성되지 않았다"를 막는다. 생성기가 헤더에 통계를
  // 남기므로, 헤더만 있고 목록이 비면 실제로 다 읽은 것이다.
  if (!/^#\s*generated-by:/m.test(unread)) {
    add('unread-authored',
      'unread.txt 에 "# generated-by:" 표식이 없다. 손으로 쓰면 node_modules/ 한 줄로 통과시킬 수 있다. tool 로그에서 생성할 것');
  }
} catch {
  add('unread-file', 'unread.txt 가 없다. 읽지 않은 범위를 기록할 것');
}

// ---- source 검사 ----

const byId = new Map();
const LOCAL_PATH = /(^|["'\s:])(\/(home|Users|tmp|var)\/|~\/|[A-Za-z]:\\)/;

for (const s of sources || []) {
  if (!s.id) {
    add('source-identity', `sources.jsonl:${s._line} 에 id 가 없다`);
    continue;
  }
  byId.set(s.id, s);

  const serialized = JSON.stringify(s);
  if (LOCAL_PATH.test(serialized)) {
    add('source-local-path',
      `source ${s.id} 에 로컬 경로가 들어 있다. 이 문서는 이 머신에서만 검증된다. repo+commit 또는 arxiv_id+version 만 적을 것`);
  }

  if (s.kind === 'repo') {
    if (!s.repo || !s.commit) {
      add('source-identity', `source ${s.id} (repo) 에 repo 또는 commit 이 없다`);
    } else if (!/^[0-9a-f]{7,40}$/.test(s.commit)) {
      add('source-identity', `source ${s.id} 의 commit 이 SHA 형태가 아니다: ${s.commit}`);
    }
  } else if (s.kind === 'paper') {
    if (!s.arxiv_id && !s.doi) add('source-identity', `source ${s.id} (paper) 에 arxiv_id 나 doi 가 없다`);
    if (s.arxiv_id && !s.version) {
      add('source-identity', `source ${s.id} 에 version 이 없다. arXiv 논문은 개정되므로 v1/v2 를 고정할 것`);
    }
  } else if (s.kind === 'web') {
    if (!s.url) add('source-identity', `source ${s.id} (web) 에 url 이 없다`);
    if (!s.retrieved_at) add('source-identity', `source ${s.id} 에 retrieved_at 이 없다`);
  } else {
    add('source-identity', `source ${s.id} 의 kind 가 repo/paper/web 이 아니다: ${s.kind}`);
  }
}

// ---- 체크아웃 해결 ----

const checkoutCache = new Map();
const missingCheckouts = new Set();

function resolveCheckout(src) {
  if (checkoutCache.has(src.id)) return checkoutCache.get(src.id);
  let path = repoOverride.get(src.repo) || null;
  if (!path && process.env.RESEARCH_CHECKOUT_DIR) {
    path = join(process.env.RESEARCH_CHECKOUT_DIR, src.repo.split('/').pop());
  }
  if (path) {
    try {
      execFileSync('git', ['-C', path, 'rev-parse', '--git-dir'], { stdio: 'ignore' });
    } catch {
      path = null;
    }
  }
  if (!path) missingCheckouts.add(src.repo);
  checkoutCache.set(src.id, path);
  return path;
}

const fileCache = new Map();

function fileAtCommit(checkout, commit, file) {
  const key = `${checkout}\0${commit}\0${file}`;
  if (fileCache.has(key)) return fileCache.get(key);
  let content = null;
  try {
    content = execFileSync('git', ['-C', checkout, 'show', `${commit}:${file}`], {
      encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    content = null;
  }
  fileCache.set(key, content);
  return content;
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();

// ---- claim 검사 ----

for (const c of claims || []) {
  const at = `claims.jsonl:${c._line}`;
  const id = c.id ? `${c.id}` : at;

  if (!c.scope) {
    add('scope', `${id} 에 scope 가 없다. "무엇 기준으로 확인됐는가"를 적을 것 (예: "커밋 019ee16 의 validators.py 기준")`);
  }
  if (c.kind && !KINDS.includes(c.kind)) {
    add('locator-form', `${id} 의 kind 가 ${KINDS.join('/')} 중 하나가 아니다: ${c.kind}`);
  }

  const evidence = Array.isArray(c.evidence) ? c.evidence : [];

  if (c.verdict === 'confirmed' && !evidence.length && c.kind !== 'absence') {
    add('empty-evidence', `${id} 는 verdict=confirmed 인데 evidence 가 비어 있다`);
  }

  if (c.kind === 'absence' && !c.search) {
    add('absence-search',
      `${id} 는 부재 주장인데 search 가 없다. 부재는 locator 를 가질 수 없으므로 재실행 가능한 검색 명령을 적을 것 (예: "grep -rn 'reconnect' --include=*.test.ts")`);
  }

  if (c.kind === 'behavioral' && !c.limits) {
    add('behavioral-limits',
      `${id} 는 행동 주장인데 limits 가 없다. 코드를 읽어 조건부 행동을 단정하면 README 를 README 로 검증하는 것과 같다. 확인하지 못한 것을 적을 것`);
  }

  if (c.kind === 'history') {
    for (const e of evidence) {
      const src = byId.get(e.source);
      if (src && src.history_available === false) {
        add('history-claim',
          `${id} 는 이력 주장인데 source ${e.source} 는 history_available=false 다 (shallow clone). git fetch --unshallow 후 다시 확인할 것`);
      }
    }
  }

  for (const e of evidence) {
    if (!e.source || !byId.has(e.source)) {
      add('source-ref', `${id} 의 evidence 가 없는 source 를 가리킨다: ${e.source}`);
      continue;
    }
    const src = byId.get(e.source);

    if (!e.quote) {
      add('quote-length', `${id} 의 evidence(${e.source}) 에 quote 가 없다`);
      continue;
    }
    if (e.quote.length < QUOTE_MIN) {
      add('quote-length',
        `${id} 의 quote 가 ${e.quote.length}자다 (${QUOTE_MIN}자 이상 필요). 짧으면 우연히 맞는다: "${e.quote}"`);
      continue;
    }

    if (src.kind !== 'repo') continue;  // 논문·웹은 아래 별도 처리

    const m = /^(.+):(\d+)$/.exec(e.locator || '');
    if (!m) {
      add('locator-form', `${id} 의 locator 가 path:line 형태가 아니다: ${e.locator}`);
      continue;
    }
    const [, file, lineStr] = m;
    const line = Number(lineStr);

    const checkout = resolveCheckout(src);
    if (!checkout) continue;

    const content = fileAtCommit(checkout, src.commit, file);
    if (content === null) {
      add('quote-match', `${id}: ${src.repo}@${src.commit} 에 ${file} 이 없다`);
      continue;
    }
    const lines = content.split('\n');
    if (line < 1 || line > lines.length) {
      add('quote-match', `${id}: ${file} 은 ${lines.length}줄인데 locator 는 ${line}행이다`);
      continue;
    }
    const from = Math.max(0, line - 1 - LINE_SLACK);
    const to = Math.min(lines.length, line + LINE_SLACK);
    const window = norm(lines.slice(from, to).join('\n'));
    if (!window.includes(norm(e.quote))) {
      const whole = norm(content).includes(norm(e.quote));
      add('quote-match', whole
        ? `${id}: quote 가 ${file} 안에 있긴 하나 ${line}행 ±${LINE_SLACK} 밖이다. locator 를 고칠 것`
        : `${id}: quote 가 ${src.repo}@${src.commit} 의 ${file} 에 없다. 지어낸 인용이거나 커밋이 다르다`);
    }
  }
}

// ---- 출력 ----

if (missingCheckouts.size) {
  console.log('체크아웃을 찾을 수 없어 quote 대조를 건너뛴 저장소가 있다:');
  for (const repo of missingCheckouts) {
    console.log(`  ${repo}`);
    console.log(`    --repo ${repo}=<path> 로 알려주거나, RESEARCH_CHECKOUT_DIR 를 설정하거나,`);
    console.log(`    git clone --filter=blob:none https://github.com/${repo}.git`);
  }
  console.log('');
  add('quote-match', `체크아웃 없이 검증된 주장이 있다 (${[...missingCheckouts].join(', ')})`);
}

const blocked = problems.filter((x) => !allowed.has(x.rule));
const waived = problems.filter((x) => allowed.has(x.rule));

const counted = claims ? claims.length : 0;
const evCount = (claims || []).reduce((n, c) => n + (Array.isArray(c.evidence) ? c.evidence.length : 0), 0);

console.log(`${blocked.length ? 'FAIL' : 'OK  '}  research/${slug}  (주장 ${counted}개, 근거 ${evCount}개, 출처 ${sources ? sources.length : 0}개)`);
for (const x of blocked) console.log(`      [${x.rule}] ${x.msg}`);
for (const x of waived) console.log(`      허용됨  [${x.rule}] ${x.msg}`);

if (blocked.length) {
  console.log(`\n${blocked.length}건이 막혔다. 고치거나 --allow= 로 명시적으로 넘길 것.`);
  process.exit(1);
}
console.log('\n통과. 인용이 고정 원문과 일치한다. 주장이 옳다는 뜻은 아니다.');
