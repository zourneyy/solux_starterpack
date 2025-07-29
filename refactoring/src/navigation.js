// 페이지별 렌더링을 분리한 함수
function renderPage(activePageId, tasks, currentDate) {
  // 모든 페이지를 숨기고
  document.querySelectorAll('.page-section').forEach(section => {
    section.style.display = 'none';
  });

  // 클릭한 메뉴에 해당하는 섹션만 보이게 함
  const sectionToShow = document.getElementById(activePageId);
  if (sectionToShow) {
    sectionToShow.style.display = 'block';
  }

  // 활성 페이지에 따라 할일 렌더링 호출 분기
  switch(activePageId) {
    case 'calendar':
      // calendar.js에서 구현한 렌더링 호출
      renderCalendar(tasks, currentDate, handleDateClick);
      renderCalendarSidebar(tasks, formatDate(currentDate));
      break;
    case 'todo':
    case 'doing':
    case 'done':
      // kanban.js에서 담당하는 kanban 초기화 호출
      initKanban(tasks, formatDate(currentDate));
      break;
    case 'dashboard':
      renderDashboard(tasks, currentDate);
      break;
  }
}

// 메뉴 클릭 이벤트 설정 함수 (export 해야 함)
export function setupNavigation(tasks, currentDate, renderCallback) {
  const menu = document.querySelector('.menu');
  if (!menu) return;

  menu.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      // active 메뉴 조정
      menu.querySelectorAll('li').forEach(li => li.classList.remove('active'));
      e.target.classList.add('active');

      const sectionId = e.target.dataset.section;

      // 페이지 렌더링 콜백 호출
      if (renderCallback) {
        renderCallback(sectionId, tasks, currentDate);
      }
    }
  });
}
