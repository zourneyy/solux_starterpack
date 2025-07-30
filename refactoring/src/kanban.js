import { saveAndRender } from './main.js';

let tasks = [];
let draggedCard = null;
let selectedDateFromMain = null;


// init 함수에서 tasks 저장
export function initKanban(taskList, currentDateStr) {
  tasks = taskList;
  selectedDateFromMain = currentDateStr;
  renderCards();
  setupDragAndDrop();

  // 카드 추가 모달 제어
  document.getElementById("addCardBtn")?.addEventListener("click", () => {
    document.getElementById("addCardModal").classList.remove("hidden");
  });
  document.getElementById("cancelCardBtn")?.addEventListener("click", () => {
    document.getElementById("addCardModal").classList.add("hidden");
  });

  // 카드 생성
  document.getElementById("createCardBtn")?.addEventListener("click", () => {
    const title = document.getElementById("cardTitleInput").value.trim();
    const detail = document.getElementById("cardDetailInput").value.trim();
    const status = document.getElementById("cardStatusSelect").value.toLowerCase();
    const type = document.getElementById("cardTypeSelect").value;

    if (!title) return alert("제목을 입력하세요.");

    const newTask = {
      id: Date.now(),
      title,
      detail,
      status,
      date: selectedDateFromMain,
      type
    };

    tasks.push(newTask);
    saveTasks();
    document.getElementById("addCardModal").classList.add("hidden");
  });
}

function saveTasks() {
  localStorage.setItem("Tasks", JSON.stringify(tasks));
  renderCards();
}

// ✅ 외부에서도 호출 가능하게 export
export function renderCards() {
  const columns = document.querySelectorAll(".kanban-column");
  columns.forEach((col) => col.innerHTML = "");

  tasks
    .filter((t) => !t.deadline && t.date === selectedDateFromMain)
    .forEach((task) => {
      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("draggable", true);
      card.dataset.id = task.id;
      card.innerHTML = `
        <strong>${task.title}</strong>
        <span class="type">(${task.type})</span>
        <div class="detail">${task.detail || ""}</div>
      `;

      // 🧲 드래그 관련 이벤트
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
  const columns = document.querySelectorAll(".kanban-column");

  columns.forEach((col) => {
    col.addEventListener("dragover", (e) => e.preventDefault());
    col.addEventListener("drop", () => {
      if (!draggedCard) return;
      const id = Number(draggedCard.dataset.id);
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      task.status = col.dataset.status;
      saveTasks();
    });
  });

  // 🔁 다음/이전 페이지 드롭
  document.querySelectorAll(".next-stage-dropzone, .prev-stage-dropzone").forEach((zone) => {
    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("drop", () => {
      if (!draggedCard) return;

      const id = Number(draggedCard.dataset.id);
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const order = ["todo", "doing", "done"];
      const currentIndex = order.indexOf(task.status);
      const targetStatus = zone.dataset.next || zone.dataset.prev;
      const targetIndex = order.indexOf(targetStatus);

      if (Math.abs(currentIndex - targetIndex) === 1) {
        task.status = targetStatus;
        saveTasks();
      }
    });
  });

  // 🗑 휴지통 드래그 삭제
  const trash = document.getElementById("trashZone");
  if (trash) {
    trash.addEventListener("dragover", (e) => {
      e.preventDefault();
      trash.classList.add("drag-over");
    });

    trash.addEventListener("dragleave", () => {
      trash.classList.remove("drag-over");
    });

    trash.addEventListener("drop", () => {
      if (!draggedCard) return;
      const id = Number(draggedCard.dataset.id);
      tasks = tasks.filter(t => t.id !== id);
      localStorage.setItem("Tasks", JSON.stringify(tasks));
      draggedCard.remove();
      draggedCard = null;

      trash.classList.remove("drag-over");
      trash.classList.add("hidden");
      saveAndRender(); // 전체 다시 렌더링
    });
  }
}