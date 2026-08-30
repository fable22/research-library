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
| The last fix round is re-verified like any other, and what it turns up ships as found-and-unfixed | `research-verify`, `research-chain.js` | a loop that ends before its own check leaves the freshest edits as the only unread ones. See the revision note below |
| Give a compression subagent extraction and quotes, never a conclusion | `research-doc` | CaMeL-style separation between the model that reads untrusted material and the model that decides. See the scale probe below |
| Read an analyzed repository's `AGENTS.md` / `CLAUDE.md` directly as data, and keep the checkout outside the working directory | `research-source` | repository instruction files are a documented prompt-injection route, but the step that executes them is harness auto-discovery, not reading. See the revision note below |
| Frame the question and scale the reading before opening files | `research-source` | orchestrator-worker deep research; explicit effort-scaling rules are what stop both over- and under-investigation |
| Name the ways a reader could disagree before reading | `research-source` | STORM perspective-guided question asking, which measured most of its coverage gain at the pre-writing stage |
| `swhid` alongside `repo`+`commit` | `research-source` | SWHID, ISO 18670 — an intrinsic hash stays verifiable after the origin is gone |
| The document title names the subject and says what it is; the finding goes in `summary` | `research-doc` | the listing gives a title no context, and a verdict placed ahead of its evidence cannot be qualified. See the revision note below |
| No chapter count; six required eyebrows | `research-doc`, `check-doc.mjs` | the gate, which checks nothing else about structure |
| The lineage bar only where succession is documented | `research-doc` | the arrow reads as a slot to fill, and filling it chained unrelated projects and ended at work nobody built |
| Slide density, figure anatomy, aria-label first | `references/visual.md` | see the eval below |
| Every rule carries the reason its ✗ fails; rule count is a cost | `AUTHORING.md` | instruction-shape ablations. See the note below |
| Plain, not simplified. Over-compression eats the mechanism before the conclusion | `research-doc`, `references/prose-ko.md` | simplification measured as deletion. See the note below |
| No sentence-length rule | `references/prose-ko.md`, by omission | the numbers everyone quotes have no source, and the Korean evidence runs the other way. See the note below |
| Technical terms stay in English | `references/prose-ko.md` | asserted, not measured. See the note below |
| Connective tissue stays; the deck's rail is why elaboration is cheap here | `references/prose-ko.md` | expertise reversal, and the cell this reader is in. See the note below |
| Count the prose rules that carry a number; leave the rest to the lens | `check-prose.mjs` | the rules were enforced in proportion to how greppable they were. See the count below |
| `~가 아니라 ~다` is reported, not blocked | `check-prose.mjs` | the count that looked like a violation was mostly quotes and attribution. See the note below |
| `~를 통해` is not translationese; `~들` is not noise; a comma after a connective ending is the tell | `references/prose-ko.md` | corpus measurement, against the prescriptive list the rules were built from. See the audit below |
| Quotes leave the prose the gate reads, in every container the documents actually use | `check-prose.mjs`, `check-doc.mjs` | both gates said quotes were excluded and stripped only `blockquote` / `pre`+`code`. See the 2026-08-30 audit |
| The polite register is blocked at zero | `check-prose.mjs`, `references/prose-ko.md` | the register rule had no counter, and all 13 occurrences in the corpus are quotes. See the 2026-08-30 audit |
| No rule against ending a sentence on a noun phrase | `references/prose-ko.md`, by omission | an outside guide proposed it; measured here, the 9.8% are captions and labels. See the outside-style-guide note |
| One rule for the doubled passive, not two | `check-prose.mjs` | `passive-stack` and `double-passive` both matched `되어지·되어진·불려진`. See the 2026-08-30 audit |
| An empty ledger fails rather than passes | `check-claims.mjs` | a scaffold with 0 claims printed the same 통과 as a document whose every quote was checked. See the note below |
| LaTeX thousands separators are normalized before matching | `check-claims.mjs` | `2{,}000` became `2 , 000`, so a number the paper prints was reported missing. See the note below |
| A Roman table number is resolved, not silently widened | `check-claims.mjs` | `Table II` passed the format check and failed to scope, so five claims were matched against a whole paper. See the note below |

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

## Why the fix loop re-verifies the round that ends it

The loop in `research-chain.js` was written to stop when a round turns up nothing new, with
a round cap so it terminates on cost when the document does not converge. The cap was
checked one step too early: `if (round === MAX_ROUNDS) break` sat above the re-verification
agent, not below it. Every other round was read by a context that had not made its edits.
The last one never was, whichever round that happened to be — raising the cap moved the
blind round rather than removing it.

The deepseek-harness document on 2026-08-14 is where it showed. Round 3 applied eight fixes
across five slides and the loop ended there. Re-verifying those slides afterwards found
three must-fix items: a count whose governing condition had been dropped while its wording
was corrected, a coverage note describing a state the document had since left, and a
가운뎃점 that renders at the weight of a period inside a monospace version string, fusing
two tokens into one. The third had been fixed by that same round in a different slide, so
the round both knew the defect and left another instance of it standing.

Two of the three are the signature of a late round specifically: a fix round works from a
findings list, and the edits it makes to satisfy that list are the ones no list covers.
That is an argument for reading the last round more carefully than the first, not less.

The cap itself was kept. What changed is that it now fires after the re-verification, and
that the items the re-verification confirms travel to the PR under a heading of their own.
Folding them into "not verified" would have been wrong in the other direction: they were
verified, by the step that found them, and the thing missing is the fix.

This revision did not go through a `skill-creator` A/B. It adds one rule and moves where a
branch sits; a pass-rate benchmark does not discriminate between a loop that checks its
last round and one that does not, because the difference only appears in runs that reach
the cap.

## What the compression-subagent rules were measured against

A scale probe on 2026-08-07 against `getpaseo/paseo` @ `deb5e5c`, 3,682 files of which 27
were opened. It produced no document; the target was whether the harness holds at a size
where the author cannot read the corpus.

**Extraction-only delegation held; the same delegation with a conclusion in it did not.** The
subagent read 38,289 B of a 643 KB path and returned a 10-hop trace with 14 quotes, all 14
verifying against the pinned commit. On the earlier insane-search document the same kind of
subagent returned two wrong reports, and both sat where it had drawn a conclusion rather than
copied a span. The rule's basis is CaMeL; this is the observation that matches it.

**An isolated subagent out-counted a direct grep on inventory**, 13 agent instruction files
against 11, because two were symlinks to directories with no `SKILL.md` in the name. That
structure is what the checkout-location rule aims at, met as a real repository.

One repository, one run, and the trace was read rather than executed.
## Why the prose rules got a counter

Lens B has `check-claims.mjs` behind it. Lens C had nothing, so every prose rule was enforced
by one reading of one document by one context. A count on 2026-08-27 over the 18 published
documents shows what that produced: the rules split by whether a reader could notice a
violation from a single sentence.

Reaction words, promotional adjectives and vague attribution: zero per 100k characters.
`~가 아니라 ~다`, which `prose-ko.md` argues against at greatest length: 58 per 100k, against
a stated budget of one or two per document. Catching that one means counting across a whole
document, and nobody was counting.

So the gate takes the rules that already had a number and does the counting. It invents no
threshold. Everything else prints under `--counts` and blocks nothing, because a count is not
a violation.
## What the translationese rules survive on

`prose-ko.md`'s list of translated-English tells came from the standard prescriptive
literature. An audit against the studies that counted things found part of it measured, part
unsupported, and part measured backwards.

**Measured.** 김혜영 (2009) built two balanced morph-tagged corpora of one million eojeol
each. Over-represented in translated Korean: syntactic passive, specifically `-아/어 지다` and
`-에 의하여`; second- and third-person pronouns and demonstratives; the bound nouns `것/거` and
`때문`; the genitive `-의`. Reported in
[김정우 (2012)](https://www.korean.go.kr/nkview/nklife/2012_1/22_0104.pdf). The passive and
pronoun rules stand on this.

**Measured backwards.**
[최희경 (2016)](https://journal.kci.go.kr/kats/archive/articlePdf?artiId=ART002094440) counted
normalized frequency of `~통하다` at 84.441 in non-translated Korean, 50.856 in the reference
corpus, and 42.090 in translated — Korean written without translation uses it twice as often.
`~를 통해` was on our filler list; it is now off it.

**Unsupported.** `~들` does not appear in the 김혜영 findings, and
[조의연 (2012)](https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001644267)
argues that deleting it produces mistranslation. The rule is now about where the plural is
already carried, not about the marker.
## The comma the documents all share

[KatFishNet (ACL 2025)](https://aclanthology.org/2025.acl-long.1030/) measured what separates
human-written from LLM-written Korean. The strongest single signal is a comma after a
connective ending: 4.10 / 4.68 / 13.27% for humans across three genres, against
19.83 / 15.57 / 28.01% for models.

Measured the same way over the 18 documents published as of 2026-08-19 — approximately, by eojeol-final
string rather than morphological analysis — the rate is **37.1%**, higher than any LLM figure
in the paper. The approximation inflates both terms of the ratio, so the absolute number does
not belong beside theirs. What survives the caveat is that every document sits in the same
band and nothing in the harness was looking at punctuation.

**A readability lens is not the repair.** Two expert-panel studies found Korean raters score
LLM Korean higher than human Korean on nearly every rubric dimension while separately
reporting that it reads like a machine, and inter-rater agreement on the one naturalness item
was ICC(A,1) = .091 ([arXiv:2601.19913](https://arxiv.org/abs/2601.19913)). Asking one more
subagent whether a document reads well would add noise, not a lens.
## Why a rule has to carry its reason

The only head-to-head ablation of instruction elements is
[Mishra et al., ACL 2022](https://aclanthology.org/2022.acl-long.244/). Average ROUGE-L gain
over a no-instruction baseline: definition +50, things-to-avoid +25, definition plus positive
examples +65. Their full instruction, which also carried the prohibitions, scored 32 against
33 for definition-plus-examples. Removing negative examples moved GPT-3 from 24 to 44.

The part worth keeping is that their human annotators rated the negative examples helpful.
**A reader asked whether a prohibition helps will say yes, and be wrong**, which is why this
weakness does not show up in review.

What carries the gain is the explanation. [TICL](https://arxiv.org/abs/2502.08972) attaches
generated failures to explanations of why they fail and reports explanations *"responsible for
up to 77% of the gains."* Rule count is its own cost:
[compliance collapses by roughly 80 simultaneous rules](https://arxiv.org/abs/2607.19257), and
adding a constraint the output already satisfies still degrades output
([arXiv:2601.22047](https://arxiv.org/abs/2601.22047)).
## Why the documents are plain and not simplified

The reader model already ruled out writing for a general audience. What the measurements add
is that the cost of simplifying for a reader who has the background is specific: it lands on
the mechanism.

In [InfoLossQA](https://arxiv.org/abs/2401.16475), three linguists marked information loss in
104 GPT-4 simplifications of medical abstracts. **41.7% of the losses fell in the Methods
section against 3.5% in the Conclusion.** The conclusion survives and the mechanism does not,
which for a document whose ⑥ chapter is a traced mechanism is the whole document.

[Ellinger et al.](https://arxiv.org/abs/2507.11981) measured whether a definition still
covered a word's senses under three prompts. GPT-4o mini: 78.43% normal, 22.22% under "in
simple language", **1.31% under "like I am 5 years old"**. The gradient is the useful part —
the two instructions are not the same request.

Not measured on developers, on documentation, or in Korean.
## Why there is no sentence-length rule

Nobody should add one without reading this, because the obvious rule is the one the evidence
does not support.

**The thresholds in circulation have no source.** A full-text search of 국립국어원's 공공언어
documents returns no numeric sentence-length rule. `50자` and `20어절` trace to nothing.

**Scale makes the popular cap vacuous.** Across 9,945 textbook passages, mean characters per
sentence is 32.30 in 국어 and 41.21 in 사회
([교육과정평가연구 27(1)](https://www.ejce.org/archive/view_article?pid=jce-27-1-87)) — a
50-character cap is looser than the average middle-school sentence. And length rises with the
reader's level: 17.0 in lower elementary, 40.1 in middle school.

**In Korean, longer can be easier.**
[Hwang & Steinhauer (2011)](https://pubmed.ncbi.nlm.nih.gov/21391765/) found the garden-path
P600 *smaller* when the sentence-initial subject NP was longer. No Korean study has
manipulated sentence length alone and measured comprehension.
## What the English-term rule rests on

`prose-ko.md` keeps RAG, embedding, corpus and the rest in English on the argument that
translating them produces coinages harder to read than the original. That has not been tested.

The nearest measurement is
[조영지·백현아 (2024)](https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART003139706),
96 native readers: loanwords were recognized more slowly, with *"no significant difference in
sentence comprehension times."* Its stimuli were Hangul transliterations, not Latin script,
and no study of Korean text carrying Latin-script technical terms appears to exist.

The 국립국어원 loanword findings are about a readership meeting terms it does not have. This
library's reader is a developer for whom the English term is the familiar form. The rule
stands on the audience, not on a measurement.
## Where "experts need less explanation" stops applying

The rule against over-compression now has evidence, and it is not the evidence people reach
for. The expertise reversal effect is real — a 2025 meta-analysis of 60 studies puts
high-assistance instruction at d = 0.505 for low prior knowledge and d = −0.428 for high
([Tetzlaff et al.](https://www.pedocs.de/volltexte/2026/34113/pdf/Learn_and_Instr_2025_Tetzlaff_u.a._A_cornerstone_of_adaptivity.pdf)).
Three things stop it applying here.

It is asymmetric, and the authors say which way to err: *"providing novices with assistance
has a stronger effect than withholding assistance from experts."* Its effect shrinks when
prior knowledge is measured rather than proxied by grade level. And its mechanism needs the
reader to be unable to skip — these documents are decks with a rail.

**The text-coherence version reverses for this audience.**
[O'Reilly & McNamara (2007)](https://doi.org/10.1080/01638530709336895) narrowed the result
that high-knowledge readers do better with less coherent text: the benefit *"was restricted to
less skilled, high-knowledge readers, whereas skilled comprehenders with high knowledge
benefited from a high-cohesion text."* A developer who reads technical prose for a living is
in the second cell.
## What the comma rule was measured against

The rule went in on evidence from a paper and was then run through `skill-creator` against the
pre-revision skill: three prompts supplying the source facts and asking for Korean slides, so
the test isolates prose from research. Rate of a connective ending followed by a comma:

| | before | rule as written | after the repair |
|---|---|---|---|
| mean of three | **39.2%** | **0.0%** | 0.0% at a 1.38% comma rate |

Human-written Korean sits at 4.1–13.3%. **The first version overcorrected into documents with
almost no commas at all** — 0.21% of Hangul characters against 1.13% for people. Two ✗/✓ pairs
both said cut, and one prose sentence said keep it where the reader needs it. The prose
sentence did nothing.

**The repair was a ✓ where a comma survives, and the first attempt made it worse.** The keeper
read `keyword 경로에만 캐시가 있어서, …` — `있어서` is a connective ending, so the example
demonstrated the banned pattern under a ✓, and the next run copied it (`없어서,`). Replacing it
with a comma between parallel items brought the rate to 0.0% at a 1.38% comma rate, against
1.40% before the rule existed.

**An exemplar is read as a pattern to copy, so a ✓ carrying the defect teaches the defect.**
Check the good example against the gate too.
## Moving countable rules out of the prose

The same run tested whether a rule can live in the script instead of the skill. Five entries
in `prose-ko.md` — progress narration, reaction words, monologue, vague attribution,
promotional adjectives — were each a ✗/✓ pair plus a reason, 26 lines, and each is a fixed
list of words that `check-prose.mjs` blocks. They were replaced by one entry naming all five
and pointing at the gate, 8 lines.

Output did not change: zero occurrences of all five patterns before and after, and identical
assertion scores. That is weaker evidence than it looks — the pre-revision skill also
produced zero, so what this shows is that the ✗/✓ blocks were not the thing preventing them.
Either way the compressed form is safe, and `prose-ko.md` went from 273 to 258 lines while
gaining the comma rule.

The general form: **a rule the gate can count belongs in the gate, and what stays in the
skill is the reason.** Script rules cost nothing at generation time; skill rules cost tokens
on every invocation and dilute compliance with the rules around them.


## Why the contrast frame is counted and not blocked

`prose-ko.md` said of `~가 아니라 ~다`: *"Once or twice per document, not per slide."* Taken as
a budget it made this the one gate rule that fired — 179 occurrences across the 18 documents,
146 over the limit, blocking 14 of them.

Reading the 34 in the worst one settles it the other way. What the pattern catches here is
verbatim quotes (`AI 경쟁의 다음 전장은 모델이 아니라 회사의 기억입니다`, a Threads post used as
evidence), attribution corrections (`판단 자체는 원문이 아니라 DataSci Ocean 의 읽기이고`), and
the use `prose-ko.md` explicitly permits, correcting an answer the reader holds. The
decorative doubling the rule was written against is rare here.

The frame is a strong measured signal, roughly nine times more frequent in model-written
Korean. But the signal is about a register, and a regular expression cannot tell a register
from three legitimate constructions that share its shape. So it moved to `--counts`, alongside
`~에 있어서`, which failed the same test.

**A pattern whose matches in the corpus are mostly correct has no business blocking a
document.** Every rule left in the gate now blocks zero of the 19 published documents, which
is the state a regression guard should be in.
## What an outside style guide was worth here
[`snflkd/fluent-korean`](https://github.com/snflkd/fluent-korean) (MIT, `ce8683f`) diagnoses
LLM Korean as the opposite of what this repo assumes: omission rather than excess, restoration
rather than cutting. Two guides pointing opposite ways is worth a measurement, so the rules it
carries that this repo lacks were measured before adoption.
| Its rule | Measured here | Outcome |
|---|---|---|
| Do not end a sentence on a noun phrase | 534 of 5,474 sentences (9.8%) end without a 종결어미 | rejected — all sampled are figure captions, source markers, and label definitions, the category its own clause exempts |
| Do not stack 관형격 `~의` | `~의 ~의` chains across 19 documents | rejected — 0 occurrences |
| Avoid metaphor, avoid the em dash | already held by `lens-prose.md` and `check-doc.mjs` | no change |
**Nothing was adopted.** Delivery is settled separately: output styles apply to the main
conversation only, and `research-verify` runs its lenses as subagents, so an output style
would not reach the place the Korean is written.
## What the 2026-08-30 audit changed
The instruction corpus had only been appended to, so it was read as a whole — 4,714 lines by
five separated readers, one each for contradictions, duplication, intent defeat, stale
references, and gate/prose drift. Findings were reproduced before being acted on.
**The measurements that moved a rule:**
| Measured | Changed |
|---|---|
| The four Korean specimens the skills hand an author ran at 100 / 100 / 33 / 100% comma-after-connective, against a human band of 4.1–13.3% | All four rewritten to 0%. `visual.md` now states that `visibleProse` strips `<svg>`, so no counter reads an `aria-label` |
| 18 `derived` claims in `.research/`, against a 7-value `kind` list in `research-verify/SKILL.md` that omits it | The skill points at `check-claims.mjs --help` and explains only `derived`, which needs a decision rather than a lookup |
| The skill's one worked claim specimen failed two gate rules: `locator: 표 1` is rejected, and its quote was 28 characters against a 40 floor | Specimen corrected; the `locator` grammar is now stated where it is written |
| `text_sha256` blocks `source-identity` and appeared in 0 markdown files and neither scaffold | Documented in `research-source` with the command that produces it, and added to the scaffold |
| Three of the five word-list rules lens C was told to sweep for are blocked at zero by the counter it runs first | `lens-prose.md` no longer sweeps them |
| 4 documents ship `category: "oss"`, which `CATEGORY_LABEL` never registered, so the raw token rendered beside Korean labels | Registered; `new-doc.mjs` now emits the CLI's own type |
| 1,557 quote containers (`.q`, `.wl`, `<cite>`) were counted as the document's own prose by both gates, which each state the opposite | `visibleProse` and `stripQuoted` strip them. The register rule found 13 polite endings, every one inside a quotation |
| `passive-stack` and `double-passive` both matched `되어지·되어진·불려진`, so one sentence reported twice and a waiver needed two ids | Merged. `check-prose.test.mjs` now asserts no two rules share an alternative |
| The register rule's first form blocked `~(으)니까`, which the same file counts as an ordinary connective | Rewritten to the ㅂ-batchim condition that actually separates 합쇼체 from the connective |
**Separation paid in both directions.** Two readers independently found the `~니까` defect and
four found the missing `derived`; independent discovery is what separates a finding from one
reader's bias. Two pairs disagreed, and the disagreement was the useful part: `Three lenses` in
the table above is accurate, because lens D is deliberately handed A/B/C's reports and the
mutual-blindness rule is about those three — while the same phrasing inside a ✓ specimen was a
real defect, since `AUTHORING.md` bars repository facts from specimens. A single reader returns
one of those verdicts and stops.
**Nothing found here was a bad rule.** Each was written correctly and then left while something
beside it moved, which is invisible to a reader who starts from the rule being edited.
document.** Every rule left in the gate now blocks zero of the 18 published documents, which
is the state a regression guard should be in.
## Why an empty ledger is not a pass
Committing the untracked evidence turned up one document, `cerebras-kb-architecture`, whose
three ledger files hold nothing but the scaffold comments `new-doc.mjs` writes. Run against
it, `check-claims.mjs` printed:
```
OK    research/2026-08-20-cerebras-kb-architecture  (주장 0개, 근거 0개, 출처 0개)
통과. 인용이 고정 원문과 일치한다.
```
Indistinguishable from a document whose every quote was matched against a pinned commit,
which is the opposite of what the gate exists to establish. The counts are printed, but a
passing gate is what gets read.
`empty-ledger` now blocks it. The 14 ledgers in the repository carry 11 to 54 claims each, so
nothing real is affected, and a missing `claims.jsonl` was already caught by `claims-file`
rather than reported twice. A freshly scaffolded document now fails this gate, which is
correct and costs nothing: the only promise made about a fresh scaffold is that
`check-doc.mjs` passes it.
**A gate that cannot fail on absence measures presence only.** Worth checking for wherever a
count of zero is a legal input.


## The number the paper printed and the gate could not find

Retro-fitting evidence onto `wikikv-hierarchical-kb-storage` turned this up. The document
says the storage benchmark ran on a wiki of about 2,000 KV pairs. The paper says exactly
that — `a medium-sized wiki ($\sim$2{,}000 KV pairs)` — and `check-claims.mjs` could not
find it.

`delatex` replaces `{` and `}` with spaces, which is right for commands and wrong for the
one place LaTeX puts braces inside a number. `2{,}000` came out as `2 , 000`, so one value
became three tokens: `quote-match` failed on any quote containing it, and `hasNum` searched
the raw text for `2,000` and `2000` against a haystack holding neither.

Four such numbers are in that one paper (`2{,}000`, `1{,}000`, `1{,}379`, `1{,}949`) and the
document leans on two of them. `fixNums` now restores the separator between digits, before
the braces are stripped, and `hasNum` normalizes its haystack the same way.

**This is the empty-ledger defect in the other direction.** That one passed what should have
failed; this one failed what should have passed, and a false positive is the worse of the
two — `check-prose.test.mjs` opens by saying so. A rule that blocks correct work pushes the
whole gate toward `--allow`, and the exception is written once and never revisited.


## The table number that passed its own format check

`locator-form` accepts `Table II`, because IEEE papers number their tables that way.
`scopeFor` matched only `/^Table\s+(\d+)$/`, so a Roman locator fell through to the
whole-document branch. The claim was still checked, against 65,000 characters instead of one
table, and the only trace was an aggregate line at the end of the run.

Five claims across the corpus were in that state. Resolving Roman numerals dropped one
document's unscoped count from 40 of 43 to 35, and the newly narrowed claims did not pass:

| Claim | Cited | Actually in |
|---|---|---|
| the no-evolve Final A@1 cells | `Table II` | `Table III` (`tab:rq1-main`) |
| the evolved-artifact recall figures | `Table III` | `Table II` (`tab:rq2-knowledge`) |

**The document had two tables swapped**, in 15 and 3 places plus its `meta.json` summary,
and it had been merged. Nothing caught it because the wrong locator was never resolved: a
quote from Table III matched fine when the haystack was the entire paper.

The same narrowing then rejected one input of a derived claim. `41.4` was listed among the
cells being averaged, and it is not a cell — it is the body value in §VI-B that the average
is being compared against. The evidence now points at the table for the four cells and at
the section for the number they disagree with.

**A check that cannot narrow its search still reports success.** The unscoped count existed
before this and said so honestly, but it is one line at the end of a passing run, and a
passing run is what gets read.
