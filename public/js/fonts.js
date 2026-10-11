import { fontProblems, fontSlug } from "./font-format.js";

const CUSTOM_KEY = "gitart-fonts";
const SELECTED_KEY = "gitart-font";
export const DEFAULT_FONT_ID = "classic";

export async function loadBuiltinFonts() {
  const response = await fetch("fonts/index.json");
  const files = await response.json();
  const results = await Promise.allSettled(files.map(async file => {
    const font = await (await fetch(`fonts/${file}`)).json();
    return { ...font, id: file.replace(/\.json$/, ""), builtin: true };
  }));
  // skip a missing or broken file instead of losing every font
  const fonts = results
    .filter(result => result.status === "fulfilled" && fontProblems(result.value).length === 0)
    .map(result => result.value);
  return fonts.sort((a, b) => (a.id === DEFAULT_FONT_ID ? -1 : b.id === DEFAULT_FONT_ID ? 1 : a.name.localeCompare(b.name)));
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadCustomFonts() {
  const fonts = readStorage(CUSTOM_KEY, []);
  return Array.isArray(fonts) ? fonts.filter(font => fontProblems(font).length === 0) : [];
}

export function saveCustomFont(font) {
  const id = `my-${fontSlug(font.name)}`;
  const fonts = loadCustomFonts().filter(other => other.id !== id && other.id !== font.id);
  const saved = { ...font, id, builtin: false };
  fonts.push(saved);
  return writeStorage(CUSTOM_KEY, fonts) ? saved : null;
}

export function deleteCustomFont(id) {
  writeStorage(CUSTOM_KEY, loadCustomFonts().filter(font => font.id !== id));
}

export function selectedFontId() {
  return readStorage(SELECTED_KEY, DEFAULT_FONT_ID);
}

export function rememberFont(id) {
  writeStorage(SELECTED_KEY, id);
}
