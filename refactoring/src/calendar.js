import { formatDate, parseDate } from './utils.js'; // utils.js 사용

// 달력과 관련된 HTML 요소들 미리 찾아두기
const calendarContainer = document.getElementById("calendarContainer");
const calendarTitle = document.getElementById("calendarTitle");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

/**
 * 달력 UI를 생성하고 화면에 렌더링하는 함수
 * @param {object[]} tasks - 전체 할 일 목록
 * @param {Date} currentDate - 현재 기준이 되는 날짜
 * @param {function} onDateClick - 날짜가 클릭되었을 때 실행될 콜백 함수
 */
export function renderCalendar(tasks, currentDate, onDateClick) {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  calendarContainer.innerHTML = ""; // 기존 달력 초기화
  calendarTitle.textContent = `${currentYear}년 ${currentMonth + 1}월`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayStr = formatDate(new Date());

  // ... (이하 script.js에 있던 달력 생성 로직과 거의 동일) ...
  // 요일 헤더
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  days.forEach(day => {
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-cell calendar-day-header";
    dayCell.textContent = day;
    calendarContainer.appendChild(dayCell);
  });

  // 빈 칸
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-cell";
    calendarContainer.appendChild(emptyCell);
  }

  // 날짜 칸
  for (let i = 1; i <= lastDate; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.textContent = i;
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

    if (dateKey === todayStr) cell.classList.add("today");
    
    // 날짜 클릭 이벤트를 main.js에 알려줌
    cell.addEventListener("click", () => onDateClick(dateKey));

    calendarContainer.appendChild(cell);
  }
}

/**
 * 달력의 이전/다음 달 버튼에 이벤트를 설정하는 함수
 * @param {function} onMonthChange - 월이 변경될 때 실행될 콜백 함수
 */
export function setupCalendarControls(onMonthChange) {
  prevMonthBtn.addEventListener("click", () => onMonthChange(-1)); // -1: 이전 달
  nextMonthBtn.addEventListener("click", () => onMonthChange(1));  // 1: 다음 달
}
