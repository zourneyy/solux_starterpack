// main.js

// 1. 기능별 모듈 가져오기
import { renderDashboard, setupDashboardInteractions } from './dashboard.js';
import { setupFooterInteraction } from './fixedbar.js';
import { setupNavigation } from './navigation.js'; // ★ 수정됨
import { renderCalendar, setupCalendarControls, renderCalendarSidebar } from './calendar.js';
import { formatDate, getUpcomingTasks } from './utils.js';
import { setupSearch } from './search.js';
import { initKanban } from './kanban.js';
import { initTaskManager } from './tasks.js';

// 2. 전역 변수 설정
const todayStr = formatDate(new Date());
const savedTasks = JSON.parse(localStorage.getItem("tasks")); // "Tasks" -> "tasks"로 수정 권장
let tasks = (savedTasks && savedTasks.length > 0) ? savedTasks : [
  { id: 1, title: "디자인 시안 확정", type: "디자인", date: todayStr, status: "todo", deadline: true, dueDate: "2025-08-01" },
  { id: 2, title: "메인 페이지 CSS 작업", type: "개발", date: todayStr, status: "doing", deadline: false, dueDate: null },
  { id: 3, title: "리팩토링 회의록 정리", type: "기획", date: todayStr, status: "done", deadline: false, dueDate: null }
];
let currentDate = new Date();

// 3. 페이지별 렌더링을 담당하는 함수 (★ 새로 추가됨)
function renderPage(pageId) {
  const pageSections = document.querySelectorAll('.page-section');
  pageSections.forEach(section => {
    section.style.display = section.id === pageId ? 'block' : 'none';
  });

  // 현재 활성화된 페이지에 따라 필요한 렌더링만 수행
  switch(pageId) {
    case 'calendar':
      renderCalendar(tasks, currentDate, handleDateClick);
      renderCalendarSidebar(tasks, formatDate(currentDate));
      break;
    case 'todo':
    case 'doing':
    case 'done':
      // kanban.js는 활성화된 섹션을 알아서 찾으므로, 그냥 호출하면 됩니다.
      initKanban(tasks, formatDate(currentDate)); 
      break;
    case 'dashboard':
      renderDashboard(tasks, currentDate);
      break;
  }
}

// 4. 데이터 저장 및 화면 갱신 함수 (★ 역할이 변경됨)
export function saveData() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  // 현재 활성화된 페이지를 기준으로 다시 렌더링합니다.
  const activeMenu = document.querySelector('.menu li.active');
  if (activeMenu) {
    renderPage(activeMenu.dataset.section);
  }
}

// 5. 이벤트 핸들러 함수들
function handleDateClick(clickedDateStr) {
  currentDate = new Date(clickedDateStr);
  saveData(); // saveAndRender -> saveData 로 변경
}

function handleMonthChange(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  saveData(); // saveAndRender -> saveData 로 변경
}

// 6. 페이지가 처음 로드될 때 실행되는 메인 로직
document.addEventListener("DOMContentLoaded", () => {
  // 이벤트 리스너 설정
  setupFooterInteraction();
  setupNavigation(tasks, currentDate, (sectionId) => renderPage(sectionId)); // ★ 수정됨: renderPage 함수 전달
  setupCalendarControls(handleMonthChange);
  setupSearch(tasks);
  setupDashboardInteractions();
  initTaskManager(tasks, formatDate(currentDate));

  // 초기 페이지 렌더링 (달력)
  renderPage('calendar');

  // 알림 기능은 그대로 유지
  if (!sessionStorage.getItem('alertShown')) { 
    const upcomingTasks = getUpcomingTasks(tasks);
    if (upcomingTasks.length > 0) {
      const alertPopup = document.getElementById("alertPopup");
      if (alertPopup) alertPopup.style.display = "flex";
      sessionStorage.setItem('alertShown', 'true');
    }
  }
});
