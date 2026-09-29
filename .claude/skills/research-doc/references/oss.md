# Documenting an open-source project

How the chapters get filled when the corpus is a repository. Read `prose-ko.md` and
`visual.md` alongside this. The reader and the three kinds are defined in `../SKILL.md`; a
repository gets a `comparison`, an `explainer` or a `walkthrough` depending on what the
reader has to do with it, and the adoption checks below belong to the comparison.

## Chapter contents

| Chapter | What goes here | Kinds |
|---|---|---|
| `problem` | The manual work this project removed: what people did before it existed | all |
| architecture | Package boundaries, what talks to what, where state lives | walkthrough, explainer |
| comparison | The alternative someone would otherwise reach for | comparison |
| trace | One request through the code, every hop with a quote and a `file:line` | walkthrough |
| `setup` | Commit SHA, files read, directories not opened, whether the clone was shallow | all |
| `result-*` | What the code does; benchmarks only if the project publishes them, marked self-reported | all |
| `critique` | Code not read, README-versus-code discrepancies, what reading alone cannot establish | all |
| adoption call | adopt / trial / assess / hold, with the grounds and the cost of keeping it running | comparison |

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

## The trace carries the walkthrough

Anyone can restate a README; a traced request path is what a reader cannot get without
opening the repo. Each hop needs a verbatim quote of 40+ characters and a `file:line`
locator at the pinned commit, and the gate checks the quote sits at the locator.

Pick a path that **ends inside one process boundary**; crossing packages means one subagent
per hop, stitched together by you. Too narrow is a single-function trace that teaches
nothing, and too wide is a grand traversal with invented middle steps, which is worse
because it is confidently wrong. Both pass every gate.

The source is already text, so `<pre>` and tables absorb everything and the document never
draws its own architecture; a kernel, a state machine, a request path and a retry loop all
have shapes (`visual.md`).

**Write locators relative to the repository root.** Verification runs
`git show <commit>:<path>`, so when the interesting code sits several levels down, the path
you have been reading is not the path that resolves: `sub/pkg/src/thing.ts:806`, not
`src/thing.ts:806`. Rewrite them from the root before they reach the document.

## The adoption call: what a developer checks

- License. Read the `LICENSE` file; the badge and the GitHub API field are not enough. An API
  value of `NOASSERTION` or "Other" usually means the file carries a preamble the classifier
  could not parse, and the preamble is where carve-outs live ("third-party components keep
  their original license, everything else is AGPLv3"). Adoption turns on which parts fall
  under which license, and only the whole file answers that.
- Maintenance vitality: commit frequency, contributor spread, release cadence. A shallow
  clone does not hold these numbers, so asserting them is invention. The gate blocks them
  only when the claim is filed as `kind:"history"`, and issue response time is in no
  checkout at any depth.
- Dependency risk: a vendor API, a runtime version, a paid service.
- Extension points: where you have to cut when requirements drift slightly.
- Tests and release discipline: whether tests exist, what they cover, whether releases are
  regular.
- What installing it leaves behind: config files edited, hooks injected, dependencies
  installed, outbound calls made, files written outside the repo, and whether anything
  removes them. A defensible side effect still belongs in the document.
- Reversibility: what backing out requires.

A comparison missing these cannot support an adoption decision, however well it explains the
architecture.

## Identity comes out of structure

Read a project's intent off artifacts and cite them: the license, the CI gates, the rules it
writes for its own contributors, the disclaimers, and what it explicitly refuses to do.
Each is a file, and a claim about intent with no file behind it is a guess.

## Limits specific to reading code

**When a claim leans on what another function does, open that function.** The common failure
is assuming a callee lacks a behavior it implements because you read only the caller.

**Reading code tells you how it is written and nothing about what happens at run time**, so
asserting runtime behavior from source checks the README against the README. Constrain the
sentence to what you have:

```
✗ 릴레이가 끊기면 자동 재접속한다
✓ 재접속 로직이 relay/src/reconnect.ts:88 에 있다. 백오프는 고정 1s 다.
  이 경로의 테스트는 찾지 못했다 (grep -rn 'reconnect' **/*.test.ts → 0건)
```

The second is shorter on confidence and longer on use. An absence claim has no line to
cite, so its evidence is the search that came back empty, recorded as a command someone can
re-run. A sentence sourced from the project's own docs claims what the maintainers wrote, so
phrase it that way or open the implementation and source it there.

## README against code

Report a discrepancy where adoption rests on it. **Name the handful of things the decision
turns on and check only those.** Asked in general whether the docs match the code, you will
flag nearly everything, and a report that flags everything says nothing.

## The `setup` chapter for a repository

```
커밋 <sha> 기준. <N>개 파일 중 <M>개를 열었다.
<디렉터리> 와 <디렉터리> 는 열지 않았다. 그래서 <몇 장>이 얕다.
shallow clone 이라 커밋 이력은 확인할 수 없다.
```

The last clause of the second line carries the information; an unread directory named
without its cost to the document is filler. `../../research-source/SKILL.md` §8 has the rules
for what the numbers must add up to.
