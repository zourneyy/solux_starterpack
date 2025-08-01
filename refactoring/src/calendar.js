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

    // --- 마감일 당일인 task 개수 체크 (dueDate 기준) ---
    const deadlineCount = tasks.filter(t => t.dueDate === dateKey).length;

    if (deadlineCount > 0) {
      cell.classList.add("deadline-day");  // 마감일 있는 날짜에 클래스 추가 (css로 스타일링 가능)
      for (let j = 0; j < deadlineCount; j++) {
        const redLine = document.createElement("div");
        redLine.className = "deadline-indicator";
        cell.appendChild(redLine);
      }
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
  renderDeadlines(tasks, selectedDateStr); // 마감 업무 렌더링 함수는 호출되지만, 내용은 비워지도록 수정됨
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
 * 특정 날짜에 해당하는 할 일 목록 필터링 함수
 * 마감일이 있으면 생성일부터 마감일까지 포함, 없으면 생성일만 포함
 * @param {string} dateStr - YYYY-MM-DD 형식 날짜 문자열
 * @param {Array} tasks - 전체 task 배열
 * @returns {Array} - 해당 날짜에 해당하는 할 일 배열
 */
function getTasksForDate(dateStr, tasks) {
  // 💡 참고: 'statue'가 아니라 'status'일 가능성이 높습니다. 오타일 경우 수정해주세요!
  return tasks.filter(task => {
    if (!task.title || task.type === "마감" || task.status === "done") return false; // "statue"를 "status"로 수정했습니다.

    const taskCreatedDate = task.date;
    const taskDueDate = task.dueDate;

    if (!taskDueDate) {
      // 마감일 없는 경우 생성일과 같은 날짜만 포함
      return taskCreatedDate === dateStr;
    } else {
      // 마감일 있으면 생성일부터 마감일까지 모두 포함 (마감일 포함!)
      return dateStr >= taskCreatedDate && dateStr <= taskDueDate;
    }
  });
}

/**
 * 할 일 목록 렌더링 ('할 일 +' 목록)
 * 마감일까지 기간 내인 할 일 모두 포함 (dueDate가 있으면 date~dueDate 기간 내)
 * @param {Array} tasks - 전체 tasks 배열
 * @param {string} selectedDateStr - YYYY-MM-DD 형식 날짜
 */
function renderTasksForDate(tasks, selectedDateStr) {
  const list = document.getElementById("taskListForDate");
  if (!list) return;

  list.innerHTML = "";

  const filtered = getTasksForDate(selectedDateStr, tasks);
  
  // ★ 수정된 부분 ★
  // "할 일이 없습니다" 문구를 표시하던 'if' 조건을 제거했습니다.
  // 이제 할 일이 없으면 목록이 그냥 비어있게 됩니다.
  filtered.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t.title;

    // 마감일이 있으면 제목 옆에 빨간색으로 마감일 표시
    if (t.dueDate) {
      const dueSpan = document.createElement("span");
      dueSpan.textContent = ` (~${t.dueDate})`;
      dueSpan.style.color = "red";
      dueSpan.style.marginLeft = "6px";
      li.appendChild(dueSpan);
    }

    list.appendChild(li);
  });
}

/**
 * 마감 업무 목록 렌더링 ('마감 업무 +' 목록)
 * @param {Array} tasks - 전체 tasks 배열
 * @param {string} selectedDateStr - YYYY-MM-DD 형식 날짜
 */
function renderDeadlines(tasks, selectedDateStr) {
  const list = document.getElementById("deadlineList");
  if (!list) return;

  // ★ 수정된 부분 ★
  // 목록 내용을 항상 비워서 "개발 완성"과 같은 마감 업무가 표시되지 않도록 합니다.
  list.innerHTML = "";
}


// 초기 달력 타이틀 텍스트 설정 (페이지 첫 로드 시)
// 이 부분은 페이지 로드 시 한 번만 실행되므로 그대로 둡니다.
const calendarTitle = document.getElementById("calendarTitle");
if (calendarTitle && !calendarTitle.textContent) { // 내용이 없을 때만 초기 설정
  const today = new Date();
  const options = { year: 'numeric', month: 'long' }; // '2025년 8월' 형태
  calendarTitle.textContent = today.toLocaleDateString('ko-KR', options);
}
