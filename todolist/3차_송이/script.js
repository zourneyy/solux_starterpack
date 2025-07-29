// -------------------- 공통 변수 --------------------
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let selectedDate = getToday(); // 오늘 날짜부터 시작
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

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
    if (["todo", "doing", "done"].includes(item.dataset.section))
      updateDayLabels();
    if (item.dataset.section !== "calendar")
      document.getElementById("searchResults").style.display = "none";
  });
});

// -------------------- 유틸 함수 --------------------
function getToday() {
  const today = new Date();
  return formatDate(today);
}

function formatDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// -------------------- 데이터 저장 --------------------
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderCards();
  createCalendar();
  renderTasksForDate();
  renderDeadlines();
  updateProgress();
  updateDayLabels();
}

// -------------------- 달력 생성 --------------------
const calendarContainer = document.getElementById("calendarContainer");
const calendarTitle = document.getElementById("calendarTitle");

function createCalendar() {
  calendarContainer.innerHTML = "";

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  calendarTitle.textContent = `${currentYear}년 ${currentMonth + 1}월`;

  // 요일 헤더
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  days.forEach((day) => {
    const dayCell = document.createElement("div");
    dayCell.classList.add("calendar-cell", "calendar-day-header");
    dayCell.style.fontWeight = "bold";
    dayCell.style.background = "#eee";
    dayCell.textContent = day;
    calendarContainer.appendChild(dayCell);
  });

  // 빈 칸
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.classList.add("calendar-cell");
    empty.style.background = "transparent";
    empty.style.border = "none";
    calendarContainer.appendChild(empty);
  }

  const todayStr = getToday();

  // 날짜 칸
  for (let i = 1; i <= lastDate; i++) {
    const cell = document.createElement("div");
    cell.classList.add("calendar-cell");
    cell.textContent = i;

    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;

    // 오늘 날짜 표시
    if (dateKey === todayStr) {
      cell.classList.add("today");
    }

    // 마감 업무 표시 줄
    const deadlinesForDay = tasks.filter((t) => t.deadline && t.date === dateKey);
    if (deadlinesForDay.length > 0) {
      deadlinesForDay.forEach(() => {
        const marker = document.createElement("div");
        marker.classList.add("deadline-marker");
        cell.appendChild(marker);
      });
    }

    cell.addEventListener("click", () => {
      selectedDate = dateKey;
      renderTasksForDate();
      updateSelectedDateTitle();
      renderDeadlines();
      renderCards(); // 해당 날짜의 카드 표시
      updateDayLabels();
    });

    calendarContainer.appendChild(cell);
  }
}
createCalendar();

// 달력 이전/다음 달 이동
document.getElementById("prevMonthBtn").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  createCalendar();
});
document.getElementById("nextMonthBtn").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  createCalendar();
});

// -------------------- 날짜 라벨 업데이트 --------------------
function updateSelectedDateTitle() {
  const title = document.getElementById("selectedDateTitle");
  if (!selectedDate) {
    title.textContent = "날짜를 선택하세요";
  } else {
    const dateObj = parseDate(selectedDate);
    title.textContent = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
  }
}

function updateDayLabels() {
  const sections = [
    { label: "todoDayLabel" },
    { label: "doingDayLabel" },
    { label: "doneDayLabel" },
    { label: "dashboardDayLabel" }
  ];

  const dateObj = parseDate(selectedDate);
  sections.forEach((s) => {
    const el = document.getElementById(s.label);
    if (el) el.textContent = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
  });

  renderCards();
  updateDashboard();
}

// -------------------- 날짜별 이전/다음 버튼 --------------------
document.querySelectorAll(".prevDayBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dateObj = parseDate(selectedDate);
    dateObj.setDate(dateObj.getDate() - 1);
    selectedDate = formatDate(dateObj);
    updateDayLabels();
  });
});
document.querySelectorAll(".nextDayBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dateObj = parseDate(selectedDate);
    dateObj.setDate(dateObj.getDate() + 1);
    selectedDate = formatDate(dateObj);
    updateDayLabels();
  });
});

// -------------------- 카드 렌더링 --------------------
const columns = document.querySelectorAll(".kanban-column");

function renderCards() {
  columns.forEach((col) => (col.innerHTML = ""));
  tasks
    .filter((task) => !task.deadline && task.date === selectedDate)
    .forEach((task) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.setAttribute("draggable", true);
      card.dataset.id = task.id;
      card.innerHTML = `
        <strong>${task.title}</strong> <span class="type">(${task.type || "일반"})</span>
        <div class="detail">${task.detail || ""}</div>
      `;

      // 드래그 기능
      card.addEventListener("dragstart", () => {
        draggedCard = card;
        card.classList.add("dragging");
        document.getElementById("trashZone").classList.remove("hidden");
      });

      card.addEventListener("dragend", () => {
        draggedCard = null;
        card.classList.remove("dragging");
        document.getElementById("trashZone").classList.add("hidden");
      });

      // 카드 붙이기
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
    const task = tasks.find((t) => t.id == id);
    if (!task) return;
    task.status = newStatus;
    saveTasks();
  });
});

const nextDropzones = document.querySelectorAll(".next-stage-dropzone");
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

    const currentStatus = currentTask.status;
    const nextStatus = zone.dataset.next;
    const order = ["todo", "doing", "done"];
    if (order.indexOf(nextStatus) === order.indexOf(currentStatus) + 1) {
      currentTask.status = nextStatus;
      saveTasks();
    }
  });
});

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

// -------------------- 날짜별 할 일 및 마감 업무 리스트 --------------------
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

function renderDeadlines() {
  const list = document.getElementById("deadlineList");
  list.innerHTML = "";
  const deadlines = tasks.filter((t) => t.deadline && t.date === selectedDate);
  deadlines.forEach((d) => {
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
    .filter((t) => !t.deadline && t.date === selectedDate)
    .reduce((acc, t) => {
      acc[t.type || "일반"] = (acc[t.type || "일반"] || 0) + 1;
      return acc;
    }, {});
  document.getElementById("taskTypes").innerHTML = Object.entries(types)
    .map(([k, v]) => `${k}: ${v}개`)
    .join("<br>");

  updateProgress();
  const doneCount = tasks.filter((t) => t.status === "done" && !t.deadline && t.date === selectedDate).length;
  const total = tasks.filter((t) => !t.deadline && t.date === selectedDate).length;
  document.getElementById("remainingTasks").innerHTML = `<strong>${total - doneCount}</strong> / ${total}`;
}

// 초기 로드
saveTasks();

// 모달 열기/닫기
document.getElementById("addCardBtn").addEventListener("click", () => {
  document.getElementById("addCardModal").classList.remove("hidden");
});

document.getElementById("cancelCardBtn").addEventListener("click", () => {
  document.getElementById("addCardModal").classList.add("hidden");
});

// 카드 생성
document.getElementById("createCardBtn").addEventListener("click", () => {
  const title = document.getElementById("cardTitleInput").value.trim();
  const detail = document.getElementById("cardDetailInput").value.trim();
  const status = document.getElementById("cardStatusSelect").value;
  const cardTypeSelect = document.getElementById("cardTypeSelect").value;
  const date = selectedDate || new Date().toISOString().split("T")[0]; // 오늘 또는 선택한 날짜

  if (!title) return alert("제목을 입력하세요.");

  const newTask = {
    id: Date.now(),
    title,
    detail,
    status,
    date,
    type: cardTypeSelect
  };

  tasks.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderCards();
  document.getElementById("addCardModal").classList.add("hidden");
});


const trashZone = document.getElementById("trashZone");

trashZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  trashZone.classList.add("drag-over");
});

trashZone.addEventListener("dragleave", () => {
  trashZone.classList.remove("drag-over");
});

trashZone.addEventListener("drop", () => {
  const draggingCard = document.querySelector(".dragging");
  if (!draggingCard) return;

  const taskId = draggingCard.dataset.id;
  tasks = tasks.filter((task) => task.id !== Number(taskId));
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderCards();

  trashZone.classList.remove("drag-over");
  trashZone.classList.add("hidden");
});


const prevDropzones = document.querySelectorAll(".prev-stage-dropzone");
prevDropzones.forEach((zone) => {
  zone.addEventListener("dragover", (e) => e.preventDefault());
  zone.addEventListener("dragenter", () => zone.classList.add("over"));
  zone.addEventListener("dragleave", () => zone.classList.remove("over"));

  zone.addEventListener("drop", () => {
    zone.classList.remove("over");
    if (!draggedCard) return;
    const id = draggedCard.dataset.id;
    const currentTask = tasks.find((t) => t.id == id);
    if (!currentTask) return;

    const currentStatus = currentTask.status;
    const prevStatus = zone.dataset.prev;
    const order = ["todo", "doing", "done"];
    if (order.indexOf(prevStatus) === order.indexOf(currentStatus) - 1) {
      currentTask.status = prevStatus;
      saveTasks();
    }
  });
});