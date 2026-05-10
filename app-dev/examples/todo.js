const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const taskText = input.value.trim();
  if (!taskText) return;

  const item = document.createElement("li");
  item.textContent = taskText;

  item.addEventListener("click", () => {
    item.classList.toggle("done");
  });

  list.appendChild(item);
  input.value = "";
});
