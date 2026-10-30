import { rankDocuments } from "./retriever.mjs";
const testCases = [
  {
    query: "What is the retirement account's total market value?",
    expectedFileName: "retirement-account.md",
  },
  {
    query:
      "What annual spending rate does the investment policy establish, and how is it calculated?",
    expectedFileName: "investment-policy.md",
  },
  {
    query: "What was net income for the quarter ending September 30, 2026?",
    expectedFileName: "quarterly-statement.md",
  },
  {
    query: "How much money can the organization take from its fund every year?",
    expectedFileName: "investment-policy.md",
  },
  {
    query: "What is the time frame for the dispersion of the fund?",
    expectedFileName: "investment-policy.md",
  },
  {
    query: "who likes ice cream",
    expectedFileName: null,
  },
];

const results = [];
const fileNames = [
  "retirement-account.md",
  "investment-policy.md",
  "quarterly-statement.md",
];

let passedCount = 0;
let percentage = 0;

//automate the three manual retrieval cases so one command runs them and reports top-1 accuracy. No embeddings or dependencies yet.
for (const { query, expectedFileName } of testCases) {
  const { match, rankings } = await rankDocuments(
    query,
    fileNames,
    "./documents",
  );

  const actualFileName = match?.fileName ?? null;
  const passed = actualFileName === expectedFileName;
  if (passed) {
    passedCount++;
  }
  results.push({
    query,
    expectedFileName,
    actualFileName,
    rankings,
    passed,
  });
  // console.log(`Query: ${query}`);
  // console.log(`Expected: ${expectedFileName}, Actual: ${actualFileName}`);
  // console.log(`${passed ? "PASS" : "FAIL"}\n`);
  percentage = (passedCount / testCases.length) * 100;
}
if (passedCount !== testCases.length) {
  process.exitCode = 1;
}
console.dir(results, { depth: null });
console.log(
  `Top-1 Accuracy: ${passedCount}  / ${testCases.length} (${percentage.toFixed(2)}%).`,
);
