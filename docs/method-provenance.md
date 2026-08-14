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
| Read an analyzed repository's `AGENTS.md` / `CLAUDE.md` directly as data, and keep the checkout outside the working directory | `research-source` | repository instruction files are a documented prompt-injection route, but the step that executes them is harness auto-discovery, not reading. See the revision note below |
| Frame the question and scale the reading before opening files | `research-source` | orchestrator-worker deep research; explicit effort-scaling rules are what stop both over- and under-investigation |
| Name the ways a reader could disagree before reading | `research-source` | STORM perspective-guided question asking, which measured most of its coverage gain at the pre-writing stage |
| `swhid` alongside `repo`+`commit` | `research-source` | SWHID, ISO 18670 — an intrinsic hash stays verifiable after the origin is gone |
| The document title names the subject and says what it is; the finding goes in `summary` | `research-doc` | the listing gives a title no context, and a verdict placed ahead of its evidence cannot be qualified. See the revision note below |
| No chapter count; six required eyebrows | `research-doc`, `check-doc.mjs` | the gate, which checks nothing else about structure |
| The lineage bar only where succession is documented | `research-doc` | the arrow reads as a slot to fill, and filling it chained unrelated projects and ended at work nobody built |
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

## Why the isolated-subagent read was dropped

The rule used to require reading an analyzed repository's `AGENTS.md` / `CLAUDE.md` in a
separate subagent that returned extracted facts. It was revised on 2026-08-12 after the
omo document, where the researcher read six such files directly and nothing in them was
acted on.

Two things were wrong with the old form. The rule fought the section it sat inside: the
entry order names those files as the densest in the repo and puts them first, and routing
them through a summarizer meant the author never saw the one source most worth reading in
full. And it aimed at the wrong step. Reading imperative text is not what executes it;
harness auto-discovery of `.claude/skills/` beneath the working directory is, and the old
rule left that path open while paying for a subagent round-trip on every repository.

The revision keeps the separation the rule was for and states it where it binds: read the
files as data, and keep the checkout outside the working directory. This revision did not
go through a `skill-creator` A/B. The change removes a requirement and sharpens an
instruction, and a pass-rate benchmark does not discriminate between the two forms.

## Why the title asks what the subject is, not what the shape is

The rule entered on 2026-08-07 to fix a title that named nothing —
`에이전트에게 준 것은 컨테이너가 아니라 파일시스템이다`, a claim with no subject attached. It
fixed that and, in the same sentence, made `name + claim` the norm. A claim is the right
title often enough that the norm held for a while: `omo 5.0 native: opencode 플러그인을 떠나
자기 호스트를 갖는다` is a sentence, and the sentence is what omo 5.0 native is. What the
norm did not say was that the claim has to be the subject's identity rather than a result
about it, and the semantica document on 2026-08-14 is where that gap shows: two findings
from two different chapters joined by a conjunction, with a word the body uses twice
standing in for what the document is on.

Banning claim-shaped titles was the obvious repair and the wrong one. It would have cost
the omo title, which is doing exactly what a title is for, and left the author with a shape
to satisfy instead of a question to answer. The revised rule states the question — does the
predicate say what this thing is — and leaves the form open.

Nothing in the harness caught it. `check-doc.mjs` `title-subject` compares the title against
the slug, so any title carrying the subject's name passes, and no verification lens read the
title at all — `lens-prose.md` went from slide `h2` headings straight to element order. The
title was written once, by the context least able to see it as a stranger would, and never
looked at again. The lens now carries it, because whether a title says what a document is on
is a judgment and the gate can only ask whether a word is present.

The same revision gave the `research-chain` ship phase a PR title, which it had never
specified. With nothing said, the shipping agent copied the document's title across, so one
bad title became two.

The revision did not go through a `skill-creator` A/B. It narrows one instruction and moves
the finding to a field that already existed; a pass-rate benchmark does not separate the
two forms.
