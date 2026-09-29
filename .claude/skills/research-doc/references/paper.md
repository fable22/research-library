# Documenting a paper

How the chapters get filled when the corpus is a paper. Read `prose-ko.md` and `visual.md`
alongside this; the reader and the three kinds are defined in `../SKILL.md`. A paper is the
corpus most likely to pull the chapters back toward its own structure, so pick the chapters
by the kind and let the paper's section order go.

## Chapter contents

| Chapter | What goes here | Kinds |
|---|---|---|
| `problem` | The failure mode of the existing approach: what breaks, under what conditions, by how much | all |
| mechanism | Enough that a reader can predict its behavior on a case the paper does not show | explainer in full; comparison only what the decision needs |
| comparison | The baselines the paper actually ran, named | comparison, explainer when it explains why |
| trace | One example run end to end through the mechanism | explainer |
| `setup` | Sections and appendices read, which conditions the setup controlled and which it did not | all |
| `result-*` | Results, read from the tables | all |
| `critique` | Limits with attribution: which the paper admits, which you assert | all |
| adoption call | When adopting makes sense, including what it costs to keep running | comparison |

An explainer moves derivations and proofs the reader will not reuse into `details.more` or an
appendix chapter.

## Numbers

Read every number out of the tables, not the text or a summarizer's output, because papers
restate their numbers loosely in prose and the table is what got reviewed. Take table
values from the LaTeX source (`../../research-source/SKILL.md` §6). Before a number ships,
check what lens B checks: value, direction, unit, range and base
(`../../research-verify/references/lens-numbers.md`). Cite `arxiv_id` plus `version`,
because a revision changes numbers and "the paper" sends the reader to whatever edition
arXiv serves that day.

## Ablations

The ablation is usually where the paper's claim is tested, and it is the section summaries
drop, so read it and give it a chapter. Check that it varied one thing. A traversal ablation
that also cut the budget cannot answer a budget-asymmetry objection, because two things
moved.

## Limits

**Separate what the paper admits from what you assert.** Without a marker like `논문이 이
점을 명시한다`, the reader cannot tell who is accountable for a reservation, and the paper's
candor gets credited to you or your inference to the paper. Papers rarely volunteer these,
so look for them:

- Conditions not controlled across the comparison
- Cost not reported, in dollars, GPU-hours or wall-clock
- A benchmark the authors built themselves
- Whether anyone outside the group has reproduced it
- Training cost, when the method trains and the paper reports only inference

If a study reports a contrary result, find it and carry it. A limits chapter with no outside
voice restates the authors' own limits section.

## Series

When a second paper extends the first, split only if the papers are **different in kind**:
a methods paper and a systems paper crammed together blur both, and a paper that extends one
section of another needs no document of its own. If you split, connect them with the same
`series` value in `meta.json`, a `.lineage` bar on each cover, and `../<slug>/#p<N>` links
to specific chapters. When the earlier document called something unverified and the later
one settles it, go back and link from that spot, or readers keep taking away the stale
conclusion. Chapter numbers shift and the links have to follow; `check-doc.mjs` checks that
they resolve.
