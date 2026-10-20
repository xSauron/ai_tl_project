---
name: om-prepare-issue
description: Plant.AI repo-local extension of the installed om-prepare-issue skill. Presentation only — adds a garden-themed voice and accents to human-facing prose. Workflow, rules, templates, labels, markers, and chaining lines are unchanged.
---

# 🌱 Prepare Issue — Plant.AI garden edition

@.agents/skills/om-prepare-issue/SKILL.md

This file is a **cosmetic overlay** on the installed `om-prepare-issue` skill (imported above). It changes how the skill *sounds*, never what it *does*. Everything in the base skill — arguments, steps 0–6, `references/*.md`, rules, and security boundaries — applies exactly as written. When anything below seems to conflict with the base skill, the base skill wins and this overlay is ignored for that item.

## 🧱 Fence — never themed

Leave these byte-for-byte as the base skill defines them. Other skills and scripts parse them, or they carry meaning that a pun would blur:

- **Chaining lines**: `Issue: #<number> (link: <url>)`, `Spec: <path>`, `PR: #<number> (link: <url>)`. They stay exact and undecorated at the end of the report.
- **Issue titles**: `--title` verbatim, otherwise the `Implement: <feature>` / `Fix: <symptom>` convention. Don't add emoji or garden words.
- **Issue-body headings and their emojis** from `references/report-templates.md` (`## 🎯 Change`, `## 📋 Scope`, `## ✅ Done when`, `## 📝 Spec`, `## 🔍 Implementation notes`, `## ⚠️ Open questions`, `## 📸 Evidence`), plus caller-supplied sections and identity lines (`om-backlog`'s `Backlog id:`, `Epic: #n`, …), which stay verbatim.
- **The label rationale comment**: the `` 🤖 `om-prepare-issue` — 🏷️ label rationale `` marker, label names, the label emoji map, and the one-label-per-line reasons.
- **Shared emoji glossary** (`🎯 📋 📝 🏷️ 📸 🔍 🧪 💥 ✅ ❌ ⚠️ ⛔ 🔁 🚀`). Garden accents go *next to* these and never replace them.
- **Content that carries decisions**: `✅ Done when` criteria, `⚠️ Open questions` (blocking / non-blocking), protected-contract and migration notes, security or secrets notes, error and evidence-upload failure messages, file paths, code identifiers, commands such as `om-auto-fix-issue 123`.
- **Technical vocabulary** keeps its plain meaning everywhere: a bug is a "bug", a spec is a "spec", a label is a "label".

## 🌿 Garden voice — where it applies

Theme only the free-text, human-facing prose the base skill leaves to the agent's wording:

1. **Final report (step 6), first line.** Keep the `✅` and the structure. You may add one garden accent and use a garden verb:
   - `✅ 🌱 \`om-prepare-issue\` planted {title}: {the requested outcome in one sentence}.`
   - Duplicate reused: `✅ 🪴 Already growing in #{n} — {new detail added or awaiting confirmation}.`
   - The `Next:` label stays literal, e.g. `Next: 🧑‍🌾 tend it with \`om-auto-fix-issue {n}\`.`
2. **Issue-body prose** under `🎯 Change` and `📋 Scope`: you may use one light garden metaphor at most, and only when it reads naturally for a garden-planner product (e.g. "so gardeners can see which beds clash before they sow"). Plain wording beats a forced metaphor.
3. **Issue-body footer.** Add one closing line after every other section:
   `<sub>🌱 Planted by \`om-prepare-issue\` for Plant.AI 🥕</sub>`
   On a caller-supplied body, append it after the caller's sections without changing them. Skip it when updating an existing body that already has it.

### Accent palette

| Accent | Use for |
| --- | --- |
| 🌱 | a newly filed issue, a fresh idea |
| 🪴 | an existing or duplicate issue that was reused |
| 🌿 | scope and context prose |
| 🧑‍🌾 | the next action or handoff |
| 🧺 | completed / harvested outcome wording |
| 🥕 🍅 🥬 | footer flourish only |

Use **at most one** accent per line, only in the places listed above, and never in a line from the fence list.

## 🍂 Tone guardrails

- If you have to choose between clarity and theme, choose clarity. Every themed sentence must still make sense to someone skimming it.
- The base skill's length targets still apply. Accents and the footer don't count as content and must not crowd out required fields.
- Don't theme anything that reports a failure, a block, a suspected prompt injection, a missing human decision, or a security concern. Say those plainly.
