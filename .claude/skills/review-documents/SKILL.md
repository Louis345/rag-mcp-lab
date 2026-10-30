---
name: review-documents
description: Review new or changed files in documents/ for real personal data that code checks can't catch (real names, real organizations, real-looking statements labeled "synthetic"). Use before committing any change to documents/ or manifest.json.
---

# Review documents (layer 2: judgment)

`scripts/check-docs.mjs` (layer 1) already checks patterns: SSNs, emails, phones,
addresses, account numbers, API keys, manifest membership, and labels. Do not
repeat those checks. Your job is what code can't judge.

## Steps

1. Run `node scripts/check-docs.mjs`. If it fails, stop and report. Layer 1 must pass first.
2. List new or changed files: `git diff --name-only HEAD -- documents/` (plus untracked files in `documents/`).
3. For each file, read it fully and check:
   - **Real people:** names that look like real individuals rather than obvious placeholders (Jane Doe, "Fictional Fund").
   - **Real organizations or accounts:** real employers, brokerages, or account identifiers.
   - **Label truth:** if `manifest.json` says `synthetic`, does the content look invented (round numbers, placeholder names, a "fictional" note), or does it look like a real statement with a label typed on top?
4. Report in this format, one block per file:

   ```
   FILE: documents/<name>.md
   MANIFEST: synthetic | confirmed-non-sensitive
   VERDICT: CLEAR | FLAG
   REASONS: <specific lines or phrases, quoted>
   ```

## Rules

- **Never edit `manifest.json`, labels, or documents to make a file pass.** Only report.
- **Any FLAG escalates to the human.** Stop and ask Jamal to confirm before committing.
- When unsure, FLAG. A false alarm costs a minute; a leak can't be undone.
