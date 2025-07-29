// kanban.js
import { saveAndRender } from './main.js';

let tasks = [];
let selectedDate = "";

// -------------------- 초기화 --------------------
export function initKanban(taskList, currentDate) {
  tasks = taskList;
  selectedDate = currentDate;
  renderCards();
  setupDragAndDrop();
  updateProgress();
}

// -------------------- 카드 렌더링 --------------------
function renderCards() {
  const columns = document.querySelectorAll(".kanban-column");
  columns.forEach((col) => (col.innerHTML = ""));

  tasks
    .filter((task) => !task.deadline && task.date === selectedDate)
    .forEach((task) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.setAttribute("draggable", true);
      card.dataset.id = task.id;
      card.innerHTML = `
        <span class="delete-btn" data-id="${task.id}">🗑️</span>
        <strong>${task.title}</strong> <span class="type">(${task.type || "일반"})</span>
        <div class="detail">${task.detail || ""}</div>
      `;

      card.querySelector(".delete-btn").addEventListener("click", () => {
        tasks = tasks.filter((t) => t.id !== task.id);
        saveAndRender();
      });

      document.querySelector(`[data-status="${task.status}"]`).appendChild(card);
    });
  updateProgress();
}

// -------------------- 드래그 앤 드롭 --------------------
function setupDragAndDrop() {
  let draggedCard = null;
  const columns = document.querySelectorAll(".kanban-column");
  const nextDropzones = document.querySelectorAll(".next-stage-dropzone");

  document.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("card")) {
      draggedCard = e.target;
    }
  });

  document.addEventListener("dragover", (e) => e.preventDefault());

  columns.forEach((col) => {
    col.addEventListener("dragenter", () => col.classList.add("over"));
    col.addEventListener("dragleave", () => col.classList.remove("over"));
    col.addEventListener("drop", () => {
      col.classList.remove("over");
      if (!draggedCard) return;
      const id = draggedCard.dataset.id;
      const task = tasks.find((t) => t.id == id);
      if (!task) return;
      task.status = col.dataset.status;
      saveAndRender();
    });
  });

  nextDropzones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("dragenter", () => zone.classList.add("over"));
    zone.addEventListener("dragleave", () => zone.classList.remove("over"));
    zone.addEventListener("drop", () => {
      zone.classList.remove("over");
      if (!draggedCard) return;
      const id = draggedCard.dataset.id;
      const currentTask = tasks.find((t) => t.id == id);
      if (!currentTask) return;
      const order = ["todo", "doing", "done"];
      const nextStatus = zone.dataset.next;
      if (order.indexOf(nextStatus) === order.indexOf(currentTask.status) + 1) {
        currentTask.status = nextStatus;
        saveAndRender();
      }
    });
  });
}

// -------------------- 진행률 업데이트 --------------------
function updateProgress() {
  const todoCount = tasks.filter((t) => t.status === "todo" && !t.deadline && t.date === selectedDate).length;
  const doingCount = tasks.filter((t) => t.status === "doing" && !t.deadline && t.date === selectedDate).length;
  const doneCount = tasks.filter((t) => t.status === "done" && !t.deadline && t.date === selectedDate).length;
  const total = todoCount + doingCount + doneCount;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  document.getElementById("progressInfo").innerHTML =
    `TODO ${todoCount}개 | DOING ${doingCount}개 | DONE ${doneCount}개 | ${percent}%`;

  const footerBar = document.getElementById("footerProgress");
  footerBar.style.width = percent + "%";

  const bar = document.getElementById("dashboardProgress");
  if (bar) {
    bar.style.width = percent + "%";
    bar.textContent = percent + "%";
  }
}
