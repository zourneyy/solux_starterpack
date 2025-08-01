// navigation.js
import { renderDashboard } from './dashboard.js';
import { initKanban } from './kanban.js';
import { formatDate } from './utils.js';

export function setupNavigation(taskList, current) {
  const menuItems = document.querySelectorAll(".menu li");
  const sections = document.querySelectorAll(".page-section");

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");
      sections.forEach((section) => section.classList.remove("active"));
      document.getElementById(item.dataset.section).classList.add("active");

      if (item.dataset.section === "dashboard") {
        renderDashboard(taskList, current);
      }

      if (["todo", "doing", "done"].includes(item.dataset.section)) {
        // 최신 데이터 불러와서 전달
        const latestTasks = JSON.parse(localStorage.getItem("Tasks")) || [];
        initKanban(latestTasks, formatDate(current));
      }

      if (item.dataset.section !== "calendar") {
        const searchResults = document.getElementById("searchResults");
        if (searchResults) searchResults.style.display = "none";
      }
    });
  });
}
