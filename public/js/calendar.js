import { formatDate, toLongDate } from "./dates.js";

const squaresContainer = document.querySelector(".squares");
const yearSelect = document.getElementById("year-select");

export function getSquares() {
  return squaresContainer.children;
}

export function getYear() {
  return yearSelect.value;
}

export function initCalendar(onYearChange) {
  generateYearOptions();
  generateCalendar(parseInt(yearSelect.value));
  yearSelect.addEventListener("change", function () {
    generateCalendar(parseInt(yearSelect.value));
    onYearChange();
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
          target.title = toLongDate(target.getAttribute("data-date"));
        }
      });
    }

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
