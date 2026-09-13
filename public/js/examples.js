const examples = document.getElementById("examples");

export function openExamples() {
  examples.style.display = "block";
  document.body.style.overflow = "hidden";
}

export function closeExamples() {
  examples.style.display = "none";
  document.body.style.overflow = "auto";
}
