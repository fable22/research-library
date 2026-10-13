# 장 견본

문서 종류마다 장 하나씩이다. `research-doc/SKILL.md` 의 장 문법(eyebrow → h2 → `.key` → 본문 →
`details.more` → `.note`)을 실제 corpus 로 채운 예시이고, 길이는 그 장의 내용이 정한 것이다. 쓰는
문서의 장 길이는 그 문서의 내용이 정한다.

| 종류 | 파일 | 원 문서 |
|---|---|---|
| walkthrough | `walkthrough-chapter.html` | Sonnet 5.5 migration, thinking 장 |
| explainer | `explainer-chapter.html` | Jev System One, calibration 장 |
| comparison | `comparison-chapter.html` | Opus 5.5 introduction, adopt 장 |

comparison 견본은 Opus 5.5 문서의 체크리스트 장을 comparison 의 형태로 다시 쓴 것이다. 실제 문서에서는
종류가 `comparison` 일 때만 이 장이 있다.

## 종류마다 접기 전에 보이는 것

walkthrough 는 체크리스트다. 바꿀 코드(diff)와 그 코드가 내는 결과(facts 의 400/200), 같이 검사할 것
한 문단이 보이고, 원문 문장과 플랫폼 조건은 첨언으로 간다. 독자는 이 장을 보고 자기 코드에서 바꿀
줄을 찾으므로 짧은 편이 맞다.

explainer 는 원리를 보여 준다. 원리가 어떻게 작동하는지와 그것을 보여 주는 그림, 원 자료의 사례 하나를
숫자로 보이고, 원리를 그대로 옮겨 쓸 수 있는 범위까지 접기 전에 둔다. 독자는 원 자료에 없는 경우를
이 장만 보고 예측해야 하므로 원리는 펼쳐 둔다. 원문 인용, 계산 과정, 표에 넣지 않은 구간은 첨언이다.

comparison 은 표와 판단이다. `.key` 에 판단과 조건, 표에 상황별 adopt / trial / assess / hold 와 근거,
facts 에 판단을 바꾸는 숫자, 그리고 되돌리는 방법 한 문단을 둔다. 판단이 난 곳에서 멈추고, 절감률
계산과 원문 인용, 시한은 첨언으로 보낸다.

## 견본이 함께 지키는 것

- `h2` 는 그 장이 담은 것을 가리키는 짧은 제목이고, 주장은 `.key` 한 곳에만 있다.
- 첨언은 접기 전 본문이 이미 한 주장만 뒷받침한다.
- 한계는 독자가 할 일과 묶어 한 번 쓴다. `.note` 는 독자의 다음 행동을 바꾸는 한 문장이 있을 때만 둔다.
- 원문 문장은 첨언의 `<span class="q">` 안에 두고, 본문은 누가 그렇게 말하는지 밝혀 우리말로 쓴다.
- 원 자료에 차트, 표, 그림이 있으면 본문은 그것을 다시 그린 것이다.
- 숫자에는 단위와 비교 대상이 붙는다 (`$0.50 에서 60% 인하`).
