# Rules for writing the skills in this directory

Not a skill. Nothing here loads during normal work. Read it before editing any `SKILL.md`
or `references/*.md`, and revise through `skill-creator`.

A skill body is recurring context cost on every invocation. These rules exist because that
cost is paid by the work, not by the author.

## Keep out

**Provenance.** The paper a rule came from, the measurement that justified it, the
citation, the story of the bug that produced it. Keep the rule; drop why you believe it.
Provenance belongs in `docs/`, outside this tree.

**Facts about a specific document or repository, used as illustration.** They go stale
faster than anything else in the file, and a stale instruction is worse than a missing one.

**Anything that reads as an agent talking.** Progress narration, one-off knowledge picked
up mid-task, notes to a future self, hedged asides.

**Restated rules.** One owner per rule. Point at it from the other files.

**Gate rules.** `--help` lists them and changes with the code.

## Keep in

**The rule, stated as an instruction.** Then one sentence on what goes wrong without it,
when that is not obvious. Not four.

**Worked specimens** — a ✗/✓ pair, a markup skeleton, a real caption. These earn their
length because they lose meaning when abstracted. `research-doc/references/prose-ko.md` is the model.

**The reason the ✗ fails, in the same entry.** A named failure carries a rule; a named
failure with the reason attached carries most of the gain over one without. A bare
prohibition is the weakest form a rule can take, and the weakness does not show up in
review, because a reader asked whether a prohibition helps says yes.

**Where the chain goes next, in its own section.** A skill that hands to another names the
file, says whether to keep or break the context, and says when its own step is done. Folded
into a paragraph it reads as a suggestion, and the chain stops at whichever skill buried it.

## Posture

Give direction, not specification. Tightening every detail removes the judgment the work
depends on and forecloses approaches that are different and better. State what the
constraint is and why it binds; leave how open unless the how is the rule.

Prefer the shorter version. If a rule lands in one sentence, one sentence is the whole
entry.

Rule count is itself a cost. Compliance falls as the number of simultaneous rules rises,
and it falls for rules the output already satisfies, so an entry that is merely true is not
free. Adding one means asking which one it displaces.
