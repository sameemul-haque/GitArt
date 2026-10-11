import { initCalendar } from "./calendar.js";
import { initTextDraw, redrawText, clearGraph, setFont } from "./text-draw.js";
import { initFontPicker } from "./font-picker.js";
import { displayCode, copyCode, generateShellScript } from "./commands.js";
import { githubJoinDate } from "./github.js";

const clearButton = document.getElementById("clear-graph");
let undoClear = null;
let undoTimer;

function resetClearButton() {
  clearTimeout(undoTimer);
  undoClear = null;
  clearButton.textContent = "Clear graph";
  clearButton.classList.remove("undo");
}

// any change to the graph after clearing means there is nothing to undo anymore
const graphWatcher = new MutationObserver(function () {
  if (undoClear) {
    resetClearButton();
  }
});
graphWatcher.observe(document.querySelector(".squares"), { attributes: true, subtree: true, attributeFilter: ["data-level"] });

initCalendar(function () {
  resetClearButton();
  redrawText();
});
initTextDraw();
initFontPicker(setFont);

document.getElementById("join-date").addEventListener("click", githubJoinDate);
clearButton.addEventListener("click", function () {
  if (undoClear) {
    undoClear();
    resetClearButton();
    return;
  }
  const empty = [...document.querySelectorAll(".squares li")].every(square => square.getAttribute("data-level") === "0");
  if (empty) {
    return;
  }
  undoClear = clearGraph();
  graphWatcher.takeRecords();
  clearButton.textContent = "Undo clear";
  clearButton.classList.add("undo");
  undoTimer = setTimeout(resetClearButton, 5000);
});
document.getElementById("generate-commands").addEventListener("click", displayCode);
document.getElementById("copy-commands").addEventListener("click", copyCode);
document.getElementById("download-script").addEventListener("click", generateShellScript);
