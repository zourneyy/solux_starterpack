// 1. 기능별 렌더링 및 설정 함수 가져오기
import { renderDashboard, setupDashboardInteractions } from './dashboard.js';
import { setupFooterInteraction } from './fixedbar.js';
import { setupNavigation } from './navigation.js';
import { renderCalendar, setupCalendarControls, renderCalendarSidebar } from './calendar.js';
import { formatDate } from './utils.js';
import { setupSearch } from './search.js';
// import { renderKanban } from './kanban.js'; // 다른 기능도 이 형식으로 가져오기

// 2. 모든 팀원이 공유할 데이터
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentDate = new Date();

// 데이터 저장과 화면 새로고침을 한번에 처리하는 공용 함수
export function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // 관련된 모든 화면 다시 렌더링
  renderDashboard(tasks, currentDate);
  renderCalendar(tasks, currentDate, handleDateClick);
  renderCalendarSidebar(tasks, formatDate(currentDate));
  // renderKanban(tasks, currentDate); // 칸반보드 렌더링 함수도 여기서 같이 호출
}

// 3. 이벤트 핸들러: 달력 날짜 클릭 시 실행될 함수
function handleDateClick(clickedDateStr) {
  currentDate = new Date(clickedDateStr);
  saveAndRender();
}

// 4. 이벤트 핸들러: 달력 월 변경 버튼 클릭 시 실행될 함수
function handleMonthChange(direction) {
  const month = currentDate.getMonth();
  currentDate.setMonth(month + direction);
  saveAndRender();
}

// 5. 페이지 처음 로드 시 실행
document.addEventListener("DOMContentLoaded", () => {
  saveAndRender();
  setupFooterInteraction();
  setupNavigation(tasks, currentDate);
  setupCalendarControls(handleMonthChange);
  setupSearch(tasks);
  setupDashboardInteractions();
});

/*
  [추후 기능 작성 가이드]
  이제부터 칸반보드나 달력에서 tasks 배열에 변화를 주는 작업(추가, 수정, 삭제)을 한 뒤에는,
  반드시 마지막에 saveAndRender() 함수를 호출해주세요!
  그러면 저장과 모든 화면 업데이트가 자동으로 처리됩니다.

  예시:
  function addNewTask(newTitle) {
    tasks.push({ id: Date.now(), title: newTitle, status: "TODO" }); // 데이터 변경
    saveAndRender(); // 이 함수 하나만 호출하면 됩니다
  }
*/
