# research library

fable22 에서 정리한 리서치 문서 모음입니다. 논문 분석, 주제 리서치, 기술 평가를 HTML 한 파일로 만들어 GitHub Pages 로 공개합니다.

**https://fable22.github.io/research-library/**

각 문서는 외부 리소스를 전혀 불러오지 않습니다. 파일 하나만 내려받으면 인터넷 없이도 그대로 열립니다.

## 문서 목록

<!-- docs:start -->

| 날짜 | 문서 | 분류 |
|---|---|---|
| 2026-08-28 | [JIT-Agent: 하네스를 태스크마다 모델이 새로 조립하게 만든 27B 메타 모델](https://fable22.github.io/research-library/research/2026-08-28-jit-agent-harness-intelligence/) | 논문 분석 |
| 2026-08-20 | [Cerebras Knowledge: 수집과 질의를 임베딩 테이블 한 장으로 갈라놓은 사내 지식베이스](https://fable22.github.io/research-library/research/2026-08-20-cerebras-kb-architecture/) | 주제 리서치 |
| 2026-08-19 | [Claude Code 세션 비용 모델: 토큰 하나의 가격과 세션이 보내는 토큰의 개수](https://fable22.github.io/research-library/research/2026-08-19-claude-code-session-cost-model/) | 메모 |
| 2026-08-18 | [J-Space Cognition Suite V3.6: 프롬프트 계층에서 상태를 다시 주입하는 추론시 통제 프로토콜](https://fable22.github.io/research-library/research/2026-08-18-j-space-cognition-suite/) | oss |
| 2026-08-14 | [deepseek-harness: 에이전트 루프도 모델 어댑터도 설정 한 행인 하네스](https://fable22.github.io/research-library/research/2026-08-14-deepseek-harness-plugin-architecture/) | oss |
| 2026-08-14 | [semantica: vector 검색 옆에 그래프 갈래를 하나 더 두는 컨텍스트 인프라](https://fable22.github.io/research-library/research/2026-08-14-semantica-graph-native-context/) | oss |
| 2026-08-13 | [A2E Agent Auditing Engine: 정답률은 0.11 폭에 몰리고 토큰은 최소 3.5배 벌어진다](https://fable22.github.io/research-library/research/2026-08-13-a2e-agent-auditing-engine/) | 논문 분석 |
| 2026-08-12 | [omo 5.0 native: opencode 플러그인을 떠나 자기 호스트를 갖는다](https://fable22.github.io/research-library/research/2026-08-12-omo-native-vs-opencode-plugin/) | 주제 리서치 |
| 2026-08-12 | [Cerebras Knowledge: 사내 지식을 RAG로 중앙집중화할 때 남는 문제](https://fable22.github.io/research-library/research/2026-08-12-cerebras-knowledge-base/) | 주제 리서치 |
| 2026-08-12 | [Claude 텍스트 워터마크: 마크는 Claude 를 거쳤다는 신호까지만 증명한다](https://fable22.github.io/research-library/research/2026-08-12-claude-text-watermark/) | 주제 리서치 |
| 2026-08-11 | [addyosmani/agent-skills: 강제는 산문에 맡기고, CI 는 스킬 자체에 건다](https://fable22.github.io/research-library/research/2026-08-11-addyosmani-agent-skills/) | 주제 리서치 |
| 2026-08-07 | [EviGraph: 리서치 에이전트의 작업 상태를 파이프라인 대신 근거 그래프로 둔다](https://fable22.github.io/research-library/research/2026-08-07-evigraph-evidence-graph-agent/) | 논문 분석 |
| 2026-08-07 | [Cloudflare computer: 에이전트에게 준 것은 컨테이너가 아니라 파일시스템이다](https://fable22.github.io/research-library/research/2026-08-07-cloudflare-computer-filesystem-not-container/) | 주제 리서치 |
| 2026-08-07 | [TencentDB Agent Memory: 기억을 자산으로 등록하고 agent 에게 장착시키는 층](https://fable22.github.io/research-library/research/2026-08-07-tencentdb-agent-memory-asset-layer/) | oss |
| 2026-08-07 | [LoopX: 에이전트 루프가 할 일을 잊지 않게 만드는 결정론적 제어 평면](https://fable22.github.io/research-library/research/2026-08-07-loopx-deterministic-loop-harness/) | 주제 리서치 |
| 2026-08-07 | [insane-search: 실패를 종료 상태로 인정하지 않는 웹 접근 엔진](https://fable22.github.io/research-library/research/2026-08-07-insane-search-nonterminal-failure/) | 주제 리서치 |
| 2026-08-05 | [WikiLoop: 위키 구축과 순회를 함께 학습시키는 논문 분석](https://fable22.github.io/research-library/research/2026-08-05-wikiloop-feedback-coupled-wiki/) | 논문 분석 |
| 2026-08-05 | [WikiKV: 계층형 지식베이스 저장 계층 논문 분석](https://fable22.github.io/research-library/research/2026-08-05-wikikv-hierarchical-kb-storage/) | 논문 분석 |
| 2026-08-05 | [Retrieval as Reasoning: LLM-Wiki 논문 분석](https://fable22.github.io/research-library/research/2026-08-05-llm-wiki-retrieval-as-reasoning/) | 논문 분석 |

<!-- docs:end -->

이 표는 `node scripts/build-index.mjs` 가 생성합니다. 손으로 고치지 마세요.

## 저장 구조

```
.
├── README.md                       # 저장소 소개 (이 파일)
├── AGENTS.md                       # 세션이 매번 알아야 할 것 (작성 규칙은 skill 에)
├── CLAUDE.md                       # @AGENTS.md import + Claude Code 전용 한 절
├── index.html                      # Pages 목록 페이지 (스크립트가 생성)
├── assets/
│   ├── index.css                   # 목록 페이지 스타일
│   └── deck-shell.html             # 문서 덱의 CSS·JS 셸 (new-doc.mjs 가 찍어낸다)
├── scripts/                        # 발행 인프라. skill 없이도 돌아간다
│   ├── build-index.mjs             # meta.json 을 모아 index.html 과 위 표를 생성
│   ├── check-doc.mjs               # 문서가 형식과 규약을 지키는지 검사
│   └── new-doc.mjs                 # 문서 골격과 작업 공간을 함께 생성·이동
├── .claude/skills/                 # 조사와 문서화 skill
│   ├── research-source/            # 코퍼스를 이식 가능한 신원으로 고정
│   ├── research-doc/               # 문서 작성
│   │   └── references/             # prose-ko.md, paper.md, oss.md
│   └── research-verify/            # 초고 적대적 검토
│       ├── references/             # 렌즈 4개
│       └── scripts/check-claims.mjs    # 주장이 고정된 원문에 근거하는지 검사
├── research/                       # 발행물만
│   └── 2026-08-05-llm-wiki-retrieval-as-reasoning/
│       ├── index.html              # 문서 본문 (자체 완결)
│       └── meta.json               # 목록에 표시할 정보
└── .research/                      # 근거
    └── 2026-08-05-llm-wiki-retrieval-as-reasoning/
        ├── sources.jsonl           # 무엇을 읽었는가 (repo+commit, arxiv_id+version)
        ├── evidence.jsonl          # 소스를 연 채로 적은 인용과 그 위치
        ├── claims.jsonl            # 어떤 주장을 어디에 근거했는가
        └── notes/                  # 작업 중 산출물 (git 에 올라가지 않음)
```

`research/` 와 `.research/` 는 **같은 디렉터리 이름**을 씁니다. 그래야 `check-claims.mjs research/<slug>` 한 줄로 근거를 찾을 수 있고, 매핑 파일이나 작업 경로가 발행물에 새어 들어가지 않습니다.

`sources.jsonl`, `evidence.jsonl`, `claims.jsonl` 은 커밋합니다. 조사는 머신 여러 대에서 이뤄지는데, 발행물만 머지되고 근거가 따라오지 않으면 받는 쪽에서 그 문서의 수치를 하나도 다시 확인할 수 없습니다. 세 파일 모두 문서당 수 KB입니다. `notes/` 는 다듬지 않은 중간 산출물이라 올리지 않습니다.

스크립트가 두 곳에 나뉜 기준은 **누가 돌리는가**입니다. `scripts/` 는 발행물을 검사하고 목록을 만드는 저장소 게이트라서 skill 이 없어도 사람이 그대로 돌립니다. skill 안의 스크립트는 `.research/` 의 작업 산출물만 다루므로 그 skill 의 절차 밖에서는 쓸 일이 없습니다.

세 파일의 역할이 다릅니다.

| 파일 | 대상 | 내용 |
|---|---|---|
| `README.md` | GitHub 에 들어온 사람 | 저장소가 무엇인지, 구조, 추가 절차, `meta.json` 필드 |
| `AGENTS.md` | 에이전트 세션 | 어디에 무엇을 두는지, 어떤 skill 을 쓰는지, 명령, 함정. `CLAUDE.md` 가 이걸 import 한다 |
| `.claude/skills/` | 에이전트 세션 | 조사 방법, 장 골격, 시각화, 문안 규칙, 검토 절차 |
| `index.html` | Pages 방문자 | 발행된 문서 목록 |

`AGENTS.md` 는 매 세션 전부 로드되므로 **항상 필요한 것만** 둡니다. 문서를 쓸 때만 필요한 규칙은 skill 에 있고, 필요할 때만 읽힙니다. 같은 규칙을 두 곳에 적으면 한쪽이 낡아도 알 수 없습니다.

문서 목록을 `README.md` 에 손으로 관리하지 않는 이유는 금방 실제와 어긋나기 때문입니다. 목록은 `meta.json` 하나만 보고 두 곳에 동시에 생성됩니다.

## 문서 추가하기

```bash
node scripts/new-doc.mjs YYYY-MM-DD-slug paper --title "제목" --summary "한 줄 설명"
# 내용을 채운 뒤
node scripts/check-doc.mjs research/YYYY-MM-DD-slug
node scripts/build-index.mjs
```

`new-doc.mjs` 가 출발용 골격이 들어간 `index.html` 과 `meta.json`, 그리고 `.research/<slug>/` 의 작업 파일을 함께 만듭니다. 유형은 `paper` 와 `oss` 두 가지이고 장 구성이 조금 다릅니다. 만든 직후 `check-doc.mjs` 를 통과합니다. 장 수는 늘리든 줄이든 상관없습니다. 게이트가 검사하는 것은 필수 eyebrow 여섯 개뿐입니다.

덱의 CSS 와 JS 는 `assets/deck-shell.html` 에 있습니다. 기존 세 문서의 CSS 블록 md5 가 완전히 같고 JS 도 같아서, 어차피 복붙되던 것을 파일 하나로 모았습니다.

이름은 조사가 끝나야 정해지는 경우가 많습니다. 바꿀 때는 직접 옮기지 말고 `rename` 을 쓰세요.

```bash
node scripts/new-doc.mjs rename <old-slug> <new-slug>
```

두 트리를 함께 옮기고, `og:url` 과 다른 문서가 걸어둔 링크까지 고칩니다. 손으로 옮기면 `research/` 와 `.research/` 가 어긋나 근거를 찾을 수 없게 됩니다.

커밋과 푸시는 이 절차에 넣지 않습니다. 푸시하면 1~2분 뒤 Pages 에 반영됩니다.

디렉터리 이름은 `YYYY-MM-DD-slug` 형식으로 씁니다. 날짜가 앞에 있어서 파일 목록이 그대로 시간순이 되고, URL 만 봐도 언제 무엇인지 알 수 있습니다.

### meta.json

```json
{
  "title": "문서 제목",
  "summary": "목록에 한두 문장으로 보일 설명",
  "date": "2026-08-05",
  "seq": 1,
  "category": "paper",
  "format": "deck",
  "series": "agent-native-wiki",
  "tags": ["RAG", "retrieval"],
  "source": {
    "label": "arXiv:2605.25480",
    "url": "https://arxiv.org/abs/2605.25480"
  }
}
```

| 필드 | 필수 | 설명 |
|---|---|---|
| `title` | 예 | 목록에 표시할 제목. 라이브러리·시스템·논문 이름을 반드시 담는다 (아래) |
| `date` | 예 | `YYYY-MM-DD`. 목록 정렬 1순위이자 연도 묶음의 기준 |
| `seq` | 예 | 1 이상의 정수. 문서를 추가한 순서이고 같은 날짜 안의 정렬 2순위다 (아래) |
| `summary` | 아니오 | 한두 문장 설명 |
| `category` | 아니오 | `paper`, `topic`, `eval`, `note`. 새 값을 쓰려면 `scripts/build-index.mjs` 의 `CATEGORY_LABEL` 에 추가 |
| `format` | 아니오 | `deck`, `report`, `dashboard` 등 문서 형태 |
| `series` | 아니오 | 같은 연구 흐름에 속한 문서를 묶는 식별자. 목록에 라벨로 표시된다. 표시 이름은 `scripts/build-index.mjs` 의 `SERIES_LABEL` 에 등록 |
| `tags` | 아니오 | 문자열 배열 |
| `source` | 아니오 | 원문 링크. `label` 과 `url` |

`meta.json` 이나 `index.html` 이 없는 디렉터리는 목록에서 빠집니다. 빌드할 때 무엇을 건너뛰었는지 출력되니 확인하세요.

#### 목록 순서와 `seq`

목록은 `date` 내림차순, 같은 날짜 안에서는 `seq` 내림차순입니다. **나중에 추가한 문서가 위에 옵니다.**

`date` 는 하루 단위라 같은 날 넣은 문서를 구분하지 못합니다. 예전에는 그럴 때 slug 알파벳순으로 밀렸는데, 그러면 목록의 순서가 제목 첫 글자라는 아무 의미 없는 값으로 정해집니다. 그렇다고 `date` 에 시·분·초를 붙이면, 목록에 보이지도 않고 아무도 확인할 수 없는 값을 문서마다 관리하게 됩니다.

`seq` 는 그 사이입니다. 저장소 전체에서 하나씩 올라가는 정수이고, 보이는 것은 여전히 날짜뿐입니다.

`new-doc.mjs` 가 만들 때 자동으로 넣으므로 직접 쓸 일은 없습니다. 손으로 정할 때만 기존 최댓값 + 1 을 쓰세요. 빠졌거나 겹치면 `check-doc.mjs` 가 막습니다. 번호가 중간에 비어도 됩니다. 크기 비교만 하므로 문서를 지워도 나머지를 다시 매길 필요가 없습니다.

#### 제목에는 대상 이름이 들어갑니다

`title` 은 목록에서 한 줄로 읽힙니다. 여기에 라이브러리·시스템·논문 이름이 없으면 무엇에 관한 문서인지 열어보기 전에는 알 수 없습니다.

```
✗ 에이전트에게 준 것은 컨테이너가 아니라 파일시스템이다
✓ Cloudflare computer: 에이전트에게 준 것은 컨테이너가 아니라 파일시스템이다
```

`check-doc.mjs` 의 `title-subject` 가 slug 의 주제어와 대조합니다. slug 에 이미 대상 이름이 들어 있으므로 별도 필드를 두지 않습니다. 제목의 나머지 절반은 그대로 주장 문장이면 됩니다.

## 검사 스크립트

발행물을 검사하는 스크립트입니다.

```bash
node scripts/check-doc.mjs                    # 전체 문서
node scripts/check-doc.mjs research/2026-...  # 특정 문서
node scripts/check-doc.mjs --help             # 규칙 목록
```

문서 형식과 저장소 규약을 확인합니다. doctype, charset, lang, viewport, 태그 균형, 외부 리소스, 다크 테마, `img` alt 같은 HTML 기본 사항에 더해 덱 구조(슬라이드 수와 목차 수 일치, 스크립트 중복), 문서 간 링크(`#pN` 앵커 범위, 계보 링크, 같은 `series` 상호 링크), 문안 규칙(em dash, 제작 과정 서술)을 봅니다. 전체 목록은 `--help` 가 알려줍니다.

**경고 등급은 없습니다.** 걸리면 종료 코드 1 입니다. 예외가 필요하면 `--allow=size` 처럼 규칙 id 를 명시해야 하고, 넘긴 항목은 출력에 남습니다. 경고 등급을 두면 전부 경고로 흘러가고 아무도 고치지 않기 때문입니다.

정적 검사이므로 통과했더라도 브라우저에서 화면을 한 번 열어보는 편이 좋습니다.

나머지 하나는 skill 안에 있습니다. `.research/` 의 작업 산출물을 다루기 때문에 그 절차 밖에서는 쓸 일이 없고, 발행물만 보는 위 게이트와 섞이면 어느 쪽이 저장소 규약인지 흐려집니다.

```bash
node .claude/skills/research-verify/scripts/check-claims.mjs research/2026-...
```

문서의 주장이 고정된 원문에 실제로 근거하는지 확인합니다. `.research/<slug>/` 의 `sources.jsonl` 과 `claims.jsonl` 을 읽고, 인용문이 그 커밋의 해당 위치에 실제로 있는지 대조합니다. 파일이 있고 줄 번호가 범위 안이라는 것만으로는 통과하지 않습니다.

## 왜 정적 HTML 인가

문서마다 표, 차트, 다이어그램 형태가 달라서 공통 템플릿에 맞추기 어렵습니다. 각 문서가 자기 스타일과 스크립트를 들고 있으면 서로 간섭하지 않고, 나중에 저장소를 정리하더라도 디렉터리째 옮기면 그대로 동작합니다. 목록 페이지만 스크립트로 관리합니다.
