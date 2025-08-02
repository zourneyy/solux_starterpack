// calendar.js

import { formatDate, parseDate, getOverdueStatusText } from './utils.js';

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

    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

    if (dateKey === todayStr) cell.classList.add("today");
    if (selectedDateStr && dateKey === selectedDateStr) cell.classList.add("selected");

    const deadlineCount = tasks.filter(t => t.dueDate === dateKey).length;
    if (deadlineCount > 0) {
      cell.classList.add("deadline-day");
      for (let j = 0; j < deadlineCount; j++) {
        const redLine = document.createElement("div");
        redLine.className = "deadline-indicator";
        cell.appendChild(redLine);
      }
    }

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

// 선택된 날짜 타이틀 업데이트
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

/**
 * 특정 날짜에 해당하는 할 일 목록 필터링 (마감일 지난 업무 포함)
 */
function getTasksForDate(dateStr, tasks) {
  const todayStr = formatDate(new Date());

  return tasks.filter(task => {
    // 1. 'done' 상태인 업무는 항상 제외
    if (task.status === "done") return false;

    const taskCreatedDate = task.date;
    const taskDueDate = task.dueDate;
    const isOverdue = taskDueDate && todayStr > taskDueDate;

    // 2. 마감일이 지난 업무는 '오늘' 날짜를 볼 때만 표시
    if (isOverdue) {
      return dateStr === todayStr;
    }
    
    // 3. 일반 업무는 생성일 ~ 마감일 사이에 표시
    if (!taskDueDate) {
      return taskCreatedDate === dateStr;
    } else {
      return dateStr >= taskCreatedDate && dateStr <= taskDueDate;
    }
  });
}

/**
 * 할 일 목록 렌더링 (마감일 지난 표시 추가)
 */
function renderTasksForDate(tasks, selectedDateStr) {
  const list = document.getElementById("taskListForDate");
  if (!list) return;

  list.innerHTML = "";

  const filtered = getTasksForDate(selectedDateStr, tasks);

  filtered.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t.title;

    if (t.dueDate) {
      const dueSpan = document.createElement("span");
      const overdueText = getOverdueStatusText(t.dueDate);
      dueSpan.textContent = ` (~${t.dueDate}${overdueText})`;
      dueSpan.style.color = overdueText ? "orange" : "red";
      dueSpan.style.marginLeft = "6px";
      li.appendChild(dueSpan);
    }
    list.appendChild(li);
  });
}

/**
 * 마감 업무 목록은 아무것도 표시하지 않도록 비워둠
 */
function renderDeadlines(tasks, selectedDateStr) {
  const list = document.getElementById("deadlineList");
  if (!list) return;
  list.innerHTML = "";
}


// 초기 달력 타이틀 텍스트 설정 (페이지 첫 로드 시)
const calendarTitle = document.getElementById("calendarTitle");
if (calendarTitle && !calendarTitle.textContent) {
  const today = new Date();
  const options = { year: 'numeric', month: 'long' };
  calendarTitle.textContent = today.toLocaleDateString('ko-KR', options);
}
