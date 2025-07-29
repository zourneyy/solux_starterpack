// 1. 기능별 렌더링 및 설정 함수 가져오기
import { renderDashboard, setupDashboardInteractions } from './dashboard.js';
import { setupFooterInteraction } from './fixedbar.js';
import { setupNavigation } from './navigation.js';
import { renderCalendar, setupCalendarControls, renderCalendarSidebar } from './calendar.js';
import { formatDate, getUpcomingTasks } from './utils.js'; 
import { setupSearch } from './search.js';


const todayStr = formatDate(new Date()); 
const savedTasks = JSON.parse(localStorage.getItem("Tasks"));

let tasks = (savedTasks && savedTasks.length > 0) ? savedTasks : [
  { id: 1, title: "디자인 시안 확정", type: "디자인", date: todayStr, status: "TODO", deadline: true, dueDate: "2025-08-01" },
  { id: 2, title: "메인 페이지 CSS 작업", type: "개발", date: todayStr, status: "DOING", deadline: false, dueDate: null },
  { id: 3, title: "리팩토링 회의록 정리", type: "기획", date: todayStr, status: "DONE", deadline: false, dueDate: null }
];

let currentDate = new Date();


export function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderDashboard(tasks, currentDate);
  renderCalendar(tasks, currentDate, handleDateClick);
  renderCalendarSidebar(tasks, formatDate(currentDate));
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


  // 여기서 알림 담당
  if (!sessionStorage.getItem('alertShown')) { 
    const upcomingTasks = getUpcomingTasks(tasks);
    if (upcomingTasks.length > 0) {
      const alertPopup = document.getElementById("alertPopup");
      if (alertPopup) alertPopup.style.display = "flex";
      sessionStorage.setItem('alertShown', 'true');
    }
  }
});
