#!/usr/bin/env node
// check-prose.mjs 시험. 잡아야 할 것과 잡으면 안 되는 것을 나란히 돌린다.
//   node scripts/test/check-prose.test.mjs
//
// 오탐 쪽이 이 파일의 본론이다. 규칙 하나가 정상 한국어를 막기 시작하면 게이트 전체가
// --allow 로 흘러가고, 그때부터는 아무것도 막지 않는 것과 같다.

import { checkDoc, visibleProse, commaAfterConnective, PATTERNS } from '../check-prose.mjs';

let pass = 0, fail = 0;
const ids = (html) => checkDoc('t', html).map((p) => p.rule);

function hit(name, rule, html) {
  const got = ids(html);
  if (got.includes(rule)) { pass++; return; }
  fail++;
  console.log(`FAIL  잡았어야 한다 [${rule}]  ${name}`);
  console.log(`      실제로 잡힌 것: ${got.join(', ') || '(없음)'}`);
}

function clean(name, rule, html) {
  const got = ids(html);
  if (!got.includes(rule)) { pass++; return; }
  fail++;
  console.log(`FAIL  오탐 [${rule}]  ${name}`);
  console.log(`      ${checkDoc('t', html).find((p) => p.rule === rule).msg}`);
}

const doc = (body) => `<html><body><section class="slide"><p>${body}</p></section></body></html>`;

// ── 잡아야 하는 것 ────────────────────────────────────────────────────────
hit('반응어', 'reaction-word', doc('흥미롭게도 단일 문서 질문에서는 뒤진다.'));
hit('과장 형용사', 'promo-adjective', doc('정교한 캐시 계층을 갖추고 있다.'));
hit('출처 없는 귀속', 'vague-attribution', doc('업계에서는 이를 규제 대응으로 본다.'));
hit('독백', 'monologue', doc('여기서 잠깐 정리하면 캐시는 버전 단위다.'));
hit('진행 서술', 'progress-narration', doc('이제 결과를 살펴보자.'));
hit('이유 없는 유보', 'hedge-no-gap', doc('성능이 더 나을 수도 있어 보인다.'));
hit('피동 겹침', 'passive-stack', doc('그 값은 런타임에 확인되어진다.'));
// double-passive 가 따로 있던 시절의 목록. 합친 뒤에도 같은 문자열을 잡아야 한다.
hit('이중 피동 보여지다', 'passive-stack', doc('그래프에 경로가 보여진다.'));
hit('이중 피동 잊혀지다', 'passive-stack', doc('캐시가 비면 값은 잊혀진다.'));
hit('빈 요약', 'empty-summary', doc('요컨대 이 방식은 중요하다.'));
hit('가능성 맺음', 'prospects-close', doc('여러 한계에도 불구하고 가능성은 열려 있다.'));
hit('~에 의해 피동', 'by-passive', doc('설정은 런처에 의해 주입된다.'));
hit('합쇼체 종결', 'honorific-register', doc('이 구조는 캐시를 지나지 않습니다.'));
hit('합쇼체 ~듭니다', 'honorific-register', doc('비용은 절반으로 줄어듭니다.'));
hit('합쇼체 ~입니다', 'honorific-register', doc('그것이 기본값입니다.'));
hit('합쇼체 의문 ~습니까', 'honorific-register', doc('정말 그렇습니까?'));

// ── 잡으면 안 되는 것 ─────────────────────────────────────────────────────
clean('`만들어지다` 는 정상 피동', 'passive-stack', doc('인덱스는 빌드 때 만들어진다.'));
clean('`~에 의하면` 은 피동이 아니다', 'by-passive', doc('README 에 의하면 기본값은 3이다.'));
clean('`정교하다` 서술형은 형용사 남용이 아니다', 'promo-adjective',
  doc('저자들은 이 구현이 정교하다고 적었다.'));
clean('인용 안의 표현은 문서의 산문이 아니다', 'reaction-word',
  `<html><body><section class="slide"><blockquote class="q">흥미롭게도 이 값은 고정이다</blockquote></section></body></html>`);
clean('code 안의 표현도 아니다', 'passive-stack',
  doc('설정은 <code>확인되어진다</code> 라는 이름의 필드에 있다.'));
// `니다` 로 끝나면서 평서형인 셋. `아니다` 는 이 코퍼스에 223건 있어서, 여기서 새면
// 문서 전부가 막히고 게이트가 --allow 로 흘러간다.
// `~(으)니까` 는 평서형 연결어미다. CONNECTIVE 가 같은 어미를 정상으로 세고 있다.
clean('`잡히니까` 연결어미', 'honorific-register', doc('캐시가 커밋 단위로 잡히니까 다시 받지 않는다.'));
clean('`그러니까` 연결어미', 'honorific-register', doc('그러니까 이 경로는 재시도하지 않는다.'));
clean('`없으니까` 연결어미', 'honorific-register', doc('값이 없으니까 기본값으로 간다.'));
clean('`8개니까` 연결어미', 'honorific-register', doc('경계가 토큰 8개니까 그 아래는 keyword 로 간다.'));
clean('`아니다` 는 평서형이다', 'honorific-register', doc('성능 문제가 아니다. 정확도 문제다.'));
clean('`지니다` 는 평서형이다', 'honorific-register', doc('이 필드는 기본값을 지니다.'));
clean('`다니다` 는 평서형이다', 'honorific-register', doc('두 경로를 오가며 다니다.'));
clean('`.q` 인용 안의 합쇼체는 막지 않는다', 'honorific-register',
  `<html><body><section class="slide"><p class="q">브레인을 만드는 건 쉽습니다.<cite>@x</cite></p></section></body></html>`);
clean('`.wl` 인용 안의 합쇼체도 막지 않는다', 'honorific-register',
  `<html><body><section class="slide"><p>원문은 <span class="wl">랭킹은 의미가 없습니다</span> 라고 적는다.</p></section></body></html>`);
clean('따옴표로만 들어온 인용도 막지 않는다', 'honorific-register',
  doc('원문에 "실행 시간이 더 짧을겁니다" 라는 문장이 있다.'));

// ── 추출과 지표 ───────────────────────────────────────────────────────────
function eq(name, got, want) {
  if (got === want) { pass++; return; }
  fail++;
  console.log(`FAIL  ${name}: ${got} (기대 ${want})`);
}
eq('blockquote 는 산문에서 빠진다',
  /인용/.test(visibleProse('<blockquote class="q">인용</blockquote><p>본문</p>')), false);
// 이 저장소가 실제로 쓰는 인용 그릇 셋. blockquote 만 빠지던 시절에는 1,557개가 문서
// 자신의 산문으로 세어졌다.
eq('`p.q` 는 산문에서 빠진다',
  /인용/.test(visibleProse('<p class="q">인용</p><p>본문</p>')), false);
eq('`span.wl` 은 산문에서 빠진다',
  /인용/.test(visibleProse('<p>본문 <span class="wl">인용</span> 이라 적는다</p>')), false);
eq('`cite` 는 산문에서 빠진다',
  /출처/.test(visibleProse('<p class="x">본문<cite>출처</cite></p>')), false);
eq('따옴표 인용은 산문에서 빠진다',
  /인용/.test(visibleProse('<p>원문에 "인용" 이라는 문장이 있다</p>')), false);
eq('그릇 밖의 본문은 남는다',
  /본문/.test(visibleProse('<p class="q">인용</p><p>본문</p>')), true);
eq('연결어미 뒤 쉼표 비율', Math.round(commaAfterConnective('빠르고, 정확하고 싸다')), 50);
eq('연결어미가 없으면 null', commaAfterConnective('숫자만 있다'), null);
eq('규칙 id 는 중복되지 않는다', new Set(PATTERNS.map((p) => p[0])).size, PATTERNS.length);
// 규칙 둘이 같은 문자열을 잡으면 한 문장이 두 번 보고되고 예외에 id 를 두 개 적어야 한다.
eq('규칙끼리 같은 문자열을 두 번 잡지 않는다', (() => {
  for (let i = 0; i < PATTERNS.length; i++) {
    for (let j = i + 1; j < PATTERNS.length; j++) {
      const b = new Set(PATTERNS[j][2].source.split('|'));
      if (PATTERNS[i][2].source.split('|').some((x) => b.has(x))) {
        return `${PATTERNS[i][0]} ∩ ${PATTERNS[j][0]}`;
      }
    }
  }
  return 'none';
})(), 'none');

console.log(`\n${pass}개 통과, ${fail}개 실패`);
process.exit(fail ? 1 : 0);
