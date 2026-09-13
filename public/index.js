document.addEventListener("DOMContentLoaded", function () {
  const squaresContainer = document.querySelector(".squares");
  const yearSelect = document.getElementById("year-select");

  function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2005; year--) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }

    yearSelect.selectedIndex = 0;
  }
  generateYearOptions();

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function generateCalendar(year) {
    squaresContainer.innerHTML = "";
    const endDate = new Date(year, 11, 31);
    const startingDay = new Date(year, 0, 1).getDay();
    const currentDate = new Date(year, 0, 1 - startingDay);

    while (currentDate <= endDate) {
      const square = document.createElement("li");
      square.setAttribute("data-level", "0");
      square.setAttribute("data-date", formatDate(currentDate));

      if (currentDate.getFullYear() < year) {
        square.classList.add("previous-year");
      }

      squaresContainer.appendChild(square);
      if (!square.classList.contains("previous-year")) {
        square.addEventListener("click", function () {
          const currentLevel = parseInt(square.getAttribute("data-level"));
          increaseLevel(square, currentLevel);
        });

        square.addEventListener("contextmenu", function (event) {
          event.preventDefault();
          const currentLevel = parseInt(square.getAttribute("data-level"));
          decreaseLevel(square, currentLevel);
        });

        square.addEventListener("mouseover", function (event) {
          const target = event.target;
          if (target && target.matches("li[data-date]")) {
            const date = target.getAttribute("data-date");
            const options = { year: "numeric", month: "long", day: "numeric" };
            target.title = parseDate(date).toLocaleDateString("en", options);
          }
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  generateCalendar(parseInt(yearSelect.value));
  yearSelect.addEventListener("change", function () {
    generateCalendar(parseInt(yearSelect.value));
  });

  function increaseLevel(square, currentLevel) {
    if (currentLevel < 4) {
      const newLevel = currentLevel + 1;
      square.setAttribute("data-level", newLevel);
    }
  }

  function decreaseLevel(square, currentLevel) {
    if (currentLevel > 0) {
      const newLevel = currentLevel - 1;
      square.setAttribute("data-level", newLevel);
    }
  }

  const textInput = document.getElementById("text-input");
  const textClear = document.getElementById("text-clear");
  const textHint = document.getElementById("text-hint");
  const textWrapper = textInput.parentElement;
  const TEXT_ROWS = [1, 2, 3, 4, 5];
  const GLYPH_GAP = 1;
  const FONT = {
    "A": [".#.", "#.#", "###", "#.#", "#.#"],
    "B": ["##.", "#.#", "##.", "#.#", "##."],
    "C": [".##", "#..", "#..", "#..", ".##"],
    "D": ["##.", "#.#", "#.#", "#.#", "##."],
    "E": ["###", "#..", "##.", "#..", "###"],
    "F": ["###", "#..", "##.", "#..", "#.."],
    "G": [".##", "#..", "#.#", "#.#", ".##"],
    "H": ["#.#", "#.#", "###", "#.#", "#.#"],
    "I": ["###", ".#.", ".#.", ".#.", "###"],
    "J": ["..#", "..#", "..#", "#.#", ".#."],
    "K": ["#.#", "#.#", "##.", "#.#", "#.#"],
    "L": ["#..", "#..", "#..", "#..", "###"],
    "M": ["#.#", "###", "###", "#.#", "#.#"],
    "N": ["##.", "#.#", "#.#", "#.#", "#.#"],
    "O": ["###", "#.#", "#.#", "#.#", "###"],
    "P": ["##.", "#.#", "##.", "#..", "#.."],
    "Q": ["###", "#.#", "#.#", "###", "..#"],
    "R": ["##.", "#.#", "##.", "#.#", "#.#"],
    "S": [".##", "#..", ".#.", "..#", "##."],
    "T": ["###", ".#.", ".#.", ".#.", ".#."],
    "U": ["#.#", "#.#", "#.#", "#.#", "###"],
    "V": ["#.#", "#.#", "#.#", "#.#", ".#."],
    "W": ["#.#", "#.#", "###", "###", "#.#"],
    "X": ["#.#", "#.#", ".#.", "#.#", "#.#"],
    "Y": ["#.#", "#.#", ".#.", ".#.", ".#."],
    "Z": ["###", "..#", ".#.", "#..", "###"],
    "0": [".#.", "#.#", "#.#", "#.#", ".#."],
    "1": [".#.", "##.", ".#.", ".#.", "###"],
    "2": ["###", "..#", "###", "#..", "###"],
    "3": ["###", "..#", "###", "..#", "###"],
    "4": ["#.#", "#.#", "###", "..#", "..#"],
    "5": ["###", "#..", "###", "..#", "###"],
    "6": ["###", "#..", "###", "#.#", "###"],
    "7": ["###", "..#", "..#", "..#", "..#"],
    "8": ["###", "#.#", "###", "#.#", "###"],
    "9": ["###", "#.#", "###", "..#", "###"],
    " ": [".", ".", ".", ".", "."],
    "!": ["#", "#", "#", ".", "#"],
    "?": ["###", "..#", ".##", "...", ".#."],
    ".": [".", ".", ".", ".", "#"],
    ",": ["..", "..", "..", ".#", "#."],
    ":": [".", "#", ".", "#", "."],
    ";": ["..", ".#", "..", ".#", "#."],
    "'": ["#", "#", ".", ".", "."],
    "\"": ["#.#", "#.#", "...", "...", "..."],
    "-": ["...", "...", "###", "...", "..."],
    "_": ["...", "...", "...", "...", "###"],
    "+": ["...", ".#.", "###", ".#.", "..."],
    "=": ["...", "###", "...", "###", "..."],
    "*": ["#.#", ".#.", "###", ".#.", "#.#"],
    "#": ["#.#", "###", "#.#", "###", "#.#"],
    "%": ["#.#", "..#", ".#.", "#..", "#.#"],
    "/": ["..#", "..#", ".#.", "#..", "#.."],
    "\\": ["#..", "#..", ".#.", "..#", "..#"],
    "|": ["#", "#", "#", "#", "#"],
    "(": [".#", "#.", "#.", "#.", ".#"],
    ")": ["#.", ".#", ".#", ".#", "#."],
    "[": ["##", "#.", "#.", "#.", "##"],
    "]": ["##", ".#", ".#", ".#", "##"],
    "<": ["..#", ".#.", "#..", ".#.", "..#"],
    ">": ["#..", ".#.", "..#", ".#.", "#.."],
    "^": [".#.", "#.#", "...", "...", "..."],
  };
  let textSquares = new Map();

  function textColumns() {
    const squares = squaresContainer.children;
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
    const squares = squaresContainer.children;
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
    const year = yearSelect.value;
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
  updateHint("", textColumns().length, false, []);

  textInput.addEventListener("input", applyText);
  textWrapper.addEventListener("animationend", function () {
    textWrapper.classList.remove("shake");
  });
  textInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      textInput.blur();
    }
  });
  textClear.addEventListener("click", function () {
    textInput.value = "";
    applyText();
    textInput.focus();
  });
});

function collectCommitDates() {
  const dateList = [];
  const options = { year: "numeric", month: "short", day: "numeric" };
  document.querySelectorAll(".squares li:not(.previous-year)").forEach(square => {
    const level = parseInt(square.getAttribute("data-level"));
    if (level > 0) {
      const [year, month, day] = square.getAttribute("data-date").split("-").map(Number);
      const date = new Date(year, month - 1, day).toLocaleDateString("en", options);
      for (let i = 0; i < level; i++) {
        dateList.push(date);
      }
    }
  });
  return dateList;
}

function generateCode() {
  const dateList = collectCommitDates();
  if (dateList.length === 0) {
    alert("Please select at least one date from the contribution graph!");
    return false;
  }
  const codeContainer = document.querySelector(".code");
  codeContainer.innerHTML = "";
  dateList.forEach(date => {
    const gitCommand = `git commit --allow-empty --date="${date}" --allow-empty-message -m ""`;
    const codeLine = document.createElement("p");
    codeLine.innerHTML = `<span class="color-1">${gitCommand}</span><span class="color-2">&&</span>`;
    codeContainer.appendChild(codeLine);
  });

  if (codeContainer.lastElementChild) {
    const lastLine = codeContainer.lastElementChild;
    lastLine.removeChild(lastLine.lastElementChild);
  }
  return true;
}

function generateShellScript() {
  const codeContainer = document.querySelector(".code");
  const codeValue = "#!/bin/sh\n\n" + codeContainer.innerText + "\n";

  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(codeValue)
  );
  element.setAttribute("download", "script.sh");

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);

  const codeHeader = document.querySelector(".code-header");
  const downloadIcon = codeHeader.querySelector(".download-icon");
  downloadIcon.setAttribute("fill", "#26a641");
  downloadIcon.innerHTML = `<svg fill="#26a641" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.063 5.674a1 1 0 0 1 .263 1.39l-7.5 11a1 1 0 0 1-1.533.143l-4.5-4.5a1 1 0 1 1 1.414-1.414l3.647 3.646 6.82-10.002a1 1 0 0 1 1.39-.263Z"/></svg>`;

  setTimeout(function () {
    downloadIcon.setAttribute("fill", "#26a641");
    downloadIcon.innerHTML = `<path fill-rule="evenodd" clip-rule="evenodd" d="M7 17h10v-2H7zm5-3 4-4-1.4-1.4-1.6 1.55V6h-2v4.15L9.4 8.6 8 10zm0 8a9.7 9.7 0 0 1-3.9-.788 10.1 10.1 0 0 1-3.175-2.137q-1.35-1.35-2.137-3.175A9.7 9.7 0 0 1 2 12q0-2.075.788-3.9a10.1 10.1 0 0 1 2.137-3.175q1.35-1.35 3.175-2.137A9.7 9.7 0 0 1 12 2q2.075 0 3.9.788a10.1 10.1 0 0 1 3.175 2.137q1.35 1.35 2.137 3.175A9.7 9.7 0 0 1 22 12a9.7 9.7 0 0 1-.788 3.9 10.1 10.1 0 0 1-2.137 3.175q-1.35 1.35-3.175 2.137A9.7 9.7 0 0 1 12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4 6.325 6.325 4 12t2.325 5.675T12 20" />`;
  }, 3000);
}

function displayCode() {
  if (!generateCode()) {
    return;
  }
  else {
    const codeContainerElement = document.querySelector(".code-container");
    codeContainerElement.style.display = "block";
    codeContainerElement.scrollIntoView({ behavior: "smooth" });
  }
}

function copyCode() {
  const codeContainer = document.querySelector(".code");
  const codeValue = codeContainer.innerText;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(codeValue).then(showCopied, function () {
      fallbackCopy(codeValue);
    });
  } else {
    fallbackCopy(codeValue);
  }
}

function fallbackCopy(codeValue) {
  const codeText = document.createElement("textarea");
  codeText.value = codeValue;
  codeText.setAttribute("readonly", "");
  codeText.style.position = "fixed";
  codeText.style.top = "-1000px";
  document.body.appendChild(codeText);

  codeText.select();
  codeText.setSelectionRange(0, 99999); // For mobile devices
  const copied = document.execCommand("copy");
  document.body.removeChild(codeText);

  if (copied) {
    showCopied();
  } else {
    alert("Could not copy the commands. Please copy them manually.");
  }
}

function showCopied() {
  const codeHeader = document.querySelector(".code-header");
  const codeIcon = codeHeader.querySelector(".code-icon");
  codeIcon.setAttribute("fill", "#26a641");
  codeIcon.innerHTML = `<svg fill="#26a641" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.063 5.674a1 1 0 0 1 .263 1.39l-7.5 11a1 1 0 0 1-1.533.143l-4.5-4.5a1 1 0 1 1 1.414-1.414l3.647 3.646 6.82-10.002a1 1 0 0 1 1.39-.263Z"/></svg>`;

  setTimeout(function () {
    codeIcon.setAttribute("fill", "#26a641");
    codeIcon.innerHTML = `<path fill-rule="evenodd" clip-rule="evenodd" d="M17.482 4.272V5.53h2.108v.004a2.48 2.48 0 0 1 1.703.667c.432.408.702.973.704 1.598H22v11.93h-.003a2.2 2.2 0 0 1-.709 1.605 2.48 2.48 0 0 1-1.696.663V22H8.928v-.003a2.48 2.48 0 0 1-1.704-.668 2.2 2.2 0 0 1-.703-1.598h-.003v-2.674H4.41v-.003a2.48 2.48 0 0 1-1.703-.668 2.2 2.2 0 0 1-.704-1.598H2V4.271h.003a2.2 2.2 0 0 1 .709-1.605 2.48 2.48 0 0 1 1.696-.663V2h10.665v.003a2.48 2.48 0 0 1 1.703.668c.432.408.701.973.703 1.598h.003zM15.655 5.53V4.27h.003a.53.53 0 0 0-.174-.386.6.6 0 0 0-.41-.163v.004H4.41V3.72a.6.6 0 0 0-.41.165.54.54 0 0 0-.172.386h.003v10.517h-.003c0 .148.067.285.174.386a.6.6 0 0 0 .41.163v-.004h2.107V7.801h.004a2.2 2.2 0 0 1 .708-1.605 2.48 2.48 0 0 1 1.697-.662V5.53zm4.516 14.198V7.799h.003A.53.53 0 0 0 20 7.413a.6.6 0 0 0-.41-.162v.003H8.926V7.25a.6.6 0 0 0-.41.164.54.54 0 0 0-.172.386h.003v11.93h-.003c0 .148.067.285.174.386.105.1.252.163.41.163v-.004h10.664v.004a.6.6 0 0 0 .41-.165.53.53 0 0 0 .172-.385z" />`;
  }, 3000);
}

async function github_join_date() {
  const username = prompt("Enter your GitHub username:");
  if (!username) {
    return;
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`
    );
    if (!response.ok) {
      alert(
        response.status === 404
          ? "No GitHub user found with that username."
          : "Could not fetch the data. Please try again later."
      );
      return;
    }
    const userData = await response.json();
    const options = { year: "numeric", month: "long", day: "numeric" };
    const joinDate = new Date(userData.created_at).toLocaleDateString("en", options);
    alert("Your GitHub join date is: " + joinDate);
  } catch (error) {
    alert("An error occurred while fetching the data. Please try again later.");
    return null;
  }
}

function openExamples(){
  document.getElementById('examples').style.display = 'block'
  document.querySelector('body').style.overflow = 'hidden'
}

function closeExamples(){
  document.getElementById('examples').style.display = 'none'
  document.querySelector('body').style.overflow = 'auto'
}
