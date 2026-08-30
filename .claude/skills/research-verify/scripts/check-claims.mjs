#!/usr/bin/env node
// 문서의 주장이 고정된 원문에 실제로 근거하는지 검사한다.
//   node .claude/skills/research-verify/scripts/check-claims.mjs research/2026-08-07-slug
//   ... research/<slug> --repo owner/name=/path/to/checkout
//   ... --help
//
// research-verify skill 의 도구다. 발행물이 아니라 .research/ 의 작업 산출물을 읽으므로
// 저장소 게이트(scripts/check-doc.mjs)와 달리 skill 안에 둔다.
//
// 읽는 것: .research/<slug>/sources.jsonl, claims.jsonl
// research/ 는 발행물만 담고, 근거는 같은 이름의 .research/<slug>/ 에 있다.
//
// 핵심은 locator 가 존재하는지가 아니라 그 자리에 무엇이 있는지다.
// "파일이 있고 줄 번호가 범위 안"은 6,000줄짜리 파일에서 아무 숫자나 통과시킨다.
// 그래서 quote 를 고정 커밋에서 직접 꺼내 대조한다.

import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

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
  'source-identity': 'repo 는 repo+commit, paper 는 arxiv_id+version+text_sha256 이 있는가',
  'source-local-path': 'sources.jsonl 에 로컬 경로가 새어 들어가지 않았는가',
  'source-drift': '고정해 둔 원문이 지금 받은 것과 같은 바이트인가 (paper)',
  'empty-evidence': 'verdict=confirmed 인 주장에 근거가 있는가',
  'quote-length': `quote 가 ${QUOTE_MIN}자 이상인가`,
  'quote-match': `quote 가 고정 커밋의 locator ±${LINE_SLACK}줄 안에 실제로 있는가`,
  'numeric-match': '주장에 적힌 수치가 인용한 표·절 안에 실제로 있는가 (paper)',
  'derived-inputs': 'kind=derived 주장이 계산의 입력값과 원문에 없다는 표시를 갖는가',
  'locator-form': 'locator 가 path:line 또는 표/절 식별자 형태인가 (kind 값 검증도 여기서 난다)',
  scope: '무엇을 기준으로 확인했는지 scope 에 적혀 있는가',
  'absence-search': 'kind=absence 주장에 재실행 가능한 검색 명령이 있는가',
  'behavioral-limits': 'kind=behavioral 주장에 확인하지 못한 것이 적혀 있는가',
  'history-claim': 'kind=history 주장의 source 에 이력이 실제로 있는가',
  'claim-kind-source': 'kind=code 주장이 구현 파일을 근거로 삼는가 (문서 파일이면 kind=doc)',
};

// derived: 원문이 인쇄하지 않은 수치. 표 두 개를 겹쳐 만든 비교 같은 것.
// research-doc 이 허용하고 caption 에 밝히라고 한 그것이다. 원문에 없는 것이 정상이므로
// numeric-match 를 걸면 안 되고, 대신 계산의 입력값이 원문에 있는지를 본다.
const KINDS = ['code', 'numeric', 'derived', 'absence', 'behavioral', 'history', 'doc', 'web'];

// 프로젝트가 자기 문서에 써 둔 것과 구현이 그렇게 돼 있는 것은 다른 사실이다.
// quote-match 는 둘을 구별하지 못한다 (문서 파일에도 그 줄은 실재하므로).
const DOC_FILE = [
  /\.(md|mdx|rst|txt|adoc|org)$/i,
  /(^|\/)(docs?|documentation|adr|rfcs?)\//i,
  /(^|\/)(readme|changelog|contributing|agents|claude|license|notice)[^/]*$/i,
];
const looksLikeDoc = (file) => DOC_FILE.some((re) => re.test(file));

// ---- 인자 ----

const argv = process.argv.slice(2);

if (argv.includes('--help') || argv.includes('-h')) {
  console.log('사용법: node .claude/skills/research-verify/scripts/check-claims.mjs research/<slug> [옵션]\n');
  console.log('옵션:');
  console.log('  --repo owner/name=<path>   체크아웃 위치를 직접 지정 (여러 번 가능)');
  console.log('  --papers <dir>             논문 원문 캐시 위치');
  console.log('  --evidence <path>          .research/<slug> 가 아닌 곳에서 근거를 읽는다');
  console.log('  --allow=rule,rule          규칙을 명시적으로 끈다');
  console.log('\n체크아웃 해결 순서 (repo):');
  console.log('  1. --repo owner/name=<path>');
  console.log('  2. $RESEARCH_CHECKOUT_DIR/<name>');
  console.log('  3. 못 찾으면 받아올 명령을 알려주고 차단한다 (자동으로 clone 하지 않는다)');
  console.log('\n원문 해결 순서 (paper):');
  console.log('  1. --papers <dir>');
  console.log('  2. $RESEARCH_PAPER_DIR');
  console.log('  3. ~/.research-papers');
  console.log('  캐시는 pin-paper.mjs 가 만든다. 같은 버전은 다시 받아도 같은 sha256 이므로');
  console.log('  캐시를 지워도 되고, sources.jsonl 의 text_sha256 이 신원이다.');
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

let paperOverrideDir = null;
const pIdx = argv.indexOf('--papers');
if (pIdx >= 0 && argv[pIdx + 1]) paperOverrideDir = resolve(argv[pIdx + 1]);

const target = argv.find((a, i) => !a.startsWith('-')
  && argv[i - 1] !== '--evidence' && argv[i - 1] !== '--repo' && argv[i - 1] !== '--papers');
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

// ---- 논문 원문 해결 ----
//
// repo 는 커밋이 바이트를 고정하지만 논문에는 그런 것이 없다. arXiv 의 버전 URL 은
// 불변이므로 e-print 를 받아 .tex 를 이어 붙인 것의 sha256 을 신원으로 쓴다.
// 같은 버전은 다시 받아도 같은 해시가 나오므로, 캐시는 버려도 되고 다른 머신에서
// pin-paper.mjs 로 다시 만들면 된다. 로컬 경로를 sources.jsonl 에 적지 않는 이유와 같다.

const PAPER_DIR = paperOverrideDir
  || process.env.RESEARCH_PAPER_DIR
  || join(process.env.HOME || '.', '.research-papers');

const paperCache = new Map();
const missingPapers = new Set();

// 그림 안의 수치는 .tex 에 없다. pin-paper.mjs 가 PDF 에서 뽑아 둔 것을 따로 읽는다.
const figureCache = new Map();

function resolveFigures(src) {
  if (figureCache.has(src.id)) return figureCache.get(src.id);
  const ref = `${src.arxiv_id}${src.version || ''}`;
  const path = join(PAPER_DIR, `${ref}.figures.txt`);
  let text = null;
  if (existsSync(path)) {
    text = readFileSync(path, 'utf8');
    if (src.figures_sha256) {
      const sha = createHash('sha256').update(text).digest('hex');
      if (sha !== src.figures_sha256) {
        add('source-drift',
          `source ${src.id}: ${ref}.figures.txt 의 sha256 이 sources.jsonl 과 다르다. pin-paper.mjs 로 다시 고정할 것`);
        text = null;
      }
    }
  }
  figureCache.set(src.id, text);
  return text;
}

function resolvePaper(src) {
  if (paperCache.has(src.id)) return paperCache.get(src.id);
  const ref = `${src.arxiv_id}${src.version || ''}`;
  const path = join(PAPER_DIR, `${ref}.tex`);
  let text = null;

  if (existsSync(path)) {
    text = readFileSync(path, 'utf8');
    if (src.text_sha256) {
      const sha = createHash('sha256').update(text).digest('hex');
      if (sha !== src.text_sha256) {
        add('source-drift',
          `source ${src.id}: ${ref} 의 sha256 이 sources.jsonl 에 적힌 것과 다르다\n` +
          `      기록 ${src.text_sha256}\n      실제 ${sha}\n` +
          `      원문이 바뀌었거나 캐시가 오염됐다. pin-paper.mjs 로 다시 고정할 것`);
        text = null;
      }
    } else {
      add('source-identity',
        `source ${src.id} (paper) 에 text_sha256 이 없다. 대조 대상이 그 시점의 바이트인지 확인할 수 없다`);
    }
  } else {
    missingPapers.add(ref);
  }
  paperCache.set(src.id, text);
  return text;
}

// LaTeX 원문과 사람이 옮겨 적은 인용문을 같은 평면에 놓는다.
// 명령어를 지우기만 하고 풀어 쓰지는 않는다. 풀어 쓰면 원문이 아니게 된다.
const delatex = (s) => s
  .replace(/\\(textbf|textit|textsc|emph|texttt|mathrm|mathbf|text)\{([^{}]*)\}/g, '$2')
  .replace(/\\(cite[a-z]*|label|ref|eqref|footnote)\{[^{}]*\}/g, '')
  .replace(/\\begin\{[^{}]*\}|\\end\{[^{}]*\}/g, ' ')
  .replace(/\\[a-zA-Z]+\s*/g, ' ')
  .replace(/\\\\/g, ' ')
  .replace(/[~$&{}]/g, ' ');
const normTex = (s) => delatex(s).replace(/\s+/g, ' ').trim();

// locator 가 가리키는 범위를 잘라낸다. LaTeX 는 등장 순서가 곧 표·그림 번호다.
// 잘라내지 못하면 문서 전체를 돌려주고, 그 사실을 호출한 쪽이 알 수 있게 scoped 를 false 로 준다.
function envAt(text, kind, n) {
  const open = new RegExp(`\\\\begin\\{${kind}\\*?\\}`, 'g');
  let m, i = 0;
  while ((m = open.exec(text))) {
    if (++i !== n) continue;
    const close = new RegExp(`\\\\end\\{${kind}\\*?\\}`, 'g');
    close.lastIndex = m.index;
    const e = close.exec(text);
    return text.slice(m.index, e ? e.index + e[0].length : text.length);
  }
  return null;
}

function envCount(text, kind) {
  return (text.match(new RegExp(`\\\\begin\\{${kind}\\*?\\}`, 'g')) || []).length;
}

function scopeFor(text, locator, figures) {
  const l = (locator || '').trim();
  let m;
  if ((m = /^Table\s+(\d+)$/.exec(l))) {
    const env = envAt(text, 'table', Number(m[1]));
    return env ? { text: env, scoped: true, what: l }
      : { text, scoped: false, what: l, overflow: envCount(text, 'table') };
  }
  if ((m = /^Figure\s+(\d+)$/.exec(l))) {
    const env = envAt(text, 'figure', Number(m[1]));
    if (!env) return { text, scoped: false, what: l, overflow: envCount(text, 'figure') };
    // 그림 환경은 캡션과 파일 이름만 갖는다. 값은 그 PDF 안에 있다.
    const inc = /\\includegraphics[^{]*\{([^}]+)\}/.exec(env);
    if (inc && figures) {
      const file = inc[1].replace(/^.*\//, '').replace(/\.(pdf|png|jpg|jpeg|eps)$/i, '');
      const re = new RegExp(`===== FIGURE-PDF ${file}\\.[a-z]+ =====([\\s\\S]*?)(?====== FIGURE-PDF |$)`, 'i');
      const block = re.exec(figures);
      if (block) return { text: env + '\n' + block[1], scoped: true, what: `${l} (${file})` };
    }
    return { text: env, scoped: true, what: l, figureless: !!inc };
  }
  if (/^Abstract$/i.test(l)) {
    const env = envAt(text, 'abstract', 1);
    if (env) return { text: env, scoped: true, what: l };
  }
  // §·Section·Appendix 는 절 경계를 정확히 자르기 어렵다. 문서 전체로 두되 그 사실을 밝힌다.
  return { text, scoped: false, what: l };
}

// locator 형태. 논문은 path:line 이 아니다
const PAPER_LOCATOR =
  /^(Table\s+[IVXLC\d]+|Figure\s+\d+|Algorithm\s+\d+|Listing\s+\d+|Appendix\s+[A-Z](\.\d+)*|§\s*\d+(\.\d+)*|Section\s+\d+(\.\d+)*|Abstract)$/i;

// 발행할 만한 수치만 센다. 맨 정수는 자릿수와 무관하게 전부 건너뛴다. 파일 개수·토큰 수처럼
// 구분자 없이 적힌 수치는 이 규칙이 보지 않고, 렌즈 B 의 몫이다.
const NUMERIC =
  /(?<![\w.\/-])(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+|\d+(?:\.\d+)?%)(?![\w\/-])/g;
const numsIn = (s) => [...String(s).matchAll(NUMERIC)].map((m) => m[1]);
const hasNum = (hay, n) => hay.includes(n) || hay.includes(n.replace(/,/g, ''));

let paperChecked = 0;
let paperUnscoped = 0;

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
  const paperScopes = [];   // derived 주장이 인용한 표들. 아래 evidence 루프가 채운다

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

  // 원문이 인쇄하지 않은 수치는 원문에서 찾을 수 없는 것이 정상이다.
  // 대신 계산의 입력값을 적게 해서 그것을 원문에서 찾는다.
  if (c.kind === 'derived') {
    const inputs = Array.isArray(c.derived_from) ? c.derived_from : [];
    if (!inputs.length) {
      add('derived-inputs',
        `${id} 는 파생 수치인데 derived_from 이 없다. 무엇을 겹쳐 계산했는지 적을 것 (예: ["0.839","0.722"])`);
    }
    if (!c.note) {
      add('derived-inputs',
        `${id} 는 파생 수치인데 note 가 없다. 원문에 이 값이 없다는 것을 독자가 알아야 한다 (문서 caption 의 "논문에는 이 비교가 없다"에 대응)`);
    }
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

    // ---- 논문 ----
    if (src.kind === 'paper') {
      const text = resolvePaper(src);
      if (text === null) continue;
      paperChecked++;

      const loc = (e.locator || '').trim();
      if (!PAPER_LOCATOR.test(loc)) {
        add('locator-form',
          `${id} 의 locator 가 논문 식별자 형태가 아니다: ${JSON.stringify(e.locator)}\n` +
          `      Table N · Figure N · §N.N · Section N · Appendix X · Abstract 중 하나여야 한다`);
      }

      const sc = scopeFor(text, loc, resolveFigures(src));
      if (sc.overflow !== undefined) {
        add('locator-form',
          `${id}: locator 가 ${loc} 인데 원문에 그 환경은 ${sc.overflow}개뿐이다`);
      }
      if (sc.figureless) {
        add('numeric-match',
          `${id}: ${loc} 의 수치는 .tex 가 아니라 그림 PDF 안에 있는데 뽑아 둔 것이 없다.\n` +
          `      pin-paper.mjs 를 다시 돌리고 (pdftotext 필요) sources.jsonl 에 figures_sha256 을 넣을 것`);
      }
      if (!sc.scoped) paperUnscoped++;

      const hay = normTex(sc.text);
      if (!hay.includes(normTex(e.quote))) {
        const whole = normTex(text).includes(normTex(e.quote));
        add('quote-match', whole
          ? `${id}: quote 가 논문에 있긴 하나 ${loc} 안에는 없다. locator 를 고칠 것`
          : `${id}: quote 가 arXiv:${src.arxiv_id}${src.version || ''} 에 없다. 지어낸 인용이거나 버전이 다르다\n` +
            `      "${e.quote.slice(0, 70)}${e.quote.length > 70 ? '…' : ''}"`);
      }

      // 발행 규칙 1번("확인하지 않은 수치를 발행하지 말 것")이 기계로 검사되는 자리.
      // derived 는 표 두 개를 겹쳐 만드는 것이 본령이라 근거 하나로 판정할 수 없다.
      // 아래 루프 밖에서 evidence 전체의 합집합을 놓고 한 번에 본다.
      if (c.kind === 'derived') {
        paperScopes.push({ loc, text: sc.text, scoped: sc.scoped });
        continue;
      }
      const missing = numsIn(c.text).filter((n) => !hasNum(sc.text, n));
      if (missing.length) {
        add('numeric-match',
          `${id}: 주장의 수치가 ${loc}${sc.scoped ? '' : ' (문서 전체)'} 안에 없다: ${missing.join(', ')}\n` +
          `      "${c.text.slice(0, 70)}${c.text.length > 70 ? '…' : ''}"\n` +
          `      원문이 인쇄하지 않은 값을 계산한 것이면 kind 를 "derived" 로 하고 derived_from 에 입력값을 적을 것`);
      }
      continue;
    }

    if (src.kind !== 'repo') continue;  // web 은 아직 대조 수단이 없다

    const m = /^(.+):(\d+)$/.exec(e.locator || '');
    if (!m) {
      add('locator-form', `${id} 의 locator 가 path:line 형태가 아니다: ${e.locator}`);
      continue;
    }
    const [, file, lineStr] = m;
    const line = Number(lineStr);

    if (c.kind === 'code' && looksLikeDoc(file)) {
      add('claim-kind-source',
        `${id}: kind=code 인데 근거가 문서 파일이다 (${file}). 구현이 그렇다는 것과 프로젝트가 자기 문서에 그렇게 썼다는 것은 다른 사실이다. kind 를 "doc" 으로 바꾸거나 구현 파일에서 같은 사실을 확인할 것`);
    }

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

  // 파생 수치는 표 두 개를 겹쳐 만드는 것이 본령이다. 입력값 하나하나가
  // 인용한 표 중 어딘가에 있으면 되고, 어느 표인지까지 요구하지는 않는다.
  if (c.kind === 'derived' && paperScopes.length) {
    const missing = (c.derived_from || []).map(String)
      .filter((n) => !paperScopes.some((s) => hasNum(s.text, n)));
    if (missing.length) {
      const where = paperScopes.map((s) => s.loc + (s.scoped ? '' : ' (문서 전체)')).join(' + ');
      add('numeric-match',
        `${id}: 계산의 입력값이 ${where} 어디에도 없다: ${missing.join(', ')}\n` +
        `      다른 표에서 가져온 값이면 그 표도 evidence 에 넣을 것`);
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

if (missingPapers.size) {
  console.log('원문을 찾을 수 없어 대조를 건너뛴 논문이 있다:');
  for (const ref of missingPapers) {
    const m = /^(\d{4}\.\d{4,5})(v\d+)?$/.exec(ref);
    console.log(`  ${ref}`);
    console.log(`    node .claude/skills/research-verify/scripts/pin-paper.mjs ${m ? `${m[1]} ${m[2] || 'v1'}` : ref}`);
  }
  console.log('');
  add('quote-match', `원문 없이 검증된 주장이 있다 (${[...missingPapers].join(', ')})`);
}

const blocked = problems.filter((x) => !allowed.has(x.rule));
const waived = problems.filter((x) => allowed.has(x.rule));

const counted = claims ? claims.length : 0;
const evCount = (claims || []).reduce((n, c) => n + (Array.isArray(c.evidence) ? c.evidence.length : 0), 0);

console.log(`${blocked.length ? 'FAIL' : 'OK  '}  research/${slug}  (주장 ${counted}개, 근거 ${evCount}개, 출처 ${sources ? sources.length : 0}개)`);
for (const x of blocked) console.log(`      [${x.rule}] ${x.msg}`);
for (const x of waived) console.log(`      허용됨  [${x.rule}] ${x.msg}`);

// 논문 근거 중 몇 건이 문서 전체로만 대조됐는지 밝힌다.
// Table N 은 그 표 안에서 찾지만 §5.2 는 절 경계를 자를 수 없어 문서 전체로 떨어진다.
// 둘을 같은 강도로 보고하면 통과가 실제보다 강해 보인다.
if (paperUnscoped) {
  console.log(`      논문 근거 ${paperChecked}건 중 ${paperUnscoped}건은 표·그림으로 좁히지 못해 문서 전체에서 대조했다`);
}

if (blocked.length) {
  console.log(`\n${blocked.length}건이 막혔다. 고치거나 --allow= 로 명시적으로 넘길 것.`);
  process.exit(1);
}
console.log('\n통과. 인용이 고정 원문과 일치한다. 주장이 옳다는 뜻은 아니다.');
