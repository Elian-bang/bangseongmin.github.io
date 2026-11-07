const search = document.querySelector(".search");
const input = search.querySelector("input");
const menu = document.querySelector(".filters");
const tree = menu.querySelector(".category-tree");
const allFilter = menu.querySelector(".filter");
const groups = [...document.querySelectorAll(".post-group")];
const title = document.querySelector("#archive-title");
const status = document.querySelector("#results-status");
const empty = document.querySelector("#no-results");
const separator = " / ";

const searchableGroups = groups.map((group) => ({
  group,
  rows: [...group.querySelectorAll(".post-row")].map((row) => ({
    row,
    category: row.dataset.category,
    text: row.textContent.toLocaleLowerCase("ko").normalize("NFKC"),
  })),
}));

const categories = new Map();
for (const { rows } of searchableGroups) {
  for (const { category } of rows) {
    let level = categories;
    let path = "";
    for (const label of category.split(separator)) {
      path = path ? path + separator + label : label;
      if (!level.has(label)) {
        level.set(label, { label, path, count: 0, children: new Map() });
      }
      const node = level.get(label);
      node.count++;
      level = node.children;
    }
  }
}

const filters = [allFilter];
const categoryOrder = new Intl.Collator("ko", { numeric: true });

function renderCategory({ label, path, count, children }) {
  const hasChildren = children.size > 0;
  const control = document.createElement(hasChildren ? "summary" : "button");
  if (!hasChildren) control.type = "button";
  control.className = "filter";
  control.dataset.category = path;

  const name = document.createElement("span");
  name.className = "filter-label";
  name.textContent = label;
  const total = document.createElement("span");
  total.className = "filter-count";
  total.textContent = count;
  control.append(name, total);
  filters.push(control);

  if (!hasChildren) return control;

  const branch = document.createElement("details");
  const items = document.createElement("div");
  items.className = "category-children";
  const sorted = [...children.values()].sort((a, b) => categoryOrder.compare(a.label, b.label));
  items.append(...sorted.map(renderCategory));
  branch.append(control, items);
  return branch;
}

tree.replaceChildren(...[...categories.values()].map(renderCategory));
let selected = "";
search.hidden = false;

function update() {
  const query = input.value.trim().toLocaleLowerCase("ko").normalize("NFKC");
  let count = 0;
  for (const { group, rows } of searchableGroups) {
    let matches = 0;
    for (const { row, category, text } of rows) {
      const categoryMatches = !selected || category === selected || category.startsWith(selected + separator);
      row.hidden = !categoryMatches || !text.includes(query);
      if (!row.hidden) matches++;
    }
    group.hidden = matches === 0;
    count += matches;
  }
  for (const filter of filters) {
    const active = filter.dataset.category === selected;
    filter.classList.toggle("is-active", active);
    if (active) filter.setAttribute("aria-current", "true");
    else filter.removeAttribute("aria-current");
  }
  title.textContent = selected || "글 목록";
  status.textContent = `${count}개의 글`;
  empty.hidden = count > 0;
}

menu.addEventListener("click", (event) => {
  const filter = event.target.closest(".filter");
  if (!filter) return;
  if (filter === allFilter) event.preventDefault();
  selected = filter.dataset.category;
  update();
});
input.addEventListener("input", update);
update();
