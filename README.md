# research library

fable22 에서 정리한 리서치 문서 모음입니다. 논문 분석, 주제 리서치, 기술 평가를 HTML 한 파일로 만들어 GitHub Pages 로 공개합니다.

**https://fable22.github.io/research-library/**

각 문서는 외부 리소스를 전혀 불러오지 않습니다. 파일 하나만 내려받으면 인터넷 없이도 그대로 열립니다.

## 문서 목록

<!-- docs:start -->

| 날짜 | 문서 | 분류 |
|---|---|---|
| 2026-08-05 | [Retrieval as Reasoning: LLM-Wiki 논문 분석](https://fable22.github.io/research-library/research/2026-08-05-llm-wiki-retrieval-as-reasoning/) | 논문 분석 |
| 2026-08-05 | [WikiKV: 계층형 지식베이스 저장 계층 논문 분석](https://fable22.github.io/research-library/research/2026-08-05-wikikv-hierarchical-kb-storage/) | 논문 분석 |
| 2026-08-05 | [WikiLoop: 위키 구축과 순회를 함께 학습시키는 논문 분석](https://fable22.github.io/research-library/research/2026-08-05-wikiloop-feedback-coupled-wiki/) | 논문 분석 |

<!-- docs:end -->

이 표는 `node scripts/build-index.mjs` 가 생성합니다. 손으로 고치지 마세요.

## 저장 구조

```
.
├── README.md                       # 저장소 소개 (이 파일)
├── CLAUDE.md                       # 문서를 만들 때 따를 작업 지침
├── index.html                      # Pages 목록 페이지 (스크립트가 생성)
├── assets/index.css                # 목록 페이지 스타일
├── scripts/
│   ├── build-index.mjs             # meta.json 을 모아 index.html 과 위 표를 생성
│   └── check-doc.mjs               # 문서가 규칙을 지키는지 검사
└── research/
    └── 2026-08-05-llm-wiki-retrieval-as-reasoning/
        ├── index.html              # 문서 본문 (자체 완결)
        └── meta.json               # 목록에 표시할 정보
```

세 파일의 역할이 다릅니다.

| 파일 | 대상 | 내용 |
|---|---|---|
| `README.md` | GitHub 에 들어온 사람 | 저장소가 무엇인지, 구조, 추가 절차 |
| `CLAUDE.md` | 문서를 만드는 사람과 에이전트 | 조사 방법, 작성 규칙, 검증 절차, 하지 말 것 |
| `index.html` | Pages 방문자 | 발행된 문서 목록 |

문서 목록을 `README.md` 에 손으로 관리하지 않는 이유는 금방 실제와 어긋나기 때문입니다. 목록은 `meta.json` 하나만 보고 두 곳에 동시에 생성됩니다.

## 문서 추가하기

```bash
mkdir -p research/YYYY-MM-DD-slug
# index.html 과 meta.json 작성
node scripts/check-doc.mjs research/YYYY-MM-DD-slug
node scripts/build-index.mjs
git add -A && git commit -m "..." && git push
```

푸시하고 1~2분이면 Pages 에 반영됩니다.

디렉터리 이름은 `YYYY-MM-DD-slug` 형식으로 씁니다. 날짜가 앞에 있어서 파일 목록이 그대로 시간순이 되고, URL 만 봐도 언제 무엇인지 알 수 있습니다.

### meta.json

```json
{
  "title": "문서 제목",
  "summary": "목록에 한두 문장으로 보일 설명",
  "date": "2026-08-05",
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
| `title` | 예 | 목록에 표시할 제목 |
| `date` | 예 | `YYYY-MM-DD`. 목록 정렬과 연도 묶음의 기준 |
| `summary` | 아니오 | 한두 문장 설명 |
| `category` | 아니오 | `paper`, `topic`, `eval`, `note`. 새 값을 쓰려면 `scripts/build-index.mjs` 의 `CATEGORY_LABEL` 에 추가 |
| `format` | 아니오 | `deck`, `report`, `dashboard` 등 문서 형태 |
| `series` | 아니오 | 같은 연구 흐름에 속한 문서를 묶는 식별자. 목록에 라벨로 표시된다. 표시 이름은 `scripts/build-index.mjs` 의 `SERIES_LABEL` 에 등록 |
| `tags` | 아니오 | 문자열 배열 |
| `source` | 아니오 | 원문 링크. `label` 과 `url` |

`meta.json` 이나 `index.html` 이 없는 디렉터리는 목록에서 빠집니다. 빌드할 때 무엇을 건너뛰었는지 출력되니 확인하세요.

## 검사 스크립트

```bash
node scripts/check-doc.mjs                    # 전체 문서
node scripts/check-doc.mjs research/2026-...  # 특정 문서
```

doctype, charset, lang, viewport, 태그 균형, 외부 리소스 로드, 다크 테마 대응, `img` alt, `meta.json` 필수 필드, 파일 크기를 확인합니다. 정적 검사이므로 통과했더라도 브라우저에서 화면을 한 번 열어보는 편이 좋습니다.

## 왜 정적 HTML 인가

문서마다 표, 차트, 다이어그램 형태가 달라서 공통 템플릿에 맞추기 어렵습니다. 각 문서가 자기 스타일과 스크립트를 들고 있으면 서로 간섭하지 않고, 나중에 저장소를 정리하더라도 디렉터리째 옮기면 그대로 동작합니다. 목록 페이지만 스크립트로 관리합니다.
