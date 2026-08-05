#!/usr/bin/env node
// research/*/meta.json 을 모아 루트 index.html 을 다시 만든다.
//   node scripts/build-index.mjs
// 문서를 추가하거나 meta.json 을 고친 뒤 실행하면 목록이 갱신된다.

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RESEARCH_DIR = join(ROOT, 'research');

// series 는 같은 연구 흐름에 속한 문서를 묶는다. 목록에서 라벨로 표시된다.
const SERIES_LABEL = {
  'agent-native-wiki': 'agent-native wiki 연구 흐름',
};

const CATEGORY_LABEL = {
  paper: '논문 분석',
  topic: '주제 리서치',
  eval: '기술 평가',
  note: '메모',
};

const esc = (s) =>
  String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

async function collect() {
  let names;
  try {
    names = await readdir(RESEARCH_DIR);
  } catch {
    return [];
  }

  const entries = [];
  for (const name of names.sort()) {
    if (name.startsWith('.')) continue;
    const dir = join(RESEARCH_DIR, name);
    if (!(await stat(dir)).isDirectory()) continue;

    let meta;
    try {
      meta = JSON.parse(await readFile(join(dir, 'meta.json'), 'utf8'));
    } catch (err) {
      console.warn(`  건너뜀  research/${name} — meta.json 없음 또는 파싱 실패 (${err.message})`);
      continue;
    }
    for (const field of ['title', 'date']) {
      if (!meta[field]) {
        console.warn(`  건너뜀  research/${name} — meta.json 에 ${field} 없음`);
        meta = null;
        break;
      }
    }
    if (!meta) continue;

    try {
      await stat(join(dir, 'index.html'));
    } catch {
      console.warn(`  건너뜀  research/${name} — index.html 없음`);
      continue;
    }

    entries.push({ ...meta, slug: name });
  }

  // 날짜 내림차순. 같은 날짜는 slug 오름차순으로 고정해 빌드 결과가 흔들리지 않게 한다.
  return entries.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  });
}

function renderItem(e) {
  const cat = CATEGORY_LABEL[e.category] ?? e.category ?? '문서';
  const tags = Array.isArray(e.tags) ? e.tags : [];
  return `      <li class="item">
        <a class="title-link" href="research/${esc(e.slug)}/">
          <p class="meta"><span class="cat">${esc(cat)}</span><span>${esc(e.date)}</span>${
            e.format ? `<span>${esc(e.format)}</span>` : ''
          }${
            e.series ? `<span class="ser">${esc(SERIES_LABEL[e.series] ?? e.series)}</span>` : ''
          }</p>
          <h2>${esc(e.title)}</h2>
          ${e.summary ? `<p class="summary">${esc(e.summary)}</p>` : ''}
        </a>
${tags.length ? `        <p class="tags">${tags.map((t) => `<span>${esc(t)}</span>`).join('')}</p>\n` : ''}${
    e.source?.url
      ? `        <p class="src">원문 <a href="${esc(e.source.url)}">${esc(
          e.source.label ?? e.source.url
        )}</a></p>\n`
      : ''
  }      </li>`;
}

function renderPage(entries) {
  const byYear = new Map();
  for (const e of entries) {
    const y = String(e.date).slice(0, 4);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(e);
  }

  const body = entries.length
    ? [...byYear.entries()]
        .map(
          ([year, list]) =>
            `    <p class="year">${esc(year)}</p>\n    <ul class="list">\n${list
              .map(renderItem)
              .join('\n')}\n    </ul>`
        )
        .join('\n\n')
    : '    <p class="empty">아직 등록된 문서가 없습니다.</p>';

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>fable22 research library</title>
<meta name="description" content="fable22 리서치 문서 모음. 논문 분석, 주제 리서치, 기술 평가.">
<link rel="stylesheet" href="assets/index.css">
</head>
<body>
<div class="wrap">
  <header>
    <p class="eyebrow">index</p>
    <h1>research library</h1>
    <p class="lede">fable22 에서 정리한 리서치 문서 모음입니다. 각 문서는 파일 하나로 완결되어 있어서 내려받아 오프라인에서도 그대로 열립니다.</p>
  </header>

  <main>
${body}
  </main>

  <footer>
    문서를 추가하려면 <code>research/&lt;YYYY-MM-DD-slug&gt;/</code> 에 <code>index.html</code> 과 <code>meta.json</code> 을 넣고 <code>node scripts/build-index.mjs</code> 를 실행하세요. 자세한 규칙은 <a href="https://github.com/fable22/research-library#readme">README</a> 에 있습니다.
  </footer>
</div>
</body>
</html>
`;
}

const README_START = '<!-- docs:start -->';
const README_END = '<!-- docs:end -->';

async function updateReadme(entries) {
  const path = join(ROOT, 'README.md');
  let md;
  try {
    md = await readFile(path, 'utf8');
  } catch {
    console.warn('  README.md 없음 — 목록 갱신 건너뜀');
    return;
  }
  const a = md.indexOf(README_START);
  const b = md.indexOf(README_END);
  if (a === -1 || b === -1 || b < a) {
    console.warn(`  README.md 에 ${README_START} / ${README_END} 표시가 없어 목록 갱신을 건너뜀`);
    return;
  }

  const rows = entries.length
    ? ['| 날짜 | 문서 | 분류 |', '|---|---|---|'].concat(
        entries.map(
          (e) =>
            `| ${e.date} | [${e.title.replaceAll('|', '\\|')}](https://fable22.github.io/research-library/research/${e.slug}/) | ${
              CATEGORY_LABEL[e.category] ?? e.category ?? '문서'
            } |`
        )
      ).join('\n')
    : '_아직 등록된 문서가 없습니다._';

  const next = md.slice(0, a + README_START.length) + '\n\n' + rows + '\n\n' + md.slice(b);
  if (next !== md) await writeFile(path, next, 'utf8');
}

const entries = await collect();
await writeFile(join(ROOT, 'index.html'), renderPage(entries), 'utf8');
await updateReadme(entries);
console.log(`index.html 과 README.md 목록 갱신 완료 — 문서 ${entries.length}건`);
for (const e of entries) console.log(`  ${e.date}  ${e.title}`);
