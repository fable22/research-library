# CLAUDE.md

A repository for researching, writing, and verifying research documents. `README.md`
covers what the repository is and the `meta.json` field reference; `index.html` is the
published listing. This file holds only what every session needs. Research procedure and
writing rules live in the skills.

**Documents are written in Korean.** These instructions are English; the product is not.
Technical terms stay English (RAG, embedding, corpus, ablation, tool call, F1, multi-hop).

## Where things go

| Path | Contents | git |
|---|---|---|
| `research/<slug>/` | The publication. `index.html` and `meta.json` only | committed |
| `.research/<slug>/` | Working artifacts. `sources.jsonl`, `claims.jsonl`, `unread.txt`, `notes/` | ignored |

The two trees always use the **same directory name**. There is no mapping file, so a
mismatch means the document and its evidence can no longer be connected. Directory names
are `YYYY-MM-DD-slug`, with the slug in lowercase letters and hyphens.

## Which skill to use

Three skills divide the work. Research method, the twelve-chapter skeleton, and the prose
rules all live inside them. Restating any of it here means two copies that drift apart.

| Skill | When | Context |
|---|---|---|
| `research-source` | Starting research. Pinning the corpus to a portable identity | author's |
| `research-doc` | Writing the document | the **same** author context |
| `research-verify` | After the draft is finished | **deliberately three fresh contexts** |

Do not break context between `research-source` and `research-doc`. When a claim starts to
feel shaky mid-sentence you have to be able to reopen the source, and across a context
boundary only a summary survives.

`research-verify` is the opposite: always break it. The context that wrote the document
knows why it wrote each sentence, so it reaches the same conclusion from the same
reasoning. Self-review confirms what it already believes.

## Commands

```bash
node scripts/new-doc.mjs <slug> <paper|oss>      # scaffold both trees
node scripts/new-doc.mjs rename <old> <new>      # move both trees together
node scripts/check-doc.mjs research/<slug>       # gate on the publication
node scripts/build-index.mjs                     # regenerate the listing

node .claude/skills/research-verify/scripts/check-claims.mjs research/<slug>
node .claude/skills/research-source/scripts/record-unread.mjs research/<slug>
```

Never move a document directory by hand. The slug is usually settled only after the
research is done, and `rename` is what keeps the two trees aligned, rewrites `og:url`, and
follows the links other documents point at it with.

The two in `scripts/` operate on the publication, so a person runs them whether or not any
skill is loaded. The two inside skills only touch `.research/` working artifacts.

**Each script's `--help` lists its rules.** Copying that list into this file guarantees it
goes stale when the code changes.

Gates are pass or block; there is no warning tier. To make an exception, name the rule id
with `--allow=<rule-id>`. A warning tier means everything drains into warnings and nothing
gets fixed.

## Rules

**Do not publish a number you have not opened the source to confirm.** Not from memory,
not from an estimate.

**Say plainly whether you looked at the rendered page.** If no headless browser was
available, say that. Passing the static gate and rendering correctly are different things.

**Do not hand-edit generated files.** `build-index.mjs` writes the root `index.html` and
the `<!-- docs:start -->` … `<!-- docs:end -->` block in `README.md`. Manual edits vanish
on the next build.

**Commit and push only when asked.** When to commit and when to publish is decided at the
time, not by procedure.

## Commits

One line in the subject saying what was done. The body records the document's topic and
the sources it rests on. Adding one document is one commit.
