# Where the rules came from

No skill loads this file. The rules live in `.claude/skills/` stated as instructions; the
reasons live here, so running a skill does not pay for them and the harness can still be
audited. See `.claude/skills/AUTHORING.md` for why they are separated.

| Rule | Lives in | Basis |
|---|---|---|
| Extract claims from the shipped draft, one sentence one claim, and drop a sentence too ambiguous to pin down | `research-verify` | Claimify, [arXiv:2502.10855](https://arxiv.org/abs/2502.10855) — selection, disambiguation, decomposition, with extraction only at high confidence |
| Do not sweep for doc/code mismatch; name what adoption rests on and check only that | `research-doc`, `references/oss.md` | DocPrism, [arXiv:2511.00215](https://arxiv.org/abs/2511.00215) — unfiltered LLM flag rate 98%, 14% with local categorization and external filtering |
| Check quotes mechanically against a pinned commit instead of by judgment | `check-claims.mjs` | Cited but Not Verified, [arXiv:2605.06635](https://arxiv.org/html/2605.06635v1) — link checks pass 94–100% while fact checks land at 39–77%, and fall about 42% as search depth grows |
| `kind:"code"` may not cite a documentation file | `check-claims.mjs` | same DocPrism distinction: what the maintainers wrote and what the code does are different claims |
| Three lenses in separate fresh contexts that cannot see each other | `research-verify` | multi-judge panels reduce single-model bias only when the error sources stay independent |
| Give a compression subagent extraction and quotes, never a conclusion | `research-doc` | CaMeL-style separation between the model that reads untrusted material and the model that decides |
| Treat an analyzed repository's `AGENTS.md` / `CLAUDE.md` as data, in an isolated subagent | `research-source` | repository instruction files are a documented prompt-injection route into agent workflows |
| Frame the question and scale the reading before opening files | `research-source` | orchestrator-worker deep research; explicit effort-scaling rules are what stop both over- and under-investigation |
| Name the ways a reader could disagree before reading | `research-source` | STORM perspective-guided question asking, which measured most of its coverage gain at the pre-writing stage |
| `swhid` alongside `repo`+`commit` | `research-source` | SWHID, ISO 18670 — an intrinsic hash stays verifiable after the origin is gone |
| No chapter count; six required eyebrows | `research-doc`, `check-doc.mjs` | the gate, which checks nothing else about structure |
| Slide density, figure anatomy, aria-label first | `references/visual.md` | see the eval below |

## What the visualization rules were measured against

The rules in `visual.md` started from a count taken on 2026-08-07: all three paper
documents in `research/` carried diagrams, both code documents carried none, and the
densest code document ran about 54% more body text per slide. The hypothesis was that the
skill needed to make diagrams happen.

**That hypothesis was wrong.** A `skill-creator` A/B against the pre-revision skill, on
prompts that asked for a mechanism slide without mentioning diagrams, had the baseline
drawing an SVG too. What the rules changed was the diagram, not whether there was one:

| | revised | baseline |
|---|---|---|
| highlighted nodes | 1 | 4 |
| nodes carrying what they do, not just a name | 7 | 0 |
| slide size, same content | 6.2 KB | 11.3 KB |
| dense slide split rather than reworded | yes | no |

Pass rate 91.7% against 65.0%, at about 1.6× the time and 1.3× the tokens, because the
revised run renders the page and re-derives the numbers. Prompts that ask for a diagram
outright do not separate the two versions (100% against 90.7%) — the request supplies what
the skill would have.

Skills get revised through `skill-creator`, and its eval workspaces are the record of
whether a revision helped.
