import { GLYPH_GAP, REQUIRED_CHARS, textRows } from "./font-format.js";
import { clearSquares, getSquares, getYear } from "./calendar.js";

const textInput = document.getElementById("text-input");
const textClear = document.getElementById("text-clear");
const textHint = document.getElementById("text-hint");
const textWrapper = textInput.parentElement;
let textSquares = new Map();
let font = { height: 5, glyphs: {} };
let typedText = "";

export function initTextDraw() {
  textInput.addEventListener("input", function () {
    typedText = textInput.value;
    applyText();
  });
  textInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      textInput.blur();
    }
  });
  textWrapper.addEventListener("animationend", function () {
    textWrapper.classList.remove("shake");
  });
  textClear.addEventListener("click", function () {
    textInput.value = "";
    typedText = "";
    applyText();
    textInput.focus();
  });
  updateHint("", textColumns().length, false, []);
}

export function setFont(newFont) {
  font = newFont;
  textInput.classList.toggle("mixed-case", hasLowercase());
  textInput.value = typedText;
  applyText();
}

export function redrawText() {
  textSquares = new Map();
  applyText();
}

// returns a function that puts everything back
export function clearGraph() {
  const levels = [...getSquares()].map(square => square.getAttribute("data-level"));
  const saved = { typedText, value: textInput.value, textSquares };

  textInput.value = "";
  typedText = "";
  textSquares = new Map();
  clearSquares();
  applyText();

  return function () {
    [...getSquares()].forEach((square, index) => square.setAttribute("data-level", levels[index]));
    typedText = saved.typedText;
    textInput.value = saved.value;
    textSquares = saved.textSquares;
    applyText();
  };
}

function textColumns() {
  const squares = getSquares();
  const rows = textRows(font.height);
  const columns = [];
  for (let column = 0; column * 7 < squares.length; column++) {
    const usable = rows.every(row => {
      const square = squares[column * 7 + row];
      return square && !square.classList.contains("previous-year");
    });
    if (usable) {
      columns.push(column);
    }
  }
  return columns;
}

function hasLowercase() {
  return Object.keys(font.glyphs).some(char => char !== char.toUpperCase());
}

function glyphFor(char) {
  return font.glyphs[char] || font.glyphs[char.toUpperCase()];
}

function glyphsFor(text) {
  return [...text].map(glyphFor).filter(Boolean);
}

function textWidth(text) {
  const glyphs = glyphsFor(text);
  if (glyphs.length === 0) {
    return 0;
  }
  const glyphWidth = glyphs.reduce((width, glyph) => width + glyph[0].length, 0);
  return glyphWidth + (glyphs.length - 1) * GLYPH_GAP;
}

function fitText(text, available) {
  let fitted = "";
  for (const char of text) {
    if (textWidth(fitted + char) > available) {
      break;
    }
    fitted += char;
  }
  return fitted;
}

function paintText(text) {
  const squares = getSquares();
  const columns = textColumns();
  const rows = textRows(font.height);
  const target = new Set();
  let column = columns[0];

  glyphsFor(text).forEach((glyph, index) => {
    if (index > 0) {
      column += GLYPH_GAP;
    }
    glyph.forEach((pixels, row) => {
      [...pixels].forEach((pixel, offset) => {
        if (pixel === "#") {
          target.add(squares[(column + offset) * 7 + rows[row]]);
        }
      });
    });
    column += glyph[0].length;
  });

  textSquares.forEach((previousLevel, square) => {
    if (!target.has(square)) {
      square.setAttribute("data-level", previousLevel);
      textSquares.delete(square);
    }
  });
  target.forEach(square => {
    if (!textSquares.has(square)) {
      textSquares.set(square, square.getAttribute("data-level"));
      square.setAttribute("data-level", "4");
    }
  });
}

function averageLetterWidth() {
  const widths = REQUIRED_CHARS.map(glyphFor).filter(Boolean).map(glyph => glyph[0].length);
  if (widths.length === 0) {
    return 3;
  }
  return Math.round(widths.reduce((sum, width) => sum + width, 0) / widths.length);
}

function lettersLeft(text, available) {
  const used = textWidth(text);
  const perLetter = averageLetterWidth() + GLYPH_GAP;
  if (used === 0) {
    return Math.floor((available + GLYPH_GAP) / perLetter);
  }
  return Math.max(0, Math.floor((available - used) / perLetter));
}

function shakeInput() {
  textWrapper.classList.remove("shake");
  void textWrapper.offsetWidth;
  textWrapper.classList.add("shake");
}

function updateHint(text, available, overflowed, skipped) {
  const year = getYear();
  const left = lettersLeft(text, available);
  let message;

  if (overflowed) {
    message = `Only "${hasLowercase() ? text : text.toUpperCase()}" fits in ${year}. Generate these commands, then pick another year for the rest.`;
  } else if (left === 0) {
    message = `${year} is full. Generate these commands, then pick another year to add more.`;
  } else if (skipped.length > 0) {
    message = `Skipped ${skipped.map(char => `"${char}"`).join(", ")} since this font can't draw ${skipped.length === 1 ? "it" : "them"}.`;
  } else if (text === "") {
    message = `Room for ${left} letters.`;
  } else {
    message = `Room for ${left} more letter${left === 1 ? "" : "s"}.`;
  }

  textHint.textContent = message;
  textHint.classList.toggle("full", overflowed || left === 0);
}

function applyText() {
  const chars = [...textInput.value];
  const supported = chars.filter(glyphFor).join("");
  const skipped = [...new Set(chars.filter(char => !glyphFor(char)))];
  const available = textColumns().length;
  const fitted = fitText(supported, available);
  const overflowed = fitted.length < supported.length;

  if (textInput.value !== fitted) {
    textInput.value = fitted;
  }
  if (overflowed) {
    shakeInput();
  }
  paintText(fitted);
  textClear.hidden = fitted === "";
  updateHint(fitted, available, overflowed, skipped);
}
