// kanban.js (전체 교체용)

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
 * 칸반 보드에 카드를 표시할지 결정하는 함수 (로직 단순화)
 */
function isCardVisibleOn(selectedDateStr, task, todayStr) {
  // 규칙 1: 상태가 'done'이면 날짜와 상관없이 항상 표시
  if (task.status === 'done') {
    return true;
  }

  // 규칙 2: 마감일이 지났으면 (아직 done이 아니라면) 항상 표시
  const isOverdue = task.dueDate && todayStr > task.dueDate;
  if (isOverdue) {
    return true;
  }

  // 규칙 3: 그 외에는 선택된 날짜가 업무 기간에 포함될 때만 표시
  if (task.dueDate) {
    return selectedDateStr >= task.date && selectedDateStr <= task.dueDate;
  }
  return selectedDateStr === task.date;
}

/**
 * 카드 렌더링 함수 (로직 단순화)
 */
export function renderCards() {
  const columns = document.querySelectorAll(".kanban-column");
  // 모든 컬럼을 깨끗하게 비워서 일관성을 유지하고 처음부터 다시 그림
  columns.forEach(col => {
    col.innerHTML = "";
  });

  const todayStr = formatDate(new Date());

  tasks
    .filter(task => isCardVisibleOn(selectedDateFromMain, task, todayStr))
    .forEach(task => {
      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("draggable", true);
      card.dataset.id = task.id;
      
      // 마감일이 지났다면 카드에 'overdue' 클래스 추가 (CSS 스타일링용)
      if (task.dueDate && todayStr > task.dueDate && task.status !== 'done') {
        card.classList.add('overdue');
      }

      card.innerHTML = `
        <strong>${task.title}</strong>
        <span class="type">(${task.type})</span>
        <div class="detail">${task.detail || ""}</div>
        ${
          task.dueDate
            ? `<div class="deadline">${getDDayText(task.dueDate)}</div>`
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
      if (column) {
        column.appendChild(card);
      } else {
        console.warn(`Kanban: 컬럼을 찾을 수 없습니다 - status: ${task.status}`);
      }
    });
}

/**
 * 마감일까지 남은 날짜 또는 지난 날짜를 텍스트로 반환
 */
function getDDayText(deadline) {
  const dDayInfo = getDDay(deadline);
  
  // 마감일이 지났으면 글자색을 주황색으로, 아니면 빨간색으로 변경
  const style = dDayInfo.isOverdue ? 'style="color: orange;"' : 'style="color: red;"';
  return `<span ${style}>마감: ${deadline} (${dDayInfo.text})</span>`;
}

function getDDay(deadline) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline);
  due.setHours(0, 0, 0, 0);

  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let text;
  if (diffDays === 0) text = 'D-Day';
  else if (diffDays > 0) text = `D-${diffDays}`;
  else text = `D+${Math.abs(diffDays)}`;

  return {
      text: text,
      isOverdue: diffDays < 0
  };
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
      draggedCard = null;
    });
  });

  document.querySelectorAll(".next-stage-dropzone, .prev-stage-dropzone").forEach(zone => {
    zone.addEventListener("dragover", e => e.preventDefault());
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedCard) return;
      const id = Number(draggedCard.dataset.id);
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const order = ["todo", "doing", "done"];
      const currentIndex = order.indexOf(task.status);
      const targetStatus = zone.dataset.next || zone.dataset.prev;
      const targetIndex = order.indexOf(targetStatus);

      if (Math.abs(currentIndex - targetIndex) === 1) {
        updateTaskStatus(id, targetStatus);
        draggedCard = null;
      }
    });
  });

  const trash = document.getElementById("trashZone");
  if (trash) {
    trash.addEventListener("dragover", e => e.preventDefault());
    trash.addEventListener("dragleave", () => trash.classList.remove("drag-over"));
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
