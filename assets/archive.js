const search = document.querySelector(".search");
const input = search.querySelector("input");
const filters = [...document.querySelectorAll(".filter")];
const groups = [...document.querySelectorAll(".post-group")];
const status = document.querySelector("#results-status");
const empty = document.querySelector("#no-results");

const searchableGroups = groups.map((group) => ({
  group,
  rows: [...group.querySelectorAll(".post-row")].map((row) => ({
    row,
    text: row.textContent.toLocaleLowerCase("ko").normalize("NFKC"),
  })),
}));
let selected = "";
search.hidden = false;

function update() {
  const query = input.value.trim().toLocaleLowerCase("ko").normalize("NFKC");
  let count = 0;
  for (const { group, rows } of searchableGroups) {
    const categoryMatches = !selected || group.dataset.category === selected;
    let matches = 0;
    for (const { row, text } of rows) {
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
  status.textContent = `${count}개의 글`;
  empty.hidden = count > 0;
}

for (const filter of filters) {
  filter.addEventListener("click", (event) => {
    event.preventDefault();
    selected = filter.dataset.category;
    update();
  });
}
input.addEventListener("input", update);
update();
