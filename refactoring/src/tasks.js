import { saveAndRender } from './main.js';

let tasks;
let selectedDate;

export function initTaskManager(taskList, currentDate, onCardCreated) {
  tasks = taskList;
  selectedDate = currentDate;

  // 떠다니는 추가 버튼
  const addCardBtn = document.getElementById("addCardBtn");
  if (addCardBtn) {
    addCardBtn.addEventListener("click", () => {
      document.getElementById("addCardModal").classList.remove("hidden");
    });
  }

  // 달력 페이지 '할 일 +' 버튼
  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      document.getElementById("addCardModal").classList.remove("hidden");
    });
  }

  // 모달 취소 버튼
  const cancelBtn = document.getElementById("cancelCardBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      document.getElementById("addCardModal").classList.add("hidden");
    });
  }

  // 모달 추가 버튼
  const createBtn = document.getElementById("createCardBtn");
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      const title = document.getElementById("cardTitleInput").value.trim();
      const detail = document.getElementById("cardDetailInput").value.trim();
      const status = document.getElementById("cardStatusSelect").value.toLowerCase();
      const type = document.getElementById("cardTypeSelect").value;
      const date = selectedDate || new Date().toISOString().split("T")[0];

      if (!title) return alert("제목을 입력하세요.");

      const newTask = {
        id: Date.now(),
        title,
        detail,
        status,
        type,
        date,
        deadline: false,
        dueDate: null,
      };

      tasks.push(newTask);
      localStorage.setItem("Tasks", JSON.stringify(tasks));
      if (typeof onCardCreated === "function") onCardCreated();

      document.getElementById("addCardModal").classList.add("hidden");

      // 입력 필드 초기화
      document.getElementById("cardTitleInput").value = "";
      document.getElementById("cardDetailInput").value = "";
    });
  }
}

// 마감 업무 추가 기능
export function initDeadlineManager(taskList, onUpdate) {
  const addDeadlineBtn = document.getElementById("addDeadlineBtn");
  const modal = document.getElementById("addDeadlineModal");
  const cancelBtn = document.getElementById("cancelDeadlineBtn");
  const createBtn = document.getElementById("createDeadlineBtn");

  addDeadlineBtn?.addEventListener("click", () => {
    if (modal) {
      modal.classList.remove("hidden");
      // 기본 마감일은 오늘로 설정
      const todayStr = new Date().toISOString().split("T")[0];
      const deadlineDateInput = document.getElementById("deadlineDateInput");
      if (deadlineDateInput) deadlineDateInput.value = todayStr;
    }
  });

  cancelBtn?.addEventListener("click", () => {
    modal?.classList.add("hidden");
    document.getElementById("deadlineTitleInput").value = "";
  });

  createBtn?.addEventListener("click", () => {
    const title = document.getElementById("deadlineTitleInput").value.trim();
    const dueDate = document.getElementById("deadlineDateInput").value;

    if (!title) {
      alert("제목을 입력하세요.");
      return;
    }
    if (!dueDate) {
      alert("마감일을 선택하세요.");
      return;
    }

    const newDeadlineTask = {
      id: Date.now(),
      title,
      detail: "",
      status: "todo",
      type: "마감",
      date: dueDate,
      deadline: true,
      dueDate,
    };

    taskList.push(newDeadlineTask);
    localStorage.setItem("Tasks", JSON.stringify(taskList));
    onUpdate();

    modal.classList.add("hidden");
    document.getElementById("deadlineTitleInput").value = "";
  });
}
