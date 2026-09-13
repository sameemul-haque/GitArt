import { initCalendar } from "./calendar.js";
import { initTextDraw, redrawText } from "./text-draw.js";
import { displayCode, copyCode, generateShellScript } from "./commands.js";
import { githubJoinDate } from "./github.js";
import { openExamples, closeExamples } from "./examples.js";

initCalendar(redrawText);
initTextDraw();

document.getElementById("open-examples").addEventListener("click", openExamples);
document.getElementById("close-examples").addEventListener("click", closeExamples);
document.getElementById("join-date").addEventListener("click", githubJoinDate);
document.getElementById("generate-commands").addEventListener("click", displayCode);
document.getElementById("copy-commands").addEventListener("click", copyCode);
document.getElementById("download-script").addEventListener("click", generateShellScript);
