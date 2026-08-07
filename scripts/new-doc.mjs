#!/usr/bin/env node
// 문서 골격과 조사 작업 공간을 함께 만든다.
//   node scripts/new-doc.mjs 2026-08-07-slug paper
//   node scripts/new-doc.mjs 2026-08-07-slug oss --title "제목" --summary "한 줄 설명"
//   node scripts/new-doc.mjs rename <old-slug> <new-slug>
//   node scripts/new-doc.mjs --help
//
// 두 트리를 항상 같은 이름으로 유지하는 것이 이 스크립트의 존재 이유다.
// slug 는 조사가 끝나야 정해진다. 기존 slug 들이 주제가 아니라 결론이라서 그렇다
// (llm-wiki-retrieval-as-reasoning). 그래서 잠정 이름으로 시작해 나중에 바꾸는데,
// 손으로 옮기면 research/ 와 .research/ 가 어긋나 근거를 찾을 수 없게 된다.
// rename 이 둘을 함께 옮기고 문서 안의 slug 도 같이 고친다.
//
// 셸을 assets/deck-shell.html 로 떼어둔 이유: 세 문서의 CSS 블록 md5 가 완전히
// 같고(142d819f, 17,909바이트) JS 도 같다. 이미 복붙 자산이었다. 파일 하나로
// 모으면 복붙 과정에서 생기는 사고가 없어진다. LLM-Wiki 문서에 덱 스크립트가
// 두 번 들어간 채 커밋 5개를 지나온 적이 있다.

import { readFile, writeFile, mkdir, rename as fsRename, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

// ---- 장 구성 ----
//
// 출발용 골격이다. 장 수는 정해져 있지 않고, eyebrow 중
// index/tl-dr/problem/critique/conclusion/sources 만 check-doc.mjs 가 검사한다.
// 나머지는 내용을 가리키는 이름으로 바꿔 쓰고, 필요하면 장을 더 넣는다.
// paper 와 oss 가 다른 자리는 ③④⑥⑦⑨⑩ 여섯 개다.

const CHAPTERS = {
  paper: [
    ['index', '표지', null],
    ['tl-dr', '요약', '무엇을 밝혔는지 두 문장 안에'],
    ['problem', '문제 정의', '기존 방식이 무엇에서 실패하는가'],
    ['method', '원리와 구조', '읽는 사람이 다른 사례의 동작을 예측할 수 있을 만큼'],
    ['compare', '기존 방식과의 비교', '논문이 실제로 돌린 baseline 을 이름으로'],
    ['trace', '사례 추적', '예시 하나가 처리되는 경로를 끝까지'],
    ['setup', '읽은 범위', '읽은 절과 부록, 맞춘 조건과 맞추지 않은 조건'],
    ['result', '결과', '표에서 직접'],
    ['critique', '해석의 한계', '논문이 인정한 것과 내가 주장하는 것을 구분'],
    ['adopt', '도입 판단', '어떤 조건에서 쓸 만한가'],
    ['conclusion', '결론', null],
    ['sources', '출처', null],
  ],
  oss: [
    ['index', '표지', null],
    ['tl-dr', '요약', '무엇을 하는 프로젝트인지 두 문장 안에'],
    ['problem', '문제 정의', '이 프로젝트가 없앤 수작업'],
    ['architecture', '구조', '패키지 경계, 무엇이 무엇과 통신하는가, 상태가 어디 있는가'],
    ['compare', '대안과의 비교', '이게 없으면 무엇을 쓰게 되는가'],
    ['trace', '요청 경로 추적', '한 요청의 모든 홉을 quote 와 file:line 으로'],
    ['setup', '읽은 범위', '커밋 SHA, 읽은 파일 수, 열지 않은 디렉터리, shallow 여부'],
    ['result', '동작', '코드가 무엇을 하는가. 자체 벤치마크는 그렇게 표시'],
    ['critique', '해석의 한계', '읽지 않은 코드, README 와 코드의 차이'],
    ['adopt', '도입 판단', 'adopt / trial / assess / hold 와 그 근거'],
    ['conclusion', '결론', null],
    ['sources', '출처', null],
  ],
};

const pad2 = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildRail(chapters) {
  const out = [];
  chapters.forEach(([, label], i) => {
    // 표지+요약, 본문, 마무리 사이에 구분선을 넣는다
    if (i === 2 || i === chapters.length - 4) out.push('    <div class="rail-sep"></div>');
    out.push(`    <button class="rail-item" data-go="${i}"><span class="n">${pad2(i + 1)}</span><span>${esc(label)}</span></button>`);
  });
  return out.join('\n');
}

function buildSlides(chapters, { title, summary }) {
  return chapters.map(([eyebrow, label, hint], i) => {
    const active = i === 0 ? ' data-active="true"' : '';
    const head = i === 0
      ? `      <h1>${esc(title)}</h1>\n      <p class="dek">${esc(summary)}</p>`
      : `      <h2>${esc(label)}. TODO 주장문으로 바꿀 것</h2>\n      <p class="dek">TODO 2~4문장. ${esc(hint || '')}</p>`;
    return [
      `  <!-- ${pad2(i + 1)} -->`,
      `  <section class="slide"${active}>`,
      '    <div class="slide-inner">',
      `      <p class="eyebrow">${eyebrow}</p>`,
      head,
      '      <p>TODO 본문</p>',
      '      <p class="note">TODO 이 장이 다루지 않는 것</p>',
      '    </div>',
      '  </section>',
    ].join('\n');
  }).join('\n\n');
}

// ---- create ----

// seq 는 저장소 전체에서 하나씩 올라가는 정수다. 같은 날짜 안의 목록 순서를 정하고,
// 이걸 손으로 넣게 하면 반드시 빠지거나 겹친다. 중간이 비어도 상관없다. 크기 비교만
// 하므로 문서를 지워도 나머지를 다시 매기지 않는다.
async function nextSeq() {
  const dir = join(ROOT, 'research');
  let names;
  try {
    names = await readdir(dir);
  } catch {
    return 1;
  }
  let max = 0;
  for (const n of names) {
    if (n.startsWith('.')) continue;
    try {
      const meta = JSON.parse(await readFile(join(dir, n, 'meta.json'), 'utf8'));
      if (Number.isInteger(meta.seq) && meta.seq > max) max = meta.seq;
    } catch {
      // meta.json 이 없거나 깨진 디렉터리는 check-doc 이 잡는다. 여기서는 건너뛴다.
    }
  }
  return max + 1;
}

async function create(slug, kind, opts) {
  if (!CHAPTERS[kind]) {
    console.error(`유형은 paper 또는 oss 다: ${kind}`);
    process.exit(2);
  }
  const m = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)$/.exec(slug);
  if (!m) {
    console.error(`디렉터리 이름은 YYYY-MM-DD-slug 형식이고 slug 는 영문 소문자와 하이픈만 쓴다: ${slug}`);
    process.exit(2);
  }
  const [, date] = m;

  const docDir = join(ROOT, 'research', slug);
  const workDir = join(ROOT, '.research', slug);
  if (existsSync(docDir)) {
    console.error(`이미 있다: research/${slug}`);
    process.exit(2);
  }

  const title = opts.title || `TODO 제목 (${slug})`;
  const summary = opts.summary || 'TODO 목록에 표시될 한 줄 설명';
  const chapters = CHAPTERS[kind];

  const shell = await readFile(join(ROOT, 'assets', 'deck-shell.html'), 'utf8');
  const html = shell
    .replace(/\{\{TITLE\}\}/g, esc(title))
    .replace(/\{\{SUMMARY\}\}/g, esc(summary))
    .replace(/\{\{SLUG\}\}/g, slug)
    .replace(/\{\{COUNT\}\}/g, pad2(chapters.length))
    .replace('{{RAIL}}', buildRail(chapters))
    .replace('{{SLIDES}}', buildSlides(chapters, { title, summary }));

  await mkdir(docDir, { recursive: true });
  await writeFile(join(docDir, 'index.html'), html);
  const seq = await nextSeq();
  await writeFile(join(docDir, 'meta.json'), JSON.stringify({
    title,
    date,
    seq,
    summary,
    category: kind === 'paper' ? 'paper' : 'topic',
  }, null, 2) + '\n');

  await mkdir(join(workDir, 'notes'), { recursive: true });
  await writeFile(join(workDir, 'sources.jsonl'),
    '// 조사 대상을 이식 가능한 신원으로 고정한다. 로컬 경로는 적지 않는다.\n' +
    (kind === 'paper'
      ? '// {"id":"p1","kind":"paper","arxiv_id":"2605.25480","version":"v1","sections_read":["1-7","A"]}\n'
      : '// {"id":"r1","kind":"repo","repo":"owner/name","commit":"019ee16","shallow":true,"history_available":false}\n'));
  await writeFile(join(workDir, 'claims.jsonl'),
    '// 초고가 나온 뒤 실린 문장에서 추출한다. 조사 단계에서 미리 쓰지 않는다.\n');

  console.log(`research/${slug}/          index.html, meta.json (seq ${seq})`);
  console.log(`.research/${slug}/         sources.jsonl, claims.jsonl, notes/`);
  console.log(`\n출발용 ${chapters.length}장 (${kind}). eyebrow 는 내용을 가리키는 이름으로 바꾸고, 장은 필요한 만큼 늘린다.`);
  console.log('읽은 범위는 조사를 마친 뒤 ⑦장에 직접 적는다.');
}

// ---- rename ----

async function renameSlug(oldSlug, newSlug) {
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(newSlug)) {
    console.error(`새 이름은 YYYY-MM-DD-slug 형식이어야 한다: ${newSlug}`);
    process.exit(2);
  }
  const oldDoc = join(ROOT, 'research', oldSlug);
  const newDoc = join(ROOT, 'research', newSlug);
  if (!existsSync(oldDoc)) {
    console.error(`없다: research/${oldSlug}`);
    process.exit(2);
  }
  if (existsSync(newDoc)) {
    console.error(`이미 있다: research/${newSlug}`);
    process.exit(2);
  }

  await fsRename(oldDoc, newDoc);
  console.log(`research/${oldSlug} → research/${newSlug}`);

  const oldWork = join(ROOT, '.research', oldSlug);
  if (existsSync(oldWork)) {
    await fsRename(oldWork, join(ROOT, '.research', newSlug));
    console.log(`.research/${oldSlug} → .research/${newSlug}`);
  } else {
    console.log(`.research/${oldSlug} 은 없다. 근거 트리 없이 진행한다.`);
  }

  // 문서 안에 slug 가 박혀 있는 자리를 고친다. og:url 과 문서 간 링크다.
  // 그대로 두면 og:url 이 없는 주소를 가리키고 계보 바 링크가 끊긴다.
  let touched = 0;
  for (const d of await readdir(join(ROOT, 'research'), { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const f = join(ROOT, 'research', d.name, 'index.html');
    if (!existsSync(f)) continue;
    const before = await readFile(f, 'utf8');
    const after = before.split(oldSlug).join(newSlug);
    if (after !== before) {
      await writeFile(f, after);
      console.log(`  ${d.name}/index.html 의 slug 참조를 고쳤다`);
      touched++;
    }
  }
  if (!touched) console.log('  다른 문서에서 이 slug 를 참조하는 곳은 없었다.');

  // 날짜가 바뀌었으면 meta.json 과 어긋난다. check-doc 의 dir-date 가 잡는다.
  const oldDate = oldSlug.slice(0, 10), newDate = newSlug.slice(0, 10);
  if (oldDate !== newDate) {
    console.log(`\n날짜가 ${oldDate} 에서 ${newDate} 로 바뀌었다. meta.json 의 date 도 함께 고칠 것.`);
  }
  console.log('\nnode scripts/check-doc.mjs 와 node scripts/build-index.mjs 를 돌릴 것.');
}

// ---- 인자 ----

const argv = process.argv.slice(2);

if (!argv.length || argv.includes('--help') || argv.includes('-h')) {
  console.log('사용법:');
  console.log('  node scripts/new-doc.mjs <YYYY-MM-DD-slug> <paper|oss> [옵션]');
  console.log('  node scripts/new-doc.mjs rename <old-slug> <new-slug>\n');
  console.log('옵션:');
  console.log('  --title <제목>       meta.json 과 표지에 들어간다');
  console.log('  --summary <설명>     목록과 og:description 에 들어간다\n');
  console.log('만드는 것:');
  console.log('  research/<slug>/     index.html (출발용 골격), meta.json');
  console.log('  .research/<slug>/    sources.jsonl, claims.jsonl, notes/\n');
  console.log('두 트리는 항상 같은 이름을 쓴다. 이름을 바꿀 때는 rename 을 쓸 것.');
  console.log('직접 옮기면 두 트리가 어긋나 문서와 근거를 이어붙일 수 없다.');
  process.exit(0);
}

if (argv[0] === 'rename') {
  if (argv.length < 3) {
    console.error('사용법: node scripts/new-doc.mjs rename <old-slug> <new-slug>');
    process.exit(2);
  }
  await renameSlug(argv[1], argv[2]);
} else {
  const opts = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--title' && argv[i + 1]) opts.title = argv[++i];
    else if (argv[i] === '--summary' && argv[i + 1]) opts.summary = argv[++i];
    else if (!argv[i].startsWith('-')) positional.push(argv[i]);
  }
  if (positional.length < 2) {
    console.error('사용법: node scripts/new-doc.mjs <YYYY-MM-DD-slug> <paper|oss>');
    process.exit(2);
  }
  await create(positional[0], positional[1], opts);
}
