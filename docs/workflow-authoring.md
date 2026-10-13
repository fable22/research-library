# Rules for writing the workflows in `.claude/workflows/`

Not loaded by anything. Read it before editing a workflow script, together with the bundled
`/workflow-authoring` skill, which owns the script API (`agent`, `parallel`, `pipeline`,
`phase`, schemas, resume). This file holds only what that skill does not say and this
repository has paid for. Run `/reload-skills` after an edit so the session sees the new script.

It lives in `docs/` rather than next to the scripts because Claude Code loads every `.js`
file in `.claude/workflows/` as a command and documents nothing about other files there.

## `meta`

**The first statement, a plain object literal, `name` and `description` present.** Anything
computed in it — a variable, a call, a template with `${}` — drops the workflow from `/`
autocomplete with no error.

**`whenToUse` is the caller's manual.** It is printed in the listing a session reads before
it launches; the script body is not. Whatever a caller has to know to launch correctly goes
there, in one or two sentences, with a literal example. Skill listings truncate
`description` plus the when-to-use text at 1,536 characters; assume workflows share the
cap and stay well under it.

**`description` is one line about what the workflow does.** It is the permission dialog's
text and says nothing about inputs.

## `args`

Workflows have no args schema and no `argument-hint`. A launch from `/<name> some text`
can deliver the typed text as a string, and the main session follows the launcher's
template unless the listing told it otherwise. So the contract is the script's job, on
both ends:

1. **Name the shape in `whenToUse`** as a literal JSON example, with the required fields
   marked.
2. **Guard it at the top of the script, before the first `agent()`.** Parse a string with
   `JSON.parse`; launches here have delivered objects JSON-encoded more often than not.
   Then check every field the script reads: presence, type, and format where a format
   exists (a slug against the pattern the scaffold script enforces).
3. **Return one error that fixes the launch in one step.** List every problem found, not the
   first, then the full shape with field meanings and a minimal example. A message that
   names only the failure sends the caller into the source.
4. **Reject keys the script does not read.** In an unattended run, a misspelled optional
   field otherwise disappears without anyone seeing it.
5. **Do not read free text into fields.** A workflow cannot ask, so a parser guesses, and
   a guessed identifier (a slug names two directories here) costs a full run to discover.

```js
// ✗ the caller learns one missing field per launch, and nothing about the rest
if (!a.slug) return { error: 'args.slug is required' }
// ✓ every problem, then the shape and an example
if (problems.length) return { error: `args did not pass: ${problems.join('; ')}.\n\n${ARGS_SHAPE}` }
```

The shape then exists twice, in `whenToUse` and in the guard's constant, because `meta`
cannot reference a variable. Keep both in the script file with a comment tying them
together, and nowhere else: `AGENTS.md` and the skills point at the workflow, they do not
restate its fields. A field nothing reads comes out of both.

## The script body

**No `Date.now()`, `Math.random()`, or argless `new Date()`.** They throw, because resume
replays the script. A date the run needs (a slug's date) arrives through `args`.

**No filesystem, no `import()`.** The script cannot read the repository or share code with
`scripts/`, so a guard cannot be imported and an absolute path written in is the author's
machine, not the reader's. Agents start in the repository root; prompts use relative paths.

**Prompts point at skill files; they do not restate them.** Where a prompt and a skill
disagree, the skill is meant to win, and a restated rule is a second copy that drifts.

**`null` from `agent()` is a failure, not an empty result.** A dead agent resolves to
`null`; a check that reads it as "no findings" ships a round nobody read.

## Testing without launching

Launching a chain to test its guard spends a full run's agents and can open a PR. Slice the
guard out of the real file and run it under node instead; that tests the shipped text, not
a copy:

```js
// node harness.mjs .claude/workflows/<name>.js
import { readFileSync } from 'node:fs'
const src = readFileSync(process.argv[2], 'utf8')
new Function(`return (async () => {${src.replace('export const meta', 'const meta')}})()`) // whole script parses
// from the guard's first line to the first line after it; research-chain.js shown
const guard = src.slice(src.indexOf('const ARGS_SHAPE'), src.indexOf('const DOC ='))
const run = new Function('args', `${guard}; return { passed: a }`)
console.log(run('Target: free text'), run({ slug: '2026-10-07-x', kind: 'explainer', target: 'https://x' }))
```

Run it against free text, a correct object, the same object JSON-encoded, and one with an
unknown key. Say in the report that the workflow itself was not launched.
