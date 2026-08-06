# Documenting a paper

How the twelve chapters get filled when the corpus is a paper. Read
`prose-ko.md` alongside this.

## Chapter contents

| # | What goes here |
|---|---|
| ③ | The failure mode of the existing approach. What breaks, under what conditions, by how much |
| ④ | The mechanism. Enough that a reader can predict its behavior on a case the paper does not show |
| ⑤ | Comparison against the baselines the paper actually ran, with the baselines named |
| ⑥ | One example traced end to end through the mechanism |
| ⑦ | Which sections and appendices were read, which conditions the setup controlled and which it did not |
| ⑧ | Results, from the tables |
| ⑨ | Limits, with attribution: which the paper admits, which you are asserting |
| ⑩ | The conditions under which adopting this makes sense |

## Numbers

Read them out of the tables, not out of the text, and not out of a summarizer's output.
Papers restate their own numbers loosely in prose and the table is what got reviewed.

Four things go wrong, in roughly this order of frequency.

**Direction.** Table 9 gaps went 7.5/12.8/9.6 → 5.1/10.5/16.9. Those **narrow** at the
step the document called widening, and an interpretation ("weaker models benefit more
from structure") was built on top of the reversal. A flipped direction takes the whole
paragraph with it.

**Unit.** 2.5–3.9 was pages read per query, not tool calls. A rebuttal rested on the
misreading and collapsed.

**Range.** Endpoints drift when an interval is assembled from several values: 78–84%
written as 84–87%, 0.860–0.989 written as 0.93–0.99.

**Base.** A number with nothing to compare against tells a reader nothing. `62.6` needs
the baseline next to it. Percent and percentage points are different claims and get
swapped constantly.

## Version

Cite `arxiv_id` plus `version`. A v2 revision has different numbers. A document that says
"the paper" sends its reader to whatever arXiv serves that day, which may not be what you
read.

## Ablations

The ablation is usually where the paper's claim is actually tested, and it is the section
summaries drop. Read it and give it a slide.

Check that the ablation varied one thing. A real case: a traversal ablation also cut the
budget, and the document claimed that variant escaped a budget-asymmetry objection. It
does not, because two things moved.

## Limits

Separate what the paper admits from what you are asserting. Without a marker like
`논문이 이 점을 명시한다` the reader cannot tell who is accountable for a given
reservation, and the paper's own candor gets credited to you or your inference gets
credited to the paper.

Things worth checking for, since papers rarely volunteer them:

- Conditions that were not controlled across the comparison
- Cost not reported, in dollars, GPU-hours, or wall-clock
- A benchmark the authors built themselves
- Whether anyone outside the group has reproduced it
- Training cost, when the method involves training and the paper reports only inference

If a study reports a contrary result, find it and carry it. A limits chapter with no
outside voice in it is the authors' own limits section, restated.

## Cross-checking secondary sources

Blog posts and community summaries get numbers wrong often enough that checking is worth
the time. When they disagree with the paper, the paper wins, and the document says which
was which so a reader who arrived from that blog post knows why the numbers differ.

## Series

When a second paper extends the first, split only if the papers are **different in
kind**. A methods paper and a systems paper crammed together blur both. A paper that
extends one section of another does not need its own document.

If you split, connect them: the same `series` value in `meta.json`, a `.lineage` bar on
each cover, and `../<slug>/#p<N>` links pointing at specific chapters. When the earlier
document said something was unverified and the later one settles it, **go back and link
from that spot**. Leaving it alone means readers keep taking away the stale conclusion.
Chapter numbers shift; the links have to follow, and `check-doc.mjs` checks that they
resolve.
