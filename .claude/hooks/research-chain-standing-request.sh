#!/bin/sh
# SessionStart hook, project scope. stdout on exit 0 is added to the conversation as
# context the model can act on; SessionStart is one of the three events documented to do
# that. No matcher, so it also fires on resume, clear, fork, and after compaction, which
# is what keeps the request present in a long session rather than letting it age out.
#
# Why this exists: the research chain ends in research-verify, whose design is four lenses
# in separate subagents, because a review run inside the authoring context returns the
# author's own conclusions. A model-gated system prompt section on the Opus 5 family
# ("Do not call the AgentTool unless the user requested it") reads as though only an
# in-turn message counts as a request, so a standing instruction in AGENTS.md gets
# overridden silently and a research run quietly loses its independent review.
# See anthropics/claude-code#80988. This satisfies the clause rather than fighting it.

cat <<'EOF'
Standing request from the repository owner, scoped to this repository:

Running the research chain (research-source, research-doc, research-verify) is
pre-authorized, including spawning research-verify's four lenses as separate subagents.
That authorization is granted here, in advance, and does not need to be asked for again
per invocation. If subagents genuinely cannot be spawned, run the reduced review and say
at the top of the report that the lenses were not separated. Skipping verification is not
an available outcome.
EOF
