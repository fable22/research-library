# What a chapter can carry

The reader is defined in `../SKILL.md`. Every choice below is decided against that reader
and the document's kind: a form is right when the reader can read the mechanism off it, and
wrong when it needs the source's own training to parse.

Past its budget a chapter stops being read and starts being scanned, and a scanned chapter
delivers whatever is largest instead of whatever is true. The craft is deciding what goes in
a picture, what goes in prose, and what goes in a different chapter. The markup below is a
starting point, since what each document needs to draw differs.

## The density symptom

A chapter is over budget when its claim will not fit in one sentence, or the reader has to
scroll to reach the `.note`. The ways out, roughly by how often they apply:

1. Split. Two claims in one chapter means neither gets checked.
2. Draw the structure and keep prose for what structure cannot say. A paragraph describing
   five stages and a failure path leaves the reader assembling the shape; the picture holds
   the shape, and the prose is free for the threshold, the reason and the exception.
3. Cut inferable background and a second example making the first one's point.
4. Fold what remains and is still support into `details.more`, the 첨언 slot in `SKILL.md`.

`check-prose.mjs --counts` prints the visible Hangul count per chapter. A chapter that reads
well shows a few hundred characters before anything is opened; the failure is a wall of
sentences at one weight, where the reader cannot tell the claim from its support. The fold
takes no claim the visible text has not made.

One failure is specific to code corpora. The source is already text, so `<pre>` and tables
absorb everything and the document never draws its own architecture, though a kernel, a
state machine, a request path and a retry loop all have shapes.

## When a picture is the right move

Draw when the shape is not a line: something returns to an earlier step, one input fans out
to destinations that behave differently, paths run parallel and rejoin, a quantity crosses
another and the crossing is the finding, or nesting is the point. A straight-line mechanism
gets its steps numbered in prose, since a picture restating the sentence above costs a
second pass and teaches nothing.

## Write the aria-label first

The gate requires `role="img"` and an `aria-label` on every `<svg>`. Write the label before
drawing, as a sentence describing what happens:

```
aria-label="Retry Queue의 4단계 순환. Enqueue에서 작업이 들어오고 Dispatch에서 워커에
배정된다. 성공하면 Ack에서 끝나고, 실패하면 Backoff에서 대기한 뒤 Enqueue로 되돌아가는
화살표가 있다."
```

If the sentence will not come, the figure has no claim in it. Name the returning edge
explicitly, so a reader who only hears the label still learns that the loop closes. No
counter reads this sentence (`check-prose.mjs` strips `<svg>` first) and a step list is
where `~하고,` piles up, so apply `prose-ko.md` here by hand.

## The figure's text does most of the work

```html
<figure>
  <p class="fig-title">…</p>   <!-- a claim, the way an h2 is. Not 표 3 -->
  <p class="fig-sub">…</p>     <!-- what this is, and where it came from -->
  <!-- svg, bars, table, or trace -->
  <figcaption>…</figcaption>   <!-- how to read it, and what it does not say -->
</figure>
```

A caption that repeats the title is wasted. One doing its job:

```
표 1(논문). 점선은 Baseline B 다. 문서 1개짜리 질문에서는 B 가 69.8 로 Ours 69.1 보다
높지만 이 차이는 통계적으로 유의하지 않다고 논문이 밝히고 있다.
```

It gives the source pin, the encoding, and the qualifier that stops a reader over-reading the
one place where the picture looks unfavorable. Verifiers extract claims from captions, so a
number that appears only in a caption still needs its locator. A comparison the source never
printed says so, and says what may not be combined.

## Choosing a form

| The content is | Form |
|---|---|
| stages, especially with a returning edge | flow or cycle diagram; the return edge is what prose loses |
| one metric, several systems | bars; rank reads at a glance |
| one metric across a varying condition | a line, when the widening gap or the crossing is the claim |
| several dimensions per row | a table |
| one instance walked end to end | a `<pre>` trace; indentation is already a diagram and identifiers stay selectable |
| a decision the reader has to make | a table whose rows are the reader's situations, not the source's conditions |
| the source's own equations | a diagram or prose; a flow with the condition written on the edge lets a developer predict behavior better than the same condition as a predicate |

Notation is the form a paper needs because a reviewer checks it exactly. **A symbol earns
its place when the document uses it again and the prose then cashes a prediction it
produces**: put two gate predicates side by side, and the reader sees the difference is one
clause, and writing what that clause admits pays for the notation. A symbol that appears
once, or is translated into Korean in the same breath, is the source's table of contents.

**A reference that only resolves in the source is the worst case.** `식 (10)` where the
document never numbered an equation sends the reader to the paper to read your sentence.
Name the thing (`inner 게이트의 엄격 개선 조항`), and define every symbol somewhere in the
document. `<pre>` is for one instance or one tree; using it for every structure produces the
density problem above.

## Drawing it

```html
<svg class="chart" viewBox="0 0 760 300" role="img" aria-label="…">
  <rect class="box"    x="8"   y="26" width="92"  height="62" rx="8"/>
  <rect class="box-hi" x="278" y="26" width="162" height="62" rx="8"/>
  <text class="txt"   x="20" y="52">문단 x</text>
  <text class="txt-s" x="20" y="70">원본 한 조각</text>
  <path class="arw" d="M100 57 L114 57"/>
  <path class="arw" d="M107 52 L114 57 L107 62"/>   <!-- head as three points -->
</svg>
```

- A node needs a name and a line of what it does; a box reading only `RunPipeline`
  adds nothing to the heading.
- Highlight one node. Highlight three and you have highlighted nothing.
- Give a returning edge its own room. A curve crossing back through the forward path is
  unreadable at reading size; running the return along a row below usually reads better and
  is often the more accurate picture.
- Three-point arrowheads avoid `<defs>` and follow the theme.
- Set `width:100%; height:auto` with a `min-width`, and `overflow-x:auto` on the wrapper, so
  the diagram scrolls and the page does not.

Bars are CSS: a name, a track, a filled div at a percentage, and the number. Print the
number, since an estimate cannot be checked against the source (the gate rejects a `.stat`
with no `.sub` for the same reason), and start at zero. In a table, mark the row the chapter
argues for and encode direction, because `+0.8` and `−2.3` do not read as opposites at a
glance. Keep losing rows visible; a comparison where every marked cell is a win reads as an
advertisement.

Route every fill and stroke through the theme tokens (`SKILL.md`), and pair color with
position, a sign or a label so it never carries meaning alone. Length and position are read
accurately; angle, area and depth are not.

## The source's own figures

Redrawing is the default, for the reasons above, until redrawing would mean inventing what
the figure shows.

| The figure is | Do |
|---|---|
| a table, or a bar/line chart whose values are printed | retype it; the numbers stay selectable and the chart follows the theme |
| the source's architecture or mechanism diagram | embed it; redrawing asserts a shape you did not verify |
| a qualitative sample, a screenshot, a rendered output | embed it; there is nothing to redraw |
| a plot whose claim is one crossing or one gap | redraw that part, and say in the caption that the source's plot holds more |

**Embed only a figure you have opened and read.** One pulled in because it looked relevant
is decoration, and a caption written from a filename is a fabricated claim with a picture
around it. `notes/figures.md` from the pinning step holds the one-sentence descriptions.

**Name the source's central figure somewhere**, either in the document or in the `setup`
chapter with the reason it is absent. A reader who has seen the paper looks for it first,
and its silent absence reads as an oversight even when it was a decision.

Mechanics: a `data:` URI inside `.plate`, which holds a white background under a light-source
figure so it survives dark mode. `alt` says what the figure shows, and the caption carries
the source's own identifier (`논문 Figure 3`) so the reader can find it there. Check the byte
cost before embedding, because the file has 1 MB and base64 is a third larger than what it
encodes. When a figure will not fit, redraw the part that carries the claim and say so.

## Do not

- Screenshot a table. Retype it; a screenshot has no theme, no selectable numbers, no usable
  alt text, and takes a large share of the size budget.
- Invent a step to make a diagram symmetric. A four-stage mechanism drawn as five boxes is a
  fabricated claim with a picture around it, and it passes every gate.
