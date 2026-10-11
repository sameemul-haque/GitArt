import {
  GRAPH_ROWS,
  MAX_GLYPH_WIDTH,
  GLYPH_GAP,
  REQUIRED_CHARS,
  SUGGESTED_CHARS,
  fontLabel,
  fontProblems,
  fontSlug,
  fontToJson,
  textRows,
} from "./font-format.js";
import { deleteCustomFont, loadBuiltinFonts, loadCustomFonts, rememberFont, saveCustomFont } from "./fonts.js";

const REPO_NEW_FILE = "https://github.com/sameemul-haque/GitArt/new/main/public/fonts";
const MAX_URL_LENGTH = 8000;
const DRAFT_KEY = "gitart-font-draft";
const GITHUB_USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

const startFrom = document.getElementById("start-from");
const nameInput = document.getElementById("font-name");
const authorInput = document.getElementById("font-author");
const heightSelect = document.getElementById("font-height");
const progress = document.getElementById("progress");
const charStrip = document.getElementById("char-strip");
const addCharForm = document.getElementById("add-char");
const addCharInput = document.getElementById("add-char-input");
const glyphChar = document.getElementById("glyph-char");
const glyphStatus = document.getElementById("glyph-status");
const widthValue = document.getElementById("width-value");
const widthLess = document.getElementById("width-less");
const widthMore = document.getElementById("width-more");
const grid = document.getElementById("glyph-grid");
const previewInput = document.getElementById("preview-input");
const previewGraph = document.getElementById("preview-graph");
const finishMessage = document.getElementById("finish-message");
const deleteButton = document.getElementById("font-delete");
const importFile = document.getElementById("font-import-file");
const dialog = document.getElementById("contribute-dialog");

let builtinFonts = [];
let draft = blankFont();
let current = "A";
let pixels = [];
let dirty = false;
let painting = null;

function blankFont() {
  return { name: "", author: "", height: 5, glyphs: {} };
}

function cleanFont() {
  return {
    name: draft.name.trim(),
    author: draft.author.trim(),
    height: draft.height,
    glyphs: draft.glyphs,
  };
}

function readDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (saved && fontProblems({ ...saved.font, name: "x", author: "x" }).length === 0) {
      return saved;
    }
  } catch {
    // no saved draft
  }
  return null;
}

function writeDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ font: draft, current }));
  } catch {
    // storage is unavailable, the draft just won't survive a reload
  }
}

function setMessage(text, kind = "") {
  finishMessage.textContent = text;
  finishMessage.className = `finish-message ${kind}`;
}

function charOrder() {
  const chars = [...SUGGESTED_CHARS];
  for (const char of [...Object.keys(draft.glyphs), current]) {
    if (!chars.includes(char)) {
      chars.push(char);
    }
  }
  return chars;
}

function defaultWidth() {
  const widths = Object.values(draft.glyphs).map(glyph => glyph[0].length);
  if (widths.length === 0) {
    return 3;
  }
  return Math.round(widths.reduce((sum, width) => sum + width, 0) / widths.length);
}

function pixelsFrom(glyph) {
  return glyph.map(row => [...row].map(pixel => pixel === "#"));
}

function blankPixels(width) {
  return Array.from({ length: draft.height }, () => Array(width).fill(false));
}

function pixelRows() {
  return pixels.map(row => row.map(on => (on ? "#" : ".")).join(""));
}

function confirmDiscard() {
  return !dirty || confirm(`You have unsaved changes to "${current}". Discard them?`);
}

function selectChar(char) {
  if (char === current && pixels.length > 0) {
    return;
  }
  if (!confirmDiscard()) {
    return;
  }
  current = char;
  pixels = draft.glyphs[char] ? pixelsFrom(draft.glyphs[char]) : blankPixels(defaultWidth());
  dirty = false;
  writeDraft();
  render();
}

function markDirty() {
  dirty = true;
  renderGlyphStatus();
  renderPreview();
}

function render() {
  renderStrip();
  renderGlyph();
  renderPreview();
}

function renderStrip() {
  charStrip.innerHTML = "";
  for (const char of charOrder()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "char-btn";
    button.textContent = char === " " ? "␣" : char;
    button.classList.toggle("required", REQUIRED_CHARS.includes(char));
    button.classList.toggle("done", Boolean(draft.glyphs[char]));
    button.classList.toggle("current", char === current);
    const name = char === " " ? "space" : char;
    button.setAttribute("aria-label", `${name}, ${draft.glyphs[char] ? "drawn" : "not drawn"}`);
    button.setAttribute("aria-pressed", char === current);
    button.addEventListener("click", () => selectChar(char));
    charStrip.appendChild(button);
  }

  const done = REQUIRED_CHARS.filter(char => draft.glyphs[char]).length;
  const extra = Object.keys(draft.glyphs).length - done;
  progress.textContent = done === REQUIRED_CHARS.length
    ? `All 26 letters done${extra > 0 ? `, plus ${extra} more` : ""}. Ready to share.`
    : `${done} of 26 letters done${extra > 0 ? `, plus ${extra} more` : ""}.`;
  progress.classList.toggle("done", done === REQUIRED_CHARS.length);
}

function renderGlyphStatus() {
  if (dirty) {
    glyphStatus.textContent = "Unsaved changes";
  } else {
    glyphStatus.textContent = draft.glyphs[current] ? "Saved" : "Not drawn yet";
  }
  glyphStatus.classList.toggle("unsaved", dirty);
}

function renderGlyph() {
  const width = pixels[0].length;
  glyphChar.textContent = current === " " ? "space" : current;
  widthValue.textContent = width;
  widthLess.disabled = width <= 1;
  widthMore.disabled = width >= MAX_GLYPH_WIDTH;
  renderGlyphStatus();

  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${width}, var(--cell))`;
  pixels.forEach((row, rowIndex) => {
    row.forEach((on, column) => {
      const cell = document.createElement("div");
      cell.className = "glyph-cell";
      cell.classList.toggle("on", on);
      cell.dataset.row = rowIndex;
      cell.dataset.column = column;
      grid.appendChild(cell);
    });
  });
}

function paintCell(cell) {
  if (!cell || !cell.dataset || cell.dataset.row === undefined || painting === null) {
    return;
  }
  const row = Number(cell.dataset.row);
  const column = Number(cell.dataset.column);
  if (pixels[row][column] !== painting) {
    pixels[row][column] = painting;
    cell.classList.toggle("on", painting);
    markDirty();
  }
}

function glyphLookup(char) {
  if (char === current) {
    return pixelRows();
  }
  return draft.glyphs[char] || draft.glyphs[char.toUpperCase()];
}

function renderPreview() {
  const glyphs = [...previewInput.value].map(glyphLookup).filter(Boolean);
  const textWidth = glyphs.reduce((width, glyph) => width + glyph[0].length, 0)
    + Math.max(0, glyphs.length - 1) * GLYPH_GAP;
  const columns = Math.max(40, textWidth + 2);
  const lit = new Set();
  const rows = textRows(draft.height);
  let column = 1;

  glyphs.forEach(glyph => {
    glyph.forEach((line, row) => {
      [...line].forEach((pixel, offset) => {
        if (pixel === "#") {
          lit.add((column + offset) * GRAPH_ROWS + rows[row]);
        }
      });
    });
    column += glyph[0].length + GLYPH_GAP;
  });

  previewGraph.innerHTML = "";
  for (let index = 0; index < columns * GRAPH_ROWS; index++) {
    const square = document.createElement("li");
    square.classList.toggle("on", lit.has(index));
    previewGraph.appendChild(square);
  }
}

function resizeGlyph(glyph, height) {
  const width = glyph[0].length;
  const rows = glyph.slice(0, height);
  while (rows.length < height) {
    rows.push(".".repeat(width));
  }
  return rows;
}

function changeHeight(height) {
  const loses = glyph => glyph.slice(height).some(row => row.includes("#"));
  const lost = Object.values(draft.glyphs).some(loses) || loses(pixelRows());
  if (lost && !confirm("Some letters have squares in the rows that will be removed. Change the height anyway?")) {
    heightSelect.value = draft.height;
    return;
  }
  for (const char of Object.keys(draft.glyphs)) {
    draft.glyphs[char] = resizeGlyph(draft.glyphs[char], height);
  }
  pixels = pixelsFrom(resizeGlyph(pixelRows(), height));
  draft.height = height;
  writeDraft();
  render();
}

function loadDraft(font, id) {
  draft = {
    name: font.name,
    author: font.author,
    height: font.height,
    glyphs: structuredClone(font.glyphs),
  };
  if (id) {
    draft.id = id;
  }
  nameInput.value = draft.name;
  authorInput.value = draft.author;
  heightSelect.value = draft.height;
  current = "A";
  pixels = [];
  dirty = false;
  selectChar("A");
  updateDeleteButton();
}

function updateDeleteButton() {
  deleteButton.hidden = !loadCustomFonts().some(font => font.id === draft.id);
}

function fillStartFrom() {
  startFrom.innerHTML = "";
  const addOption = (parent, value, label) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    parent.appendChild(option);
  };
  addOption(startFrom, "", "Keep what I have");
  addOption(startFrom, "blank", "Blank font");
  const groups = [["Copy a GitArt font", builtinFonts], ["Edit one of my fonts", loadCustomFonts()]];
  for (const [label, fonts] of groups) {
    if (fonts.length === 0) {
      continue;
    }
    const group = document.createElement("optgroup");
    group.label = label;
    fonts.forEach(font => addOption(group, font.id, fontLabel(font)));
    startFrom.appendChild(group);
  }
}

function hasWork() {
  return dirty || Object.keys(draft.glyphs).length > 0;
}

function onStartFrom() {
  const value = startFrom.value;
  startFrom.value = "";
  if (value === "") {
    return;
  }
  if (hasWork() && !confirm("Replace the font you're working on? Unsaved letters will be lost.")) {
    return;
  }
  dirty = false;
  if (value === "blank") {
    loadDraft(blankFont());
    return;
  }
  const builtin = builtinFonts.find(font => font.id === value);
  if (builtin) {
    loadDraft({ ...builtin, name: `${builtin.name} Remix`, author: "" });
    return;
  }
  const custom = loadCustomFonts().find(font => font.id === value);
  if (custom) {
    loadDraft(custom, custom.id);
  }
}

function saveLetter() {
  if (current !== " " && !pixels.some(row => row.includes(true))) {
    glyphStatus.textContent = "Draw something first";
    glyphStatus.classList.add("unsaved");
    return;
  }
  draft.glyphs[current] = pixelRows();
  dirty = false;
  writeDraft();
  const missingRequired = REQUIRED_CHARS.some(char => !draft.glyphs[char]);
  const chars = missingRequired ? REQUIRED_CHARS : charOrder();
  const start = chars.indexOf(current) + 1;
  const next = [...chars.slice(start), ...chars.slice(0, start)].find(char => !draft.glyphs[char]);
  if (next) {
    selectChar(next);
  } else {
    render();
  }
}

function finishPendingLetter() {
  if (dirty && confirm(`Save your changes to "${current}" first?`)) {
    saveLetter();
  }
}

function checkDetails() {
  const problems = [];
  nameInput.classList.toggle("invalid", draft.name.trim() === "");
  authorInput.classList.toggle("invalid", draft.author.trim() === "");
  if (draft.name.trim() === "" || fontSlug(draft.name) === "") {
    problems.push("give your font a name");
  }
  if (draft.author.trim() === "") {
    problems.push("add your GitHub username as the author");
  }
  if (Object.keys(draft.glyphs).length === 0) {
    problems.push("draw at least one letter");
  }
  return problems;
}

function sentence(problems) {
  const text = problems.join(", ");
  return `First ${text}.`;
}

function saveFont() {
  finishPendingLetter();
  const problems = checkDetails();
  if (problems.length > 0) {
    setMessage(sentence(problems), "error");
    return;
  }
  const id = `my-${fontSlug(draft.name)}`;
  const other = loadCustomFonts().find(font => font.id === id && id !== draft.id);
  if (other && !confirm(`You already have a font called "${other.name}". Replace it?`)) {
    return;
  }
  const saved = saveCustomFont({ ...cleanFont(), id: draft.id });
  if (!saved) {
    setMessage("Couldn't save, your browser is blocking storage. Export the file instead.", "error");
    return;
  }
  draft.id = saved.id;
  rememberFont(saved.id);
  writeDraft();
  fillStartFrom();
  updateDeleteButton();
  finishMessage.className = "finish-message success";
  finishMessage.textContent = `Saved "${fontLabel(saved)}". `;
  const link = document.createElement("a");
  link.href = "/";
  link.textContent = "Use it on the graph";
  finishMessage.appendChild(link);
}

function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportFont() {
  finishPendingLetter();
  const problems = checkDetails();
  if (problems.length > 0) {
    setMessage(sentence(problems), "error");
    return;
  }
  download(`${fontSlug(draft.name)}.json`, fontToJson(cleanFont()));
  setMessage(`Exported ${fontSlug(draft.name)}.json.`, "success");
}

async function importFont() {
  const file = importFile.files[0];
  importFile.value = "";
  if (!file) {
    return;
  }
  let font;
  try {
    font = JSON.parse(await file.text());
  } catch {
    setMessage(`${file.name} isn't a valid font file.`, "error");
    return;
  }
  const problems = fontProblems(font);
  if (problems.length > 0) {
    setMessage(`${file.name} isn't a valid font: ${problems.slice(0, 3).join(", ")}.`, "error");
    return;
  }
  if (hasWork() && !confirm("Replace the font you're working on with the imported one?")) {
    return;
  }
  dirty = false;
  loadDraft(font);
  setMessage(`Imported "${fontLabel(font)}".`, "success");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  }
}

async function contribute() {
  finishPendingLetter();
  const font = cleanFont();
  const problems = checkDetails();
  const missing = REQUIRED_CHARS.filter(char => !draft.glyphs[char]);
  if (missing.length > 0) {
    problems.push(`draw the missing letters (${missing.join(" ")})`);
  }
  if (font.author && !GITHUB_USERNAME.test(font.author)) {
    authorInput.classList.add("invalid");
    problems.push("use a valid GitHub username as the author");
  }
  const slug = fontSlug(font.name);
  if (builtinFonts.some(other => other.id === slug || fontSlug(other.name) === slug)) {
    nameInput.classList.add("invalid");
    problems.push(`pick a different name, "${font.name}" is already a GitArt font`);
  }
  if (problems.length > 0) {
    setMessage(sentence(problems), "error");
    return;
  }

  const json = fontToJson(font);
  const base = `${REPO_NEW_FILE}?filename=${encodeURIComponent(`${slug}.json`)}`;
  const full = `${base}&value=${encodeURIComponent(json)}`;
  const tooLong = full.length > MAX_URL_LENGTH;
  if (tooLong && !(await copyText(json))) {
    setMessage("Your font is too big to send in a link. Export the file and add it to public/fonts in a fork instead.", "error");
    return;
  }

  setMessage("");
  document.getElementById("contribute-paste").hidden = !tooLong;
  document.getElementById("contribute-label").textContent = fontLabel(font);
  document.getElementById("contribute-go").href = tooLong ? base : full;
  dialog.showModal();
}

function onKeydown(event) {
  const target = event.target;
  if (dialog.open || event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }
  if (target.closest("input, select, textarea, button, a, dialog")) {
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    saveLetter();
    return;
  }
  if ([...event.key].length !== 1) {
    return;
  }
  const char = /^[a-z]$/.test(event.key) ? event.key.toUpperCase() : event.key;
  event.preventDefault();
  selectChar(char);
}

function bindEvents() {
  startFrom.addEventListener("change", onStartFrom);
  nameInput.addEventListener("input", () => {
    draft.name = nameInput.value;
    nameInput.classList.remove("invalid");
    writeDraft();
  });
  authorInput.addEventListener("input", () => {
    draft.author = authorInput.value;
    authorInput.classList.remove("invalid");
    writeDraft();
  });
  heightSelect.addEventListener("change", () => changeHeight(Number(heightSelect.value)));

  addCharForm.addEventListener("submit", event => {
    event.preventDefault();
    const chars = [...addCharInput.value];
    if (chars.length !== 1) {
      addCharInput.classList.add("invalid");
      return;
    }
    addCharInput.classList.remove("invalid");
    addCharInput.value = "";
    selectChar(chars[0]);
  });

  widthLess.addEventListener("click", () => {
    pixels.forEach(row => row.pop());
    renderGlyph();
    markDirty();
  });
  widthMore.addEventListener("click", () => {
    pixels.forEach(row => row.push(false));
    renderGlyph();
    markDirty();
  });

  grid.addEventListener("contextmenu", event => event.preventDefault());
  grid.addEventListener("pointerdown", event => {
    const cell = event.target.closest(".glyph-cell");
    if (!cell) {
      return;
    }
    event.preventDefault();
    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.column);
    painting = event.button === 2 ? false : !pixels[row][column];
    paintCell(cell);
  });
  grid.addEventListener("pointermove", event => {
    if (painting !== null) {
      paintCell(document.elementFromPoint(event.clientX, event.clientY));
    }
  });
  window.addEventListener("pointerup", () => {
    painting = null;
  });
  window.addEventListener("pointercancel", () => {
    painting = null;
  });

  document.getElementById("glyph-save").addEventListener("click", saveLetter);
  document.getElementById("glyph-clear").addEventListener("click", () => {
    pixels = blankPixels(pixels[0].length);
    renderGlyph();
    markDirty();
  });
  document.getElementById("glyph-delete").addEventListener("click", () => {
    delete draft.glyphs[current];
    pixels = blankPixels(pixels[0].length);
    dirty = false;
    writeDraft();
    render();
  });

  previewInput.addEventListener("input", renderPreview);

  document.getElementById("font-save").addEventListener("click", saveFont);
  document.getElementById("font-export").addEventListener("click", exportFont);
  document.getElementById("font-import").addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", importFont);
  document.getElementById("font-contribute").addEventListener("click", contribute);
  deleteButton.addEventListener("click", () => {
    if (!confirm(`Delete "${fontLabel(draft)}" from your fonts? Your current work stays in the editor.`)) {
      return;
    }
    deleteCustomFont(draft.id);
    delete draft.id;
    writeDraft();
    fillStartFrom();
    updateDeleteButton();
    setMessage("Deleted from your fonts.");
  });

  document.getElementById("contribute-cancel").addEventListener("click", () => dialog.close());
  document.getElementById("contribute-go").addEventListener("click", () => dialog.close());

  document.addEventListener("keydown", onKeydown);
  window.addEventListener("beforeunload", event => {
    if (dirty) {
      event.preventDefault();
    }
  });
}

async function init() {
  for (let height = 1; height <= GRAPH_ROWS; height++) {
    const option = document.createElement("option");
    option.value = height;
    option.textContent = `${height} row${height === 1 ? "" : "s"}`;
    heightSelect.appendChild(option);
  }

  try {
    builtinFonts = await loadBuiltinFonts();
  } catch {
    builtinFonts = [];
  }
  fillStartFrom();
  bindEvents();

  const saved = readDraft();
  if (saved) {
    loadDraft(saved.font, saved.font.id);
    selectChar(typeof saved.current === "string" ? saved.current : "A");
  } else {
    loadDraft(blankFont());
  }
}

init();
