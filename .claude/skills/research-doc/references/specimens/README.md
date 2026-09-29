# 장 견본

세 문서 종류마다 장 하나씩. `research-doc/SKILL.md` 의 장 문법(eyebrow → h2 → `.key` →
본문 → `details.more` → `.note`)을 실제 corpus 로 채운 것이고, 저자와 렌즈가 "이 정도"의
기준으로 본다. 셋 다 `check-prose.mjs` 를 통과한다.

| 종류 | 파일 | 원 문서 | 접기 전 한글 | 접힌 비율 |
|---|---|---|---|---|
| walkthrough | `walkthrough-chapter.html` | Sonnet 5.5 migration, thinking 장 | 143 | 31% |
| explainer | `explainer-chapter.html` | Jev System One, calibration 장 | 633 | 16% |
| comparison | `comparison-chapter.html` | Opus 5.5 introduction, adopt 장 | 310 | 22% |

한글 수는 `check-prose.mjs --counts` 의 「슬라이드중앙」 열이다. Opus 5.5 문서 자체는 옮기는 사람을 위한
walkthrough 이고, comparison 견본은 그 문서의 체크리스트 장을 comparison 의 형태로 다시 쓴 것이다.
실제 문서에서는 종류가 `comparison` 일 때만 이 장이 있다.

## 종류마다 접기 전에 보여야 하는 것

**walkthrough** 는 체크리스트다. 바꿀 코드(diff), 그 코드가 내는 결과(facts 의 400/200),
같이 검사할 것 한 문단. 원문 문장과 플랫폼 조건은 첨언으로 간다. 짧은 것이 맞다. 독자는
이 장을 보고 자기 코드에서 바꿀 줄을 찾는다.

**explainer** 는 가장 길다. 원리를 재는 방법(식 포함), 원리를 보여 주는 그림, 원 자료의
사례 하나를 숫자로, 그 사례로 독자가 자기 경우를 예측하는 문단, 원리가 멈추는 조건.
다섯 가지가 전부 접기 전에 있어야 한다. 독자는 원 자료에 없는 경우를 이 장만 보고
예측해야 하므로, 원리를 첨언으로 접으면 장이 실패한다. 원문 인용, 계산 과정, 표에
넣지 않은 구간은 첨언이다.

**comparison** 은 표와 판단이다. `.key` 에 판단과 조건, 표에 상황별 adopt / trial /
assess / hold 와 근거, facts 에 판단을 바꾸는 숫자 셋, 되돌리는 방법 한 문단. 판단이
난 곳에서 멈춘다. 절감률 계산과 원문 인용, 시한은 첨언이다.

## 세 견본이 공통으로 지키는 것

- `h2` 는 짧은 제목이고 주장은 `.key` 한 곳에만 있다.
- 첨언은 접기 전 본문이 이미 한 주장만 뒷받침한다. 새 주장은 없다.
- 본문 문장은 사실을 잇는다. 「X 는 Y 가 아니다」 로 끝나는 면책 문장은 `.note` 한 줄로
  모으고 본문에서는 조건절로 쓴다.
- 숫자에는 단위와 비교 대상이 붙는다 (`$0.50 에서 60% 인하`).
