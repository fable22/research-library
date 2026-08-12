# The knowledge layer

This repository publishes research documents. This file describes the layer underneath
them — a ledger of claims pinned to sources, and the surfaces projected from it — and
what has been built, decided, and left open.

Written 2026-08-13 on branch `paper-claim-verification`. Read this before continuing that
work; it holds the reasoning that the commits assume.

## What the repository turned out to be

The starting request was to turn this into an LLM wiki you can query. The design that
survived contact with the repository is one step lower than that.

Every wiki implementation surveyed — Karpathy's gist and the four community builds of it,
openwiki, wenlan, llm-wiki-newsroom, the Wiki layer inside TencentDB Agent Memory — lints
its markdown. Broken wikilinks, orphan pages, malformed frontmatter. **None of them can
ask whether a page is still true**, because none of them keep a verbatim quote against a
pinned source.

This repository does. `check-claims.mjs` pulls a file out of a fixed commit and looks for
the quote at the locator. That is the rarest thing here, and a wiki built on top of the
documents rather than on top of the ledger would bury it under prose.

So the ledger is the artifact. `wiki/` and `research/<slug>/index.html` are both
projections of it.

```
source, pinned          repo@commit  ·  arxiv_id@version  ·  archived url
   └── .research/<slug>/claims.jsonl          the ledger, committed
          ├── wiki/**.md                      agent surface, generated, prescriptive
          └── research/<slug>/index.html      human surface, hand-written, gated
```

Neither projection generates the other, and that is deliberate. A deck carries judgment,
narrative, and drawing that no generator produces; a wiki page carries facts and links
that one does. What connects them is that no sentence may enter the deck without a claim
behind it, and the wiki is the ledger's readable face. The requested direction — markdown
under HTML — holds in the sense that matters.

## What was measured

Decisions below rest on counts taken on 2026-08-12 against the twelve published documents.

| | |
|---|---|
| Distinct numbers across the library | 562 |
| Of those, in the four paper documents | 405 (72%) |
| Documents with a ledger in this checkout | 6 of 12 |
| Inter-document links | 12, of which 6 are forced by `series-backlink` |
| Documents with no inter-document link at all | 5 |
| Shared external sources cited by 2+ documents | 7 of 31 |

Two readings follow.

**The verification gap was in the code, not the data.** `check-claims.mjs:289` skipped
every non-repo source behind a comment promising handling that was never written. Two
fabricated claims, one with the locator `!!!! not a locator at all ????`, passed with exit
0 and the message that the quote matched the pinned source. That held on every machine, so
no paper claim in this library had ever been checked.

**The cross-document layer was an assumption.** Six voluntary links across twelve
documents does not support "the wiki's value is connecting documents." It was projected
anyway, for one series, to find out.

The missing ledgers are not evidence of sloppy work. Research runs on several machines and
`.research/` was ignored, so each checkout holds only what it researched. That is the
problem the commit fixes, not a finding about the documents.

## Relations and their pass conditions

The state is a typed graph, and a node is weak by virtue of a relation rather than by
itself. This is EviGraph's contract, transposed; see the document in `research/`.

| Relation | Passes when | Enforced by |
|---|---|---|
| `Excerpt → extracted-from → Source` | the quote sits at the locator in the pinned bytes | `quote-match` |
| `Claim → grounded-in → Excerpt` | the claim's kind carries what that kind requires | `behavioral-limits`, `absence-search`, `claim-kind-source` |
| `Claim → cites → Table/Figure` | the number is inside the table or figure cited, not merely in the paper | `numeric-match` |
| `Derived → computed-from → Claim*` | every input is in the union of the scopes cited, and the note says the source never printed it | `derived-inputs`, `numeric-match` |
| `Page → summarizes → Claim` | the `claim:` reference resolves in the committed ledger | `check-wiki.mjs` `claim-ref` |
| `Page → newer-than → Evidence` | the page is not older than the ledger under it | `check-wiki.mjs` `stale` |

`Source` and `Excerpt` are anchors. When a source moves, they are not edited to match —
that is fabrication. They are re-pinned and re-verified, and a claim whose quote is gone
dies or gains a bound.

Two relations from the design are not implemented: `Claim → contradicts → Claim` and
`Finding → supported-by → Claim`. There was not enough cross-document material to justify
them yet.

## What is built

```bash
node .claude/skills/research-verify/scripts/pin-paper.mjs <arxiv_id> <version>
node .claude/skills/research-verify/scripts/check-claims.mjs research/<slug>
node scripts/check-wiki.mjs
```

**`pin-paper.mjs`** fetches `arxiv.org/e-print/<id>v<n>`, concatenates the `.tex` in name
order, and records a sha256. A given version returns the same bytes on refetch, so the
cache is disposable and `text_sha256` is the identity — another machine re-pins and
compares rather than trusting a path. It also runs `pdftotext` over the figure PDFs into a
second artifact keyed by `figures_sha256`, kept apart so a machine without poppler-utils
still reproduces the main hash.

**`check-claims.mjs`** gained the paper path. LaTeX numbers tables by order of appearance,
so `Table 10` cuts to the tenth table environment and both quote and numbers are sought
inside it. A `Figure N` locator resolves through `includegraphics` to that PDF's extracted
block. Section locators cannot be cut that way and fall back to the whole document; the
output says how many claims got the weaker check rather than reporting them as equal.

**`check-wiki.mjs`** is the code layer of reconcile: wikilink resolution, orphans,
frontmatter schema, claim references against the committed ledger, and staleness.

Thirteen tests cover the paper path, in
`.claude/skills/research-verify/scripts/test/paper-path.test.mjs`. They cover fabricated quotes, absent tables,
malformed locators, single-digit mutations, a real number cited to the wrong table, a
quote present in the paper but outside the cited table, derived claims missing their note
or inputs, an absent cache, and a tampered one. Five more cover the figure path and were
run inline rather than committed: a mutated plot label, a number real in a table but absent
from the figure cited, an out-of-range figure number, and misattribution to figure 1.

They need `arXiv:2605.25480v2` pinned first, which the file's header says.

## Decided

**Evidence commits.** `sources.jsonl` and `claims.jsonl` travel with the publication;
`notes/` does not. 93 KB across six documents. Without it a merged document cannot be
re-checked by anyone downstream and CI cannot see it at all.

**A paper's identity is `text_sha256`, not a path.** Same reason local paths were already
banned from `sources.jsonl`.

**No embeddings.** The library is 516 KB of extracted text across twelve documents;
WikiKV's breakdown point is 10⁴ KV pairs, two orders of magnitude away. Karpathy's gist
puts the threshold at roughly a hundred sources. Adding a vector index buys nothing and
takes on the three maintenance costs the Cerebras document lays out.

**Wiki pages are prescriptive, not encyclopedic.** Measured: raw structured data moved
agent accuracy 0.17 points, an agent-optimized prescriptive format 29.6. See
`~/github/adr-research/12-SSOT-COMPOSITION-RETRIEVAL.md`.

**Reconcile is two layers and the upper one never regenerates.** Code, per push: links,
orphans, schema, claim integrity, staleness. LLM, scheduled: contradictions, missing
concept pages, supersession — as itemized deltas with deterministic merge, opening a PR
and never merging one. Monolithic rewrite is measured to cause context collapse (18,282
tokens at 66.7% falling to 122 tokens at 57.1%, below no-adaptation), and EviGraph's own
repair loop measured regressions in task alignment and data consistency. Two independent
sources say the same thing.

**Superseded content leaves the default view.** Stale-state reference errors accounted for
47% of agent failures before pruning and 11% after. Linking to a superseded page is not
enough; it has to be out of the way.

## Open

- **Whether the wiki earns its place.** The projection exists and lints clean, but the
  blind comparison against reading the decks has not been run. The context that wrote the
  pages cannot run it.
- **Nine documents are not in the wiki**, and the index says so.
- **`kind:"web"` has no comparison path.** `check-claims.mjs` still skips it.
- **Existing paper sources predate `text_sha256`** and need re-pinning; the new
  `source-identity` rule blocks them, correctly.
- **The same paper is pinned at two versions.** `2605.25480` is v1 in the wikiloop ledger
  and v2 in the llm-wiki ledger. Recorded in a note; not resolved.
- **Two evidence directories have no document** and are left untracked rather than
  committed or deleted: `insane-search-adaptive-access`, which pins the same commit as the
  published `nonterminal-failure` and looks like a rename that bypassed
  `new-doc.mjs rename`, and `paseo-scale-probe`, researched and never published.
- **No GitHub Actions yet.** Both gates now read only committed files, so they can run.

## Handoff

The next step is to find out whether the wiki layer is worth keeping, because the query
surface and the scheduled reconcile both assume it is.

`docs/wiki-eval.md` holds the questions, fixed before the pages were written. **Do not
change them to fit the wiki.** If the evaluation is run, run it in a context that has not
read the decks, answer from `wiki/` alone and from the decks alone, and record both.

What a continuing context needs to know that is not in the commits:

- The design vocabulary came from this repository's own documents. Cloudflare computer for
  one authoritative store with mirrors, LoopX for `result < validate < writeback < spend`
  and keeping the model out of the decision path, EviGraph for the typed contract and the
  writing gate, TencentDB for the asset/content split and deterministic ids, WikiKV for
  schema evolution, WikiLoop for scoring edits by difference and running guard questions.
  Reading those six is the cheapest way in.
- The empirical constraints came from `~/github/adr-research`, which is prior work in this
  user's own hand and stronger evidence than anything found externally.
- Cost of building a ledger: 46 claims for the densest paper document took under four
  minutes of writing once the source's ten tables were laid out in one command, and eleven
  minutes from pin to first passing gate. The cost scales per table, not per number, so
  laying out ground truth first is the move. Backfilling the remaining eleven documents is
  a two-to-four hour job, not a token-budget problem.
- Nothing here has been merged to `main`.
