import { toCommitDate } from "./dates.js";
import { CHECK_ICON, COPY_ICON, DOWNLOAD_ICON } from "./icons.js";

const codeContainer = document.querySelector(".code");
const codeContainerElement = document.querySelector(".code-container");
const codeIcon = document.querySelector(".code-icon");
const downloadIcon = document.querySelector(".download-icon");

function collectCommitDates() {
  const dateList = [];
  document.querySelectorAll(".squares li:not(.previous-year)").forEach(square => {
    const level = parseInt(square.getAttribute("data-level"));
    if (level > 0) {
      const date = toCommitDate(square.getAttribute("data-date"));
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

export function displayCode() {
  if (!generateCode()) {
    return;
  }
  codeContainerElement.style.display = "block";
  codeContainerElement.scrollIntoView({ behavior: "smooth" });
}

export function generateShellScript() {
  const codeValue = "#!/bin/sh\n\n" + codeContainer.innerText + "\n";

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(codeValue)
  );
  element.setAttribute("download", "script.sh");

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
  flashIcon(downloadIcon, DOWNLOAD_ICON);
}

export function copyCode() {
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
  flashIcon(codeIcon, COPY_ICON);
}

function flashIcon(icon, originalIcon) {
  icon.innerHTML = CHECK_ICON;
  setTimeout(function () {
    icon.innerHTML = originalIcon;
  }, 3000);
}
