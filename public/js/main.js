import { initCalendar } from "./calendar.js";
import { initTextDraw, redrawText, clearGraph, setFont } from "./text-draw.js";
import { initFontPicker } from "./font-picker.js";
import { displayCode, copyCode, generateShellScript } from "./commands.js";
import { githubJoinDate } from "./github.js";

initCalendar(redrawText);
initTextDraw();
initFontPicker(setFont);

document.getElementById("join-date").addEventListener("click", githubJoinDate);
document.getElementById("clear-graph").addEventListener("click", clearGraph);
document.getElementById("generate-commands").addEventListener("click", displayCode);
document.getElementById("copy-commands").addEventListener("click", copyCode);
document.getElementById("download-script").addEventListener("click", generateShellScript);
