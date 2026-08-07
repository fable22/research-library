# What a slide can carry

Past a slide's budget the reader stops reading and starts scanning, and a scanned slide
delivers whatever is largest rather than whatever is true. The craft is deciding what goes
in a picture, what goes in prose, and what goes on a different slide.

Markup below is a starting point, not a house style. Documents here do not share a
template, because what each needs to draw differs.

## The density symptom

You are over budget when the slide's claim will not fit in one sentence, or the reader has
to scroll to reach the `.note`. Three ways out, roughly in order of how often they apply:

**Split.** No chapter count, no length limit. Two claims on one slide means neither gets
checked.

**Draw the structure; keep prose for what structure cannot say.** A paragraph describing
five stages and a failure path leaves the reader assembling the shape. The picture holds
the shape, and the prose is then free for the threshold, the reason, the exception.

**Cut.** Inferable background, a second example making the first one's point.

One failure is specific to code corpora: the source is already text, so `<pre>` and tables
absorb everything and the document never draws its own architecture. A kernel, a state
machine, a request path, a retry loop all have shapes.

## When a picture is the right move

Draw when the shape is not a line — something returns to an earlier step, one input fans
out to destinations that behave differently, paths run parallel and rejoin, a quantity
crosses another and the crossing is the finding, or nesting is the point.

If the mechanism is a straight line, number the steps in prose. A picture restating the
sentence above it costs a second pass and teaches nothing.

## Write the aria-label first

The gate requires `role="img"` and an `aria-label` on every `<svg>`. Write it before
drawing, as a sentence describing what happens:

```
aria-label="Error Book의 5단계 순환. Discover에서 검증기가 오류를 찾고, Attribute에서
원인을 밝히고, Constrain에서 제약 조건으로 만들고, Inject에서 컴파일 프롬프트에 넣고,
Verify 단계에서 재검증 후 종료한다. Inject에서 Discover로 되돌아가는 화살표가 있다."
```

If the sentence will not come, the figure has no claim in it. Name the returning edge
explicitly; a reader who only hears the label should still learn that the loop closes.

## The figure's text does most of the work

```html
<figure>
  <p class="fig-title">…</p>   <!-- a claim, the way an h2 is. Not 표 3 -->
  <p class="fig-sub">…</p>     <!-- what this is, and where it came from -->
  <!-- svg, bars, table, or trace -->
  <figcaption>…</figcaption>   <!-- how to read it, and what it does not say -->
</figure>
```

A caption repeating the title is wasted. One doing its job:

```
표 1(논문). 점선은 HippoRAG 2다. 문서 1개짜리 질문에서는 HippoRAG 2가 69.8로
WikiLoop 69.1보다 0.7 높지만, 이 차이는 통계적으로 유의하지 않다고 논문이 밝히고 있다.
```

Source pin, encoding, then the qualifier that stops a reader over-reading the one place
the picture looks unfavorable. Verifiers extract claims from captions, so a number that
appears only in a caption still needs its locator. A comparison the source never printed
has to say so, and say what may not be combined.

## Choosing a form

- **stages, especially with a returning edge** — flow or cycle diagram. The return edge is
  what prose loses.
- **one metric, several systems** — bars. Rank is read at a glance.
- **one metric across a varying condition** — a line, when the widening gap or the
  crossing is the claim.
- **several dimensions per row** — a table.
- **one instance walked end to end** — a `<pre>` trace; indentation is already a diagram
  and identifiers stay selectable.
- **a decision the reader has to make** — a table whose rows are the reader's situations,
  not the source's conditions.

`<pre>` is for one instance or one tree. Using it for every structure is what produces the
dense-slide problem above.

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

- A node needs a name **and** a line of what it does. A box reading only
  `CompileWikiPages` adds nothing to the heading.
- Highlight one node. Highlight three and you have highlighted nothing.
- Give a returning edge its own room. A curve crossing back through the forward path is
  unreadable at slide size; running the return along a row below usually reads better and
  often turns out to be the more accurate picture.
- Three-point arrowheads avoid `<defs>` and follow the theme.
- `width:100%; height:auto` with a `min-width`, and `overflow-x:auto` on the wrapper, so
  the diagram scrolls instead of the page.

**Bars.** CSS beats SVG here — a name, a track, a filled div at a percentage, and the
number. Print the number; an estimate cannot be checked against the source, which is why
the gate also rejects a `.stat` with no `.sub`. Start at zero.

**Tables.** Mark the row the slide argues for, and encode direction, because `+0.8` and
`−2.3` do not read as opposites at a glance. Emphasis is a budget. Keep losing rows
visible — a comparison where every marked cell is a win reads as an advertisement.

## Color and theme

Route every fill and stroke through a custom property; a literal hex survives light mode
and vanishes in dark, and the gate requires both. Give tokens roles and hold them steady
across the document. Never let color carry meaning alone — pair it with position, a sign,
or a label.

Length and position are read accurately; angle, area, and depth are not.

## Do not

- **No external chart library, no remote images.** The gate blocks them.
- **No screenshot of a table.** Retype it. No theme, no selectable numbers, no usable alt
  text, and a large share of the size budget.
- **Do not invent a step to make a diagram symmetric.** A four-stage mechanism drawn as
  five boxes is a fabricated claim with a picture around it, and it passes every gate.
