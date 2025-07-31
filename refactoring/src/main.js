// main.js
import { renderDashboard, setupDashboardInteractions } from './dashboard.js';
import { setupFooterInteraction, updateFooterStatusCounts } from './fixedbar.js';
import { setupNavigation } from './navigation.js';
import { renderCalendar, setupCalendarControls, renderCalendarSidebar } from './calendar.js';
import { formatDate, getUpcomingTasks } from './utils.js';
import { setupSearch } from './search.js';
import { initTaskManager, initDeadlineManager } from './tasks.js';
import { initKanban } from './kanban.js';

export let currentDate = new Date();
export let tasks = JSON.parse(localStorage.getItem("Tasks")) || [];

// 전체 UI 갱신 함수 (초기 렌더 및 데이터 변경 시)
export function saveAndRender() {
  localStorage.setItem('Tasks', JSON.stringify(tasks));

  renderCalendar(tasks, currentDate, handleDateClick, formatDate(currentDate));
  renderCalendarSidebar(tasks, formatDate(currentDate));
  renderDashboard(tasks, currentDate);
  initKanban(tasks, formatDate(currentDate));

  // 하단바 '오늘 진행 상황'은 시스템 현재 날짜 기준으로 고정 업데이트
  updateFooterStatusCounts(tasks);
}

// 카드 추가 후 UI만 갱신하는 콜백 함수
function onCardCreated() {
  renderCalendar(tasks, currentDate, handleDateClick, formatDate(currentDate));
  renderCalendarSidebar(tasks, formatDate(currentDate));
  renderDashboard(tasks, currentDate);
  initKanban(tasks, formatDate(currentDate));

  updateFooterStatusCounts(tasks);
}

// 할 일 삭제 함수
export function deleteTaskById(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveAndRender();
}

// 할 일 상태 변경 함수
export function updateTaskStatus(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    console.log(`Changing status of task ${id} from ${task.status} to ${newStatus}`);
    task.status = newStatus;
    saveAndRender();
  } else {
    console.warn(`Task ${id} not found for status update`);
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

// 섹션 화면 표시 처리
function updatePageVisibility(selectedSectionId) {
  const sections = document.querySelectorAll(".page-section");
  sections.forEach(section => {
    section.classList.remove("active", "calendar-page", "dashboard-page", "kanban-page");
    if (section.id === selectedSectionId) {
      section.classList.add("active");

      if (["todo", "doing", "done"].includes(selectedSectionId)) {
        section.classList.add("kanban-page");
      } else if (selectedSectionId === "calendar") {
        section.classList.add("calendar-page");
      } else if (selectedSectionId === "dashboard") {
        section.classList.add("dashboard-page");
      }
    }
  });

  // 버튼 영역 제어
  const kanbanButtons = document.querySelector(".kanban-buttons");
  const isKanbanPage = ["todo", "doing", "done"].includes(selectedSectionId);
  if (kanbanButtons) {
    kanbanButtons.style.display = isKanbanPage ? "flex" : "none";
  }
}

// 초기화 및 이벤트 연결
document.addEventListener("DOMContentLoaded", () => {
  saveAndRender();

  // tasks.js 초기화 (콜백 전달)
  initTaskManager(tasks, formatDate(currentDate), onCardCreated);

  setupFooterInteraction();
  setupNavigation(tasks, currentDate);
  setupCalendarControls(handleMonthChange);
  setupSearch(tasks);
  setupDashboardInteractions();

  updateDayLabels();

  // 마감 업무 추가 기능 초기화
  initDeadlineManager(tasks, saveAndRender);

  // 이전/다음 날짜 버튼 연결 (칸반보드 제외 대시보드)
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

  // 메뉴 클릭 시 섹션 변경 이벤트
  document.querySelectorAll(".menu li").forEach(menuItem => {
    menuItem.addEventListener("click", () => {
      const sectionId = menuItem.getAttribute("data-section");
      localStorage.setItem("selectedSectionId", sectionId);
      updatePageVisibility(sectionId);
    });
  });

  // 저장된 섹션 ID 불러오기
  const savedSection = localStorage.getItem("selectedSectionId");
  updatePageVisibility(savedSection || "calendar");

  // 메뉴 active 표시 업데이트
  document.querySelectorAll(".menu li").forEach(menuItem => {
    menuItem.classList.remove("active");
    if (menuItem.getAttribute("data-section") === savedSection) {
      menuItem.classList.add("active");
    }
  });

  // 알림 팝업 표시 (세션 중 1회)
  if (!sessionStorage.getItem('alertShown')) {
    const upcomingTasks = getUpcomingTasks(tasks);
    if (upcomingTasks.length > 0) {
      const alertPopup = document.getElementById("alertPopup");
      if (alertPopup) alertPopup.style.display = "flex";
      sessionStorage.setItem('alertShown', 'true');
    }
  }
});
