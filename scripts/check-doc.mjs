#!/usr/bin/env node
// 문서 디렉터리가 저장소 규칙을 지키는지 검사한다.
//   node scripts/check-doc.mjs research/2026-08-05-llm-wiki-retrieval-as-reasoning
//   node scripts/check-doc.mjs            # 인자가 없으면 전체 검사
//   node scripts/check-doc.mjs --help     # 규칙 목록
//
// 통과 아니면 차단이다. 경고 등급은 없다. 경고를 만들면 전부 경고로 흘러가고
// 아무도 고치지 않는다. 예외가 필요하면 --allow=<rule-id> 로 명시적으로 끈다.
//
// 정적 검사일 뿐이다. 통과했다고 화면이 제대로 나온다는 뜻은 아니다.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RESEARCH_DIR = join(ROOT, 'research');

const VOID = new Set([
  'img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'path', 'line',
  'circle', 'rect', 'use', 'area', 'col', 'embed', 'track', 'wbr', 'polygon',
  'polyline', 'ellipse', 'stop', 'param',
]);

const SIZE_LIMIT = 1024 * 1024;

// 모든 문서에 있어야 하는 eyebrow. 문서 골격의 최소 뼈대다.
const REQUIRED_EYEBROWS = ['index', 'tl-dr', 'problem', 'critique', 'conclusion', 'sources'];

// 제작 과정 서술. 독자에게 정보를 주지 않는다.
// 원문에 없는 계산을 캡션에 표시하는 것은 예외이므로 여기 넣지 않는다.
const PROCESS_NARRATION = [
  /이\s*(자료|문서)\s*[는은][^.]{0,40}(정리했|만들었|작성했)/,
  /원문을\s*직접\s*(읽|확인)/,
  /모든\s*수치[는를을][^.]{0,30}(표에서|직접)/,
  /소개글이\s*아니/,
];

const RULES = {
  'meta-json': 'meta.json 을 읽을 수 있고 title 과 date 가 있는가',
  'meta-date': 'meta.json 의 date 가 YYYY-MM-DD 인가',
  'meta-summary': 'meta.json 에 summary 가 있는가 (목록 설명이 비면 안 된다)',
  'dir-name': '디렉터리 이름이 YYYY-MM-DD-slug 인가',
  'dir-date': '디렉터리 날짜와 meta.json date 가 같은가',
  'index-html': 'index.html 이 있는가',
  size: `파일이 ${SIZE_LIMIT / 1024}KB 이하인가 (내장 이미지를 압축할 것)`,
  doctype: '<!doctype html> 이 있는가 (없으면 quirks mode)',
  charset: '<meta charset="utf-8"> 가 있는가',
  lang: '<html> 에 lang 속성이 있는가',
  viewport: 'viewport meta 가 있는가',
  'title-tag': '<title> 이 있는가',
  'dark-theme': 'prefers-color-scheme: dark 대응이 있는가',
  external: '외부 리소스를 불러오지 않는가 (오프라인에서 열려야 한다)',
  'img-alt': '모든 <img> 에 alt 텍스트가 있는가',
  'tag-balance': '태그가 균형 잡혀 있는가',
  'dup-script': '<script> 블록이 하나뿐인가',
  'rail-count': '.rail-item 수와 .slide 수가 같은가',
  'anchor-range': '#pN 앵커가 대상 문서의 슬라이드 수 안인가',
  'lineage-link': '../<slug>/ 링크가 실제로 존재하는 디렉터리인가',
  'series-backlink': '같은 series 문서끼리 서로 링크하는가',
  'eyebrow-set': `필수 eyebrow 가 다 있는가 (${REQUIRED_EYEBROWS.join(', ')})`,
  'svg-label': '모든 <svg> 에 role="img" 와 aria-label 이 있는가',
  'stat-sub': '모든 .stat 에 .sub 가 있는가 (단독 숫자 금지)',
  'em-dash': '본문에 em dash 가 없는가',
  'process-narration': '문서를 어떻게 만들었는지 쓰지 않았는가',
};

function stripCode(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

function checkTagBalance(html) {
  const body = stripCode(html).replace(/<!doctype[^>]*>/gi, '');
  const stack = [];
  const problems = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g;
  let m;
  while ((m = re.exec(body))) {
    const [, closing, rawTag, selfClose] = m;
    const tag = rawTag.toLowerCase();
    if (VOID.has(tag) || selfClose === '/') continue;
    if (!closing) {
      stack.push(tag);
    } else if (stack.length === 0) {
      problems.push(`짝 없는 닫는 태그 </${tag}>`);
    } else if (stack[stack.length - 1] !== tag) {
      problems.push(`태그 어긋남: </${tag}> 앞에 <${stack[stack.length - 1]}> 가 열려 있음`);
      const at = stack.lastIndexOf(tag);
      if (at >= 0) stack.length = at;
    } else {
      stack.pop();
    }
  }
  if (stack.length) problems.push(`닫히지 않은 태그: ${stack.join(', ')}`);
  return problems;
}

function lineOf(html, index) {
  return html.slice(0, index).split('\n').length;
}

// 문서를 읽어 교차 검사에 필요한 정보를 뽑는다.
async function loadDoc(dir) {
  const slug = relative(ROOT, dir).split('/').pop();
  const doc = { slug, dir, meta: null, metaError: null, html: null };
  try {
    doc.meta = JSON.parse(await readFile(join(dir, 'meta.json'), 'utf8'));
  } catch (err) {
    doc.metaError = err.message;
  }
  try {
    doc.html = await readFile(join(dir, 'index.html'), 'utf8');
  } catch {
    return doc;
  }
  doc.size = Buffer.byteLength(doc.html);
  doc.slideCount = (doc.html.match(/<section\s+class="slide\b/g) || []).length;
  doc.railCount = (doc.html.match(/class="rail-item"/g) || []).length;
  return doc;
}

function checkDoc(doc, byslug) {
  const p = [];
  const add = (rule, msg) => p.push({ rule, msg });

  if (doc.metaError) add('meta-json', `meta.json 읽기 실패: ${doc.metaError}`);
  const meta = doc.meta;
  if (meta) {
    for (const f of ['title', 'date']) {
      if (!meta[f]) add('meta-json', `meta.json 에 ${f} 없음`);
    }
    if (meta.date && !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) {
      add('meta-date', `date 형식이 YYYY-MM-DD 가 아님: ${meta.date}`);
    }
    if (!meta.summary) add('meta-summary', 'meta.json 에 summary 없음');
  }

  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(doc.slug)) {
    add('dir-name', `디렉터리 이름이 YYYY-MM-DD-slug 형식이 아님: ${doc.slug}`);
  }
  if (meta?.date && !doc.slug.startsWith(meta.date)) {
    add('dir-date', `디렉터리 날짜(${doc.slug.slice(0, 10)})와 meta.json date(${meta.date})가 다름`);
  }

  const html = doc.html;
  if (html === null) {
    add('index-html', 'index.html 없음');
    return p;
  }

  if (doc.size > SIZE_LIMIT) {
    add('size', `파일이 ${(doc.size / 1048576).toFixed(2)}MB 다 (한도 ${SIZE_LIMIT / 1024}KB). 내장 이미지를 압축할 것`);
  }

  if (!/^\s*<!doctype html>/i.test(html)) add('doctype', '<!doctype html> 없음');
  if (!/<meta\s+charset=["']?utf-8/i.test(html)) add('charset', '<meta charset="utf-8"> 없음');
  if (!/<html[^>]*\slang=/i.test(html)) add('lang', '<html> 에 lang 속성 없음');
  if (!/name=["']viewport["']/i.test(html)) add('viewport', 'viewport meta 없음');
  if (!/<title>/i.test(html)) add('title-tag', '<title> 없음');
  if (!/prefers-color-scheme:\s*dark/i.test(html)) add('dark-theme', '다크 테마 대응 없음');

  const loads = [
    ...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi),
    ...html.matchAll(/<link[^>]+href=["']([^"']+)["']/gi),
    ...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi),
    ...html.matchAll(/url\(\s*["']?(https?:\/\/[^"')]+)/gi),
  ].map((m) => m[1]);
  const external = loads.filter((u) => /^(https?:)?\/\//i.test(u));
  if (external.length) {
    add('external', `외부 리소스를 불러온다: ${[...new Set(external)].join(', ')}`);
  }

  const noAlt = [...html.matchAll(/<img\b[^>]*>/gi)]
    .filter((m) => !/\salt=["'][^"']+["']/i.test(m[0]));
  if (noAlt.length) {
    add('img-alt', `alt 텍스트가 없거나 빈 <img> ${noAlt.length}개 (첫 번째: ${lineOf(html, noAlt[0].index)}행)`);
  }

  for (const msg of checkTagBalance(html)) add('tag-balance', msg);

  // --- 덱 구조 ---
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)];
  if (scripts.length > 1) {
    add('dup-script', `<script> 블록이 ${scripts.length}개다 (${scripts.map((m) => lineOf(html, m.index) + '행').join(', ')}). 덱 스크립트는 하나여야 한다`);
  }
  if (doc.slideCount !== doc.railCount) {
    add('rail-count', `.slide ${doc.slideCount}개인데 .rail-item 은 ${doc.railCount}개다`);
  }

  // --- 문서 간 링크 ---
  const crossLinks = new Map(); // slug -> Set(anchor number | null)
  for (const m of html.matchAll(/href="\.\.\/([^"/]+)\/(#p(\d+))?/g)) {
    const [, target, , n] = m;
    if (!crossLinks.has(target)) crossLinks.set(target, new Set());
    if (n) crossLinks.get(target).add(Number(n));
  }
  for (const [target, anchors] of crossLinks) {
    const other = byslug.get(target);
    if (!other) {
      add('lineage-link', `../${target}/ 는 존재하지 않는 디렉터리다`);
      continue;
    }
    for (const n of anchors) {
      if (n < 1 || n > other.slideCount) {
        add('anchor-range', `../${target}/#p${n} 은 범위 밖이다 (그 문서는 슬라이드 ${other.slideCount}개)`);
      }
    }
  }

  if (meta?.series) {
    for (const other of byslug.values()) {
      if (other.slug === doc.slug) continue;
      if (other.meta?.series !== meta.series) continue;
      if (!crossLinks.has(other.slug)) {
        add('series-backlink', `같은 series(${meta.series}) 인 ${other.slug} 로 가는 링크가 없다`);
      }
    }
  }

  // --- 슬라이드 문법 ---
  const eyebrows = new Set(
    [...html.matchAll(/<p class="eyebrow">([^<]*)</g)].map((m) => m[1].trim())
  );
  const missing = REQUIRED_EYEBROWS.filter((e) => !eyebrows.has(e));
  if (missing.length) {
    add('eyebrow-set', `필수 eyebrow 누락: ${missing.join(', ')}`);
  }

  for (const m of html.matchAll(/<svg\b[^>]*>/gi)) {
    const tag = m[0];
    const lacks = [];
    if (!/\brole=["']img["']/i.test(tag)) lacks.push('role="img"');
    if (!/\baria-label=["'][^"']+["']/i.test(tag)) lacks.push('aria-label');
    if (lacks.length) {
      add('svg-label', `${lineOf(html, m.index)}행 <svg> 에 ${lacks.join(', ')} 없음. 그림이 무엇을 보여주는지 문장으로 쓸 것`);
    }
  }

  for (const m of html.matchAll(/<div class="stat\b[^"]*">([\s\S]*?)<\/div>/g)) {
    if (!/class="sub"/.test(m[1])) {
      add('stat-sub', `${lineOf(html, m.index)}행 .stat 에 .sub 가 없다. 숫자는 비교 기준과 함께 써야 한다`);
    }
  }

  // --- 문안 ---
  const prose = stripCode(html);
  const emIdx = prose.indexOf('—');
  if (emIdx >= 0) {
    const around = prose.slice(Math.max(0, emIdx - 40), emIdx + 40).replace(/\s+/g, ' ');
    add('em-dash', `em dash 를 쓴다. 쉼표나 문장 분리로 바꿀 것: ...${around}...`);
  }
  for (const re of PROCESS_NARRATION) {
    const hit = prose.match(re);
    if (hit) add('process-narration', `제작 과정을 서술한다: ${hit[0].replace(/\s+/g, ' ')}`);
  }

  return p;
}

// ---- CLI ----

const argv = process.argv.slice(2);

if (argv.includes('--help') || argv.includes('-h')) {
  console.log('사용법: node scripts/check-doc.mjs [research/<slug>] [--allow=rule,rule]\n');
  console.log('통과 아니면 차단이다. 경고 등급은 없다.\n');
  console.log('규칙:');
  const width = Math.max(...Object.keys(RULES).map((k) => k.length));
  for (const [id, desc] of Object.entries(RULES)) {
    console.log(`  ${id.padEnd(width)}  ${desc}`);
  }
  console.log('\n예외를 두려면:  --allow=size,dup-script');
  process.exit(0);
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

const target = argv.find((a) => !a.startsWith('-'));

// 교차 검사가 있으므로 항상 전체를 읽고, 출력만 대상으로 좁힌다.
const names = (await readdir(RESEARCH_DIR).catch(() => []))
  .filter((n) => !n.startsWith('.'))
  .sort();
const all = [];
for (const n of names) {
  const d = join(RESEARCH_DIR, n);
  if ((await stat(d)).isDirectory()) all.push(await loadDoc(d));
}
const byslug = new Map(all.map((d) => [d.slug, d]));

let selected = all;
if (target) {
  const want = target.replace(/\/+$/, '').split('/').pop();
  selected = all.filter((d) => d.slug === want);
  if (!selected.length) {
    console.error(`그런 문서가 없다: ${target}`);
    process.exit(2);
  }
}

if (!selected.length) {
  console.log('검사할 문서가 없다.');
  process.exit(0);
}

let failed = 0;
for (const doc of selected) {
  const problems = checkDoc(doc, byslug);
  const blocked = problems.filter((x) => !allowed.has(x.rule));
  const waived = problems.filter((x) => allowed.has(x.rule));
  const mark = blocked.length ? 'FAIL' : 'OK  ';
  console.log(`${mark}  research/${doc.slug}`);
  for (const x of blocked) console.log(`      [${x.rule}] ${x.msg}`);
  for (const x of waived) console.log(`      허용됨  [${x.rule}] ${x.msg}`);
  if (blocked.length) failed++;
}

if (failed) {
  console.log(`\n${failed}개 문서가 막혔다. 고치거나 --allow= 로 명시적으로 넘길 것.`);
  process.exit(1);
}
console.log('\n통과. 정적 검사만 한 것이므로 브라우저에서 화면도 확인할 것.');
