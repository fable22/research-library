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

A scale probe on 2026-08-07 against `getpaseo/paseo` @ `deb5e5c`, shallow, 3,682 files of
which 27 were opened. It produced no document; the target was whether the harness holds at
a size where the author cannot read the corpus.

**Extraction-only delegation held; the same delegation with a conclusion in it did not.**
The traced path crossed four files totalling about 643 KB. The subagent read 38,289 B — of
`session.ts` it read roughly 19,000 B of 242,512 — and returned a 10-hop trace with 14
quotes. All 14 verified against the pinned commit. On the earlier insane-search document
the same kind of subagent returned two wrong reports, and both sat at the point where it
had drawn a conclusion rather than copied a span (that a README contradicted the code).
The rule's basis is CaMeL; this is the observation that matches it.

**An isolated subagent out-counted a direct grep on inventory.** It found 13 agent
instruction files where the grep found 11. `.claude/skills/release-beta` and
`release-stable` are symlinks to directories, so nothing in their names is `SKILL.md`, and
the repository double-exposes `.agents/skills/` as `.claude/skills/`. The auto-discovery
surface the checkout-location rule aims at is what that structure is, met as a real
repository rather than as a hypothetical.

**The entry order broke where it says it breaks.** `CLAUDE.md` listed six packages; ten
exist. The 7 imports in `session.ts` that cross a package boundary all go to
`@getpaseo/protocol`, one of the four the map omits. `research-source` §5 says to confirm
the stated map against the tree for exactly this reason.

**The ⑥ scope rule held at size.** `session.ts` is 6,934 lines with 104 imports, and the
7 that leave the package go to a shared library rather than another process, so the
process boundary the rule asks for was still findable in a file that large.

One repository, one run, and the trace was read rather than executed. This is a specimen,
not a measurement.


## Why the prose rules got a counter

Lens B has `check-claims.mjs` behind it. Lens C had nothing, and `lens-prose.md` told it
`taste is not a rule`, so every prose rule was enforced by one reading of one document by
one context.

A count taken on 2026-08-27 over the 18 published documents, 164,481 Hangul characters of
visible prose, shows what that produced. The rules split cleanly by whether a reader could
notice a violation from a single sentence:

| Rule | Per 100k characters |
|---|---|
| reaction words (흥미롭게도, 놀랍게도) | 0 |
| promotional adjectives (강력한, 획기적인) | 0 |
| vague attribution (업계에서는, 전문가들은) | 0 |
| `~에 있어서` as filler | 0 real, 2 false positives |
| `~가 아니라 ~다` as a default frame | 58 |

`prose-ko.md` says of the last one: *"Once or twice per document, not per slide."* The
budget across 18 documents is at most 36. There were 91, a mean of 5.4 per document and 34
in one. It is the rule the file argues for at greatest length and the one most broken,
because catching it means counting across a whole document and no one was counting.

So the gate takes the rules that already had a number in `prose-ko.md` and does the
counting. It invents no threshold of its own. Everything else — `것이다` density, `~들`,
repeated demonstratives, a connective opening every paragraph — prints under `--counts`
and blocks nothing, because a count is not a violation and the judgment of which
occurrence is wrong is exactly what a lens is for.

**`~에 있어서` was dropped from the gate for failing this test.** Both hits in the corpus
were the existence reading (`규격 안에 있어서`, `C.6 절에 있어서` — 있다 + 어서), not the
filler. A pattern whose only matches are false positives has no business blocking a
document, which is the same standard the DocPrism row above applies to doc/code sweeps.

What this does not do is judge whether a document reads well. Readability research is
consistent that surface metrics are poor proxies — rewriting to a lower grade level does
not by itself improve comprehension, and coherence, which no regular expression reaches,
is what carries reading ease. The counter finds token-level rule breaks. Whether the
document lands is still unowned, and `lens-prose.md`'s `taste is not a rule` is why.


## What the translationese rules survive on

`prose-ko.md`'s list of translated-English tells came from the standard Korean prescriptive
literature. An audit on 2026-08-27 against the studies that actually counted things found
part of that list measured, part unsupported, and part measured backwards.

**Measured, translated Korean against non-translated.** 김혜영 (2009) built two balanced
morph-tagged corpora of one million eojeol each. What is over-represented in translated
Korean: syntactic passive, specifically `-아/어 지다` and `-에 의하여`; second- and
third-person pronouns and demonstratives; the bound nouns `것/거` and `때문`; the genitive
`-의`; and `-은/는` where `-이/가` would do. Reported in
[김정우 (2012), 새국어생활 22(1)](https://www.korean.go.kr/nkview/nklife/2012_1/22_0104.pdf).
The passive and pronoun rules in `prose-ko.md` stand on this.

**Measured backwards.**
[최희경 (2016), 번역학연구 17(1)](https://journal.kci.go.kr/kats/archive/articlePdf?artiId=ART002094440)
built translated, non-translated, and reference corpora and counted. Normalized frequency of
`~통하다`: non-translated 84.441, reference 50.856, translated 42.090 — Korean written
without translation uses it twice as often as translated Korean. Only 6 of 46 `through`
tokens became `~통하다` at all. The same reversal holds for `by` → `~에 의하다`. `~를 통해`
was on our filler list; it is now off it.

**Unsupported.** `~들` does not appear in the 김혜영 corpus findings. The case against it
(김순영 2012) is semantic — `들` carries definiteness and variety — and
[조의연 (2012), 번역학연구 13(1)](https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001644267)
argues the strategy of deleting it produces mistranslation. The rule is now about where the
plural is already carried, not about the marker.

**The reader side is thinner than the rule side.** 오미형 (2015) put 27 translationese
sentences to 31 students: they recognized translationese and *did not* consistently rate it
harder to read. No eye-tracking or reading-time study of Korean translationese appears to
exist. The one Korean comprehension result with a large sample is about vocabulary, not
syntax — 신명선 외 (2016), n=493, found 8% of high-schoolers understood `전담` and 10%
understood `공시` in government press releases. That is the shape of the evidence: word
difficulty measurably breaks comprehension, sentence shape has not been shown to.

## The comma the documents all share

[KatFishNet (Park et al., ACL 2025)](https://aclanthology.org/2025.acl-long.1030/) measured
what separates human-written from LLM-written Korean. The strongest single signal is a comma
after a connective ending: 4.10 / 4.68 / 13.27% for humans across essays, poetry and paper
abstracts, against 19.83 / 15.57 / 28.01% for models.

Measured the same way over the 18 published documents here — approximately, by eojeol-final
string rather than morphological analysis — the rate is **37.1%**, higher than any LLM
figure in the paper, ranging from 25.5% to 48.7% across documents. Comma rate against
Hangul characters is 2.39%, against the paper's 1.13% human and 2.56% model.

The approximation inflates both terms of the ratio and the absolute number should not be set
beside the paper's. What survives the caveat is that every document in the library sits in
the same band, no document approaches the human range, and nothing in the harness was
looking at punctuation at all.

The rule went into `prose-ko.md`; the rate prints under `check-prose.mjs --counts`. It does
not gate, because the measurement is approximate and `prose-ko.md` gives it no budget.

**A readability lens is not the repair.** Two expert-panel studies found Korean raters score
LLM Korean *higher* than human Korean on nearly every rubric dimension, including grammatical
accuracy, while separately reporting that it reads like a machine. On the one rubric item
that names naturalness, inter-rater agreement was ICC(A,1) = .091
([arXiv:2601.19913](https://arxiv.org/abs/2601.19913)) — three trained raters essentially did
not agree. Asking one more subagent whether a document reads well would add noise, not a
lens. Measuring the few things that have been measured is what is available.


## Why a rule has to carry its reason

`AUTHORING.md` already asked for worked specimens. What it did not say was that the ✗ needs
the reason attached, and the measurements that exist all point the same way.

The only head-to-head ablation of instruction elements is
[Mishra et al., ACL 2022](https://aclanthology.org/2022.acl-long.244/). Average ROUGE-L gain
over a no-instruction baseline: definition +50, things-to-avoid +25, definition plus positive
examples +65. Their full instruction, which also carried the prohibitions, scored 32 against
33 for definition-plus-examples — the prohibitions cost a point. Removing negative examples
moved GPT-3 from 24 to 44. Their own paper reports that human annotators rated the negative
examples helpful, which is the part worth keeping: **a reader asked whether a prohibition
helps will say yes, and be wrong.** Super-NaturalInstructions reaches a milder conclusion but
its own best configuration excludes negative examples.

A bare prohibition also has a floor. In
[Castricato et al.](https://arxiv.org/abs/2402.07896), an explicit instruction not to mention
a topic left two open models unchanged (Δ = 0.00 and −0.03) and GPT-4 still violated it 13% of
the time. And the failure can invert: prompting for accuracy made scientific summaries
*more* overgeneralized, OR 1.90, in
[Peters & Chin-Yee, R. Soc. Open Sci. 2025](https://royalsocietypublishing.org/doi/10.1098/rsos.241776).

What carries the gain is the explanation, not the prohibition.
[TICL](https://arxiv.org/abs/2502.08972) attaches generated negative samples to explanations
of why they fail and reports explanations *"responsible for up to 77% of the gains"*, with the
method specifically reducing the `additionally`/`therefore` register.

Rule count is its own cost. Perfect compliance
[collapses to zero by roughly 80 simultaneous rules](https://arxiv.org/abs/2607.19257), and
adding a constraint the output *already satisfies* still degrades task performance
([arXiv:2601.22047](https://arxiv.org/abs/2601.22047)).

A count of `prose-ko.md` on 2026-08-27: 29 rules, 16 carrying a ✗/✓ pair and all 16 also
carrying the reason. The ten bare prohibitions were the gap, and four of them named a bad
form without ever showing the good one. Those four now have pairs. The transfer is
unmeasured — none of the studies above is about prose style guides, and none is in Korean —
so this is the shape the evidence points at, not a result.


## Why the documents are plain and not simplified

The reader model in `research-doc` — a developer deciding whether to use this next week —
already ruled out writing for a general audience. What the measurements add is that the
cost of simplifying for a reader who has the background is specific and predictable, so the
rule is about where the loss lands rather than about tone.

**Simplification is implemented as deletion.** In
[InfoLossQA](https://arxiv.org/abs/2401.16475), three linguists marked information loss in
104 GPT-4 simplifications of medical abstracts: 74.1% of the losses were oversimplification
rather than outright deletion, and **41.7% of them fell in the Methods section against 3.5%
in the Conclusion**. The conclusion survives and the mechanism does not. For a document
whose ⑥ chapter is a traced mechanism, that is the whole document.

This is not a model defect. In
[Devaraj et al., ACL 2022](https://aclanthology.org/2022.acl-long.506/), professionally
human-simplified Newsela sentences carry a deletion error in 84.2% of pairs and a *major*
one — main idea not preserved — in 42.9%.

**"Explain like I'm 5" is the worst-performing instruction that has been tested.**
[Ellinger et al.](https://arxiv.org/abs/2507.11981) put three prompts to five models and
measured whether the definition still covered the word's senses:

| | Normal | "in simple language" | "like I am 5 years old" |
|---|---|---|---|
| GPT-4o mini | 78.43% | 22.22% | **1.31%** |
| Llama 3.1 8B | 79.08% | 31.37% | **4.58%** |
| Qwen3-30B A3B | 83.66% | 44.44% | **15.69%** |

The gradient is the useful part: the two instructions are not the same request, and the
literal one costs nearly everything. Appending a counter-instruction that alternatives exist
recovered GPT-4o mini to 30.41% — mitigation, not repair.

**Audience targeting fails upward, not downward.**
[ELI-Why (Findings of ACL 2025)](https://aclanthology.org/2025.findings-acl.1306/) found
GPT-4 explanations matched their intended educational level 50% of the time against 79% for
lay human-written ones, collapsing toward a high-school register regardless of the target.
For graduate-level physics readers, **19%** of explanations matched. The paper also reports
that questions resembling ELI5 training data are simplified hardest, *"particularly for
prompts originally intended for higher educational levels."*

**The strongest result on the other side excludes this audience by design.** A randomized
study of n=4,563 found simplified text raised comprehension by 3.9 points
([arXiv:2505.01980](https://arxiv.org/abs/2505.01980)) — and its method screened out
participants who reported an educational background in the topic. Its system was built for
*minimally lossy* simplification with a fidelity check, which is a different operation from
the prompt above, and its gains concentrated where readers had started out lost.

**What r/explainlikeimfive actually asks for is worth keeping.** The subreddit the phrase
comes from states that it *"is not literally meant for 5-year-olds"*, targets *"people who
are not professionals in that area"*, and defines an explanation as having *"3 components; a
context, mechanism, and an impact"*, with an answer being what leaves one of the three to be
inferred. That is a better description of a slide than the name it travels under.

None of this was measured on developers, API documentation, or Korean. It transfers by
analogy from medicine, science communication, and education.


## Why there is no sentence-length rule

Nobody should add one without reading this first, because the obvious rule is the one the
evidence does not support.

**The thresholds in circulation have no source.** A full-text search of 국립국어원's
공공언어 documents returns no numeric sentence-length rule at all. `50자` and `20어절`,
the two figures quoted most often, trace to nothing; the only government-linked caps are
`100자(2줄)` on plainkorean.kr and `3줄` in a 보도자료 booklet, both uncited, and the second
measured in *lines*, which depends on the font.

**Scale makes the popular cap vacuous anyway.** Across 9,945 textbook passages, mean
characters per sentence is 32.30 in 국어, 41.21 in 사회, 33.91 in 과학. A 50-character cap
is looser than the average middle-school sentence
([교육과정평가연구 27(1)](https://www.ejce.org/archive/view_article?pid=jce-27-1-87)).

**And length rises with the reader's level, not against it.** The same corpus runs 17.0
characters per sentence in lower elementary and 40.1 in middle school. Sentence length
indexes who the text is for.

**In Korean specifically, longer can be easier.**
[Hwang & Steinhauer (2011)](https://pubmed.ncbi.nlm.nih.gov/21391765/) measured ERPs on
Korean garden-path sentences and found the P600 *smaller* when the sentence-initial subject
NP was longer, because the implicit prosodic boundary the longer phrase creates helps the
reader recover.

**No Korean study has manipulated sentence length alone and measured comprehension.** Every
Korean length effect that exists is graded and continuous — fixation milliseconds per
어절 — never a cliff. A count over the 18 documents here puts the median sentence at 52
characters, and the longest stretches are ⑫ source blocks rather than prose.

What is measured, repeatedly, is vocabulary. 국립국어원's own AHP weights put
쉽고 친숙한 용어와 어조 at 26.45% against 16.40% for sentence length, and a survey of 1,000
people found term familiarity explains about 99% of the variance in reported understanding.

## What the English-term rule rests on

`prose-ko.md` keeps RAG, embedding, corpus and the rest in English, on the argument that
translating them produces coinages harder to read than the original. That argument has not
been tested.

The nearest measurement is
[조영지·백현아 (2024)](https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART003139706),
96 native readers, self-paced: loanwords were recognized more slowly than native words, and
*"no significant difference was found in sentence comprehension times."* A lexical cost that
does not reach the sentence. But its stimuli were Hangul transliterations (세일즈맨), not
Latin script, and no eye-tracking or reading-time study of Korean text carrying Latin-script
technical terms appears to exist. Whether `RAG` in a Korean sentence costs the reader is an
open question, not a settled one.

The 국립국어원 loanword findings — 국민 평균 이해도 44.0% across 2,540 terms, 거버넌스 at
15.2% — are about a general readership meeting terms it does not have. This library's reader
is a developer for whom the English term is the familiar form and the Korean coinage would be
the unfamiliar one. That is a different case, and the rule stands on the audience rather than
on the measurement.

**One Korean result matches the simplification finding above.** Seven hospitals' Korean
liver-resection consent forms, simplified by GPT-4o
([J Med Internet Res 27:e73222](https://pmc.ncbi.nlm.nih.gov/articles/PMC12200805/)):
readability indices improved significantly (KReaD 1777 → 1335.6, p<.001; words per sentence
15.01 → 9.23), and expert-rated **risk descriptions fell** (β₁ = −0.371, p = .01). No patient
comprehension was measured. Better scores, less of what the document was for.


## Where "experts need less explanation" stops applying

The rule against over-compression had no evidence behind it. It has some now, and it is not
the evidence people usually reach for.

**The expertise reversal effect is real.** A 2025 meta-analysis — 60 studies, 176 effect
sizes, 5,924 participants, no publication bias on Egger's test — puts high-assistance
instruction at d = 0.505 for low prior knowledge and d = −0.428 for high, a crossover of
d = 0.971
([Tetzlaff et al., *Learning and Instruction* 98](https://www.pedocs.de/volltexte/2026/34113/pdf/Learn_and_Instr_2025_Tetzlaff_u.a._A_cornerstone_of_adaptivity.pdf)).

Three things in it cut against applying it here.

**It is asymmetric, and the authors say which way to err:** *"providing novices with
assistance has a stronger effect than withholding assistance from experts."*

**It is weakest where it should be strongest.** Effect size depends on how expertise was
defined (R² = 50%), largest when the split was grade level and smallest when prior knowledge
was actually measured — which confounds schooling and age with domain knowledge in the
studies carrying most of the effect.

**Its mechanism needs the reader to be unable to skip.** Kalyuga's account is that redundant
material harms *"especially if more knowledgeable learners cannot avoid processing the
redundant components of information."* These documents are decks with a rail. A reader who
already knows chapter ④ moves past it in one click, and nothing in this literature tests
elaboration a reader can skip.

**And the text-coherence version reverses for this audience specifically.** The famous result
that high-knowledge readers do better with a *less* coherent text — because the gaps force
inference — was narrowed by
[O'Reilly & McNamara (2007)](https://doi.org/10.1080/01638530709336895): the benefit *"was
restricted to less skilled, high-knowledge readers, whereas skilled comprehenders with high
knowledge benefited from a high-cohesion text."* A developer who reads technical prose for a
living is in the second cell.

**One positive design principle comes out of this.**
[Rozenblit & Keil (2002)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3062901/) measured
self-rated understanding before and after being made to explain, across knowledge types. The
drop was 0.918 for devices and 0.860 for natural phenomena, and **−0.173 for procedures** —
readers are badly overconfident about *how a thing works* and well calibrated about *how to
do something*. Chapter ⑥ is the mechanism chapter, so it is the one where a reader will
believe they understood it when they did not. A traced case with a real failure in it is
what a slide can do about that.

**Two adjacent effects did not survive, and should not be cited here.** Perceptual
disfluency — the claim that harder-to-read text is better remembered — failed three
replications and a corrected meta-analysis put the pooled effect at −0.008
([Weissgerber et al. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC7854329/)). Seductive
details is contested: by Rey's own count 15 of 39 studies did not support it, one failed
replication used Harp & Mayer's original materials, and publication bias is suspected.
Oppenheimer's "erudite vernacular" result is often quoted as an argument for simple wording,
but its outcome measure is *judged author intelligence*, not comprehension, and its
manipulation was thesaurus substitution. It is an argument against padding, not against
precision — which is the same thing it says about ELI5 paraphrase of an exact term.

No study in any of this used software developers or technical documentation.


## What the comma rule was measured against

The rule went in on evidence from a paper and was then run through `skill-creator` against
the pre-revision skill: three prompts that supply the source facts and ask for Korean slides,
so the test isolates prose from research. Rate of a connective ending followed by a comma,
averaged over the three:

| | mechanism | limits | tl-dr + conclusion | mean |
|---|---|---|---|---|
| before the rule | 45.5% | 50.0% | 22.2% | **39.2%** |
| rule as first written | 0.0% | 0.0% | 0.0% | **0.0%** |
| after the repair below | 0.0% | 0.0% | 7.1% | — |

Human-written Korean sits at 4.1–13.3%. **The first version overcorrected into a document
with almost no commas at all** — overall comma rate fell to 0.21% of Hangul characters
against 1.13% for people, and 0.88% for the same skill before the rule. The rule had two ✗/✓
pairs that both said cut, and one prose sentence saying keep it where the reader needs it.
The prose sentence did nothing; a rule made of prohibitions is followed as a prohibition.

**The repair was to add a ✓ where a comma survives, and the first attempt at that made it
worse.** The keeper example read `keyword 경로에만 캐시가 있어서, 짧은 질의가…` — `있어서` is
a connective ending, so the example demonstrated the banned pattern under a ✓. The next run
copied it verbatim in form (`없어서,`) and the rate went back to 20.0%. Replacing it with a
comma between parallel items (`그 아래는 keyword, 위는 embed 경로로 간다`) brought that eval
to 0.0% connective commas at a 1.38% overall comma rate, against 1.40% before the rule
existed. The tell is gone and the comma budget is intact.

The lesson generalizes past this rule: **an exemplar is read as a pattern to copy, so a ✓
carrying the defect teaches the defect.** Check the good example against the gate too.

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

`prose-ko.md` said of `~가 아니라 ~다`: *"Once or twice per document, not per slide."* Taken
as a budget, that made it the one gate rule that fired — 179 occurrences across the 18
published documents, 146 of them over a two-per-document limit, blocking 14 documents.

Reading the 34 in the worst one settles it the other way. What the pattern catches here is:

- **verbatim quotes.** `AI 경쟁의 다음 전장은 모델이 아니라 회사의 기억입니다` is a Threads
  post quoted as evidence. Quotes are not edited.
- **attribution corrections.** `단일 라운드라는 판단 자체는 원문이 아니라 DataSci Ocean 의
  읽기이고` — deleting the frame loses who said it.
- **the use `prose-ko.md` explicitly permits**, correcting an answer the reader is holding:
  `이 수치는 사용자 수가 아니라 호출 수에 가깝다`.

The decorative doubling the rule was written against is rare in this corpus. The frame is a
strong measured signal — roughly nine times more frequent in model-written Korean than in
human-written Korean — but the signal is about a register, and a regular expression cannot
tell a register from three legitimate constructions that share its shape.

So it moved to `--counts`, alongside `~에 있어서`, which failed the same test for the same
reason. **A pattern whose matches in the corpus are mostly correct has no business blocking a
document**, and the rule text now names what separates the two: delete the first half and see
whether the sentence lost anything.

Every rule left in the gate now blocks zero of the 18 published documents. That is the state
a regression guard should be in — it holds a line the library already meets, rather than
asking the library to move.
