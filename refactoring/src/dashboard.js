// dashboard.js
import { formatDate } from './utils.js';

/**
 * 마감 임박 작업 필터링 함수
 * - todo 또는 doing 상태의 마감 업무 중 오늘 기준 최대 maxDay일 이내 임박한 일정 반환
 * - dDay가 음수인 경우 D+xx로 마감일 지나도 계속 표시
 * @param {Array} tasks 전체 할 일 배열
 * @param {string|null} baseDateStr 기준 날짜 문자열 (없으면 오늘)
 * @param {number} maxDay 최대 임박일 (기본 3일)
 * @returns {Array} dDay 프로퍼티가 추가된 임박 작업 리스트
 */
export function getUpcomingTasks(tasks, baseDateStr = null, maxDay = 3) {
  const today = baseDateStr ? new Date(baseDateStr) : new Date();

  return tasks
    .filter(task =>
      task.deadline &&                             // 마감 업무만
      (task.status === "todo" || task.status === "doing") && // done 제외
      task.dueDate                                 // 마감일 존재
    )
    .map(task => {
      const dueDate = new Date(task.dueDate);
      const diff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24)); // 일 단위 차이
      return { ...task, dDay: diff };
    })
    // maxDay 이상 넘어도 마감일 지난(task.dDay < 0) 일정은 계속 보임
    .filter(task => task.dDay <= maxDay)
    .sort((a, b) => a.dDay - b.dDay);  // 임박 순 정렬
}

/**
 * D-day / D+day 문자열 포맷
 * @param {number} dDay
 * @returns {string}
 */
function formatDDay(dDay) {
  if (dDay > 0) return `D-${dDay}`;
  else if (dDay === 0) return "D-DAY";
  else return `D+${Math.abs(dDay)}`;
}

/**
 * 대시보드 렌더링 함수
 * @param {Array} tasks 전체 할 일 배열
 * @param {Date} currentDate 현재 날짜 객체
 */
export function renderDashboard(tasks, currentDate) {
  // 1. 날짜 네비게이션 라벨 업데이트
  const dateLabel = document.getElementById("dashboardDayLabel");
  if (dateLabel) {
    dateLabel.textContent = `${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일 현황`;
  }

  // 2. 마감 임박 일정 리스트 렌더링
  const upcomingTasks = getUpcomingTasks(tasks);
  const upcomingList = document.getElementById("upcomingDeadlinesList");
  if (upcomingList) {
    upcomingList.innerHTML = "";
    if (upcomingTasks.length > 0) {
      upcomingTasks.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `<strong style="color: red;">${formatDDay(task.dDay)}</strong>: ${task.title}`;
        upcomingList.appendChild(li);
      });
    } else {
      upcomingList.innerHTML = "<li>마감 임박 일정이 없습니다.</li>";
    }
  }

  // 3. 중요도별 분포 차트 렌더링
  const distributionChart = document.getElementById("taskDistributionChart");
  if (!distributionChart) return;

  const importanceCount = {};
  tasks.forEach(task => {
    if (!task.deadline) { // 마감 업무 제외
      const importance = task.type || "일반";
      importanceCount[importance] = (importanceCount[importance] || 0) + 1;
    }
  });

  distributionChart.innerHTML = "";

  for (const [level, count] of Object.entries(importanceCount)) {
    const total = Object.values(importanceCount).reduce((a, b) => a + b, 0);
    const percent = ((count / total) * 100).toFixed(1);

    const barContainer = document.createElement("div");
    barContainer.style.marginBottom = "6px";

    const label = document.createElement("span");
    label.textContent = `${level} (${count}개) `;
    label.style.fontWeight = "bold";

    const bar = document.createElement("div");
    bar.style.display = "inline-block";
    bar.style.height = "14px";
    bar.style.width = `${percent}%`;
    bar.style.backgroundColor = "#70a5ff";
    bar.style.borderRadius = "4px";
    bar.style.verticalAlign = "middle";
    bar.style.transition = "width 0.3s ease";

    barContainer.appendChild(label);
    barContainer.appendChild(bar);

    distributionChart.appendChild(barContainer);
  }

  // 4. 전체 진행률 및 남은 업무 수
  const progressCircle = document.getElementById("overallProgress");
  const remainingCount = document.getElementById("remainingTasksCount");
  const total = tasks.filter(t => !t.deadline).length;
  const done = tasks.filter(t => !t.deadline && t.status === "done").length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  if (progressCircle) {
    progressCircle.style.setProperty("--p", `${percent}%`);
    progressCircle.innerHTML = `<span>${percent}%</span>`;
  }
  if (remainingCount) remainingCount.textContent = `${total - done} / ${total}`;

  // 5. 하단 상태바 전체 업데이트
  const tasksForDay = tasks.filter(t => !t.deadline && t.date === formatDate(currentDate));
  const todoCount = tasksForDay.filter(t => t.status === "todo").length;
  const doingCount = tasksForDay.filter(t => t.status === "doing").length;
  const doneCountDay = tasksForDay.filter(t => t.status === "done").length;
  const totalDayTasks = tasksForDay.length;
  const remainingDayTasks = totalDayTasks - doneCountDay;

  const statusCountsEl = document.getElementById("statusCounts");
  if (statusCountsEl) {
    statusCountsEl.innerHTML = `TODO ${todoCount} | DOING ${doingCount} | DONE ${doneCountDay} | <span class="footer-remaining-tasks">남은 업무 ${remainingDayTasks}/${totalDayTasks}</span>`;
  }

  const footerUrgentCountEl = document.getElementById("footerUrgentCount");
  if (footerUrgentCountEl) {
    if (upcomingTasks.length > 0) {
      footerUrgentCountEl.innerHTML = `<span class="footer-urgent-count">${upcomingTasks.length}개</span>`;
    } else {
      footerUrgentCountEl.textContent = "0개";
    }
  }

  const allProjectTasks = tasks.filter(t => !t.deadline);
  const allDoneTasks = allProjectTasks.filter(t => t.status === "done").length;
  const overallPercent =
    allProjectTasks.length === 0 ? 0 : Math.round((allDoneTasks / allProjectTasks.length) * 100);

  const footerProgressFillEl = document.getElementById("footerProgressFill");
  const footerProgressPercentEl = document.getElementById("footerProgressPercent");

  if (footerProgressFillEl) footerProgressFillEl.style.width = `${overallPercent}%`;
  if (footerProgressPercentEl) footerProgressPercentEl.textContent = `${overallPercent}%`;
}

/**
 * 대시보드 이벤트 설정 함수
 */
export function setupDashboardInteractions() {
  const alertCloseBtn = document.getElementById("alertCloseBtn");
  if (alertCloseBtn) {
    alertCloseBtn.addEventListener("click", () => {
      const alertPopup = document.getElementById("alertPopup");
      if (alertPopup) {
        alertPopup.style.display = "none";
      }
    });
  }
}
