---
type: index
okf_version: "0.1"
updated: 2026-08-13
---

# research library wiki

발행된 문서에서 컴파일한 지식 층. 사람이 읽는 리포트는 `research/<slug>/index.html` 이고,
여기는 **에이전트가 순회하는 면**이다. 두 층 모두 `.research/<slug>/claims.jsonl` 의 같은
근거에서 나온다.

> 이 위키는 문서를 요약하지 않는다. 문서 하나를 알고 싶으면 그 문서를 읽는 편이 낫다.
> 여기 있는 것은 **문서 하나로는 알 수 없는 것** 뿐이다: 문서를 가로지르는 판단, 그리고
> 나란히 놓으면 안 되는 것들.

## findings — 문서를 가로지르는 판단

한 문서 안에서는 성립하지만 여러 문서를 겹쳐야 보이는 것.

- [[findings/compile-and-traverse-are-a-set]] — 위키만 만들면 RAG 보다 **낮아진다**
- [[findings/schema-must-not-be-frozen]] — 디렉터리를 사람이 정해 고정하면 10점 잃는다
- [[findings/wiki-numbers-are-not-cross-comparable]] — **세 논문의 수치를 한 표에 놓지 말 것**

## systems — 무엇인가

- [[systems/llm-wiki]] · [[systems/wikikv]] · [[systems/wikiloop]]

## documents — 어디서 왔는가

- [[documents/2026-08-05-llm-wiki-retrieval-as-reasoning]]
- [[documents/2026-08-05-wikikv-hierarchical-kb-storage]]
- [[documents/2026-08-05-wikiloop-feedback-coupled-wiki]]

## 범위

지금 담고 있는 것은 `series: agent-native-wiki` 3편뿐이다. 나머지 9편은 아직 컴파일하지
않았다. 이 위키에 없다고 라이브러리에 없는 것이 아니다.
