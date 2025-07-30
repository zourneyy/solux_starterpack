// utils.js의 함수들은 calendar.js 내부에서도 사용될 수 있음
import { formatDate, parseDate } from './utils.js';

/**
 * 달력 UI를 생성하고 화면에 렌더링
 */
export function renderCalendar(tasks, currentDate, onDateClick) {
  const calendarContainer = document.getElementById("calendarContainer");
  const calendarTitle = document.getElementById("calendarTitle");

  if (!calendarContainer || !calendarTitle) {
    console.error("달력 UI 요소를 찾을 수 없습니다.");
    return;
  }

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  calendarContainer.innerHTML = "";
  calendarTitle.textContent = `${currentYear}년 ${currentMonth + 1}월`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayStr = formatDate(new Date());

  const days = ["일", "월", "화", "수", "목", "금", "토"];
  days.forEach(day => {
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-cell calendar-day-header";
    dayCell.textContent = day;
    calendarContainer.appendChild(dayCell);
  });

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-cell";
    calendarContainer.appendChild(emptyCell);
  }

  for (let i = 1; i <= lastDate; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.textContent = i;
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

    if (dateKey === todayStr) cell.classList.add("today");

    cell.addEventListener("click", () => onDateClick(dateKey));

    calendarContainer.appendChild(cell);
  }
}

/**
 * 달력의 이전/다음 달 버튼에 이벤트 설정
 */
export function setupCalendarControls(onMonthChange) {
  const prevMonthBtn = document.getElementById("prevMonthBtn");
  const nextMonthBtn = document.getElementById("nextMonthBtn");

  if (!prevMonthBtn || !nextMonthBtn) {
    console.error("달력 컨트롤 버튼을 찾을 수 없습니다.");
    return;
  }

  prevMonthBtn.addEventListener("click", () => onMonthChange(-1));
  nextMonthBtn.addEventListener("click", () => onMonthChange(1));
}

// 달력 사이드바의 UI 업데이트하는 함수들 모아서 export
export function renderCalendarSidebar(Tasks, selectedDateStr) {
  updateSelectedDateTitle(selectedDateStr);
  renderTasksForDate(Tasks, selectedDateStr);
  renderDeadlines(Tasks, selectedDateStr);
}

// --- 아래 함수들은 내부 헬퍼 함수, export 하지 않음 ---

function updateSelectedDateTitle(selectedDateStr) {
  const title = document.getElementById("selectedDateTitle");
  if (!title) return; // 안전장치

  if (!selectedDateStr) {
    title.textContent = "날짜를 선택하세요";
    return;
  }
  const dateObj = parseDate(selectedDateStr);
  title.textContent = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
}

function renderTasksForDate(Tasks, selectedDateStr) {
  const list = document.getElementById("taskListForDate");
  if (!list) return; // 안전장치
  const tasks = JSON.parse(localStorage.getItem("Tasks")) || [];
  list.innerHTML = "";
  const filtered = tasks.filter((t) => t.date === selectedDateStr && !t.deadline);
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

function renderDeadlines(tasks, selectedDateStr) {
  const list = document.getElementById("deadlineList");
  if (!list) return; // 안전장치

  list.innerHTML = "";
  const deadlines = tasks.filter((t) => t.deadline && t.date === selectedDateStr);
  deadlines.forEach((d) => {
    const li = document.createElement("li");
    li.textContent = d.title;
    list.appendChild(li);
  });
}

const calendarTitle = document.getElementById("calendarTitle");
if (calendarTitle) {
  const today = new Date();
  const options = { month: 'long', day: 'numeric' }; // '7월 30일' 형태
  calendarTitle.textContent = today.toLocaleDateString('ko-KR', options);
}