import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fontProblems, fontSlug } from "../../public/js/font-format.js";

const FONTS_DIR = new URL("../../public/fonts/", import.meta.url);
const DEFAULT_FONT = "classic.json";
const GITHUB_USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

const files = readdirSync(FONTS_DIR).filter(file => file.endsWith(".json") && file !== "index.json");

function check() {
  const names = new Map();
  let failed = false;

  for (const file of files) {
    let problems;
    try {
      const font = JSON.parse(readFileSync(new URL(file, FONTS_DIR), "utf8"));
      problems = fontProblems(font, { requireAll: true });
      if (problems.length === 0) {
        const slug = fontSlug(font.name);
        if (file !== `${slug}.json`) {
          problems.push(`file should be named ${slug}.json`);
        }
        if (!GITHUB_USERNAME.test(font.author)) {
          problems.push("author should be a GitHub username");
        }
        if (names.has(slug)) {
          problems.push(`same name as ${names.get(slug)}`);
        }
        names.set(slug, file);
      }
    } catch (error) {
      problems = [`not valid JSON (${error.message})`];
    }

    if (problems.length > 0) {
      failed = true;
      problems.forEach(problem => console.log(`::error file=public/fonts/${file}::${problem}`));
    } else {
      console.log(`ok ${file}`);
    }
  }

  process.exitCode = failed ? 1 : 0;
}

function index() {
  const sorted = files.sort((a, b) => (a === DEFAULT_FONT ? -1 : b === DEFAULT_FONT ? 1 : a.localeCompare(b)));
  writeFileSync(new URL("index.json", FONTS_DIR), `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`indexed ${sorted.length} fonts`);
}

const commands = { check, index };
const command = commands[process.argv[2]];
if (!command) {
  console.log("usage: node .github/scripts/fonts.mjs check|index");
  process.exitCode = 1;
} else {
  command();
}
