// 1. 기능별 렌더링 및 설정 함수 가져오기
import { renderDashboard } from './dashboard.js';
import { setupFooterInteraction } from './fixedbar.js'; // 하단 바 기능 가져오기
import { setupNavigation } from './navigation.js'; // 네비게이션 기능 가져오기
import { renderCalendar, setupCalendarControls } from './calendar.js'; // 달력 기능 가져오기
import { formatDate } from './utils.js'; // 유틸 함수 가져오기
// import { renderKanban } from './kanban.js'; // 다른 기능도 이 형식으로 가져오기

// 2. 모든 팀원이 공유할 데이터
let tasks = JSON.parse(localStorage.getItem("tasks")) || [
];
let currentDate = new Date(); // 현재 날짜 (달력, 칸반보드 등 이 날짜 기준 표시)

// ★★★ 데이터 저장과 화면 새로고침을 한번에 처리하는 공용 함수 ★★★
export function saveAndRender() {
  // 1. 현재 tasks 데이터를 localStorage에 저장
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // 2. 관련된 모든 화면 다시 렌더링
  renderDashboard(tasks);
  renderCalendar(tasks, currentDate, handleDateClick); // 달력 다시 그리기
  // renderKanban(tasks); // 칸반보드 렌더링 함수도 여기서 같이 호출
}

// 3. 이벤트 핸들러 : 달력 날짜 클릭 시 실행될 함수
function handleDateClick(clickedDateStr) {
  currentDate = new Date(clickedDateStr); // 중앙 상태 업데이트
  saveAndRender(); // 모든 화면 새 날짜에 맞게 새로고침
}

// 4. 이벤트 핸들러 : 달력 월 변경 버튼 클릭 시 실행될 함수
function handleMonthChange(direction) {
  const month = currentDate.getMonth();
  currentDate.setMonth(month + direction); // 중앙 상태 업데이트
  saveAndRender(); // 모든 화면을 새 달에 맞게 새로고침
}

// 5. 페이지 처음 로드 시 실행
document.addEventListener("DOMContentLoaded", () => {
  saveAndRender(); // 데이터 기반 화면 렌더링
  setupFooterInteraction(); // 하단 바 클릭 이벤트 설정
  setupNavigation(tasks); // 네비게이션 설정 함수 실행
  setupCalendarControls(handleMonthChange); // 달력 버튼 이벤트 설정
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
