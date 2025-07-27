// -------------------- 페이지 전환 --------------------
const menuItems = document.querySelectorAll(".menu li");
const sections = document.querySelectorAll(".page-section");

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    menuItems.forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
    sections.forEach((section) => section.classList.remove("active"));
    document.getElementById(item.dataset.section).classList.add("active");
    if (item.dataset.section === "dashboard") updateDashboard();
    if (item.dataset.section !== "calendar")
      document.getElementById("searchResults").style.display = "none";
  });
});

// -------------------- 카드 데이터 관리 --------------------
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let selectedDate = null;

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderCards();
  createCalendar();
  renderTasksForDate();
  updateSelectedDateTitle(); // 3) 달력 제목 업데이트
  renderDeadlines(); // 5) 마감 업무 리스트 렌더링
}

// -------------------- 칸반보드 렌더링 --------------------
const columns = document.querySelectorAll(".kanban-column");

function renderCards() {
  columns.forEach((col) => (col.innerHTML = ""));
  tasks
    .filter((task) => !task.deadline) // 마감업무 제외
    .forEach((task) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.setAttribute("draggable", true);
      card.dataset.id = task.id;
      card.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""}>
        <span class="delete-btn" data-id="${task.id}">🗑️</span>
        <strong>${task.title}</strong> <span class="type">(${task.type || "일반"})</span>
        <div class="detail">${task.detail || ""}</div>
      `;

      card.querySelector("input[type='checkbox']").addEventListener("change", (e) => {
        task.completed = e.target.checked;
        saveTasks();
      });

      card.querySelector(".delete-btn").addEventListener("click", () => {
        tasks = tasks.filter((t) => t.id !== task.id);
        saveTasks();
      });

      document.querySelector(`[data-status="${task.status}"]`).appendChild(card);
    });
  updateProgress();
}
renderCards();

// -------------------- 드래그 앤 드롭 --------------------
let draggedCard = null;
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
    const newStatus = col.dataset.status;
    const task = tasks.find(t => t.id == id);
    if (!task) return;

    // 상태 변경: 드래그 드롭 시 무조건 해당 칸반 상태로 이동
    task.status = newStatus;
    saveTasks();
  });
});

// 4) next-stage-dropzone 드롭존에도 드래그 이벤트 추가
const nextDropzones = document.querySelectorAll(".next-stage-dropzone");
nextDropzones.forEach((zone) => {
  zone.addEventListener("dragover", (e) => e.preventDefault());
  zone.addEventListener("dragenter", () => zone.classList.add("over"));
  zone.addEventListener("dragleave", () => zone.classList.remove("over"));

  zone.addEventListener("drop", () => {
    zone.classList.remove("over");
    if (!draggedCard) return;
    const id = draggedCard.dataset.id;
    const currentTask = tasks.find(t => t.id == id);
    if (!currentTask) return;

    const currentStatus = currentTask.status;
    const nextStatus = zone.dataset.next;

    // 상태 순서 강제: todo -> doing -> done 순으로만 이동 허용
    const order = ["todo", "doing", "done"];
    if (order.indexOf(nextStatus) === order.indexOf(currentStatus) + 1) {
      currentTask.status = nextStatus;
      saveTasks();
    }
  });
});

// -------------------- 진행률 업데이트 + 하단 상태바 표시 --------------------
function updateProgress() {
  const todoCount = tasks.filter((t) => t.status === "todo" && !t.deadline).length;
  const doingCount = tasks.filter((t) => t.status === "doing" && !t.deadline).length;
  const doneCount = tasks.filter((t) => t.status === "done" && !t.deadline).length;
  const total = todoCount + doingCount + doneCount;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  // 하단 상태바 텍스트 (TODO, DOING, DONE 개수)
  document.getElementById("progressInfo").innerHTML =
    `TODO ${todoCount}개 | DOING ${doingCount}개 | DONE ${doneCount}개`;

  // 진행률 바 업데이트
  const bar = document.getElementById("dashboardProgress");
  if (bar) {
    bar.style.width = percent + "%";
    bar.textContent = percent + "%";
  }
}

// -------------------- 달력 생성 --------------------
const calendarContainer = document.getElementById("calendarContainer");

function createCalendar() {
  calendarContainer.innerHTML = "";
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.classList.add("calendar-cell");
    calendarContainer.appendChild(empty);
  }

  for (let i = 1; i <= lastDate; i++) {
    const cell = document.createElement("div");
    cell.classList.add("calendar-cell");
    cell.textContent = i;

    const dateKey = `${year}-${month + 1}-${i}`;
    if (tasks.some((t) => t.deadline && t.date === dateKey)) {
      cell.classList.add("deadline");
    }

    cell.addEventListener("click", () => {
      selectedDate = dateKey;
      renderTasksForDate();
      updateSelectedDateTitle(); // 3) 날짜 선택 시 제목 바꾸기
      renderDeadlines(); // 마감 업무도 갱신
    });

    calendarContainer.appendChild(cell);
  }
}
createCalendar();

// 3) 달력 제목 업데이트 함수
function updateSelectedDateTitle() {
  const title = document.getElementById("selectedDateTitle");
  if (!selectedDate) {
    title.textContent = "날짜를 선택하세요";
  } else {
    const day = selectedDate.split("-")[2];
    title.textContent = `${day}일`;
  }
}

// -------------------- 날짜별 할 일 및 마감 업무 리스트 렌더링 --------------------
function renderTasksForDate() {
  const list = document.getElementById("taskListForDate");
  if (!list || !selectedDate) return;
  list.innerHTML = "";
  const filtered = tasks.filter((t) => t.date === selectedDate && !t.deadline);
  if (filtered.length === 0) {
    list.innerHTML = "<li>할 일이 없습니다.</li>";
  } else {
    filtered.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t.title;
      list.appendChild(li);
    });
  }
}

// 5) 마감 업무 리스트 렌더링 (달력 오른쪽 '마감 업무 +' 버튼 바로 밑에 표시)
function renderDeadlines() {
  const list = document.getElementById("deadlineList");
  list.innerHTML = "";
  const deadlines = tasks.filter((t) => t.deadline && t.date === selectedDate);
  deadlines.forEach(d => {
    const li = document.createElement("li");
    li.textContent = d.title;
    list.appendChild(li);
  });
}

// -------------------- 버튼 이벤트 --------------------
document.getElementById("addTaskBtn").addEventListener("click", () => {
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
    completed: false,
    deadline: false
  });
  saveTasks();
});

document.getElementById("addDeadlineBtn").addEventListener("click", () => {
  if (!selectedDate) return alert("날짜를 먼저 선택하세요!");
  const title = prompt("마감 업무 제목:");
  if (!title) return;
  tasks.push({
    id: Date.now(),
    title,
    date: selectedDate,
    deadline: true
  });
  saveTasks();
});

// -------------------- 검색 기능 --------------------
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const container = document.getElementById("searchContainer");
  if (!query) {
    document.getElementById("searchResults").style.display = "none";
    return;
  }

  container.innerHTML = "";
  const result = tasks.filter(
    (task) =>
      (task.title && task.title.toLowerCase().includes(query)) ||
      (task.detail || "").toLowerCase().includes(query)
  );
  document.getElementById("searchResults").style.display = "block";

  result.forEach((task) => {
    const div = document.createElement("div");
    div.classList.add("card");
    const highlighted = (text) =>
      text.replace(new RegExp(`(${query})`, "gi"), '<span class="highlight">$1</span>');
    div.innerHTML = `
      <strong>${highlighted(task.title)}</strong> (${task.deadline ? "마감" : task.status.toUpperCase()})<br>
      <span class="detail">${highlighted(task.detail || "")}</span>
    `;
    container.appendChild(div);
  });
});

// -------------------- 대시보드 --------------------
function updateDashboard() {
  const deadlines = tasks
    .filter((t) => t.deadline)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const list = document.getElementById("upcomingDeadlines");
  list.innerHTML = deadlines.map((d) => `<li>${d.date}: ${d.title}</li>`).join("");

  const types = tasks
    .filter((t) => !t.deadline)
    .reduce((acc, t) => {
      acc[t.type || "일반"] = (acc[t.type || "일반"] || 0) + 1;
      return acc;
    }, {});
  document.getElementById("taskTypes").innerHTML = Object.entries(types)
    .map(([k, v]) => `${k}: ${v}개`)
    .join("<br>");

  updateProgress();
  const doneCount = tasks.filter((t) => t.status === "done" && !t.deadline).length;
  const total = tasks.filter((t) => !t.deadline).length;
  document.getElementById("remainingTasks").innerHTML = `<strong>${total - doneCount}</strong> / ${total}`;
}

// 최초 로드 시
saveTasks();
