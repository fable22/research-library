---
name: research-doc
description: Writes a single-file HTML research document in Korean from a corpus pinned
  by research-source. Covers the twelve-chapter deck skeleton, slide grammar, compression
  subagents for sources too large to load, how to phrase claims that reading alone cannot
  establish, and Korean prose that is not translated English.
when_to_use: Writing or substantially rewriting research/<slug>/index.html, turning a
  paper or an open-source project into a document, or adding chapters to an existing one.
---

# Writing a research document

The instructions here are English. **The document is Korean.** Technical terms stay in
English (RAG, embedding, chunk, corpus, baseline, ablation, agent, tool call, F1,
multi-hop), as do quotes, code, and identifiers.

Read before writing:

- `references/prose-ko.md` — always. This is where Korean output quality is decided.
- `references/paper.md` or `references/oss.md` — pick by what the corpus is.

The reader is a developer deciding whether to use this thing next week. Not a general
audience. That single fact settles most questions about what to include: if it does not
help someone decide or understand the mechanism well enough to predict behavior, cut it.

## Write in the same context that did the research

Do not hand a research summary to a fresh context and have it write the document. The
value of having read the source is that when a sentence starts to feel shaky you can
reopen the file and check, mid-paragraph. Across a context boundary that ability is gone
and what survives is a summary, which is exactly where invented detail creeps in.

The one place a subagent helps is compression, below.

## The twelve chapters

| # | eyebrow | Holds |
|---|---|---|
| ① | `index` | Cover, lineage bar, reading path |
| ② | `tl-dr` | The finding, in the first two sentences |
| ③ | `problem` | What was failing before this existed |
| ④ | (topical) | Mechanism and structure. How it actually works |
| ⑤ | (topical) | Comparison with the existing approach |
| ⑥ | (topical) | One case traced end to end |
| ⑦ | `setup` | What was read, and what was not |
| ⑧ | `result-*` | Results |
| ⑨ | `critique` | Limits, with attribution |
| ⑩ | (topical) | Adoption call |
| ⑪ | `conclusion` | Conclusion |
| ⑫ | `sources` | Sources |

`check-doc.mjs` enforces the presence of `index`, `tl-dr`, `problem`, `critique`,
`conclusion`, `sources`. The rest take topical eyebrows naming their content
(`nav-reward`, `result-cost`), not chapter numbers.

Requests map onto this rather than adding chapters. Overview lands in ①②, mechanism in
⑥, architecture in ④, identity in ③④⑩. **Trend gets no chapter of its own** — it depends
on the open web, has almost no verification surface, and goes stale fastest. Fold what
survives into ⑤.

Identity is read out of structure, never guessed. What a project is trying to be shows up
in its license, its CI gates, the rules it writes for its own contributors, and what it
refuses to do. Every one of those is a file you can point at; if you cannot point at one,
you are speculating.

**⑦ is the strongest chapter and is easy to skip.** It is what separates this from a
summary someone wrote off an abstract. Include it every time.

## Slide grammar

Five elements, in order:

```
.eyebrow   short topical label
h2         a claim sentence, not a noun label
.dek       2 to 4 sentences setting up what follows
body       table, chart, code, prose
.note      the qualifier that closes the slide
```

`h2` reads as a statement: `결과 2. 단계가 많은 질문일수록 차이가 커진다`. Plain labels
are fine where the content is genuinely a label (`결과 5. ablation`). What does not work
is an inflated heading — `가장 중요한 표`, `그림이 말하지 않는 것`. Name the content.

The `.note` is where a slide admits what it does not cover. A slide with no qualifier is
usually a slide that overclaimed.

## Compression subagents

Some sources do not fit. In a mature TypeScript monorepo a single request path can run
through four files of 150–250 KB each, so the trace you need costs several hundred KB
before you have written a sentence. Measure before you open anything:

```bash
git -C <checkout> ls-tree -r -l <commit> -- <paths> | awk '{s+=$4} END {print s}'
```

Loading all of it leaves nothing to write with. Even in a 1M context it lands in the
middle, where recall is worst, and every later citation is drawn from the weakest part of
the window.

So hand it to a subagent:

```
in    the paths to trace, plus the pinned identity
out   notes/mechanism.md, roughly 4K
      each hop described, with a verbatim quote of 40+ chars and a file:line locator
```

**Give it no judgment to make.** Ask for extraction and quotes, never for a conclusion.
A subcontractor that reports "the README contradicts the code" hands you a finding you
did not verify and will probably ship; one that reports quotes and locators hands you
material you can check. The first kind is where fabricated findings enter.

**You are not locked out of the source.** Write ⑥ from the notes, and reopen the file
whenever a sentence needs more than the notes hold. That freedom is the whole difference
between this and a pipeline handoff.

## Chapter ⑥ scope rule

Pick a path that **ends inside one process boundary.** Crossing packages means one
subagent per hop, stitched together by you.

Both failure modes pass every gate. Too narrow is a single-function trace that satisfies
the structure and teaches nothing. Too wide is a grand traversal with invented middle
steps, which is worse, because it is confidently wrong.

## Claims that reading cannot establish

Reading source code tells you how the code is written. It does not tell you what happens
at run time. Asserting runtime behavior from source is checking the README against the
README, so constrain the sentence to what you actually have:

```
✗ 릴레이가 끊기면 자동 재접속한다
✓ 재접속 로직이 relay/src/reconnect.ts:88 에 있다. 백오프는 고정 1s 다.
  이 경로의 테스트는 찾지 못했다 (grep -rn 'reconnect' **/*.test.ts → 0건)
```

The second sentence is shorter on confidence and longer on use. A reader can act on it.

`check-claims.mjs` requires `limits` on `kind:"behavioral"` claims and a re-runnable
search command on `kind:"absence"` claims, for the same reason: "there is no retry path"
has no line to cite, so the evidence has to be the search that came back empty.

### README against code

Check them against each other and report the gap when there is one. `references/oss.md`
lists the specific places this bites.

Do not turn this into a sweep. Asked in general whether docs match code you will flag
nearly everything, and a report that flags everything says nothing. Name the specific
things adoption rests on and check only those.

## Calculations the source did not make

Overlaying two tables to build a comparison the source never printed is allowed and often
the most useful thing in the document. It has to be labeled in the caption
(`논문에는 이 비교가 없다`), or a reader goes looking for it in the original and finds
nothing.

This is the one exception to the rule against describing how the document was made. It is
not process narration; it is what the reader needs to line the document up against the
source.

## Producing the file

`new-doc.mjs` stamps the shell from `assets/deck-shell.html`. If you assemble one by hand
instead, confirm the deck script appears **exactly once** — a duplicate renders fine and
breaks navigation silently.

Write the document **chapter by chapter**. A finished deck is large enough that a single
write risks truncation.

Constraints the gate enforces, so build them in rather than repairing them later:

- A complete document: `<!doctype html>`, `<html lang="ko">`, `<meta charset="utf-8">`,
  a viewport meta, a `<title>`. Without the doctype the browser renders in quirks mode
  and the layout shifts.
- **No external resources at all.** Inline CSS and JS, `data:` URIs for images, system
  font stacks, no CDN. One file has to open offline and survive being moved. Source links
  in the body (`<a href>`) are for clicking, so they are the exception.
- Both color themes via `@media (prefers-color-scheme: dark)`. Define colors as CSS
  custom properties and have components reference only the tokens.
- `overflow-x: auto` on anything wide (tables, code blocks, charts). The page body must
  never scroll sideways.
- `alt` on every image, describing what the figure shows rather than labeling it "그림 1".
  `role="img"` and a descriptive `aria-label` on every `<svg>`.
- No `.stat` without a `.sub`, no em dashes, one `.rail-item` per slide, 1 MB total.

Compress images before embedding. base64 adds about 33%, and a document that crosses 1 MB
makes the repository heavy fast. Anything you can draw yourself belongs in inline SVG
instead.

## Gates

```bash
node scripts/check-doc.mjs research/<slug>
node scripts/build-index.mjs
```

`--help` lists the rules; they change with the code, so read them there rather than from
memory. Both are pass/fail, with `--allow=<rule-id>` as the only escape.

Then run **research-verify** on the draft. Passing the static gate and being correct are
different things, and the errors that matter are only visible once sentences exist.

Say plainly whether you looked at the rendered page. If no headless browser was
available, say that instead of implying you checked.

## Do not

- Do not edit `index.html` at the repo root or the docs table in `README.md`. Both are
  generated.
- Do not force a shared template across documents. Tables, charts, and diagrams differ
  enough that a common stylesheet becomes a constraint rather than a convenience.
- Do not write a number you have not opened the source to confirm.
- Do not end the limits chapter on a purely negative note. If something survives the
  limits and transfers elsewhere, that belongs there too.
