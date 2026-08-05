#!/usr/bin/env node
// 문서 디렉터리가 저장소 규칙을 지키는지 검사한다.
//   node scripts/check-doc.mjs research/2026-08-05-llm-wiki-retrieval-as-reasoning
//   node scripts/check-doc.mjs            # 인자가 없으면 전체 검사
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
const SIZE_WARN = 8 * 1024 * 1024;

function checkTagBalance(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!doctype[^>]*>/gi, '');

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

async function checkDoc(dir) {
  const rel = relative(ROOT, dir);
  const errors = [];
  const warnings = [];

  // --- meta.json ---
  let meta = null;
  try {
    meta = JSON.parse(await readFile(join(dir, 'meta.json'), 'utf8'));
  } catch (err) {
    errors.push(`meta.json 읽기 실패: ${err.message}`);
  }
  if (meta) {
    for (const f of ['title', 'date']) {
      if (!meta[f]) errors.push(`meta.json 에 ${f} 없음`);
    }
    if (meta.date && !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) {
      errors.push(`meta.json date 형식이 YYYY-MM-DD 가 아님: ${meta.date}`);
    }
    if (!meta.summary) warnings.push('meta.json 에 summary 없음 (목록에 설명이 비어 보인다)');
  }

  // --- 디렉터리 이름 ---
  const base = rel.split('/').pop();
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(base)) {
    errors.push(`디렉터리 이름이 YYYY-MM-DD-slug 형식이 아님: ${base}`);
  }
  if (meta?.date && !base.startsWith(meta.date)) {
    warnings.push(`디렉터리 날짜(${base.slice(0, 10)})와 meta.json date(${meta.date})가 다름`);
  }

  // --- index.html ---
  let html = null;
  try {
    html = await readFile(join(dir, 'index.html'), 'utf8');
  } catch {
    errors.push('index.html 없음');
    return { rel, errors, warnings };
  }

  const size = Buffer.byteLength(html);
  if (size > SIZE_WARN) {
    warnings.push(`파일이 ${(size / 1048576).toFixed(1)}MB 다. 내장 이미지를 압축할 것`);
  }

  if (!/^\s*<!doctype html>/i.test(html)) errors.push('<!doctype html> 없음 (quirks mode 로 렌더링된다)');
  if (!/<meta\s+charset=["']?utf-8/i.test(html)) errors.push('<meta charset="utf-8"> 없음');
  if (!/<html[^>]*\slang=/i.test(html)) errors.push('<html> 에 lang 속성 없음');
  if (!/name=["']viewport["']/i.test(html)) errors.push('viewport meta 없음 (모바일에서 축소되어 보인다)');
  if (!/prefers-color-scheme:\s*dark/i.test(html)) warnings.push('다크 테마 대응(prefers-color-scheme)이 없음');
  if (!/<title>/i.test(html)) errors.push('<title> 없음');

  // --- 외부 리소스 로드 ---
  const loads = [
    ...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi),
    ...html.matchAll(/<link[^>]+href=["']([^"']+)["']/gi),
    ...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi),
    ...html.matchAll(/url\(\s*["']?(https?:\/\/[^"')]+)/gi),
  ].map((m) => m[1]);
  const external = loads.filter((u) => /^(https?:)?\/\//i.test(u));
  if (external.length) {
    errors.push(`외부 리소스를 불러온다 (오프라인에서 깨진다): ${[...new Set(external)].join(', ')}`);
  }

  // --- img alt ---
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\salt=["'][^"']+["']/i.test(t));
  if (noAlt.length) warnings.push(`alt 텍스트가 없거나 빈 <img> ${noAlt.length}개`);

  // --- 태그 균형 ---
  errors.push(...checkTagBalance(html));

  return { rel, errors, warnings };
}

const arg = process.argv[2];
let targets;
if (arg) {
  targets = [join(ROOT, arg.replace(/\/+$/, ''))];
} else {
  const names = await readdir(RESEARCH_DIR).catch(() => []);
  targets = [];
  for (const n of names.sort()) {
    if (n.startsWith('.')) continue;
    const d = join(RESEARCH_DIR, n);
    if ((await stat(d)).isDirectory()) targets.push(d);
  }
}

if (!targets.length) {
  console.log('검사할 문서가 없다.');
  process.exit(0);
}

let failed = 0;
for (const dir of targets) {
  const { rel, errors, warnings } = await checkDoc(dir);
  const mark = errors.length ? 'FAIL' : warnings.length ? 'WARN' : 'OK  ';
  console.log(`${mark}  ${rel}`);
  for (const e of errors) console.log(`      오류  ${e}`);
  for (const w of warnings) console.log(`      경고  ${w}`);
  if (errors.length) failed++;
}

console.log(
  failed
    ? `\n${failed}개 문서에 오류가 있다. 고치고 다시 실행할 것.`
    : '\n오류 없음. 정적 검사만 한 것이므로 브라우저에서 화면도 확인할 것.'
);
process.exit(failed ? 1 : 0);
