# Documenting an open-source project

How the chapters get filled when the corpus is a repository. Read `prose-ko.md` and
`visual.md` alongside this.

The reader is deciding whether to adopt. Everything below serves that.

## Chapter contents

| # | What goes here |
|---|---|
| ③ | The manual work this project removed. What people did before it existed |
| ④ | Architecture: package boundaries, what talks to what, where state lives |
| ⑤ | Comparison against the alternative someone would otherwise reach for |
| ⑥ | One request traced through the code, every hop with a quote and a `file:line` |
| ⑦ | Commit SHA, files read, directories not opened, whether the clone was shallow |
| ⑧ | What the code does. Benchmarks only if the project publishes them, marked as self-reported |
| ⑨ | Code not read, README-versus-code discrepancies, what reading alone cannot establish |
| ⑩ | adopt / trial / assess / hold, with the grounds and what it costs to keep running |

## Chapter ⑥ is the one that carries the document

Anyone can restate a README. A traced request path is what a reader cannot get without
opening the repo themselves.

Each hop needs a verbatim quote of 40+ characters and a `file:line` locator at the pinned
commit. `check-claims.mjs` confirms the quote appears within ±15 lines of the locator.

**Locators are relative to the repository root, always.** Verification runs
`git show <commit>:<path>`. When the interesting code sits several levels down, the path
you have been reading is not the path that resolves — `sub/pkg/src/thing.ts:806`, not
`src/thing.ts:806`. Rewrite them from the root before they reach the document.

Pick a path that ends inside **one process boundary**. Across packages, run one
compression subagent per hop and stitch them together yourself.

## Chapter ⑩: what a developer actually checks

- **License.** Read the `LICENSE` file, not the badge and not the GitHub API field. An API
  value of `NOASSERTION` or "Other" does not mean unlicensed; it usually means the file
  carries a preamble the classifier could not parse, and the preamble is where carve-outs
  live ("third-party components keep their original license, everything else is AGPLv3").
  So the answer is rarely a single SPDX id. "Which parts are under which license" is what
  adoption turns on, and only the whole file answers it.
- **Maintenance vitality.** Commit frequency, contributor spread, release cadence. If
  the clone was shallow, **these numbers do not exist in your checkout** and asserting
  them is invention. `check-claims.mjs` blocks these only when the claim is filed as
  `kind:"history"`. Issue response time is not in the checkout at any depth.
- **Dependency risk.** What does adopting this tie you to: a vendor API, a runtime
  version, a paid service?
- **Extension points.** When requirements drift slightly, where do you have to cut?
- **Tests and release discipline.** Do tests exist, what do they cover, are releases
  regular?
- **What installing it leaves behind.** Config files edited, hooks injected, dependencies
  installed, outbound calls made, files written outside the repo, and whether anything
  removes them again. A defensible side effect still belongs in the document.
- **Reversibility.** What does backing out require?

A document missing these cannot support an adoption decision no matter how well it
explains the architecture.

## Identity comes out of structure

Do not speculate about a project's intent. Read it off artifacts and cite them: the
license, the CI gates, the rules it writes for its own contributors, the disclaimers, and
what it explicitly refuses to do. Those together say what it is trying to be, and each one
is a file. A claim about intent with no file behind it is a guess.

## Limits specific to reading code

**Runtime behavior is not established by reading.** Say what the code contains and what
you could not check:

```
✗ 릴레이가 끊기면 자동 재접속한다
✓ 재접속 로직이 relay/src/reconnect.ts:88 에 있다. 백오프는 고정 1s 다.
  이 경로의 테스트는 찾지 못했다 (grep -rn 'reconnect' **/*.test.ts → 0건)
```

**Claims that depend on code you did not open.** The common failure is assuming a callee
lacks a behavior it actually implements, because you only read the caller. When a claim
leans on what another function does, open that function.

**Absence claims have no locator.** "This is not configurable", "there is no retry path"
cannot cite a line. The evidence is the search that came back empty, recorded as a
command someone else can re-run.

## README against code

Report discrepancies where adoption rests on them. **Do not sweep.** Asked in general
whether the docs match the code, you will flag nearly everything and the report becomes
worthless. Name the handful of things the decision turns on and check only those. Check the
handful of things the decision depends on.

## Chapter ⑦ for a repository

```
커밋 <sha> 기준. <N>개 파일 중 <M>개를 열었다.
<디렉터리> 와 <디렉터리> 는 열지 않았다. 그래서 <몇 장>이 얕다.
shallow clone 이라 커밋 이력은 확인할 수 없다.
```

The third clause of the second line is the one that carries information. Naming an unread
directory without saying what it costs the document is filler.

Check the stated numbers against each other before shipping: files read plus files in the
unread directories has to account for the total. A long unread list is not a defect and
should not be padded down by opening files you do not need.
