// tasks.js
import { saveAndRender } from './main.js';

let tasks = [
  { id: 1, title: "테스트 마감 임박 업무", type: "테스트", date: "2025-08-01", status: "TODO", deadline: true, dueDate: "2025-08-02" },
  // ... 나머지 데이터
];
let selectedDate = "";

// -------------------- 초기화 --------------------
export function initTaskManager(taskList, currentDate) {
  tasks = taskList;
  selectedDate = currentDate;
  setupAddTaskButtons();
}

// -------------------- 할 일 추가 버튼 --------------------
function setupAddTaskButtons() {
  const addTaskBtn = document.getElementById("addTaskBtn");
  const addDeadlineBtn = document.getElementById("addDeadlineBtn");

  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      if (!selectedDate) return alert("날짜를 먼저 선택하세요!");
      const title = prompt("할 일 제목:");
      if (!title) return;
      const type = prompt("업무 유형 (디자인, 개발 등):") || "일반";
      const detail = prompt("세부 사항:") || "";
      tasks.push({
        id: Date.now(),
        title,
        type,
        detail,
        date: selectedDate,
        status: "todo",
        deadline: false
      });
      saveAndRender();
    });
  }

  if (addDeadlineBtn) {
    addDeadlineBtn.addEventListener("click", () => {
      if (!selectedDate) return alert("날짜를 먼저 선택하세요!");
      const title = prompt("마감 업무 제목:");
      if (!title) return;
      tasks.push({
        id: Date.now(),
        title,
        date: selectedDate,
        deadline: true
      });
      saveAndRender();
    });
  }
}
