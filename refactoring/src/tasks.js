let tasks;
let selectedDate;

export function initTaskManager(taskList, currentDate, onCardCreated) {
  tasks = taskList;
  selectedDate = currentDate;

  const addBtn = document.getElementById("addCardBtn");
  if (addBtn) {
    console.log("✅ 카드 추가 버튼 찾음");
    addBtn.addEventListener("click", () => {
      console.log("➕ 버튼 클릭됨");
      document.getElementById("addCardModal").classList.remove("hidden");
    });
  } else {
    console.log("❌ addCardBtn 못 찾음");
  }

  const cancelBtn = document.getElementById("cancelCardBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      document.getElementById("addCardModal").classList.add("hidden");
    });
  }

  const createBtn = document.getElementById("createCardBtn");
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      const title = document.getElementById("cardTitleInput").value.trim();
      const detail = document.getElementById("cardDetailInput").value.trim();
      const status = document.getElementById("cardStatusSelect").value;
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
        dueDate: null
      };

      tasks.push(newTask);
      localStorage.setItem("Tasks", JSON.stringify(tasks));
      if (typeof onCardCreated === "function") onCardCreated();

      document.getElementById("addCardModal").classList.add("hidden");
    });
  }
}