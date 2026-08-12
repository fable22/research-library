#!/usr/bin/env node
// arxiv e-print 를 받아 LaTeX 본문을 정규 텍스트 하나로 만들고 sha256 을 낸다.
// 사용: node pin-paper.mjs <arxiv_id> <version> [--dir <cache>]
//
// 왜 e-print 인가: research-source 가 이미 적어둔 이유 그대로다. HTML 변환은
// 셀을 떨구고 열을 합치고 다중행 헤더를 흘린다. 발행할 수치는 원본에서 온다.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const [id, version] = process.argv.slice(2);
const dirArg = process.argv.indexOf('--dir');
const CACHE = dirArg > -1 ? process.argv[dirArg + 1] : join(process.env.HOME, '.research-papers');

if (!id || !version) {
  console.error('사용: node pin-paper.mjs <arxiv_id> <version> [--dir <cache>]');
  console.error('예:   node pin-paper.mjs 2605.25480 v2');
  process.exit(2);
}

const ref = `${id}${version}`;
const work = mkdtempSync(join(tmpdir(), 'pin-paper-'));

try {
  const tgz = join(work, 'eprint.tar.gz');
  execFileSync('curl', ['-sL', '--fail', '--max-time', '60', '-o', tgz,
    `https://arxiv.org/e-print/${ref}`]);

  execFileSync('tar', ['xzf', tgz, '-C', work]);

  // .tex 를 이름순으로 이어 붙인다. 순서가 고정이라야 해시가 재현된다.
  const texFiles = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.tex')) texFiles.push(p);
    }
  };
  walk(work);
  texFiles.sort();

  if (!texFiles.length) {
    console.error(`${ref}: e-print 에 .tex 가 없다 (PDF-only 투고일 수 있다)`);
    process.exit(1);
  }

  const raw = texFiles.map((f) => readFileSync(f, 'utf8')).join('\n');

  // 주석만 걷어낸다. 그 외에는 손대지 않는다.
  // 명령어를 풀어 쓰면 원문이 아니게 되고, 인용 대조의 의미가 사라진다.
  const body = raw
    .split('\n')
    .filter((l) => !/^\s*%/.test(l))
    .join('\n');

  const sha = createHash('sha256').update(body).digest('hex');

  mkdirSync(CACHE, { recursive: true });
  const out = join(CACHE, `${ref}.tex`);
  writeFileSync(out, body);

  console.log(`저장   ${out}`);
  console.log(`파일   ${texFiles.length}개, ${body.length.toLocaleString()}자`);
  console.log(`sha256 ${sha}`);
  console.log('');
  console.log('sources.jsonl 에 넣을 것:');
  console.log(JSON.stringify({
    id: 'p1', kind: 'paper', arxiv_id: id, version,
    text_sha256: sha, text_chars: body.length,
    retrieved_at: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
  }));
} finally {
  rmSync(work, { recursive: true, force: true });
}
