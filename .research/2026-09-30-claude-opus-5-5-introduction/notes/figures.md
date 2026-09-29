# 원문과 시스템 카드가 그리거나 표로 적은 것

원문 w1 은 2026-09-29T15:50:58Z 수신본이다. 차트 점은 같은 HTML 의 SVG aria-label 이고, 2026-09-23 판과 130개 모두 같다.
처리: 그림 = 문서가 다시 그렸다 / 이름 = setup 에 이름과 빠진 이유를 적었다.

| 식별자 | 무엇을 보이나 | 어디서 | 처리 |
|---|---|---|---|
| w1 성능 표 | 9개 벤치마크 × 5개 모델 점수, 각주 1~3, 표 아래 조건 문단 | w1 §Performance and cost-effectiveness | 그림: bench-table 장 표 |
| w1 Pricing 표 | cache read, input, output, cache write 의 Opus 5.5 / Opus 5 가격 | w1 §Performance and cost-effectiveness | 그림: price 장 diff 표 |
| w1 Terminal-Bench 4.0 Accuracy vs Cost | 5개 모델 × 5 effort, 점수와 시도당 비용 25점 | w1 §Coding | 그림: coding-charts 장 산점도 + 첨언 표, cost-40 장 비율 격자 |
| w1 FrontierCode v1.1 main set | 25점, 과제당 비용 | w1 §Coding | 그림: coding-charts, frontiercode 장 |
| w1 CursorBench 4.0 | 4개 모델 20점 | w1 §Coding | 그림: coding-charts |
| w1 GDPval-AA v2.1 Elo vs Cost | 25점, 추정 과제당 비용 | w1 §Knowledge work | 그림: knowledge-charts |
| w1 AutomationBench | 4개 모델 20점 | w1 §Knowledge work | 그림: knowledge-charts |
| w1 WANDR | 3개 모델 15점, 각주 4 | w1 §Knowledge work | 그림: knowledge-charts |
| w1 Communication 비교 carousel | 세 과제(버그 설명, 스레드 요약, 설계 변경 설명)의 Opus 5 / Opus 5.5 응답 | w1 §Communication | 그림: communication 장에 발췌 대조 |
| w1 고객 인용 carousel 셋 | Coding 8, Knowledge work 8, Communication 5 | w1 각 절 | 그림: 절마다 인용 표 |
| s1 Table 8.1.A | 능력 요약 13행 | s1 p174 | 그림: bench-table 첨언(원문 표와 다른 행만), critique |
| s1 Table 5.2.2.1.A | Shade coding 공격 성공률 | s1 p87 | 그림: injection 장 막대 |
| s1 Figure 5.2.1.A | Gray Swan IPI k=1/10/15 | s1 p85 | 이름: 막대값은 본문 문장으로만 옮김 (그림 자체는 열지 않음) |
| s1 Figure 3.4.2.A | 취약점 탐색 classifier flag rate | s1 p57 (렌더링해 읽음) | 그림: cyber 장 막대 |
| s1 Figure 6.4.8.A | sandbox escape 시도 비율 | s1 p119 (렌더링해 읽음) | 그림: alignment 장 막대 |
| s1 Figure 6.5.1.B | 붙여 넣은 문서 속 지시 따름 비율 | s1 p125 (렌더링해 읽음) | 그림: pasted-text 장 막대 |
| s1 Table 8.14.5.A | Toolathlon Pass@1 등 | s1 p211 | 그림: critique 장 표 |
| s1 Figure 8.4.A/B, 8.8.A, 8.11.1.A, 8.11.2.A, 8.11.3.A, 8.13.1.A, 8.13.3.A/B, 8.14.6.A, 6.4.10.A, 3.4.1.A | 벤치마크별 effort 곡선, 감사 지표 | s1 | 이름: setup. 원문 차트가 같은 벤치마크를 그리거나 문서 주장에 쓰지 않아 다시 그리지 않음 |

## 원문 차트 점 130개 (aria-label 그대로)
Terminal-Bench 4.0 | Opus 5.5 · Low: 38.5% $1.29
Terminal-Bench 4.0 | Opus 5.5 · Med: 57.6% $2.94
Terminal-Bench 4.0 | Opus 5.5 · High: 64.2% $3.88
Terminal-Bench 4.0 | Opus 5.5 · Xhigh: 66.4% $7.35
Terminal-Bench 4.0 | Opus 5.5 · Max: 64.8% $11.24
Terminal-Bench 4.0 | Fable 5.1 · Low: 40.2% $5.70
Terminal-Bench 4.0 | Fable 5.1 · Med: 43.4% $7.80
Terminal-Bench 4.0 | Fable 5.1 · High: 49.4% $10.50
Terminal-Bench 4.0 | Fable 5.1 · Xhigh: 51.3% $15.80
Terminal-Bench 4.0 | Fable 5.1 · Max: 55.8% $19.50
Terminal-Bench 4.0 | Opus 5 · Low: 28.5% $4.25
Terminal-Bench 4.0 | Opus 5 · Med: 41.2% $7
Terminal-Bench 4.0 | Opus 5 · High: 47.0% $10.64
Terminal-Bench 4.0 | Opus 5 · Xhigh: 50.6% $13.48
Terminal-Bench 4.0 | Opus 5 · Max: 52.3% $15.83
Terminal-Bench 4.0 | GPT-5.6 Sol · Low: 7.9% $1.46
Terminal-Bench 4.0 | GPT-5.6 Sol · Med: 20.9% $2.69
Terminal-Bench 4.0 | GPT-5.6 Sol · High: 26.1% $4.12
Terminal-Bench 4.0 | GPT-5.6 Sol · Xhigh: 28.5% $5.39
Terminal-Bench 4.0 | GPT-5.6 Sol · Max: 37.3% $7.89
Terminal-Bench 4.0 | GPT-6 Astra · Low: 49.7% $4.95
Terminal-Bench 4.0 | GPT-6 Astra · Med: 53.9% $6.15
Terminal-Bench 4.0 | GPT-6 Astra · High: 57.9% $7.21
Terminal-Bench 4.0 | GPT-6 Astra · Xhigh: 57.6% $7.48
Terminal-Bench 4.0 | GPT-6 Astra · Max: 56.7% $10.35
FrontierCode v1.1, main set | Opus 5.5 · Low: 47.3% $0.40
FrontierCode v1.1, main set | Opus 5.5 · Med: 54.6% $0.80
FrontierCode v1.1, main set | Opus 5.5 · High: 54.0% $1.09
FrontierCode v1.1, main set | Opus 5.5 · Xhigh: 51.4% $2.25
FrontierCode v1.1, main set | Opus 5.5 · Max: 54.4% $6.19
FrontierCode v1.1, main set | Fable 5.1 · Low: 52.8% $2.47
FrontierCode v1.1, main set | Fable 5.1 · Med: 50.9% $3.28
FrontierCode v1.1, main set | Fable 5.1 · High: 50.3% $5.27
FrontierCode v1.1, main set | Fable 5.1 · Xhigh: 48.7% $9.27
FrontierCode v1.1, main set | Fable 5.1 · Max: 50.3% $12.82
FrontierCode v1.1, main set | Opus 5 · Low: 42.0% $2.64
FrontierCode v1.1, main set | Opus 5 · Med: 53.4% $4.61
FrontierCode v1.1, main set | Opus 5 · High: 48.0% $7.62
FrontierCode v1.1, main set | Opus 5 · Xhigh: 43.6% $8.99
FrontierCode v1.1, main set | Opus 5 · Max: 48.0% $12.28
FrontierCode v1.1, main set | GPT-5.6 Sol · Low: 35.4% $1.75
FrontierCode v1.1, main set | GPT-5.6 Sol · Med: 39.9% $2.50
FrontierCode v1.1, main set | GPT-5.6 Sol · High: 45.1% $3.25
FrontierCode v1.1, main set | GPT-5.6 Sol · Xhigh: 46.8% $3.88
FrontierCode v1.1, main set | GPT-5.6 Sol · Max: 47.5% $4.85
FrontierCode v1.1, main set | GPT-6 Astra · Low: 45.3% $1.59
FrontierCode v1.1, main set | GPT-6 Astra · Med: 48.8% $2.28
FrontierCode v1.1, main set | GPT-6 Astra · High: 50.9% $2.85
FrontierCode v1.1, main set | GPT-6 Astra · Xhigh: 50.6% $3.10
FrontierCode v1.1, main set | GPT-6 Astra · Max: 53.3% $4.36
CursorBench 4.0 | Opus 5.5 · Low: 43.7% $1.18
CursorBench 4.0 | Opus 5.5 · Med: 52.5% $2.90
CursorBench 4.0 | Opus 5.5 · High: 56.0% $3.97
CursorBench 4.0 | Opus 5.5 · Xhigh: 56.0% $6.99
CursorBench 4.0 | Opus 5.5 · Max: 57.8% $13.43
CursorBench 4.0 | Fable 5.1 · Low: 45.1% $5.44
CursorBench 4.0 | Fable 5.1 · Med: 46.8% $7.05
CursorBench 4.0 | Fable 5.1 · High: 49.2% $9.08
CursorBench 4.0 | Fable 5.1 · Xhigh: 51.6% $13.01
CursorBench 4.0 | Fable 5.1 · Max: 51.8% $17.28
CursorBench 4.0 | Opus 5 · Low: 40.7% $4.87
CursorBench 4.0 | Opus 5 · Med: 43.3% $6.94
CursorBench 4.0 | Opus 5 · High: 44.7% $9
CursorBench 4.0 | Opus 5 · Xhigh: 46.1% $11.43
CursorBench 4.0 | Opus 5 · Max: 46.6% $11.95
CursorBench 4.0 | GPT-5.6 Sol · Low: 24.6% $0.87
CursorBench 4.0 | GPT-5.6 Sol · Med: 31.1% $1.77
CursorBench 4.0 | GPT-5.6 Sol · High: 35.7% $2.85
CursorBench 4.0 | GPT-5.6 Sol · Xhigh: 37.7% $4.40
CursorBench 4.0 | GPT-5.6 Sol · Max: 41.7% $8.23
GDPval-AA v2.1 | Opus 5.5 · Low: 1224 $0.21
GDPval-AA v2.1 | Opus 5.5 · Med: 1576 $0.86
GDPval-AA v2.1 | Opus 5.5 · High: 1692 $1.54
GDPval-AA v2.1 | Opus 5.5 · Xhigh: 1820 $4.21
GDPval-AA v2.1 | Opus 5.5 · Max: 1846 $8.92
GDPval-AA v2.1 | Fable 5.1 · Low: 1450 $1.41
GDPval-AA v2.1 | Fable 5.1 · Med: 1536 $2.17
GDPval-AA v2.1 | Fable 5.1 · High: 1617 $3.43
GDPval-AA v2.1 | Fable 5.1 · Xhigh: 1721 $7.09
GDPval-AA v2.1 | Fable 5.1 · Max: 1735 $9.59
GDPval-AA v2.1 | Opus 5 · Low: 1294 $0.58
GDPval-AA v2.1 | Opus 5 · Med: 1476 $1.36
GDPval-AA v2.1 | Opus 5 · High: 1581 $3.03
GDPval-AA v2.1 | Opus 5 · Xhigh: 1676 $4.96
GDPval-AA v2.1 | Opus 5 · Max: 1708 $6.76
GDPval-AA v2.1 | GPT-5.6 Sol · Low: 1289 $0.27
GDPval-AA v2.1 | GPT-5.6 Sol · Med: 1403 $0.60
GDPval-AA v2.1 | GPT-5.6 Sol · High: 1480 $1.11
GDPval-AA v2.1 | GPT-5.6 Sol · Xhigh: 1548 $1.70
GDPval-AA v2.1 | GPT-5.6 Sol · Max: 1588 $2.81
GDPval-AA v2.1 | GPT-6 Astra · Low: 1366 $0.85
GDPval-AA v2.1 | GPT-6 Astra · Med: 1468 $1.82
GDPval-AA v2.1 | GPT-6 Astra · High: 1485 $2.43
GDPval-AA v2.1 | GPT-6 Astra · Xhigh: 1516 $3.04
GDPval-AA v2.1 | GPT-6 Astra · Max: 1542 $4.53
AutomationBench | Opus 5.5 · Low: 23.3% $0.50
AutomationBench | Opus 5.5 · Med: 28.6% $0.64
AutomationBench | Opus 5.5 · High: 32.0% $0.70
AutomationBench | Opus 5.5 · Xhigh: 34.4% $0.86
AutomationBench | Opus 5.5 · Max: 40.0% $1.37
AutomationBench | Opus 5 · Low: 20.4% $0.75
AutomationBench | Opus 5 · Med: 23.9% $0.89
AutomationBench | Opus 5 · High: 20.6% $1.03
AutomationBench | Opus 5 · Xhigh: 25.3% $1.15
AutomationBench | Opus 5 · Max: 26.9% $1.27
AutomationBench | GPT-5.6 Sol · Low: 11.7% $0.42
AutomationBench | GPT-5.6 Sol · Med: 19.6% $0.57
AutomationBench | GPT-5.6 Sol · High: 24.8% $0.64
AutomationBench | GPT-5.6 Sol · Xhigh: 26.3% $0.74
AutomationBench | GPT-5.6 Sol · Max: 28.8% $0.91
AutomationBench | GPT-6 Astra · Low: 30.3% $1.08
AutomationBench | GPT-6 Astra · Med: 34.1% $1.28
AutomationBench | GPT-6 Astra · High: 37.1% $1.45
AutomationBench | GPT-6 Astra · Xhigh: 39.0% $1.53
AutomationBench | GPT-6 Astra · Max: 41.4% $1.77
WANDR | Opus 5.5 · Low: 31.2% $1.20
WANDR | Opus 5.5 · Med: 62.8% $11.20
WANDR | Opus 5.5 · High: 67.3% $16.88
WANDR | Opus 5.5 · Xhigh: 71.3% $29.06
WANDR | Opus 5.5 · Max: 72.3% $37.92
WANDR | Fable 5.1 · Low: 63.3% $23.25
WANDR | Fable 5.1 · Med: 64.5% $27.41
WANDR | Fable 5.1 · High: 66.7% $33.62
WANDR | Fable 5.1 · Xhigh: 67.7% $42.81
WANDR | Fable 5.1 · Max: 68.7% $49.02
WANDR | Opus 5 · Low: 50.5% $10.65
WANDR | Opus 5 · Med: 58.1% $23.97
WANDR | Opus 5 · High: 64.6% $43.49
WANDR | Opus 5 · Xhigh: 67.0% $53.84
WANDR | Opus 5 · Max: 67.2% $61.62
