import { renderDashboard, setupDashboardInteractions } from './dashboard.js';
import { setupFooterInteraction } from './fixedbar.js';
import { setupNavigation } from './navigation.js';
import { renderCalendar, setupCalendarControls, renderCalendarSidebar } from './calendar.js';
import { formatDate, getUpcomingTasks } from './utils.js';
import { setupSearch } from './search.js';
import { initTaskManager, initDeadlineManager } from './tasks.js';
import { initKanban } from './kanban.js';

export let currentDate = new Date();
export let tasks = JSON.parse(localStorage.getItem("Tasks")) || [
  { id: 1, title: "디자인 시안 확정", type: "디자인", date: formatDate(currentDate), status: "todo", deadline: true, dueDate: "2025-08-01" },
  { id: 2, title: "메인 페이지 CSS 작업", type: "개발", date: formatDate(currentDate), status: "doing", deadline: false },
  { id: 3, title: "리팩토링 회의록 정리", type: "기획", date: formatDate(currentDate), status: "done", deadline: false }
];

// tasks 수정 후 저장 및 전체 다시 렌더링하는 함수
export function saveAndRender() {
  localStorage.setItem('Tasks', JSON.stringify(tasks));
  renderCalendar(tasks, currentDate, handleDateClick);
  renderCalendarSidebar(tasks, formatDate(currentDate));
  renderDashboard(tasks, currentDate);
  initKanban(tasks, formatDate(currentDate));
  initTaskManager(tasks, formatDate(currentDate), saveAndRender);
}

// tasks 삭제 함수 (kanban.js에서 호출)
export function deleteTaskById(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveAndRender();
}

// tasks 상태 변경 함수 (kanban.js에서 호출)
export function updateTaskStatus(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = newStatus;
    saveAndRender();
  }
}

function handleDateClick(clickedDateStr) {
  currentDate = new Date(clickedDateStr);
  saveAndRender();
}

function handleMonthChange(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  saveAndRender();
}

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

  if (!sessionStorage.getItem('alertShown')) {
    const upcomingTasks = getUpcomingTasks(tasks);
    if (upcomingTasks.length > 0) {
      const alertPopup = document.getElementById("alertPopup");
      if (alertPopup) alertPopup.style.display = "flex";
      sessionStorage.setItem('alertShown', 'true');
    }
  }
});

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
