#!/usr/bin/env node
// 세션 기록에서 "무엇을 읽지 않았는가"를 유도해 .research/<slug>/unread.txt 로 쓴다.
//   node .claude/skills/research-source/scripts/record-unread.mjs research/2026-08-07-slug
//   ... research/<slug> --repo owner/name=/path/to/checkout
//   ... --help
//
// research-source skill 의 도구다. 발행물이 아니라 .research/ 의 작업 산출물을 쓰므로
// 저장소 게이트(scripts/check-doc.mjs)와 달리 skill 안에 둔다.
//
// 이 파일을 모델이 직접 쓰게 두면 안 된다. "비어 있지 않으면 통과"는 강제하려는
// 성질과 반대로 유인이 걸린다. node_modules/ 한 줄이면 통과하고, 정직하게 250줄을
// 쓰면 문서의 "읽은 범위" 장이 얕아 보인다. 그래서 기록에서 유도한다.
//
// 이건 커버리지 요구가 아니다. 전부 읽으라는 뜻이 아니고, 많이 읽을수록 좋다는 뜻도
// 아니다. 무엇을 안 봤는지 독자가 알 수 있게 하려는 것뿐이다. 3,682 파일짜리 저장소
// 에서 12개만 읽고 정확한 문서를 쓰는 것이, 200개를 읽고 컨텍스트를 태운 뒤 흐릿한
// 문서를 쓰는 것보다 낫다. 미확인 목록이 길다고 문서가 부실한 게 아니다.
//
// 판정은 보수적이다. 파일을 읽었다고 인정하려면 세션 기록에 그 파일을 가리키는
// 경로가 명시돼 있어야 한다. glob 이나 파이프로 읽은 것은 잡히지 않으므로
// 안 읽은 쪽으로 기운다. 반대 방향(안 읽었는데 읽었다고 기록)보다 낫다.

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, resolve, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

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
const HOME = homedir();

const argv = process.argv.slice(2);

if (argv.includes('--help') || argv.includes('-h')) {
  console.log('사용법: node .claude/skills/research-source/scripts/record-unread.mjs research/<slug> [옵션]\n');
  console.log('옵션:');
  console.log('  --repo owner/name=<path>   체크아웃 위치를 직접 지정 (여러 번 가능)');
  console.log('  --transcript <file>        세션 기록을 직접 지정 (여러 번 가능)');
  console.log('  --evidence <path>          .research/<slug> 가 아닌 곳에 쓴다');
  console.log('  --print                    파일로 쓰지 않고 화면에만 출력');
  console.log('\n기본 세션 기록: ~/.claude/projects/<현재 경로>/ 의 모든 .jsonl');
  console.log('\n파일을 읽었다고 인정하는 조건:');
  console.log('  Read/Edit/Write 의 file_path 가 체크아웃 안을 가리킬 때');
  console.log('  Bash 명령이 체크아웃을 절대경로로 언급하고(cd, git -C 등)');
  console.log('  그 기준 아래로 해석되는 상대 경로 토큰이 실재 파일일 때');
  console.log('\nglob(*.py)이나 파이프로 읽은 것은 잡히지 않는다. 보수적으로 기운다.');
  process.exit(0);
}

const repoOverride = new Map();
const transcripts = [];
let evidenceDir = null;
let printOnly = false;
let target = null;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--repo' && argv[i + 1]) {
    const [k, v] = argv[++i].split('=');
    if (k && v) repoOverride.set(k, resolve(v.replace(/^~/, HOME)));
  } else if (a.startsWith('--repo=')) {
    const [k, v] = a.slice('--repo='.length).split('=');
    if (k && v) repoOverride.set(k, resolve(v.replace(/^~/, HOME)));
  } else if (a === '--transcript' && argv[i + 1]) {
    transcripts.push(resolve(argv[++i].replace(/^~/, HOME)));
  } else if (a === '--evidence' && argv[i + 1]) {
    evidenceDir = resolve(argv[++i]);
  } else if (a === '--print') {
    printOnly = true;
  } else if (!a.startsWith('-')) {
    target = a;
  }
}

if (!target) {
  console.error('검사할 문서를 지정할 것: node .claude/skills/research-source/scripts/record-unread.mjs research/<slug>');
  process.exit(2);
}
const slug = target.replace(/\/+$/, '').split('/').pop();
if (!evidenceDir) evidenceDir = join(ROOT, '.research', slug);

// ---- sources.jsonl ----

let sources;
try {
  sources = (await readFile(join(evidenceDir, 'sources.jsonl'), 'utf8'))
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'))
    .map((l) => JSON.parse(l));
} catch (err) {
  console.error(`${relative(ROOT, join(evidenceDir, 'sources.jsonl'))} 을 읽을 수 없다: ${err.message}`);
  console.error('먼저 조사 대상을 sources.jsonl 에 고정할 것.');
  process.exit(2);
}

const repos = sources.filter((s) => s.kind === 'repo');
if (!repos.length) {
  console.error('sources.jsonl 에 kind:"repo" 인 출처가 없다. 읽은 범위를 계산할 대상이 없다.');
  process.exit(2);
}

// ---- 세션 기록 찾기 ----

if (!transcripts.length) {
  const projectDir = join(HOME, '.claude', 'projects', process.cwd().replace(/\//g, '-'));
  // subagent 기록은 하위 디렉터리에 따로 쌓인다. 압축 하청이 읽은 파일은 저자
  // 컨텍스트 기록에 안 남으므로, 최상위만 훑으면 하청이 읽은 것을 통째로 놓친다.
  const walk = async (dir) => {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (e.name.endsWith('.jsonl')) transcripts.push(p);
    }
  };
  await walk(projectDir);
  if (!transcripts.length) {
    console.error(`세션 기록을 찾을 수 없다: ${projectDir}`);
    console.error('--transcript <file> 로 직접 지정할 것.');
    process.exit(2);
  }
}
if (!transcripts.length) {
  console.error('세션 기록이 하나도 없다. --transcript <file> 로 지정할 것.');
  process.exit(2);
}

// ---- 기록에서 경로 토큰 뽑기 ----

const TOKEN = /[\w./~-]+/g;
const READ_TOOLS = new Set(['Read', 'Edit', 'Write', 'NotebookEdit']);

const calls = [];  // {tool, paths:[absolute], tokens:[raw]}
let scanned = 0;

for (const t of transcripts) {
  let text;
  try {
    text = await readFile(t, 'utf8');
  } catch {
    console.error(`세션 기록을 읽을 수 없다: ${t}`);
    continue;
  }
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let rec;
    try {
      rec = JSON.parse(line);
    } catch {
      continue;
    }
    const content = rec?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (c?.type !== 'tool_use') continue;
      scanned++;
      const input = c.input || {};
      if (READ_TOOLS.has(c.name) && input.file_path) {
        calls.push({ tool: c.name, tokens: [String(input.file_path)] });
      } else if (c.name === 'Bash' && input.command) {
        calls.push({ tool: 'Bash', tokens: String(input.command).match(TOKEN) || [] });
      } else if ((c.name === 'Grep' || c.name === 'Glob') && input.path) {
        calls.push({ tool: c.name, tokens: [String(input.path)] });
      }
    }
  }
}

// ---- 저장소별 계산 ----

const expand = (t) => (t.startsWith('~') ? HOME + t.slice(1) : t);

function filesAt(checkout, commit) {
  return execFileSync('git', ['-C', checkout, 'ls-tree', '-r', '--name-only', commit], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  }).split('\n').map((s) => s.trim()).filter(Boolean);
}

const report = [];
let failed = false;

for (const src of repos) {
  if (!src.repo || !src.commit) {
    console.error(`source ${src.id} 에 repo 또는 commit 이 없다.`);
    failed = true;
    continue;
  }
  let checkout = repoOverride.get(src.repo) || null;
  if (!checkout && process.env.RESEARCH_CHECKOUT_DIR) {
    checkout = join(process.env.RESEARCH_CHECKOUT_DIR, src.repo.split('/').pop());
  }
  if (checkout) {
    try {
      execFileSync('git', ['-C', checkout, 'rev-parse', '--git-dir'], { stdio: 'ignore' });
    } catch {
      checkout = null;
    }
  }
  if (!checkout) {
    console.error(`${src.repo} 의 체크아웃을 찾을 수 없다.`);
    console.error(`  --repo ${src.repo}=<path> 로 알려주거나 RESEARCH_CHECKOUT_DIR 를 설정할 것.`);
    failed = true;
    continue;
  }
  const co = normalize(resolve(checkout));

  let files;
  try {
    files = filesAt(co, src.commit);
  } catch (err) {
    console.error(`${src.repo}@${src.commit} 의 파일 목록을 얻을 수 없다: ${err.message}`);
    failed = true;
    continue;
  }
  const fileSet = new Set(files);

  const inCorpus = (abs) => {
    const p = normalize(abs);
    if (!p.startsWith(co + '/')) return null;
    const r = p.slice(co.length + 1);
    return fileSet.has(r) ? r : null;
  };

  const touched = new Set();
  for (const call of calls) {
    const toks = call.tokens.map(expand);
    // 이 호출이 체크아웃을 절대경로로 명시했는가. 명시하지 않았다면 상대 토큰은
    // 다른 저장소의 같은 이름 파일일 수 있으므로 인정하지 않는다.
    const bases = toks
      .filter((t) => t.startsWith('/'))
      .map((t) => normalize(t))
      .filter((t) => t === co || t.startsWith(co + '/'));
    for (const t of toks) {
      if (t.startsWith('/')) {
        const r = inCorpus(t);
        if (r) touched.add(r);
      } else {
        for (const b of bases) {
          const r = inCorpus(join(b, t));
          if (r) { touched.add(r); break; }
        }
      }
    }
  }

  const dirOf = (f) => f.split('/').slice(0, -1).join('/') || '.';
  const allDirs = new Map();
  for (const f of files) allDirs.set(dirOf(f), (allDirs.get(dirOf(f)) || 0) + 1);
  const touchedDirs = new Set([...touched].map(dirOf));
  const unreadDirs = [...allDirs.keys()].filter((d) => !touchedDirs.has(d)).sort();

  report.push({ src, co, files, touched, allDirs, unreadDirs });
}

if (failed && !report.length) process.exit(2);

// ---- 쓰기 ----

const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const lines = [
  '# generated-by: .claude/skills/research-source/scripts/record-unread.mjs',
  `# generated-at: ${now}`,
  `# transcripts: ${transcripts.length}개 파일, tool 호출 ${scanned}건 훑음`,
  '#',
  '# 판정은 보수적이다. glob 이나 파이프로 읽은 파일은 잡히지 않으므로',
  '# 안 읽은 쪽으로 기운다. 손으로 고치면 이 파일의 의미가 사라진다.',
  '#',
  '# 이 목록이 길다고 문서가 부실한 게 아니다. 커버리지 요구가 아니라 공시다.',
  '# 필요한 것만 읽고 무엇을 안 봤는지 밝히는 편이, 다 읽고 컨텍스트를 태우는 것보다 낫다.',
];

for (const r of report) {
  const pct = r.files.length ? Math.round((r.touched.size / r.files.length) * 100) : 0;
  lines.push('#');
  lines.push(`# ${r.src.repo} @ ${r.src.commit.slice(0, 12)}`);
  lines.push(`#   파일 ${r.files.length}개 중 ${r.touched.size}개 확인 (${pct}%), 디렉터리 ${r.allDirs.size}개 중 ${r.unreadDirs.length}개 미확인`);
  if (r.src.shallow) lines.push('#   shallow clone 이다. 이력에 기반한 서술은 할 수 없다.');
  lines.push('');
  for (const d of r.unreadDirs) {
    lines.push(`${d === '.' ? './' : d + '/'}    # 파일 ${r.allDirs.get(d)}개`);
  }
}
const out = lines.join('\n') + '\n';

if (printOnly) {
  process.stdout.write(out);
} else {
  await stat(evidenceDir).catch(() => {
    console.error(`${relative(ROOT, evidenceDir)} 가 없다.`);
    process.exit(2);
  });
  const path = join(evidenceDir, 'unread.txt');
  await writeFile(path, out, 'utf8');
  console.log(`${relative(ROOT, path)} 를 썼다.`);
  for (const r of report) {
    console.log(`  ${r.src.repo}@${r.src.commit.slice(0, 12)}  확인 ${r.touched.size}/${r.files.length} 파일, 미확인 디렉터리 ${r.unreadDirs.length}개`);
  }
}

process.exit(failed ? 1 : 0);
