import { readFile } from "node:fs/promises";
import path from "node:path";

async function rankDocuments(query, fileNames, documentsDirectory) {
  function scoreDocument(queryWords, documentText) {
    const documentWords = uniqueWords(documentText);
    return [...queryWords].filter((word) => documentWords.has(word)).length;
  }

  function uniqueWords(text) {
    const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    return new Set(words.filter((word) => !stopWords.has(word)));
  }

  const stopWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "how",
    "is",
    "of",
    "the",
    "to",
    "what",
    "s",
  ]);
  // create queryWords
  const queryWords = uniqueWords(query);
  // score every document
  const rankings = [];
  let match = null;
  for (const fileName of fileNames) {
    const content = await readFile(
      path.join(documentsDirectory, fileName),
      "utf8",
    );
    rankings.push({
      fileName,
      score: scoreDocument(queryWords, content),
    });
  }
  // sort rankings
  rankings.sort((left, right) => right.score - left.score);
  rankings[0]?.score > 0 ? (match = rankings[0]) : (match = null);
  // return rankings
  return { match, rankings };
}

export { rankDocuments };
