#!/usr/bin/env node
// 발행물의 한국어 산문이 prose-ko.md 의 규칙 중 셀 수 있는 것들을 지키는지 검사한다.
//   node scripts/check-prose.mjs research/2026-08-05-llm-wiki-retrieval-as-reasoning
//   node scripts/check-prose.mjs            # 인자가 없으면 전체 검사
//   node scripts/check-prose.mjs --counts   # 막지 않는 밀도표. 렌즈 C 가 읽는다
//   node scripts/check-prose.mjs --help     # 규칙 목록
//
// 통과 아니면 차단이다. 경고 등급은 없다. 예외는 --allow=<rule-id>.
//
// 여기 있는 규칙은 전부 prose-ko.md 에 이미 숫자가 붙어 있던 것들이다. 이 파일이
// 새로 정하는 한도는 없다.
//
// 열한 규칙 중 여덟은 열린 부류의 흔한 형태만 잡는다. 반응어는 흥미롭게도 말고도 얼마든지
// 있고, 실측하면 목록에 있는 여덟은 다 잡고 같은 문장을 다른 말로 쓴 열은 다 통과한다.
// 통과가 그 부류의 부재를 뜻하지 않는다는 말이고, 그 부류를 실제로 보는 것은 렌즈 C 다.
// 닫힌 것은 이중 피동·~에 의해 피동·합쇼체 종결 셋뿐이다. 문법 형태라 셀 수 있다. 숫자가 없는 규칙 — 지시대명사 반복, ~들, 문단머리 접속사,
// 문장 길이 — 은 --counts 로만 나온다. 세는 것과 판단하는 것은 다른 일이고, 뒤쪽은
// 렌즈 C 의 몫이다.
//
// 검사 대상은 문서가 스스로 쓴 산문뿐이다. 코드와 인용은 뺀다. 무엇을 빼는지는
// visibleProse 에 있다.

import { readdir, readFile } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RESEARCH_DIR = join(ROOT, 'research');

// 종성이 ㅂ 인 음절 588개. 연속 범위가 아니라 정규식으로 못 적으므로 만들어 쓴다.
const P_BATCHIM = Array.from({ length: 588 },
  (_, k) => String.fromCharCode(0xAC00 + k * 28 + 17)).join('');

// [규칙 id, 설명, 정규식]. 전부 0건이고, 한도가 붙는 규칙은 없다.
export const PATTERNS = [
  ['reaction-word', '반응어 (흥미롭게도, 놀랍게도, 주목할 점은)',
    /흥미롭게도|놀랍게도|주목할\s*(만한\s*)?점은|눈여겨볼\s*(만한\s*)?점은|여기서\s*중요한\s*것은/g],
  ['promo-adjective', '수식으로 때우는 형용사 (강력한, 획기적인, 정교한)',
    /강력한|획기적(인|이다)|정교한|탄탄한|풍부한|눈부신|압도적인/g],
  ['vague-attribution', '출처 없는 귀속 (업계에서는, 전문가들은)',
    /업계에서는|전문가들[은이]|일각에서는|많은\s*사람들[은이]/g],
  ['monologue', '독백 (여기서 잠깐, 다시 말해, 헷갈릴 수 있는데)',
    /여기서\s*잠깐|다시\s*말해|헷갈릴\s*수\s*있|짚고\s*넘어가/g],
  ['progress-narration', '진행 서술 (이제 ~보자, 먼저 ~부터)',
    /이제\s+[^.]{0,20}(보자|보겠다|살펴)|먼저\s+[^.]{0,20}부터\s*(확인|살펴|보)/g],
  ['hedge-no-gap', '이유 없는 유보 (~일 수도 있어 보인다, ~라고 볼 여지가 있다)',
    /수도\s*있어\s*보인다|볼\s*여지가\s*있|것으로\s*보인다고\s*할\s*수/g],
  // 이중 피동. 닫힌 목록이고 동형이의가 없어 정규식으로 안전하다.
  ['passive-stack', '이중 피동 (되어지다, 보여지다, 잊혀지다, 말해질 수 있다)',
    /되어지|되어진|되어졌|잊혀지|잊혀진|보여지|보여진|쓰여지|쓰여진|불려지|불려진|놓여지|놓여진|모여지|맺어지|짜여지|말해질\s*수|생각되어|여겨지어/g],
  ['empty-summary', '빈 요약 (요컨대 ~중요하다, 종합하면 장단점이)',
    /요컨대[^.]{0,30}중요|종합하면[^.]{0,30}(장단점|있다)/g],
  ['prospects-close', '한계에도 불구하고 가능성은 열려 있다 류의 맺음',
    /한계에도\s*불구하고[^.]{0,30}(가능성|기대)|가능성은\s*열려\s*있/g],
  // 피동 어미는 활용해서 붙는다. `되` 만 찾으면 `주입된다` 를 놓친다.
  ['by-passive', '`~에 의해` + 피동 (행위자를 조사로 미룬 영어 수동태)',
    /에\s*의(해|하여)\s*[^.]{0,12}(되[는다어었]|된[다는]|됐|돼|받[는아]|당[하해]|[아어여]졌|[아어여]진[다는])/g],
  // 발행물의 문체는 평서형이고 prose-ko.md 「Sentence ending」 이 그렇게 정해 두었다.
  // 합쇼체는 `니` 앞 음절에 ㅂ 받침이 온다 (습니다, 합니다, 줄어듭니다). 평서형 `~(으)니까`
  // 는 그 자리에 ㅂ 받침이 오지 않으므로 (잡다→잡으니까) 이 한 조건으로 갈린다.
  ['honorific-register', '합쇼체 종결 (~습니다, ~합니다) — 발행물은 평서형 ~한다/~이다',
    new RegExp(`[${P_BATCHIM}]니(다|까)`, 'g')],
];

// 숫자가 붙어 있지 않아 막지 않는 것들. --counts 로만 보여준다.
const DENSITY = [
  ['것이다', /것이다/g],
  ['~들 (복수 표지)', /[가-힣]들[이을은는의에]/g],
  ['지시대명사 (그것은/이것은)', /(그것|이것|그들|이들)[은는이가]/g],
  ['~에 대한/대해', /에\s*(대한|대해|대하여)/g],
  ['~를 통해', /[을를]\s*통(해|한|하여)/g],
  // `~에 있어서` 는 막지 않는다. 존재의 `있다+어서` 와 같은 꼴이고, 이 코퍼스에서
  // 걸린 2건이 모두 그쪽이었다. 어느 쪽인지는 문장을 읽어야 갈리므로 렌즈 C 몫이다.
  ['~에 있어서 (동형이의 주의)', /에\s*있어서/g],
  ['문단머리 접속사', /^\s*(또한|그러나|따라서|하지만|그리고)[\s,]/gm],
  // `~가 아니라 ~다` 는 막지 않는다. AI 한국어와 사람 한국어를 가르는 강한 신호이지만
  // (AI 5.8 대 사람 0.6/1k, G²=41.7), 이 코퍼스에서 걸리는 것 대부분이 정당한 쓰임이다:
  // 원문 직접 인용, 귀속 정정, 그리고 prose-ko.md 가 허용한 "독자가 쥔 틀린 답을 고치는
  // 자리". 장식적 반복과 그 셋을 정규식이 못 가른다. 세되, 판단은 렌즈 C 가 한다.
  ['`~가 아니라 ~다`', /(?<=[가-힣])(?<![만뿐])[이가]\s*아니라/g],
];

const RULES = Object.fromEntries(PATTERNS.map(([id, desc]) => [id, desc]));

// 보이는 산문만 남긴다. 인용과 코드는 규칙 대상이 아니다.
export function visibleProse(html) {
  let s = html;
  for (const tag of ['script', 'style', 'svg', 'code', 'pre', 'blockquote']) {
    s = s.replace(new RegExp(`<${tag}[\\s>][\\s\\S]*?</${tag}>`, 'gi'), ' ');
  }
  // 이 저장소가 인용을 담는 그릇은 blockquote 가 아니라 `.q`, `.wl`, `<cite>` 다.
  s = s.replace(/<(p|span|div)\b[^>]*class="[^"]*\b(?:q|wl)\b[^"]*"[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  s = s.replace(/<cite\b[\s\S]*?<\/cite>/gi, ' ');
  s = s.replace(/<[^>]+>/g, '\n').replace(/&[a-z]+;/gi, ' ');
  // 그릇 없이 따옴표로만 들어온 발췌도 같은 이유로 뺀다.
  return s.replace(/["“][^"”]{0,400}["”]/g, ' ');
}

// 위반이 몇 번째 슬라이드인지 알려주려면 슬라이드 경계가 필요하다.
function slidesOf(html) {
  const parts = html.split(/<section\b[^>]*class="[^"]*\bslide\b/i);
  return parts.slice(1).map(visibleProse);
}

export function checkDoc(slug, html) {
  const prose = visibleProse(html);
  const slides = slidesOf(html);
  const problems = [];

  for (const [id, desc, rx] of PATTERNS) {
    const hits = prose.match(new RegExp(rx.source, 'g')) || [];
    if (!hits.length) continue;
    // 어느 슬라이드인지 같이 준다. 문서 전체에서 N건이라는 말만으로는 고칠 수 없다.
    const where = [];
    slides.forEach((s, i) => {
      const n = (s.match(new RegExp(rx.source, 'g')) || []).length;
      if (n) where.push(`${i + 1}${n > 1 ? `(${n})` : ''}`);
    });
    const over = `${hits.length}건`;
    // 매치 문자열만 내면 잘린 조각이라 어디를 고칠지 알 수 없다. 앞뒤를 붙여 준다.
    const at = prose.search(new RegExp(rx.source));
    const sample = prose.slice(Math.max(0, at - 18), at + 20).replace(/\s+/g, ' ').trim();
    problems.push({
      rule: id,
      msg: `${desc} — ${over}. 슬라이드 ${where.join(', ') || '?'}. 예: "…${sample}…"`,
    });
  }
  return problems;
}

// 연결어미 뒤 쉼표. 사람이 쓴 한국어와 모델이 쓴 한국어를 가르는 가장 강한 측정 신호다.
// 형태소 분석기 없이 어절 끝 문자열로만 재는 근사치라 절대값을 논문 수치와 나란히 놓을 수
// 없다. 문서끼리 비교하는 용도이고, 그래서 막지 않는다.
//
// 오탐은 `사고, 보고, 광고` 처럼 고로 끝나는 한자어 명사다. 이 코퍼스에서 실측하면 분모의
// 2.5% 이고, 빼고 다시 재면 비율이 37.1% 에서 37.6% 로 오히려 올라간다. 분자와 분모에
// 같이 들어가기 때문이다. 비교를 뒤집을 만한 크기가 아니다.
//
// 위 37.1% 은 인용을 포함해 잰 옛 값이다. 지금 기준으로는 35.9% 다.
const CONNECTIVE = /(고|며|면서|지만|는데|어서|아서|여서|므로|니까|거나|든지|어도|아도)$/;

export function commaAfterConnective(prose) {
  let conn = 0, withComma = 0;
  for (const w of prose.match(/[가-힣]+[,，]?/g) || []) {
    const bare = w.replace(/[,，]$/, '');
    if (!CONNECTIVE.test(bare)) continue;
    conn++;
    if (w !== bare) withComma++;
  }
  return conn ? withComma / conn * 100 : null;
}

export function densityOf(html) {
  const prose = visibleProse(html);
  const ko = (prose.match(/[가-힣]/g) || []).length;
  return {
    ko,
    counts: DENSITY.map(([n, rx]) => [n, (prose.match(rx) || []).length]),
    conn: commaAfterConnective(prose),
    comma: ko ? (prose.match(/[,，]/g) || []).length / ko * 100 : 0,
  };
}

// 여기부터는 직접 실행할 때만 돈다. import 하면 규칙과 검사 함수만 가져간다.
const isMain = process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {

const argv = process.argv.slice(2);

if (argv.includes('--help') || argv.includes('-h')) {
  console.log('사용법: node scripts/check-prose.mjs [research/<slug>] [--counts] [--allow=rule,rule]\n');
  console.log('통과 아니면 차단이다. 경고 등급은 없다.');
  console.log('규칙의 한도는 전부 prose-ko.md 에서 온 것이고, 이 파일이 새로 정하지 않는다.\n');
  console.log('규칙:');
  const w = Math.max(...PATTERNS.map(([id]) => id.length));
  for (const [id, desc] of PATTERNS) {
    console.log(`  ${id.padEnd(w)}  ${desc} — 0건`);
  }
  console.log('\n--counts 는 숫자가 붙지 않은 항목의 밀도표를 낸다. 막지 않는다.');
  console.log('세는 것과 판단하는 것은 다른 일이고, 뒤쪽은 렌즈 C 가 한다.');
  process.exit(0);
}

const allowed = new Set(
  argv.filter((a) => a.startsWith('--allow='))
    .flatMap((a) => a.slice(8).split(',')).filter(Boolean));
for (const id of allowed) {
  if (!RULES[id]) {
    console.error(`그런 규칙이 없다: ${id}`);
    process.exit(2);
  }
}

// 문서 디렉터리도, 그 안의 index.html 도 받는다. 렌즈는 문서 경로를 들고 있고
// 게이트를 돌리는 사람은 디렉터리를 들고 있어서, 둘 중 어느 쪽이 올지 정해져 있지 않다.
const target = argv.find((a) => !a.startsWith('-'));
const slugOf = (t) => t.replace(/\/+$/, '').replace(/\/index\.html$/i, '').split('/').pop();
const all = (await readdir(RESEARCH_DIR, { withFileTypes: true }))
  .filter((d) => d.isDirectory()).map((d) => d.name).sort();
const selected = target ? all.filter((s) => s === slugOf(target)) : all;

if (!selected.length) {
  console.error(`그런 문서가 없다: ${target}`);
  process.exit(2);
}

if (argv.includes('--counts')) {
  console.log('한글 10만자당 빈도. 한도가 없는 항목이라 막지 않는다.\n');
  const head = DENSITY.map(([n]) => n.slice(0, 11).padStart(12)).join('');
  console.log(`${'문서'.padEnd(32)}${'한글자'.padStart(7)}${head}${'연결어미+쉼표%'.padStart(15)}${'쉼표%'.padStart(7)}`);
  for (const slug of selected) {
    const d = densityOf(await readFile(join(RESEARCH_DIR, slug, 'index.html'), 'utf8'));
    const row = d.counts.map(([, n]) => (d.ko ? (n / d.ko * 100000).toFixed(0) : '-').padStart(12)).join('');
    const conn = (d.conn === null ? '-' : d.conn.toFixed(1)).padStart(15);
    console.log(`${slug.slice(0, 31).padEnd(32)}${String(d.ko).padStart(7)}${row}${conn}${d.comma.toFixed(2).padStart(7)}`);
  }
  console.log('\n연결어미+쉼표: 사람이 쓴 한국어 4~13%, 모델이 쓴 한국어 16~28% (KatFishNet, ACL 2025).');
  console.log('형태소 분석 없이 어절 끝으로 잰 근사치다. 문서끼리 비교하는 데 쓸 것.');
  process.exit(0);
}

let failed = 0;
for (const slug of selected) {
  const html = await readFile(join(RESEARCH_DIR, slug, 'index.html'), 'utf8');
  const problems = checkDoc(slug, html);
  const blocked = problems.filter((x) => !allowed.has(x.rule));
  const waived = problems.filter((x) => allowed.has(x.rule));
  console.log(`${blocked.length ? 'FAIL' : 'OK  '}  research/${slug}`);
  for (const x of blocked) console.log(`      [${x.rule}] ${x.msg}`);
  for (const x of waived) console.log(`      허용됨  [${x.rule}] ${x.msg}`);
  if (blocked.length) failed++;
}

if (failed) {
  console.log(`\n${failed}개 문서가 막혔다. 고치거나 --allow= 로 명시적으로 넘길 것.`);
  process.exit(1);
}
console.log('\n통과. 셀 수 있는 규칙만 본 것이므로 읽히는지는 렌즈 C 가 판단한다.');

}
