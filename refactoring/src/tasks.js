// tasks.js
import { saveAndRender } from './main.js';

let tasks;
let selectedDate;
let onCardCreatedCallback;  // 콜백 저장용
let isCreateBtnSetup = false; // 중복 이벤트 등록 방지

export function initTaskManager(taskList, currentDate, onCardCreated) {
  tasks = taskList;
  selectedDate = currentDate;
  onCardCreatedCallback = onCardCreated;

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

  // 모달 추가 버튼 - 중복 이벤트 등록 방지
  if (!isCreateBtnSetup) {
    const createBtn = document.getElementById("createCardBtn");
    if (createBtn) {
      createBtn.addEventListener("click", (e) => {
        e.preventDefault(); // form 제출 방지

        const titleInput = document.getElementById("cardTitleInput");
        const detailInput = document.getElementById("cardDetailInput");
        const statusSelect = document.getElementById("cardStatusSelect");
        const typeSelect = document.getElementById("cardTypeSelect");

        const title = titleInput.value.trim();
        const detail = detailInput.value.trim();
        const status = statusSelect.value.toLowerCase();
        const type = typeSelect.value;
        const date = selectedDate || new Date().toISOString().split("T")[0];
        const dueDate = document.getElementById("cardDueDateInput").value; // 마감일 입력 필드 값

        if (!title) {
          alert("제목을 입력하세요.");
          return;
        }

        const newTask = {
          id: Date.now(),
          title,
          detail,
          status,
          type,
          date,
          created: new Date().toISOString(),  // 생성일자 필수 추가
          dueDate: dueDate || null,           // 마감일 (없으면 null)
          deadline: Boolean(dueDate)          // 마감일 있으면 true, 없으면 false
        };

        tasks.push(newTask);
        localStorage.setItem("Tasks", JSON.stringify(tasks));

        // UI 바로 갱신 콜백 호출
        if (typeof onCardCreatedCallback === "function") onCardCreatedCallback();

        // 모달 닫기
        document.getElementById("addCardModal").classList.add("hidden");

        // 입력 필드 초기화
        titleInput.value = "";
        detailInput.value = "";
        document.getElementById("cardDueDateInput").value = ""; // 마감일 초기화
      });
    }
    isCreateBtnSetup = true;
  }
}

// 마감 업무 추가 기능 (달력 마감일 별도 기능)
export function initDeadlineManager(taskList, onUpdate) {
  const addDeadlineBtn = document.getElementById("addDeadlineBtn");
  const modal = document.getElementById("addDeadlineModal");
  const cancelBtn = document.getElementById("cancelDeadlineBtn");
  const createBtn = document.getElementById("createDeadlineBtn");

  addDeadlineBtn?.addEventListener("click", () => {
    if (modal) {
      modal.classList.remove("hidden");
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
      created: new Date().toISOString(),  // 생성일자 필수 추가
    };

    taskList.push(newDeadlineTask);
    localStorage.setItem("Tasks", JSON.stringify(taskList));
    onUpdate();

    modal.classList.add("hidden");
    document.getElementById("deadlineTitleInput").value = "";
  });
}
