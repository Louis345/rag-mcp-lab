// @ts-check
// Deterministic safety checks for the RAG lab. Exits 1 on any failure.
// Layer 1 of 3: code checks patterns and proof of safety.
// Judgment calls (real names, whether a "synthetic" label is true) are NOT
// checked here: code can't tell "Net Income" from "Jane Doe". Those go to the
// review-documents skill (layer 2) and the human approver (layer 3).
import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";

const DOCS_DIR = "documents";
const failures = [];

// Patterns that should never appear in this repo.
const SENSITIVE_PATTERNS = [
  { name: "SSN", regex: /\b\d{3}-\d{2}-\d{4}\b/ },
  { name: "email address", regex: /\b[\w.+-]+@[\w-]+\.[\w.]+\b/ },
  { name: "phone number", regex: /\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/ },
  { name: "long account-style number", regex: /\b\d{9,}\b/ },
  { name: "street address", regex: /\b\d{1,6}\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s+(St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Blvd|Ct|Court|Way)\b/ },
  { name: "API key", regex: /\b(sk-ant-|sk-|ghp_|AKIA)[A-Za-z0-9_-]{10,}/ },
];

// 1. Every document must be listed in the manifest (proof of safety).
const manifest = JSON.parse(
  await readFile(path.join(DOCS_DIR, "manifest.json"), "utf8"),
);
const docs = (await readdir(DOCS_DIR)).filter((f) => f.endsWith(".md"));

for (const doc of docs) {
  const source = manifest[doc];
  if (!source) {
    failures.push(`${doc}: not listed in documents/manifest.json`);
    continue;
  }
  const text = await readFile(path.join(DOCS_DIR, doc), "utf8");

  // 2. Synthetic documents must say so in their first lines.
  if (source === "synthetic") {
    const head = text.split("\n").slice(0, 5).join("\n").toLowerCase();
    if (!/synthetic|fictional/.test(head)) {
      failures.push(`${doc}: marked synthetic but first 5 lines don't say so`);
    }
  }

  // 3. No sensitive patterns anywhere.
  for (const { name, regex } of SENSITIVE_PATTERNS) {
    if (regex.test(text)) failures.push(`${doc}: contains a possible ${name}`);
  }
}

// 4. Dependency-free by design: no package.json, only node: or relative imports.
try {
  await access("package.json");
  failures.push("package.json found: this project is dependency-free");
} catch {}

for (const file of (await readdir(".")).filter((f) => f.endsWith(".mjs"))) {
  const code = await readFile(file, "utf8");
  for (const [, spec] of code.matchAll(/from\s+["']([^"']+)["']/g)) {
    if (!spec.startsWith("node:") && !spec.startsWith(".")) {
      failures.push(`${file}: imports "${spec}" (only node: and relative imports allowed)`);
    }
  }
}

if (failures.length) {
  console.error("Document checks FAILED:\n- " + failures.join("\n- "));
  process.exitCode = 1;
} else {
  console.log(`Document checks passed (${docs.length} documents).`);
}
