export const GRAPH_ROWS = 7;
export const MAX_GLYPH_WIDTH = 10;
export const GLYPH_GAP = 1;
export const REQUIRED_CHARS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
export const SUGGESTED_CHARS = [
  ...REQUIRED_CHARS,
  ..."0123456789",
  ..."!?.,:;'\"-_+=*#%/\\|()[]<>^",
];

export function textRows(height) {
  const start = Math.floor((GRAPH_ROWS - height) / 2);
  return Array.from({ length: height }, (_, row) => start + row);
}

export function fontSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function glyphProblem(glyph, height) {
  if (!Array.isArray(glyph) || glyph.length !== height) {
    return `needs exactly ${height} rows`;
  }
  const width = glyph[0].length;
  if (width < 1 || width > MAX_GLYPH_WIDTH) {
    return `must be 1 to ${MAX_GLYPH_WIDTH} squares wide`;
  }
  for (const row of glyph) {
    if (typeof row !== "string" || row.length !== width) {
      return "rows must all be the same width";
    }
    if (!/^[#.]+$/.test(row)) {
      return `rows can only contain "#" and "."`;
    }
  }
  return null;
}

export function fontProblems(font, { requireAll = false } = {}) {
  const problems = [];
  if (!font || typeof font !== "object") {
    return ["font is not an object"];
  }
  if (typeof font.name !== "string" || fontSlug(font.name) === "") {
    problems.push("name is missing");
  }
  if (typeof font.author !== "string" || font.author.trim() === "") {
    problems.push("author is missing");
  }
  if (!Number.isInteger(font.height) || font.height < 1 || font.height > GRAPH_ROWS) {
    problems.push(`height must be 1 to ${GRAPH_ROWS}`);
    return problems;
  }
  if (!font.glyphs || typeof font.glyphs !== "object") {
    problems.push("glyphs are missing");
    return problems;
  }
  for (const [char, glyph] of Object.entries(font.glyphs)) {
    if ([...char].length !== 1) {
      problems.push(`"${char}" is not a single character`);
      continue;
    }
    const problem = glyphProblem(glyph, font.height);
    if (problem) {
      problems.push(`"${char}" ${problem}`);
    }
  }
  if (requireAll) {
    const missing = REQUIRED_CHARS.filter(char => !font.glyphs[char]);
    if (missing.length > 0) {
      problems.push(`missing letters: ${missing.join(" ")}`);
    }
  }
  return problems;
}

export function fontToJson(font) {
  const order = char => {
    const index = SUGGESTED_CHARS.indexOf(char);
    return index === -1 ? SUGGESTED_CHARS.length : index;
  };
  const chars = Object.keys(font.glyphs).sort((a, b) => order(a) - order(b) || a.localeCompare(b));
  const lines = chars.map(char =>
    `    ${JSON.stringify(char)}: ${JSON.stringify(font.glyphs[char]).replace(/","/g, "\", \"")}`
  );
  return [
    "{",
    `  "name": ${JSON.stringify(font.name)},`,
    `  "author": ${JSON.stringify(font.author)},`,
    `  "height": ${font.height},`,
    "  \"glyphs\": {",
    lines.join(",\n"),
    "  }",
    "}",
    "",
  ].join("\n");
}

export function fontLabel(font) {
  return `${font.name} by ${font.author}`;
}
