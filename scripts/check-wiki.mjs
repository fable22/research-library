#!/usr/bin/env node
// 위키 투영의 1층 검사. 코드로 판정 가능한 것만 본다.
//   깨진 [[링크]] · 고아 페이지 · frontmatter 스키마 · 문서 커버리지 · staleness
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const WIKI = join(ROOT, 'wiki');

const problems = [];
const add = (rule, msg) => problems.push({ rule, msg });

const pages = [];
const walk = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.md')) pages.push(p);
  }
};
walk(WIKI);

const key = (p) => relative(WIKI, p).replace(/\.md$/, '');
const known = new Set(pages.map(key));
const inbound = new Map(pages.map((p) => [key(p), 0]));

const REQUIRED_FM = { finding: ['type', 'tags', 'sources'], system: ['type', 'identity', 'sources'], document: ['type', 'slug'], index: ['type'] };

for (const p of pages) {
  const k = key(p);
  const src = readFileSync(p, 'utf8');

  // frontmatter
  const fm = /^---\n([\s\S]*?)\n---/.exec(src);
  if (!fm) { add('frontmatter', `${k}: frontmatter 가 없다`); continue; }
  const fields = Object.fromEntries(
    fm[1].split('\n').filter((l) => /^[a-z_]+:/.test(l)).map((l) => [l.split(':')[0], l.slice(l.indexOf(':') + 1).trim()])
  );
  if (!fields.type) { add('frontmatter', `${k}: type 이 없다`); continue; }
  for (const need of REQUIRED_FM[fields.type] || []) {
    if (!fields[need]) add('frontmatter', `${k}: type=${fields.type} 인데 ${need} 가 없다`);
  }

  // 위키링크
  for (const m of src.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
    const t = m[1].trim();
    if (!known.has(t)) add('broken-link', `${k}: [[${t}]] 가 가리키는 페이지가 없다`);
    else inbound.set(t, inbound.get(t) + 1);
  }

  // claim 참조가 실제 원장에 있는가
  const slugFm = fields.slug || null;
  for (const m of src.matchAll(/claim:([a-z0-9 ]+)/g)) {
    const ids = m[1].trim().split(/\s+/);
    const srcs = (fields.sources || '').replace(/[[\]]/g, '').split(',').map((s) => s.trim());
    const docs = srcs.filter((s) => s.startsWith('documents/')).map((s) => s.replace('documents/', ''));
    for (const doc of docs) {
      const led = join(ROOT, '.research', doc, 'claims.jsonl');
      if (!existsSync(led)) continue;
      const have = new Set(readFileSync(led, 'utf8').split('\n')
        .filter((l) => l.trim().startsWith('{')).map((l) => JSON.parse(l).id));
      for (const id of ids) {
        if (!have.has(id)) add('claim-ref', `${k}: claim:${id} 가 ${doc} 의 원장에 없다`);
      }
    }
  }
}

// 고아
for (const [k, n] of inbound) {
  if (n === 0 && k !== 'index') add('orphan', `${k}: 어떤 페이지도 링크하지 않는다`);
}

// 문서 커버리지 — series 에 속한 발행물이 documents/ 에 있는가
const series = readdirSync(join(ROOT, 'research'))
  .filter((s) => existsSync(join(ROOT, 'research', s, 'meta.json')))
  .map((s) => ({ s, m: JSON.parse(readFileSync(join(ROOT, 'research', s, 'meta.json'), 'utf8')) }))
  .filter((x) => x.m.series === 'agent-native-wiki');
for (const { s } of series) {
  if (!known.has(`documents/${s}`)) add('coverage', `series 문서 ${s} 에 대응하는 위키 페이지가 없다`);
}

// staleness — 위키 페이지가 자기 근거보다 오래됐는가
for (const p of pages) {
  const k = key(p);
  const src = readFileSync(p, 'utf8');
  const doc = /^slug:\s*(\S+)/m.exec(src)?.[1];
  if (!doc) continue;
  const led = join(ROOT, '.research', doc, 'claims.jsonl');
  if (!existsSync(led)) continue;
  if (statSync(led).mtimeMs > statSync(p).mtimeMs + 1000) {
    add('stale', `${k}: 근거(${doc})가 이 페이지보다 나중에 바뀌었다`);
  }
}

const byRule = {};
for (const x of problems) (byRule[x.rule] ||= []).push(x.msg);
console.log(`${problems.length ? 'FAIL' : 'OK  '}  wiki/  (페이지 ${pages.length}개, 링크 ${[...inbound.values()].reduce((a, b) => a + b, 0)}개)`);
for (const [r, msgs] of Object.entries(byRule)) {
  console.log(`\n[${r}]`);
  for (const m of msgs) console.log(`  ${m}`);
}
process.exit(problems.length ? 1 : 0);
