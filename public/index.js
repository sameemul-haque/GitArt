let gitCommitCommands = '';
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
    alert("Please select at least one date from the contribution graph!");
    return false;
  }
  const codeContainer = document.querySelector(".code");
  codeContainer.innerHTML = "";
  gitCommitCommands = '';

  dateList.forEach(date => {
    const gitCommand = `git commit --allow-empty --date="${date}" --allow-empty-message -m ""`;
    gitCommitCommands += gitCommand + " && ";
    const codeLine = document.createElement("p");
    codeLine.innerHTML = `<span class="color-1">${gitCommand}</span><span class="color-2">&&</span>`;
    codeContainer.appendChild(codeLine);
  });

  if (codeContainer.lastElementChild) {
    lastLine = codeContainer.lastElementChild;
    lastLine.removeChild(lastLine.lastElementChild);
  }
  return true;
}

function generateShellScript() {
  const codeContainer = document.querySelector(".code");
  const codeValue = codeContainer.innerText;

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
    const formBoxElement = document.querySelector(".form-box");
    formBoxElement.style.display = "none";
    const codeContainerElement = document.querySelector(".code-container");
    codeContainerElement.style.display = "block";
    codeContainerElement.scrollIntoView({ behavior: "smooth" });
  }
}

function displayForm() {
  if (!generateCode()) {
    return;
  }
  else {
    const codeContainerElement = document.querySelector(".code-container");
    codeContainerElement.style.display = "none";
    const formBoxElement = document.querySelector(".form-box");
    formBoxElement.style.display = "block";
    formBoxElement.scrollIntoView({ behavior: "smooth" });
  }
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
    codeIcon.innerHTML = `<path fill-rule="evenodd" clip-rule="evenodd" d="M17.482 4.272V5.53h2.108v.004a2.48 2.48 0 0 1 1.703.667c.432.408.702.973.704 1.598H22v11.93h-.003a2.2 2.2 0 0 1-.709 1.605 2.48 2.48 0 0 1-1.696.663V22H8.928v-.003a2.48 2.48 0 0 1-1.704-.668 2.2 2.2 0 0 1-.703-1.598h-.003v-2.674H4.41v-.003a2.48 2.48 0 0 1-1.703-.668 2.2 2.2 0 0 1-.704-1.598H2V4.271h.003a2.2 2.2 0 0 1 .709-1.605 2.48 2.48 0 0 1 1.696-.663V2h10.665v.003a2.48 2.48 0 0 1 1.703.668c.432.408.701.973.703 1.598h.003zM15.655 5.53V4.27h.003a.53.53 0 0 0-.174-.386.6.6 0 0 0-.41-.163v.004H4.41V3.72a.6.6 0 0 0-.41.165.54.54 0 0 0-.172.386h.003v10.517h-.003c0 .148.067.285.174.386a.6.6 0 0 0 .41.163v-.004h2.107V7.801h.004a2.2 2.2 0 0 1 .708-1.605 2.48 2.48 0 0 1 1.697-.662V5.53zm4.516 14.198V7.799h.003A.53.53 0 0 0 20 7.413a.6.6 0 0 0-.41-.162v.003H8.926V7.25a.6.6 0 0 0-.41.164.54.54 0 0 0-.172.386h.003v11.93h-.003c0 .148.067.285.174.386.105.1.252.163.41.163v-.004h10.664v.004a.6.6 0 0 0 .41-.165.53.53 0 0 0 .172-.385z" />`;
  }, 3000);

}

async function github_join_date() {
  const username = prompt("Enter your GitHub username:");
  if (!username) {
    console.log("No username entered");
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    const userData = await response.json();
    const options = { year: "numeric", month: "long", day: "numeric" };
    const joinDate = new Date(userData.created_at).toLocaleDateString("en", options);
    alert("Your GitHub join date is: " + joinDate);
  } catch (error) {
    alert("An error occurred while fetching the data. Please try again later.");
    return null;
  }
}

document.getElementById('generate-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  if (!generateCode()) {
    return;
  }
  else {
    const formData = new FormData(this);
    const requestData = {};
    for (const [key, value] of formData.entries()) {
      requestData[key] = value;
    }

    requestData.gitart_commit_command = gitCommitCommands.trim();

    try {
      // for deployment
      const response = await fetch('https://gitart.vercel.app/workflow', {
      // for local
      // const response = await fetch('http://localhost:3000/workflow', {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      if (response.ok) {
        alert('Workflow request sent successfully');
      } else {
        throw new Error('Failed to send workflow request');
      }
    } catch (error) {
      console.error('Error sending workflow request:', error);
      alert('An error occurred. Please try again later.');
      console.log('requestData:', requestData);
    }
  }
});