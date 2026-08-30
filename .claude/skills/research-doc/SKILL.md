---
name: research-doc
description: Writes a single-file HTML research document in Korean from a corpus pinned
  by research-source. Covers the chapter spine, slide grammar, drawing mechanisms as
  inline SVG flow and cycle diagrams, CSS charts and figure captions, compression
  subagents for sources too large to load, how to phrase claims that reading alone cannot
  establish, and Korean prose that is not translated English.
when_to_use: Writing or substantially rewriting research/<slug>/index.html, turning a
  paper or an open-source project into a document, adding chapters or slides to an
  existing one, or adding a diagram, chart, figure, or trace to one.
---

# Writing a research document

The instructions here are English. **The document is Korean.** Technical terms stay in
English, as do quotes, code, and identifiers. `references/prose-ko.md` holds the list and
the reason.

Read before writing:

- `references/prose-ko.md` — always. This is where Korean output quality is decided.
- `references/visual.md` — whenever the document has a mechanism, an architecture, a
  loop, or a comparison in it, which is nearly always. A shape drawn wrong is read as
  fact and never checked against the source.
- `references/paper.md` or `references/oss.md` — pick by what the corpus is.

The reader is a developer deciding whether to use this thing next week. Not a general
audience. That single fact settles most questions about what to include: if it does not
help someone decide or understand the mechanism well enough to predict behavior, cut it.

It settles one more thing. **Do not write this simpler than the subject is.** Simplifying
for a reader who already has the background costs them the detail they came for, and the
loss lands on the mechanism first. Plain is the goal; simplified is not. The two differ in
whether a qualifier survives.

## Write in the same context that did the research

Do not hand a research summary to a fresh context and have it write the document. The
value of having read the source is that when a sentence starts to feel shaky you can
reopen the file and check, mid-paragraph. Across a context boundary that ability is gone
and what survives is a summary, which is exactly where invented detail creeps in.

The one place a subagent helps is compression, below.

## The spine, and what you build on it

`check-doc.mjs` requires six eyebrows and checks nothing else about structure. **There is
no chapter count and no length limit** — the only size rule is a 1 MB file cap, and that
one is about embedded images.

A usual shape. **Bold** eyebrows are the six the gate requires; the rest are named after
their content (`nav-reward`, `result-cost`) rather than numbered:

| # | eyebrow | Holds |
|---|---|---|
| ① | **`index`** | Cover, reading path, a lineage bar when one is earned |
| ② | **`tl-dr`** | The finding, in the first two sentences |
| ③ | **`problem`** | What was failing before this existed |
| ④ | (topical) | Mechanism and structure. How it actually works |
| ⑤ | (topical) | Comparison with the existing approach |
| ⑥ | (topical) | One case traced end to end |
| ⑦ | `setup` | What was read, and what was not |
| ⑧ | `result-*` | Results |
| ⑨ | **`critique`** | Limits, with attribution |
| ⑩ | (topical) | Adoption call |
| ⑪ | **`conclusion`** | Conclusion |
| ⑫ | **`sources`** | Sources |

**A lineage bar has to name a relation the document backs, and an arrow in it claims
succession.** Chain with arrows only along a `series`; an adjacent project or an unbuilt
piece gets a prose cross-reference instead.

Split whenever a slide carries two claims, because neither gets checked while they share
one. A mechanism with three separable parts is entitled to three slides; two result
families get `result-cost` and `result-quality`. `references/visual.md` covers how to tell
you are over budget and what to do besides splitting. The failure on the other side is
padding — a chapter added because the outline had a slot for it reads as filler.

**Trend gets no chapter of its own.** It depends on the open web, has almost no
verification surface, and goes stale fastest. Fold what survives into ⑤.

Identity is read out of structure, never guessed. What a project is trying to be shows up
in its license, its CI gates, the rules it writes for its own contributors, and what it
refuses to do. Every one of those is a file you can point at; if you cannot point at one,
you are speculating.

**⑦ is the strongest chapter and is easy to skip.** It is what separates this from a
summary someone wrote off an abstract. Include it every time.

## The title says what the document is on

The title is read in the listing next to twenty others, with nothing around it. Lead with
the library, system, or paper name, then say what that thing is. A sentence does that as
well as a noun phrase — the form is not the rule:

```
✓ omo 5.0 native: opencode 플러그인을 떠나 자기 호스트를 갖는다
✓ semantica: vector 검색 옆에 그래프 갈래를 하나 더 두는 컨텍스트 인프라
✗ 그래프는 RAG 위에 얹히고, 벤치마크는 저장소에 없다
✗ semantica: 그래프는 RAG 위에 얹히고, 벤치마크는 저장소에 없다
```

The first two answer *what is this thing*, one as a sentence and one as a noun phrase. The
third names nothing, so a reader cannot tell what the claim is about. The fourth names the
subject and then spends the line on two findings from two different chapters, neither of
which the subject is — and the reader still cannot say what the document is on.

The test is what the predicate does. A claim belongs in the title when it **is** the
subject's identity, the thing it turned out to be. A finding *about* the subject — one the
reader would have had to read the document to care about — goes to `meta.json` `summary`,
which the listing prints directly under the title, and to the conclusion chapter. Both have
room to qualify it; a title has none.

The same string goes in four places and they must agree: `meta.json` `title`, `<title>`,
`og:title`, and the cover `h1`. No gate can judge a title and nothing downstream re-reads
one, so this section is where it gets decided.

## Slide grammar

Five elements, in order:

```
.eyebrow   short topical label
h2         a claim sentence, not a noun label
.dek       2 to 4 sentences setting up what follows
body       figure, table, chart, trace, code, prose — references/visual.md
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

The gate asks the same thing in its own way, and its `--help` says how. "There is no retry
path" has no line to cite, so the evidence has to be the search that came back empty.

### README against code

Check them against each other and report the gap when there is one. `references/oss.md`
lists the specific places this bites.

A sentence sourced from the project's own docs is a claim about what the maintainers
wrote. Write it that way, or go open the implementation and source it there.

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

`check-doc.mjs --help` lists what the gate blocks, and it changes with the code. Build
these in rather than repairing them later. Two it enforces without being able to tell you
how, one it only half-enforces, and one it does not check at all:

- **No external resources means no CDN, at all.** Inline CSS and JS, `data:` URIs for
  images, system font stacks. One file has to open offline and survive being moved. Source
  links in the body (`<a href>`) are the exception the gate allows, because they are for
  clicking rather than loading.
- **Both themes come out of tokens.** Define colors as CSS custom properties and have
  components reference only the tokens. Write the dark rule any other way and it becomes a
  second copy of every component that then drifts from the first.
- **An `aria-label` says what the figure shows**, not "그림 1". The gate checks only that
  the attribute exists, so a bare "그림 1" passes it — the content is yours. `visual.md`
  treats writing that label first as the test of whether the figure is worth drawing at all,
  and notes that no counter reads the label's Korean either.
- **`overflow-x: auto` on anything wide** — tables, code blocks, charts. The gate does not
  check this one, and the page body must never scroll sideways.

Draw rather than embed, except where redrawing would invent what the source shows.
Anything you can build in inline SVG or CSS costs a few hundred bytes, scales, and follows
the theme; a raster image does none of that and base64 adds another 33% on top. `visual.md`
splits the two cases and covers embedding the source's own figures.

## Gates

```bash
node scripts/check-doc.mjs research/<slug>
node scripts/check-prose.mjs research/<slug>
node scripts/build-index.mjs
```

`--help` lists the rules; they change with the code, so read them there rather than from
memory. Both gates are pass/fail, with `--allow=<rule-id>` as the only escape.

`check-prose.mjs` only counts the rules in `references/prose-ko.md` that already carry a
number. It cannot tell whether the document reads well, and passing it is not evidence
that it does.

Say plainly whether you looked at the rendered page. If no headless browser was
available, say that instead of implying you checked.

## Hand off

When both gates pass, continue with `../research-verify/SKILL.md`. Do not stop to ask
first. Passing the static gate and being correct are different things, and the errors that
matter are only visible once sentences exist, so the draft is not finished until verify has
run on it.

**Break the context here.** The rule that kept research-source and research-doc in one
context inverts at this step, and `../research-verify/SKILL.md` opens with why: its lenses
have to run where this context cannot reach them.

## Common rationalizations

| The excuse | Why it does not hold |
|---|---|
| The gates pass and it reads well, so the draft is done | The gates are static. Hand off to research-verify; that is where the errors that matter surface |
| Verification needs subagents, so ask before starting it | The chain does not stop for permission. Start it, and declare a reduced review if it comes to that |
| The source's figure is not essential, the prose covers it | Decide that in the coverage chapter where a reader can see the decision, not silently |
| I could not confirm this number, so soften the sentence | Hedging with no named gap is worse than the gap. Name what is missing |
| A reader would find this interesting too | Interesting to you is not the test. Whether it changes a claim in this document is |
| It is true and it took work to find, so it stays | Cost of finding it is not value to the reader. Chapter ⑦ is where the work goes |

## Do not

- Do not edit `index.html` at the repo root or the docs table in `README.md`. Both are
  generated.
- Do not force a shared template across documents. Tables, charts, and diagrams differ
  enough that a common stylesheet becomes a constraint rather than a convenience.
- Do not write a number you have not opened the source to confirm.
- Do not end the limits chapter on a purely negative note. If something survives the
  limits and transfers elsewhere, that belongs there too.
