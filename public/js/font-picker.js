import { fontLabel } from "./font-format.js";
import { DEFAULT_FONT_ID, loadBuiltinFonts, loadCustomFonts, rememberFont, selectedFontId } from "./fonts.js";

const button = document.getElementById("font-button");
const panel = document.getElementById("font-panel");
const search = document.getElementById("font-search");
const list = document.getElementById("font-list");

let fonts = [];
let selected = null;
let active = 0;
let onSelect = () => {};

function matches(font, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const label = fontLabel(font).toLowerCase();
  return words.every(word => label.includes(word));
}

function visibleFonts() {
  return fonts.filter(font => matches(font, search.value));
}

function renderList() {
  const shown = visibleFonts();
  list.innerHTML = "";
  active = Math.min(active, Math.max(0, shown.length - 1));

  if (shown.length === 0) {
    const empty = document.createElement("li");
    empty.className = "font-empty";
    empty.textContent = "No fonts match.";
    list.appendChild(empty);
    search.removeAttribute("aria-activedescendant");
    return;
  }

  let group = null;
  shown.forEach((font, index) => {
    const groupName = font.builtin ? "GitArt fonts" : "My fonts";
    if (groupName !== group) {
      group = groupName;
      const heading = document.createElement("li");
      heading.className = "font-group";
      heading.setAttribute("role", "presentation");
      heading.textContent = groupName;
      list.appendChild(heading);
    }

    const option = document.createElement("li");
    option.id = `font-option-${index}`;
    option.className = "font-option";
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", font === selected);
    option.classList.toggle("active", index === active);
    option.append(font.name);
    const author = document.createElement("span");
    author.className = "font-author";
    author.textContent = ` by ${font.author}`;
    option.appendChild(author);
    option.addEventListener("click", () => choose(font));
    option.addEventListener("mousemove", () => {
      if (active !== index) {
        active = index;
        renderList();
      }
    });
    list.appendChild(option);
  });

  const current = document.getElementById(`font-option-${active}`);
  search.setAttribute("aria-activedescendant", current.id);
  current.scrollIntoView({ block: "nearest" });
}

function openPanel() {
  panel.hidden = false;
  button.setAttribute("aria-expanded", "true");
  search.value = "";
  active = Math.max(0, fonts.indexOf(selected));
  renderList();
  search.focus();
}

function closePanel(focusButton) {
  panel.hidden = true;
  button.setAttribute("aria-expanded", "false");
  if (focusButton) {
    button.focus();
  }
}

function choose(font) {
  selected = font;
  button.textContent = fontLabel(font);
  rememberFont(font.id);
  closePanel(true);
  onSelect(font);
}

export async function initFontPicker(onChange) {
  onSelect = onChange;
  let builtin = [];
  try {
    builtin = await loadBuiltinFonts();
  } catch {
    // offline or blocked, custom fonts still work
  }
  fonts = [...builtin, ...loadCustomFonts()];
  const saved = selectedFontId();
  selected = fonts.find(font => font.id === saved) || fonts.find(font => font.id === DEFAULT_FONT_ID) || fonts[0];
  if (!selected) {
    button.textContent = "Fonts failed to load";
    button.disabled = true;
    return;
  }
  button.textContent = fontLabel(selected);
  onChange(selected);

  button.addEventListener("mousedown", event => {
    if (!panel.hidden) {
      event.preventDefault();
    }
  });
  button.addEventListener("click", () => (panel.hidden ? openPanel() : closePanel(false)));
  list.addEventListener("mousedown", event => event.preventDefault());
  search.addEventListener("input", () => {
    active = 0;
    renderList();
  });
  search.addEventListener("keydown", event => {
    const shown = visibleFonts();
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (shown.length > 0) {
        active = (active + (event.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length;
        renderList();
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (shown[active]) {
        choose(shown[active]);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      closePanel(true);
    }
  });
  search.addEventListener("blur", () => closePanel(false));
}
