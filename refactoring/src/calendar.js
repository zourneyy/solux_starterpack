// calendar.js

// utils.js의 함수들은 calendar.js 내부에서도 사용될 수 있음
import { formatDate, parseDate } from './utils.js';

/**
 * 달력 UI를 생성하고 화면에 렌더링
 * @param {Array} tasks - 전체 할 일 배열
 * @param {Date} currentDate - 현재 달력 기준 날짜 객체 (year, month 사용)
 * @param {function} onDateClick - 특정 날짜 클릭 시 동작할 함수 (날짜 문자열 매개변수함)
 * @param {string} selectedDateStr - 선택된 날짜 문자열 (예: '2025-07-31')
 */
export function renderCalendar(tasks, currentDate, onDateClick, selectedDateStr) {
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

  // 달력 요일 헤더 추가
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  days.forEach(day => {
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-cell calendar-day-header";
    dayCell.textContent = day;
    calendarContainer.appendChild(dayCell);
  });

  // 빈 칸(앞부분) 추가
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-cell";
    calendarContainer.appendChild(emptyCell);
  }

  // 날짜 칸 추가
  for (let i = 1; i <= lastDate; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.textContent = i;

    // YYYY-MM-DD 형태 날짜 key 생성
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

    // 오늘 날짜 강조
    if (dateKey === todayStr) cell.classList.add("today");
    // 선택된 날짜 강조
    if (selectedDateStr && dateKey === selectedDateStr) cell.classList.add("selected");

    // 마감 업무 개수 확인 및 표시
    const deadlineCount = tasks.filter(t => t.deadline && t.date === dateKey).length;
    for (let j = 0; j < deadlineCount; j++) {
      const redLine = document.createElement("div");
      redLine.className = "deadline-indicator";
      cell.appendChild(redLine);
    }

    // 클릭 시 해당 날짜를 알리는 콜백 호출
    cell.addEventListener("click", () => onDateClick(dateKey));

    calendarContainer.appendChild(cell);
  }
}

/**
 * 달력의 이전/다음 달 버튼에 이벤트 설정
 * @param {function} onMonthChange - 월 변경 함수 (direction: -1 or 1)
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

// 달력 사이드바 UI 업데이트 함수 모음
export function renderCalendarSidebar(tasks, selectedDateStr) {
  updateSelectedDateTitle(selectedDateStr);
  renderTasksForDate(tasks, selectedDateStr);
  renderDeadlines(tasks, selectedDateStr);
}

// --- 내부 헬퍼 함수 (export 하지 않음) ---

function updateSelectedDateTitle(selectedDateStr) {
  const title = document.getElementById("selectedDateTitle");
  if (!title) return;

  if (!selectedDateStr) {
    title.textContent = "날짜를 선택하세요";
    return;
  }

  const dateObj = parseDate(selectedDateStr);
  title.textContent = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
}

function renderTasksForDate(tasks, selectedDateStr) {
  const list = document.getElementById("taskListForDate");
  if (!list) return;
  const tasksFromStorage = JSON.parse(localStorage.getItem("Tasks")) || [];
  list.innerHTML = "";
  const filtered = tasksFromStorage.filter(t => t.date === selectedDateStr && !t.deadline);
  if (filtered.length === 0) {
    list.innerHTML = "<li>할 일이 없습니다.</li>";
  } else {
    filtered.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t.title;
      list.appendChild(li);
    });
  }
}

function renderDeadlines(tasks, selectedDateStr) {
  const list = document.getElementById("deadlineList");
  if (!list) return;

  list.innerHTML = "";
  const deadlines = tasks.filter(t => t.deadline && t.date === selectedDateStr);
  deadlines.forEach(d => {
    const li = document.createElement("li");
    li.textContent = d.title;
    list.appendChild(li);
  });
}

// 초기 달력 타이틀 텍스트 설정 (페이지 첫 로드 시)
const calendarTitle = document.getElementById("calendarTitle");
if (calendarTitle) {
  const today = new Date();
  const options = { month: 'long', day: 'numeric' }; // '7월 30일' 형태
  calendarTitle.textContent = today.toLocaleDateString('ko-KR', options);
}
