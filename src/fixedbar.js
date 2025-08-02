// fixedbar.js

import { formatDate } from './utils.js';

export function updateFooterStatusCounts(tasks) {
  // 날짜 조건 없이 전체 tasks를 상태별 카운트
  const todoCount = tasks.filter(t => t.status === "todo").length;
  const doingCount = tasks.filter(t => t.status === "doing").length;
  const doneCount = tasks.filter(t => t.status === "done").length;
  const total = tasks.length;
  const remainingCount = todoCount + doingCount;

  const statusEl = document.getElementById("statusCounts");
  if (statusEl) {
    statusEl.innerHTML = `TODO ${todoCount} | DOING ${doingCount} | DONE ${doneCount} | <span class="footer-remaining-tasks">남은 업무 ${remainingCount}/${total}</span>`;
  }
}



export function setupFooterInteraction() {
  // 의도치 않은 버그 막기 위해 비워둠
}
