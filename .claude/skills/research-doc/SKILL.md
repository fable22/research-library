---
name: research-doc
description: Writes a single-file HTML research document in Korean from a corpus pinned
  by research-source. Defines the reader and the three document kinds (comparison,
  explainer, walkthrough), the chapter spine, the chapter grammar with a specimen per
  kind, figures and charts, quoting, and Korean prose that is not translated English.
when_to_use: Writing or substantially rewriting research/<slug>/index.html, turning a
  paper or an open-source project into a document, adding chapters to an existing one, or
  adding a diagram, chart, figure, or trace to one.
---

# Writing a research document

The instructions here are English. **The document is Korean.** Technical terms, quotes,
code and identifiers stay English; `references/prose-ko.md` holds the list.

Read before writing:

- `references/prose-ko.md`, always.
- `references/specimens/<purpose>-chapter.html`, the one for this document's kind. It is
  the bar for how much a chapter shows before its fold opens, and `specimens/README.md`
  says what each kind keeps visible.
- `references/visual.md`, whenever the document has a mechanism, an architecture, a loop
  or a comparison. A shape drawn wrong is read as fact.
- `references/paper.md` or `references/oss.md`, by what the corpus is.
- `.research/<slug>/notes/figures.md`, what the source drew or tabulated. Every entry is
  redrawn in the document or named in `setup` with the reason it is absent.

## The reader, and the three kinds

This is the one place the reader is defined; every other file points here.

The reader is a developer, not a general audience and not the audience the source was
written for. What the document has to do for them depends on its kind, which
`research-source` chose and `new-doc.mjs` recorded as `purpose` in `meta.json`:

| Kind | The reader leaves able to | Chapters that carry it |
|---|---|---|
| `comparison` | decide adopt, trial, assess or hold, and defend the call | the alternative, what it costs to keep running, the adoption call with its grounds |
| `explainer` | predict the behavior on a case the source never shows | the mechanism at full depth, one case traced through it, where the principle stops holding |
| `walkthrough` | find the code and follow it to change or extend it | the map of what talks to what, one path traced hop by hop, where a change would land |

Every kind has a summary (`tl-dr`), the evidence for it, and its limits (`critique`). The
adoption call belongs to the comparison and to no other kind. A comparison stops where the
decision is made, an explainer goes deep on the mechanism and folds the derivations the
reader will not reuse, and a walkthrough is as long as its path.

**Do not write this simpler than the subject is.** Plain is the goal, and what tells plain
from simplified is whether the qualifier survives.

## Write in the same context that did the research

When a sentence turns shaky you reopen the file mid-paragraph; a summary handed across a
context boundary is where invented detail creeps in. `references/oss.md` says when a
compression subagent is the exception.

## The spine

The gate requires the chapters `index`, `tl-dr`, `problem`, `critique`, `conclusion` and
`sources`; `check-doc.mjs --help` lists the rest of what it enforces. There is no chapter
count and no length limit apart from the 1 MB file cap. `new-doc.mjs` lays out the middle
chapters for the kind; rename them after their content (`nav-reward`, `result-cost`).

| Chapter (eyebrow) | Holds |
|---|---|
| `index` | Cover, reading path, a lineage bar when one is earned |
| `tl-dr` | The finding in the first two sentences, then its conditions and what is unconfirmed |
| `problem` | What was failing before this existed |
| the kind's middle | `references/paper.md` and `references/oss.md` say how each fills |
| `setup` | What was read, and what was not |
| `result-*` | Results, redrawn from the source's own charts and tables (`visual.md` §The source's own figures) |
| `critique` | Limits, with attribution; end with a named result that survives them, where one exists |
| `conclusion`, `sources` | Conclusion; sources |

**Include the `setup` chapter every time.** It separates this from a summary written off an
abstract, and the lenses locate coverage by its eyebrow.

**Split a chapter that carries two claims**; neither gets checked while they share one.
**Fold trend into the comparison chapter**; it goes stale fastest. Chain lineage arrows
only along a `series`, because an arrow claims succession.

## The title

Lead with the thing's name, then what it is. The same string goes in `meta.json` `title`,
`<title>`, `og:title` and the cover `h1`; no gate compares them.

- ✓ Foo 5.0: 플러그인을 떠나 자기 호스트를 갖는다
- ✓ Bar: vector 검색 옆에 그래프 갈래를 하나 더 두는 컨텍스트 인프라
- ✗ 그래프는 RAG 위에 얹히고, 벤치마크는 저장소에 없다 (a finding, not an identity; it goes to `summary`)

## The chapter grammar

The default reading form is continuous: `<body data-mode="article">`, chapters flowing under
a contents list, with a deck toggle that pages the same chapters. Write for the continuous
form and keep the markup valid for both.

A chapter is `<section class="slide">`. Inside it, in this order:

```
.eyebrow        short topical label
h2              a short heading that names what the chapter holds
                (effort 재측정 · thinking 끄기: disabled → between_tools)
.key            the chapter's one claim, in one or two sentences, with the condition it
                holds under. The only place the claim is stated; the body supports it
body            a figure, a diff, a table, a fact list with one line per item, or short
                paragraphs of mechanism. Where the source drew or tabulated it, the body
                is that chart or table redrawn, not prose about it (references/visual.md)
details.more    첨언: the verbatim quote, the derivation, which paragraph of the source
                says it, the setting in full. Folded by default
.note           optional. One sentence, when it changes what the reader does next
```

The visible text carries the claim and what the reader needs to act on it. **The fold takes
no claim the visible text has not already made.** What each kind keeps visible differs:

| Kind | Visible before the fold | Specimen |
|---|---|---|
| walkthrough | the diff, the result codes, one paragraph of what to check with it | `specimens/walkthrough-chapter.html` |
| explainer | how the principle is measured, a figure, one case in numbers, the reader's own prediction, where it stops holding | `specimens/explainer-chapter.html` |
| comparison | the call with its condition, a table of situations, the numbers that move the call, how to back out | `specimens/comparison-chapter.html` |

An explainer chapter that folds the mechanism has failed, because the reader cannot
predict from a summary. A walkthrough chapter that spells out the source's conditions
before the diff has buried the diff. A stat card's `.sub` is one line, and its second
sentence goes to the fold. Older documents call the `.key` slot `.dek`.

## Quoting the source

A verbatim passage goes inside `.q`, `.wl` or `<cite>`, never in a plain paragraph. The
prose counter skips those, the reader sees whose words they are, and the ledger can point
at them. A source sentence reworded into Korean prose with nothing marking it is the
source's claim wearing yours.

```html
✗ <p>between_tools 는 low, medium, high 에서 받고 xhigh 나 max 에서는 400 을 낸다.</p>
✓ <p>guide 「Turn off up-front thinking」: <span class="q">“It's accepted at low, medium,
  and high effort. At xhigh or max, it returns a 400 error.”</span> 그래서 effort 를
  high 이하로 둔다.</p>
```

## Calculations the source did not make

Overlaying two tables to build a comparison the source never printed is allowed and often
the most useful thing in the document. Label it in the caption (`논문에는 이 비교가 없다`),
so a reader who looks for it in the original does not come up empty.

## Producing the file

`new-doc.mjs` stamps the shell from `assets/deck-shell.html`; assembling one by hand,
confirm the shell script appears once, since a duplicate breaks navigation silently. Write
chapter by chapter. Define colors as CSS custom properties that components reference, or
dark mode becomes a second copy of every component, and give anything wide
`overflow-x: auto`. Draw rather than embed, except where redrawing would invent what the
source shows; `check-doc.mjs --help` lists the rest, including the ban on external
resources.

## Gates, then the read pass

```bash
node scripts/check-doc.mjs research/<slug>
node scripts/check-prose.mjs research/<slug>
node scripts/check-prose.mjs research/<slug> --counts
node scripts/build-index.mjs
```

The first two are pass or fail and `--allow=<rule-id>` is the only escape. The third prints
the density table with the human band under each column and the visible Hangul per chapter.
Read the document once with it open; where a column sits outside the band, `prose-ko.md`
has the fix. This read is the one place prose is judged for its own sake.

## Hand off

- **Started by the `research-chain` workflow** (its prompt says so): stop once the gates
  pass and report. Phase 2 runs the lenses in contexts you cannot reach.
- **Started directly**: continue with `../research-verify/SKILL.md` without asking, and
  **break the context there**; verify opens with why.

## Do not

- Edit `index.html` at the repo root or the docs table in `README.md`; both are generated.
- Force a shared template across documents; tables, charts and diagrams differ enough that
  a common stylesheet becomes a constraint.
