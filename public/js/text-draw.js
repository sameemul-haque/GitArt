import { FONT, GLYPH_GAP, TEXT_ROWS } from "./font.js";
import { getSquares, getYear } from "./calendar.js";

const textInput = document.getElementById("text-input");
const textClear = document.getElementById("text-clear");
const textHint = document.getElementById("text-hint");
const textWrapper = textInput.parentElement;
let textSquares = new Map();

export function initTextDraw() {
  textInput.addEventListener("input", applyText);
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
    applyText();
    textInput.focus();
  });
  updateHint("", textColumns().length, false, []);
}

export function redrawText() {
  textSquares = new Map();
  applyText();
}

function textColumns() {
  const squares = getSquares();
  const columns = [];
  for (let column = 0; column * 7 < squares.length; column++) {
    const usable = TEXT_ROWS.every(row => {
      const square = squares[column * 7 + row];
      return square && !square.classList.contains("previous-year");
    });
    if (usable) {
      columns.push(column);
    }
  }
  return columns;
}

function glyphsFor(text) {
  return [...text.toUpperCase()].map(char => FONT[char]).filter(Boolean);
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
  const target = new Set();
  let column = columns[0];

  glyphsFor(text).forEach((glyph, index) => {
    if (index > 0) {
      column += GLYPH_GAP;
    }
    glyph.forEach((pixels, row) => {
      [...pixels].forEach((pixel, offset) => {
        if (pixel === "#") {
          target.add(squares[(column + offset) * 7 + TEXT_ROWS[row]]);
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

function lettersLeft(text, available) {
  const used = textWidth(text);
  const perLetter = 3 + GLYPH_GAP;
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
    message = `Only "${text.toUpperCase()}" fits in ${year}. Generate these commands, then pick another year for the rest.`;
  } else if (left === 0) {
    message = `${year} is full. Generate these commands, then pick another year to add more.`;
  } else if (skipped.length > 0) {
    message = `Skipped ${skipped.map(char => `"${char}"`).join(", ")} since the graph can't draw it.`;
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
  const supported = chars.filter(char => FONT[char.toUpperCase()]).join("");
  const skipped = [...new Set(chars.filter(char => !FONT[char.toUpperCase()]))];
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
