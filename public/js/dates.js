export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toCommitDate(value) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return parseDate(value).toLocaleDateString("en", options);
}

export function toLongDate(value) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return parseDate(value).toLocaleDateString("en", options);
}
