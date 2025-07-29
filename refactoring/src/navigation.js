import { renderDashboard } from './dashboard.js';

// currentDate를 매개변수로 받음
export function setupNavigation(tasks, currentDate) {
  const menuItems = document.querySelectorAll(".menu li");
  const sections = document.querySelectorAll(".page-section");

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");
      sections.forEach((section) => section.classList.remove("active"));
      document.getElementById(item.dataset.section).classList.add("active");

      // renderDashboard를 호출할 때 currentDate를 함께 넘겨줌
      if (item.dataset.section === "dashboard") {
        renderDashboard(tasks, currentDate); 
      }

      // 아직 리팩토링되지 않은 기능은 일단 주석 처리
      // if (["todo", "doing", "done"].includes(item.dataset.section)) {
      //   updateDayLabels(); 
      // }

      if (item.dataset.section !== "calendar") {
        const searchResults = document.getElementById("searchResults");
        if (searchResults) {
          searchResults.style.display = "none";
        }
      }
    });
  });
}
