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

  function generateCalendar(year) {
    squaresContainer.innerHTML = "";
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const millisecondsInDay = 24 * 60 * 60 * 1000;

    const startingDay = new Date(startDate.getFullYear(), 0, 1).getDay();

    let currentDate = startDate;
    currentDate = new Date(
      currentDate.getTime() - startingDay * millisecondsInDay
    );

    while (currentDate <= endDate) {
      const square = document.createElement("li");
      square.setAttribute("data-level", "0");
      square.setAttribute(
        "data-date",
        new Date(currentDate.getTime() + 1 * millisecondsInDay)
          .toISOString()
          .split("T")[0]
      );

      if (currentDate.getFullYear() < startDate.getFullYear()) {
        square.classList.add("previous-year");
      }

      dateforgitlist = [];
      squaresContainer.appendChild(square);
      if (!square.classList.contains("previous-year")) {
        square.addEventListener("click", function () {
          const currentLevel = parseInt(square.getAttribute("data-level"));
          const options = { year: "numeric", month: "short", day: "numeric" };
          dateforgit = new Date(square.getAttribute("data-date")).toLocaleDateString("en", options);
          dateforgitlist.push(dateforgit);
          console.log("dateforgit:", dateforgit);
          console.log("dateforgitlist: ", dateforgitlist);

          increaseLevel(square, currentLevel);
        });

        square.addEventListener("contextmenu", function (event) {
          event.preventDefault();
          const currentLevel = parseInt(square.getAttribute("data-level"));
          const options = { year: "numeric", month: "short", day: "numeric" };
          dateforgit = new Date(square.getAttribute("data-date")).toLocaleDateString("en", options);
          decreaseLevel(square, currentLevel);
          const index = dateforgitlist.indexOf(dateforgit);
          if (index > -1) {
            dateforgitlist.splice(index, 1);
          }
          console.log("dateforgit:", dateforgit);
          console.log("dateforgitlist: ", dateforgitlist);
        });

        square.addEventListener("mouseover", function (event) {
          const target = event.target;
          if (target && target.matches("li[data-date]")) {
            const date = target.getAttribute("data-date");
            const options = { year: "numeric", month: "long", day: "numeric" };
            target.title = new Date(date).toLocaleDateString("en", options);
          }
        });
      }

      currentDate = new Date(currentDate.getTime() + millisecondsInDay);
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
});

function generateCode() {
  const dateList = dateforgitlist;
  if (dateList.length === 0) {
    alert("empty");
    return;
  }
  const codeContainer = document.querySelector(".code");
  codeContainer.innerHTML = "";

  dateList.forEach(date => {
    const codeLine = document.createElement("p");
    codeLine.innerHTML = `<span class="color-1"> git commit --allow-empty --date=<span class="color-2">"${date}"</span> --allow-empty-message -m "" </span><span class="color-2">&&</span>`;
    codeContainer.appendChild(codeLine);

  });

  if (codeContainer.lastElementChild) {
    lastLine = codeContainer.lastElementChild;
    lastLine.removeChild(lastLine.lastElementChild);
  }

  const codeContainerElement = document.querySelector(".code-container");
  codeContainerElement.style.display = "block";
}

function copyCode() {
  const codeContainer = document.querySelector(".code");
  const codeValue = codeContainer.innerText;
  const codeText = document.createElement('textarea');
  codeText.value = codeValue;
  document.body.appendChild(codeText);

  codeText.select();
  codeText.setSelectionRange(0, 99999); // For mobile devices
  navigator.clipboard.writeText(codeText.value);
  document.body.removeChild(codeText);

  const codeHeader = document.querySelector(".code-header");
  const codeIcon = codeHeader.querySelector(".code-icon");
  codeIcon.setAttribute("fill", "#26a641");
  codeIcon.innerHTML = `<svg fill="#26a641" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.063 5.674a1 1 0 0 1 .263 1.39l-7.5 11a1 1 0 0 1-1.533.143l-4.5-4.5a1 1 0 1 1 1.414-1.414l3.647 3.646 6.82-10.002a1 1 0 0 1 1.39-.263Z"/></svg>`;

  setTimeout(function () {
    codeIcon.setAttribute("fill", "#26a641");
    codeIcon.innerHTML = `<path d="M89.62 13.96v7.73h12.2v.02c3.85.01 7.34 1.57 9.86 4.1 2.5 2.51 4.06 5.98 4.07 9.82h.02v73.3h-.02c-.01 3.84-1.57 7.33-4.1 9.86-2.51 2.5-5.98 4.06-9.82 4.07v.02H40.1v-.02c-3.84-.01-7.34-1.57-9.86-4.1-2.5-2.51-4.06-5.98-4.07-9.82h-.02V92.51h-12.2v-.02c-3.84-.01-7.34-1.57-9.86-4.1-2.5-2.51-4.06-5.98-4.07-9.82H0V13.95h.02c.01-3.85 1.58-7.34 4.1-9.86C6.63 1.59 10.1.03 13.94.02V0h61.73v.02c3.85.01 7.34 1.57 9.86 4.1 2.5 2.51 4.06 5.98 4.07 9.82h.02zm-10.58 7.73v-7.75h.02c0-.91-.39-1.75-1.01-2.37-.61-.61-1.46-1-2.37-1v.02H13.95v-.02c-.91 0-1.75.39-2.37 1.01-.61.61-1 1.46-1 2.37h.02v64.62h-.02c0 .91.39 1.75 1.01 2.37.61.61 1.46 1 2.37 1v-.02h12.2V35.64h.02c.01-3.85 1.58-7.34 4.1-9.86 2.51-2.5 5.98-4.06 9.82-4.07v-.02zm26.14 87.23V35.63h.02c0-.91-.39-1.75-1.01-2.37-.61-.61-1.46-1-2.37-1v.02H40.09v-.02c-.91 0-1.75.39-2.37 1.01-.61.61-1 1.46-1 2.37h.02v73.3h-.02c0 .91.39 1.75 1.01 2.37.61.61 1.46 1 2.37 1v-.02h61.73v.02c.91 0 1.75-.39 2.37-1.01.61-.61 1-1.46 1-2.37h-.02z" style="fill-rule:evenodd;clip-rule:evenodd"/>`;
  }, 3000);

}