---
name: research-doc
description: Writes a single-file HTML research document in Korean from a corpus pinned
  by research-source. Covers the reader and the three document kinds (comparison,
  explainer, walkthrough), the chapter spine, the chapter grammar of the continuous
  reading form, drawing mechanisms as inline SVG flow and cycle diagrams, CSS charts and
  figure captions, compression subagents for sources too large to load, how to phrase
  claims that reading alone cannot establish, and Korean prose that is not translated
  English.
when_to_use: Writing or substantially rewriting research/<slug>/index.html, turning a
  paper or an open-source project into a document, adding chapters to an existing one, or
  adding a diagram, chart, figure, or trace to one.
---

# Writing a research document

The instructions here are English. **The document is Korean.** Technical terms stay in
English, as do quotes, code, and identifiers; `references/prose-ko.md` holds the list.

Read before writing:

- `references/prose-ko.md`, always. Korean output quality is decided there.
- `references/visual.md`, whenever the document has a mechanism, an architecture, a loop
  or a comparison, which is nearly always. A shape drawn wrong is read as fact and never
  checked against the source.
- `references/paper.md` or `references/oss.md`, by what the corpus is.

## The reader, and the three kinds

This is the one place the reader is defined; every other file points here.

The reader is a developer, not a general audience and not the audience the source was
written for. Nobody here reads to follow a proof, so a derivation the reader will not use
goes into `details.more` or an appendix chapter, and everything else is cut. What the
document has to do for that developer depends on its kind, which `research-source` chose
and recorded as `purpose` in `meta.json`:

| Kind | The reader leaves able to | Chapters that carry it |
|---|---|---|
| `comparison` | decide adopt, trial, assess or hold, and defend the call | the alternative it is compared with, what it costs to keep running, the adoption call with its grounds |
| `explainer` | predict the behavior on a case the source never shows | the mechanism at full depth, one case traced through it, where the principle stops holding |
| `walkthrough` | find the code and follow it to change or extend it | the map of what talks to what, one path traced hop by hop, where a change would land |

Every kind has a summary (`tl-dr`), the evidence for it, and its limits (`critique`);
chapter set and length follow the kind, and adoption is one kind's task and no other's. A
comparison stays short and stops where the decision is made, an explainer goes deep on the
mechanism and folds the equations and proofs the reader will not reuse, and a walkthrough
is as long as its path.

**Do not write this simpler than the subject is.** Simplifying for a reader who has the
background costs them the detail they came for, and the loss lands on the mechanism first.
Plain is the goal, and what tells plain from simplified is whether the qualifier survives.

## Write in the same context that did the research

Write in the context that read the source, because when a sentence turns shaky you can
reopen the file mid-paragraph. A summary handed across a context boundary is where invented
detail creeps in. The one place a subagent helps is compression, below.

## The spine

The gate requires the chapters `index`, `tl-dr`, `problem`, `critique`, `conclusion` and
`sources`; `check-doc.mjs --help` lists everything else it enforces about structure. There
is no chapter count and no length limit apart from a 1 MB file cap, which exists because of
embedded images. Name the other chapters after their content (`nav-reward`, `result-cost`).

| Chapter (eyebrow) | Holds |
|---|---|
| `index` | Cover, reading path, a lineage bar when one is earned |
| `tl-dr` | The finding in the first two sentences, then its conditions and what is unconfirmed |
| `problem` | What was failing before this existed |
| mechanism, comparison, trace | As the kind requires; `references/paper.md` and `references/oss.md` say how each fills |
| `setup` | What was read, and what was not |
| `result-*` | Results |
| `critique` | Limits, with attribution; end with a named result that survives them, where one exists |
| `conclusion`, `sources` | Conclusion; sources |

**Include the `setup` chapter every time.** It is what separates this from a summary
written off an abstract, and it is easy to skip. Verify audits it, and the lenses locate
coverage by the `setup` eyebrow.

**A lineage bar names a relation the document backs, and an arrow in it claims
succession.** Chain arrows only along a `series`; an adjacent project or an unbuilt piece
gets a prose cross-reference.

**Split a chapter that carries two claims**, because neither gets checked while they share
one: a mechanism with three separable parts gets three chapters, and two result families
get `result-cost` and `result-quality`. `references/visual.md` covers the over-budget
signs and the options besides splitting. A chapter added because the outline had a slot for
it reads as filler.

**Fold trend into the comparison chapter.** It depends on the open web, has almost no
verification surface, and goes stale fastest, so it gets no chapter of its own.

## The title says what the document is on

The title is read in the listing beside twenty others, with nothing around it. Lead with
the library, system or paper name, then say what that thing is; a sentence does this as
well as a noun phrase:

```
✓ Foo 5.0: 플러그인을 떠나 자기 호스트를 갖는다
✓ Bar: vector 검색 옆에 그래프 갈래를 하나 더 두는 컨텍스트 인프라
✗ 그래프는 RAG 위에 얹히고, 벤치마크는 저장소에 없다
✗ Bar: 그래프는 RAG 위에 얹히고, 벤치마크는 저장소에 없다
```

The first two answer what the thing is. The third names nothing, so the reader cannot tell
what the claim is about. The fourth names the subject and spends the line on two findings
from different chapters, so the reader still cannot say what the document is on.

Put a claim in the title when it is the subject's identity, the thing it turned out to be.
A finding about the subject goes to `meta.json` `summary`, which the listing prints under
the title, and to the conclusion; both have room for the qualifier a title lacks. The same
string sits in `meta.json` `title`, `<title>`, `og:title` and the cover `h1`, and no gate
compares them, so keep them identical yourself.

## The chapter grammar

The default reading form is continuous: one HTML shell with `<body data-mode="article">`,
the chapters flowing as text under a contents list. The reader can switch to deck mode,
which pages through the same chapters one at a time. Write for the continuous form and keep
the markup valid for both.

A chapter is `<section class="slide">`. The class name stayed from the deck days; it marks
a chapter. Inside it, six elements in this order:

```
.eyebrow        short topical label
h2              a claim sentence, not a noun label
.key            one or two sentences: what the reader does with the claim, or what it
                changes. Not a summary of the body
body            stat cards, a figure, a table, or a short fact list, each item one line
                (references/visual.md)
details.more    첨언: the calculation, the source's paragraph structure, the quoted
                original, the condition in full. Folded by default
.note           one sentence that closes the chapter with what it does not cover
```

A scanning reader sees only what is visible before opening a fold, so that text has to
carry the claim. `details.more` takes what a checking reader needs: how a number was
derived, which paragraph of the source says it, the verbatim quote, the setting under which
it holds. **The fold takes no claim the visible text has not already made**, because a
claim living only in the fold never reaches the scanning reader. A stat card's `.sub` is
one line and the second sentence it wanted goes to the fold. Older documents call the
`.key` slot `.dek`.

`h2` reads as a statement (`결과 2. 단계가 많은 질문일수록 차이가 커진다`); a plain label
is fine where the content is one (`결과 5. ablation`). Name what the chapter holds and what
it does, and avoid headings that inflate (`가장 중요한 표`) or set two abstract nouns
against each other, which `prose-ko.md` explains. A chapter with no `.note` qualifier has
usually overclaimed.

## Compression subagents

Some sources do not fit: one request path can cross files of hundreds of KB. Measure before
opening anything:

```bash
git -C <checkout> ls-tree -r -l <commit> -- <paths> | awk '{s+=$4} END {print s}'
```

Loading all of it leaves nothing to write with, and every later citation then comes from
the weakest part of the window. Hand it to a subagent:

```
in    the paths to trace, plus the pinned identity
out   notes/mechanism.md, roughly 4K
      each hop described, with a verbatim quote of 40+ chars and a file:line locator
```

**Ask the subagent for extraction and quotes, never for a conclusion.** One that reports
"the README contradicts the code" hands you a finding you did not verify and will probably
ship; one that reports quotes and locators hands you material you can check. Write the trace
chapter from the notes and reopen the file whenever a sentence needs more than they hold.

## The trace chapter

Pick a path that **ends inside one process boundary**; crossing packages means one subagent
per hop, stitched together by you. Too narrow is a single-function trace that teaches
nothing, and too wide is a grand traversal with invented middle steps, which is worse
because it is confidently wrong. Both pass every gate.

## Claims that reading cannot establish

Reading code tells you how it is written and nothing about what happens at run time, so
asserting runtime behavior from source checks the README against the README. Constrain the
sentence to what you have:

```
✗ 릴레이가 끊기면 자동 재접속한다
✓ 재접속 로직이 relay/src/reconnect.ts:88 에 있다. 백오프는 고정 1s 다.
  이 경로의 테스트는 찾지 못했다 (grep -rn 'reconnect' **/*.test.ts → 0건)
```

The second version is shorter on confidence and longer on use, since a reader can act on
it. An absence claim ("there is no retry path") has no line to cite, so its evidence is the
search that came back empty, recorded as a command someone can re-run. A sentence sourced
from the project's own docs claims what the maintainers wrote, so phrase it that way or
open the implementation and source it there; `references/oss.md` lists where docs and code
tend to diverge.

## Calculations the source did not make

Overlaying two tables to build a comparison the source never printed is allowed and often
the most useful thing in the document. Label it in the caption (`논문에는 이 비교가 없다`),
so the reader who looks for it in the original does not come up empty. This is the one
statement about how the document was made that belongs outside `setup`.

## Producing the file

`new-doc.mjs` stamps the shell from `assets/deck-shell.html`. If you assemble one by hand,
confirm the shell script appears exactly once, because a duplicate renders fine and breaks
navigation silently. Write chapter by chapter, since a finished document is large enough
that a single write risks truncation.

`check-doc.mjs --help` lists what the gate blocks, including external resources: the file
opens offline, with inline CSS and JS, `data:` URIs and system font stacks. Two things it
cannot check for you:

- **Both themes come out of tokens.** Define colors as CSS custom properties and have
  components reference only the tokens. A dark rule written any other way becomes a second
  copy of every component and drifts from the first.
- **Give anything wide `overflow-x: auto`**: tables, code blocks, charts. The page body
  never scrolls sideways.

Draw rather than embed, except where redrawing would invent what the source shows. Inline
SVG or CSS costs a few hundred bytes, scales and follows the theme, while a raster image
does none of that and base64 adds a third. `visual.md` covers both cases, the
`aria-label` and embedding the source's own figures.

## Gates

```bash
node scripts/check-doc.mjs research/<slug>
node scripts/check-prose.mjs research/<slug>
node scripts/build-index.mjs
```

`--help` lists the rules, both gates are pass or fail, and `--allow=<rule-id>` is the only
escape. `check-prose.mjs` counts only the rules in `prose-ko.md` that carry a number; it
cannot tell whether the document reads well. Say plainly whether you looked at the rendered
page, and if no headless browser was available, say that instead of implying you checked.

## Hand off

Read the document once for how it reads, with the counter open:

```bash
node scripts/check-prose.mjs research/<slug> --counts
```

The table prints the human band under each column. A column outside it is where to look,
and `prose-ko.md` has the fix. This read is the one place prose is judged for its own sake:
the verify lenses check structure, numbers and completeness, because a context asked
whether a document reads well returns noise.

What happens next depends on how you were started.

- **Started by the `research-chain` workflow** (its prompt says so): stop once both gates
  pass and report. The workflow runs verification as phase 2, and running it here as well
  would review the draft twice in contexts that share the author's beliefs.
- **Started directly**: continue with `../research-verify/SKILL.md` without stopping to
  ask. The gates are static, the errors that matter show only once sentences exist, and the
  draft is unfinished until verify has run. **Break the context at that step.** The rule
  that kept `research-source` and this skill in one context inverts here, and verify opens
  with why.

## Do not

- Edit `index.html` at the repo root or the docs table in `README.md`; both are generated.
- Force a shared template across documents. Tables, charts and diagrams differ enough that
  a common stylesheet becomes a constraint.
