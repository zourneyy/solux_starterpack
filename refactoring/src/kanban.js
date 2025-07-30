// kanban.js
import { deleteTaskById, updateTaskStatus } from './main.js';
import { formatDate } from './utils.js';

let tasks = [];
let draggedCard = null;
let selectedDateFromMain = null;
let isDragDropSetup = false; // 중복 이벤트 등록 방지

// 초기화: tasks는 main.js에서 직접 관리되므로 참조만 저장
export function initKanban(taskList, currentDateStr) {
  tasks = taskList;
  selectedDateFromMain = currentDateStr;
  renderCards();
  setupDragAndDrop();
}

export function renderCards() {
  const columns = document.querySelectorAll(".kanban-column");
  columns.forEach(col => (col.innerHTML = ""));

  console.log("Kanban - rendering cards for date:", selectedDateFromMain);

  tasks
    .filter(t => !t.deadline && formatDate(new Date(t.date)) === selectedDateFromMain)
    .forEach(task => {
      console.log(`Rendering task id:${task.id}, status:${task.status}, date:${task.date}`);

      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("draggable", true);
      card.dataset.id = task.id;
      card.innerHTML = `
        <strong>${task.title}</strong>
        <span class="type">(${task.type})</span>
        <div class="detail">${task.detail || ""}</div>
      `;

      card.addEventListener("dragstart", () => {
        draggedCard = card;
        card.classList.add("dragging");
        document.getElementById("trashZone")?.classList.remove("hidden");
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        draggedCard = null;
        document.getElementById("trashZone")?.classList.add("hidden");
      });

      const column = document.querySelector(`[data-status="${task.status}"]`);
      column?.appendChild(card);
    });
}

function setupDragAndDrop() {
  if (isDragDropSetup) return; // 중복 방지
  isDragDropSetup = true;

  const columns = document.querySelectorAll(".kanban-column");

  columns.forEach(col => {
    col.addEventListener("dragover", e => e.preventDefault());
    col.addEventListener("drop", () => {
      if (!draggedCard) return;
      const id = Number(draggedCard.dataset.id);
      updateTaskStatus(id, col.dataset.status);
    });
  });

  document.querySelectorAll(".next-stage-dropzone, .prev-stage-dropzone").forEach(zone => {
    zone.addEventListener("dragover", e => e.preventDefault());
    zone.addEventListener("drop", (e) => {
      e.preventDefault();

      if (!draggedCard) return;
      const id = Number(draggedCard.dataset.id);

      const order = ["todo", "doing", "done"];
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const currentIndex = order.indexOf(task.status);
      const targetStatus = zone.dataset.next || zone.dataset.prev;
      const targetIndex = order.indexOf(targetStatus);

      if (Math.abs(currentIndex - targetIndex) === 1) {
        updateTaskStatus(id, targetStatus);
      }
    });
  });

  // 휴지통 드래그 삭제
  const trash = document.getElementById("trashZone");
  if (trash) {
    trash.addEventListener("dragover", e => {
      e.preventDefault();
      trash.classList.add("drag-over");
    });

    trash.addEventListener("dragleave", () => {
      trash.classList.remove("drag-over");
    });

    trash.addEventListener("drop", () => {
      if (!draggedCard) return;
      const id = Number(draggedCard.dataset.id);
      deleteTaskById(id);
      draggedCard = null;
      trash.classList.remove("drag-over");
      trash.classList.add("hidden");
    });
  }
}
