---
name: research-doc
description: Writes a single-file HTML research document in Korean from a corpus pinned
  by research-source. Defines the reader and the three document kinds (comparison,
  explainer, walkthrough), the first screen, the chapter grammar, figures and charts,
  quoting, and Korean prose that reads like a person explaining.
when_to_use: Writing or substantially rewriting research/<slug>/index.html, turning a
  paper, an open-source project or a web page into a document, adding chapters to an
  existing one, or adding a diagram, chart, figure, or trace to one.
---

# Writing a research document

The instructions here are English. **The document is Korean**, and
`references/prose-ko.md` shows what its sentences should read like.

Read before writing:

- `references/prose-ko.md`, always.
- `references/specimens/<purpose>-chapter.html`, the one for this document's kind. It shows
  the chapter grammar filled in; its length is an example, and your content sets yours.
- `references/visual.md`, whenever the document has a mechanism, an architecture, a loop
  or a comparison. A shape drawn wrong is read as fact.
- `references/paper.md`, `references/oss.md` or `references/web.md`, by what the corpus is.
- `.research/<slug>/notes/figures.md`, what the source drew or tabulated. Redraw what the
  reader needs.

## The reader, and the three kinds

This is the one place the reader is defined; every other file points here.

The reader is a developer, not a general audience and not the audience the source was
written for. They open a document to get the point quickly and to understand the mechanism
well enough to explain it. What the document has to do for them depends on its kind, which
`research-source` chose and `new-doc.mjs` recorded as `purpose` in `meta.json`:

| Kind | The reader leaves able to | Chapters that carry it |
|---|---|---|
| `comparison` | decide adopt, trial, assess or hold, and defend the call | the alternative, what it costs to keep running, the adoption call with its grounds |
| `explainer` | predict the behavior on a case the source never shows | the mechanism at full depth, one case traced through it, where the principle stops holding |
| `walkthrough` | find the code, or the request field, and follow the path to change it | the map of what talks to what, one path traced hop by hop, where a change would land |

The adoption call belongs to the comparison. Comparisons with other systems and outside cases
go in when the launch's `angle` or the request asks for them, gathered in one chapter.

Plain is the goal, and a qualifier the claim needs survives the plainness.

## Write in the same context that did the research

When a sentence turns shaky you reopen the file mid-paragraph; a summary handed across a
context boundary is where invented detail creeps in. `references/oss.md` says when a
compression subagent is the exception.

## The first screen and the length

The first screen decides whether the document gets read. The cover's title says what the
whole document is about, one paragraph of three or four sentences under it answers the
question, and the `tl-dr` chapter right after gives the few points to do or remember. What the
paragraph cannot hold goes to those points, not into a longer paragraph. How the document was
made has no place there: no source-to-chapter mapping table, no reading method.

A chapter's body takes its form from its content: sentences for a chain of causes, a list for
parallel items, a table for a comparison, a figure for a flow (`references/prose-ko.md`
§Choose the form). It says each thing once.

Aim for twenty chapters or fewer; merge chapters a reader would read as one. The order
follows the source or the research where that order carries meaning, and the `tl-dr` points
link to the chapters that answer the reader's main questions.

## The spine

The gate requires `index`, `tl-dr`, `critique` and `sources`; `check-doc.mjs --help` lists the
rest of what it enforces. `new-doc.mjs` lays out a starting set of middle chapters for the
kind; rename them after their content (`nav-reward`, `result-cost`), merge or drop them.

| Chapter (eyebrow) | Holds |
|---|---|
| `index` | The title and the one-paragraph answer |
| `tl-dr` | The points to do or remember, each in a sentence or two |
| the kind's middle | `references/paper.md`, `references/oss.md` and `references/web.md` say how each fills |
| `result-*` | Results, redrawn from the source's own charts and tables (`visual.md` §The source's own figures) |
| `critique` | Limits, with attribution, stated once: what is self-reported, unconfirmed or unread, and what that means for the reader |
| `setup` | Near the end and short: what was read, what was run, what was left unopened |
| `sources` | Sources |

Production records stay out of the document: retrieval times, archive attempts, hashes,
rendering checks and file-count arithmetic go to `sources.jsonl`, `run.json` and the PR body.

**Split a chapter that carries two claims**; neither gets checked while they share one.
**Fold trend into the comparison chapter**; it goes stale fastest. Chain lineage arrows
only along a `series`, because an arrow claims succession.

## The title

Name the subject and what it is or does, in a phrase a reader would search for; the
`title-subject` gate wants a word from the slug in it. The same string goes in `meta.json`
`title`, `<title>`, `og:title` and the cover `h1`, and `title-copies` compares them.

- ✓ Sonnet 5 코드를 Sonnet 5.5로 옮길 때 바꿔야 하는 곳
- ✓ Bar 가 vector 검색 옆에 그래프 경로를 더하는 방식
- ✗ Bar: 그래프 갈래를 하나 더 두는 컨텍스트 인프라 (a label and a colon; `prose-ko.md` §Forms)
- ✗ 그래프는 RAG 위에 얹히고, 벤치마크는 저장소에 없다 (a finding with paired clauses; it goes to `summary`)

## The chapter grammar

The default reading form is continuous: `<body data-mode="article">`, chapters flowing under
a contents list, with a deck toggle that pages the same chapters. Write for the continuous
form and keep the markup valid for both.

A chapter is `<section class="slide">`. Inside it, in this order:

```
.eyebrow        short topical label
h2              a short title naming what the chapter holds (thinking을 끄던 코드)
.key            the claim a scanning reader needs, in one or two sentences. Keep a condition
                here only when the claim is false without it; narrower conditions go to the
                body. The only place the claim is stated; the body supports it
body            a figure, a diff, a table, a fact list with one line per item, or paragraphs
                of mechanism. Where the source drew or tabulated it, the body is that chart
                or table redrawn, not prose about it (references/visual.md)
details.more    첨언: the source's own words, the derivation, the setting in full. Folded
.note           optional. One sentence, when it changes what the reader does next
```

The visible text carries the claim and what the reader needs to act on it. **The fold takes
no claim the visible text has not already made.** What each kind keeps visible differs:

| Kind | Visible before the fold | Specimen |
|---|---|---|
| walkthrough | the diff, the result codes, one paragraph of what to check with it | `specimens/walkthrough-chapter.html` |
| explainer | how the principle works, a figure, one case in numbers, where it stops holding | `specimens/explainer-chapter.html` |
| comparison | the call with its condition, a table of situations, the numbers that move the call, how to back out | `specimens/comparison-chapter.html` |

An explainer chapter keeps its mechanism visible, because the reader cannot predict from a
summary. A walkthrough chapter puts the diff first. Older documents call the `.key` slot
`.dek`.

## Quoting the source

The body says in Korean what the source says and names who says it; the source's own words
go in the fold, inside `.q`, `.wl` or `<cite>`. A source sentence reworded into Korean with
nobody named is the source's claim wearing yours, and an English passage in the middle of a
Korean paragraph stops the reader.

```html
✓ <p>migration guide 는 between_tools 가 low, medium, high 에서만 받아들여지고 xhigh 나
  max 에서는 400 을 낸다고 설명한다. 그래서 effort 를 high 이하로 둔다.</p>
  <details class="more"><summary>첨언: 원문</summary><p>guide 「Turn off up-front
  thinking」: <span class="q">“It's accepted at low, medium, and high effort. At xhigh or
  max, it returns a 400 error.”</span></p></details>
✗ <p>between_tools 는 low, medium, high 에서 받고 xhigh 나 max 에서는 400 을 낸다.</p>
```

## Calculations the source did not make

Overlaying two tables to build a comparison the source never printed is allowed and often
the most useful thing in the document. Label it in the caption (`논문에는 이 비교가 없다`),
so a reader who looks for it in the original does not come up empty.

## Producing the file

`new-doc.mjs` stamps the shell from `assets/deck-shell.html`; assembling one by hand,
confirm the shell script appears once, since a duplicate breaks navigation silently. The
contents rail is built by the shell from the chapters (`data-label` on a section names
it), so adding or renaming a chapter needs no rail edit. A document stamped before that
shell carries its own hand-written `.rail-item` list and a script that cannot build one;
there, add and renumber the items with the chapters (`rail-count`), and do not delete them,
or the rail goes empty. Write chapter by chapter. Define colors as CSS custom properties that
components reference, or dark mode becomes a second copy of every component, and give
anything wide `overflow-x: auto`. Draw rather than embed, except where redrawing would invent
what the source shows; `check-doc.mjs --help` lists the rest, including the ban on external
resources.

## Gates, then the read pass

```bash
node scripts/check-doc.mjs research/<slug>
node scripts/check-prose.mjs research/<slug>
node scripts/build-index.mjs
```

Both checks are pass or fail and `--allow=<rule-id>` is the only escape. Then read the
document once from the first screen down, as the reader would, against the passages in
`prose-ko.md`. This read is the one place prose is judged for its own sake.

## Hand off

- **Started by the `research-chain` workflow** (its prompt says so): stop once the gates
  pass and report. Phase 2 runs the lenses in contexts you cannot reach.
- **Started directly**: continue with `../research-verify/SKILL.md` without asking, and
  **break the context there**; verify opens with why.

## Do not

- Force shared components across documents beyond the shell `new-doc.mjs` stamps; tables,
  charts and diagrams differ enough that a common component set becomes a constraint.
