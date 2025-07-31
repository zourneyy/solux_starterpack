// kanban.js
import { deleteTaskById, updateTaskStatus } from './main.js';
import { formatDate } from './utils.js';

let tasks = [];
let draggedCard = null;
let selectedDateFromMain = null;
let isDragDropSetup = false; // 중복 이벤트 등록 방지

export function initKanban(taskList, currentDateStr) {
  tasks = taskList;
  selectedDateFromMain = currentDateStr;
  renderCards();
  setupDragAndDrop();
}

/**
 * 카드가 선택된 날짜에 보일지 여부 판단 (선택날짜가 task.date ~ task.dueDate 사이에 있으면 true)
 * 상태 관계없이, 기간 내에 있는 카드만 표시
 */
function isCardVisibleOn(selectedDateStr, task) {
  if (task.dueDate) {
    // dueDate 있을 때, 기간 내에 있으면 표시
    return selectedDateStr >= task.date && selectedDateStr <= task.dueDate;
  }
  // dueDate 없으면 날짜 일치 여부
  return selectedDateStr === task.date;
}

export function renderCards() {
  const columns = document.querySelectorAll(".kanban-column");
  columns.forEach(col => (col.innerHTML = ""));

  // console.log 디버깅용
  console.log("Kanban - rendering cards for date:", selectedDateFromMain);

  tasks
    .filter(task => isCardVisibleOn(selectedDateFromMain, task))
    .forEach(task => {
      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("draggable", true);
      card.dataset.id = task.id;

      card.innerHTML = `
  <strong>${task.title}</strong>
  <span class="type">(${task.type})</span>
  <div class="detail">${task.detail || ""}</div>
  ${
    task.dueDate
      ? `<div class="deadline red-small">마감일: ${task.dueDate} (${getDDay(task.dueDate)})</div>`
      : ""
  }
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

function getDDay(deadline) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline);
  due.setHours(0, 0, 0, 0);

  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
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
      updateTaskStatus(id, col.dataset.status); // 상태 변경
      draggedCard = null;
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
        draggedCard = null;
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
