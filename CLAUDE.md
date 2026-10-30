# RAG Retrieval Lab

@README.md

## What this is (and isn't)
- A learning lab for lexical retrieval: word overlap only.
- Not semantic search. Don't add embeddings, vector DBs, or LLM calls unless I ask.
- Dependency-free by design. No npm packages.

## How to run
- `node retrieve.mjs` runs all test cases, prints top-1 accuracy, and exits 1 if any test fails.
- `node scripts/check-docs.mjs` runs the deterministic document safety checks.

## Definition of done
- Both commands above exit 0.
- Accuracy does not drop.
- Every behavior change adds a test case in `retrieve.mjs`.
- Never edit an `expectedFileName` to make a failing test pass. Report the failure instead.

## Data rules
- Only synthetic or confirmed non-sensitive documents in `documents/`.
- Every document is listed in `documents/manifest.json`. Never add or change a manifest entry yourself; ask me.
- Synthetic documents state that they are synthetic in their first lines.
- Before committing changes to `documents/`, run the `review-documents` skill.

## How the rules are enforced (three layers)
1. Code: `scripts/check-docs.mjs` + `.githooks/pre-commit` block commits on patterns, manifest, labels, dependencies, and failing tests.
2. Judgment: the `review-documents` skill reviews what code can't (real names, whether a label is true).
3. Human: anything the skill flags goes to me before commit.
`.claude/settings.json` denies reading `.env`, `npm install`, and `git commit --no-verify`.

One-time setup after cloning: `git config core.hooksPath .githooks`
