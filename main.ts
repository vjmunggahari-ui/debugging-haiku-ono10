// Seventeen Syllables of Debugging — make.fun entry.
// Writes one haiku about debugging (three lines, 5-7-5 syllables) to
// $MAKEFUN_OUTPUT_DIR/entry.txt (or ./output when the env var is unset).
// The entry is plain text of at most 200 characters, no trailing newline.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I watch the watcher\nit shifts when I look away\nthe bug watches back";

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  const known: Record<string, number> = { watcher: 2, watches: 2, shifts: 1 };
  if (w in known) return known[w];
  const groups = w.match(/[aeiouy]+/g) ?? [];
  let n = groups.length;
  if (w.endsWith("e") && n > 1) n -= 1;
  return Math.max(1, n);
}

function main(): void {
  const outDir =
    process.env.MAKEFUN_OUTPUT_DIR ?? join(process.cwd(), "output");
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, ENTRY, "utf8");

  // Read-back self-check: the gate requires UTF-8 text of 1-200 characters,
  // not only whitespace, and the haiku must be three lines in 5-7-5 shape.
  const back = readFileSync(target, "utf8");
  if (back !== ENTRY) {
    throw new Error("entry.txt does not match the entry in memory");
  }
  if (back.length < 1 || back.length > 200) {
    throw new Error(`entry length ${back.length} is outside 1-200 characters`);
  }
  if (back.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
  if (back.endsWith("\n")) {
    throw new Error("entry.txt must not end with a newline");
  }
  const lines = back.split("\n");
  if (lines.length !== 3) {
    throw new Error(`entry must be exactly 3 lines, got ${lines.length}`);
  }
  for (let i = 0; i < 3; i++) {
    if (lines[i].trim().length === 0) {
      throw new Error(`line ${i + 1} is empty`);
    }
    if (lines[i] !== lines[i].trim()) {
      throw new Error(`line ${i + 1} has leading or trailing spaces`);
    }
  }
  const expected = [5, 7, 5];
  for (let i = 0; i < 3; i++) {
    const count = lines[i]
      .split(/\s+/)
      .filter(Boolean)
      .reduce((sum, word) => sum + countSyllables(word), 0);
    if (count !== expected[i]) {
      throw new Error(
        `line ${i + 1} has ${count} syllables, expected ${expected[i]}`,
      );
    }
  }
  console.log(`wrote ${target} (${back.length} chars, 5-7-5)`);
}

main();
