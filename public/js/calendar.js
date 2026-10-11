import { formatDate, toLongDate } from "./dates.js";

const squaresContainer = document.querySelector(".squares");
const yearSelect = document.getElementById("year-select");

export function getSquares() {
  return squaresContainer.children;
}

export function getYear() {
  return yearSelect.value;
}

export function clearSquares() {
  for (const square of squaresContainer.children) {
    square.setAttribute("data-level", "0");
  }
}

export function initCalendar(onYearChange) {
  generateYearOptions();
  generateCalendar(parseInt(yearSelect.value));
  yearSelect.addEventListener("change", function () {
    generateCalendar(parseInt(yearSelect.value));
    onYearChange();
  });
  initPainting();
}

// mouse and pen paint on press and while dragging, touch keeps tap so the graph can still scroll
let paintLevel = null;
let skipClick = false;
let skipContextMenu = false;

function paintableSquare(target) {
  const square = target.closest("li[data-date]");
  return square && !square.classList.contains("previous-year") ? square : null;
}

function initPainting() {
  squaresContainer.addEventListener("pointerdown", function (event) {
    skipClick = false;
    const square = paintableSquare(event.target);
    if (!square || event.pointerType === "touch" || event.ctrlKey || event.button > 2) {
      return;
    }
    event.preventDefault();
    const currentLevel = parseInt(square.getAttribute("data-level"));
    if (event.button === 2) {
      skipContextMenu = true;
      paintLevel = Math.max(0, currentLevel - 1);
    } else {
      skipClick = true;
      paintLevel = Math.min(4, currentLevel + 1);
    }
    square.setAttribute("data-level", paintLevel);
  });

  squaresContainer.addEventListener("pointerover", function (event) {
    const square = paintableSquare(event.target);
    if (!square) {
      return;
    }
    square.title = toLongDate(square.getAttribute("data-date"));
    if (paintLevel !== null) {
      square.setAttribute("data-level", paintLevel);
    }
  });

  window.addEventListener("pointerup", function () {
    paintLevel = null;
  });
  window.addEventListener("pointercancel", function () {
    paintLevel = null;
  });

  squaresContainer.addEventListener("click", function (event) {
    const square = paintableSquare(event.target);
    if (skipClick || !square) {
      skipClick = false;
      return;
    }
    increaseLevel(square, parseInt(square.getAttribute("data-level")));
  });

  squaresContainer.addEventListener("contextmenu", function (event) {
    const square = paintableSquare(event.target);
    if (!square) {
      return;
    }
    event.preventDefault();
    if (skipContextMenu) {
      skipContextMenu = false;
      return;
    }
    decreaseLevel(square, parseInt(square.getAttribute("data-level")));
  });
}

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
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

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
