// 1. 대시보드 렌더링 기능을 dashboard.js에서 가져오기
import { renderDashboard } from './dashboard.js';

// 페이지 전환 이벤트를 설정하는 함수
export function setupNavigation(tasks) {
  const menuItems = document.querySelectorAll(".menu li");
  const sections = document.querySelectorAll(".page-section");

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");
      sections.forEach((section) => section.classList.remove("active"));
      document.getElementById(item.dataset.section).classList.add("active");

      // 2. "대시보드" 탭을 클릭 시 import 해온 renderDashboard 함수 직접 호출
      if (item.dataset.section === "dashboard") {
        renderDashboard(tasks); // ★ 수정된 부분
      }

      // 3. 아직 리팩토링되지 않은 기능 일단 주석 처리
      // if (["todo", "doing", "done"].includes(item.dataset.section)) {
      //   updateDayLabels(); // 이 함수는 나중에 kanban.js 등에서 가져와야 함
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
