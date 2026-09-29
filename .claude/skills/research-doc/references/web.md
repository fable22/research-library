# Documenting a web source

How the chapters get filled when the corpus is a page with no commit and no arXiv version:
a vendor guide, an announcement, a blog post. Read `prose-ko.md` and `visual.md` alongside
this; the reader and the three kinds are defined in `../SKILL.md`. A guide is written in
the vendor's order; pick the chapters by the kind and let that order go.

## Chapter contents

| Chapter | What goes here | Kinds |
|---|---|---|
| `problem` | The question the page answers, and what a developer hits without the answer | all |
| map | The layers that change (request, response, conversation history, account), and what each change does | walkthrough, explainer |
| trace | One path through the page: each hop with a verbatim quote and its `§Heading` | walkthrough |
| comparison | The alternative the page itself sets against its subject | comparison |
| `setup` | Each URL with `retrieved_at`, the archive link, the sections read, the linked sub-pages not opened and which chapter is thinner for it | all |
| `result-*` | The page's own charts and tables, redrawn; values from the chart's `aria-label`, the SVG text or the table, never estimated from bar length | all |
| `critique` | What the page does not say, separated from what you inferred; a vendor's numbers marked as the vendor's | all |
| reception | What practitioners contested or confirmed, as who said what when, each re-fetched from its API and pinned; only reactions that change how a claim of the page reads, with the chapter they change | all, for an announcement |

## Locators and the fixed copy

A locator is the page's own heading, written `§Behavior differences`. The text you read is
saved as `notes/web/<id>.txt`, hashed into `sources.jsonl` as `text_sha256`, and committed;
`check-claims.mjs` matches every quote and every number against it. A quote that is only
in a chart goes into `notes/figures.md` with the chart's other points, and the gate looks
there too.

## Reception

An announcement is read against its reception. Take the launch thread on Hacker News
through the Algolia API (`https://hn.algolia.com/api/v1/items/<id>`), which returns the
comment's text, author and time, and pin each comment used as its own `web` source with a
`notes/web/<id>.txt` copy. A post you cannot fetch yourself does not go in; a subagent's
summary of one is hearsay. A reaction is a statement, not a fact: write who said what and
when, check it against the page and its linked documents, and attach what you found as the
condition. Keep only reactions that change how a claim of the page reads, and say which
chapter they change.

## Limits specific to a live page

A page changes without a version, so a claim carries the retrieval date, and a claim about
what the page does not say is an absence claim: record the search over the fixed copy that
came back empty. A guide describes what the vendor intends; whether the API does it is a
runtime claim, and the document says which of the two it has.
