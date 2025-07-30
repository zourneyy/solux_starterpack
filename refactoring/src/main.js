// main.js
import { renderDashboard, setupDashboardInteractions } from './dashboard.js';
import { setupFooterInteraction } from './fixedbar.js';
import { setupNavigation } from './navigation.js';
import { renderCalendar, setupCalendarControls, renderCalendarSidebar } from './calendar.js';
import { formatDate, getUpcomingTasks } from './utils.js';
import { setupSearch } from './search.js';
import { initTaskManager, initDeadlineManager } from './tasks.js';
import { initKanban } from './kanban.js';

// 전역 변수
export let currentDate = new Date();

export let tasks = JSON.parse(localStorage.getItem("Tasks")) || [];

// 데이터 저장 후 전체 렌더링
export function saveAndRender() {
  tasks = JSON.parse(localStorage.getItem("Tasks")) || []; // 여기에 최신 데이터 항상 불러오기
  localStorage.setItem('Tasks', JSON.stringify(tasks));
  renderCalendar(tasks, currentDate, handleDateClick);
  renderCalendarSidebar(tasks, formatDate(currentDate));
  renderDashboard(tasks, currentDate);
  initKanban(tasks, formatDate(currentDate));
  initTaskManager(tasks, formatDate(currentDate));
}

// 할 일 삭제 함수
export function deleteTaskById(id) {
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem('Tasks', JSON.stringify(tasks));
  saveAndRender();
}

// 할 일 상태 변경 함수
export function updateTaskStatus(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = newStatus;
    saveAndRender();
  }
}

// 날짜 선택 처리 (달력 클릭)
function handleDateClick(clickedDateStr) {
  currentDate = new Date(clickedDateStr);
  saveAndRender();
}

// 월 단위 이동 (달력)
function handleMonthChange(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  saveAndRender();
}

// 일 단위 이동 (TODO, DOING, DONE, 대시보드)
function handleDayChange(direction) {
  currentDate.setDate(currentDate.getDate() + direction);
  saveAndRender();
  updateDayLabels();
}

// 날짜 텍스트 업데이트
function updateDayLabels() {
  const labels = [
    { id: "todoDayLabel" },
    { id: "doingDayLabel" },
    { id: "doneDayLabel" },
    { id: "dashboardDayLabel" }
  ];

  const dateObj = currentDate;
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  labels.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `${month}월 ${day}일`;
  });
}

// 초기화, 이벤트 연결 부분
document.addEventListener("DOMContentLoaded", () => {
  saveAndRender();

  setupFooterInteraction();
  setupNavigation(tasks, currentDate);
  setupCalendarControls(handleMonthChange);
  setupSearch(tasks);
  setupDashboardInteractions();

  updateDayLabels();

  // 마감 업무 추가 기능 초기화
  initDeadlineManager(tasks, saveAndRender);

  // TODO/DOING/DONE 각 페이지 날짜기준 삭제 및 다음 버튼 이벤트 연결
document.querySelectorAll(".prevDayBtn").forEach(button => {
  if (!button.closest("#dashboard")) {
    button.addEventListener("click", () => handleDayChange(-1));
  }
});

document.querySelectorAll(".nextDayBtn").forEach(button => {
  if (!button.closest("#dashboard")) {
    button.addEventListener("click", () => handleDayChange(1));
  }
});


  // 알림 팝업 한번만 보여주기
  if (!sessionStorage.getItem('alertShown')) {
    const upcomingTasks = getUpcomingTasks(tasks);
    if (upcomingTasks.length > 0) {
      const alertPopup = document.getElementById("alertPopup");
      if (alertPopup) alertPopup.style.display = "flex";
      sessionStorage.setItem('alertShown', 'true');
    }
  }
});
