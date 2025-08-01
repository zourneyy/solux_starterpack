// dashboard.js

import { formatDate } from './utils.js';

/**
 * 마감 임박 작업 필터링 함수 (규칙 변경)
 */
export function getUpcomingTasks(tasks, baseDateStr = null, maxDay = 3) {
  const today = baseDateStr ? new Date(baseDateStr) : new Date();

  return tasks
    .filter(task =>
      // 'deadline: true' 조건을 제거하여, 마감일(dueDate)이 있는 모든 할 일을 대상으로 합니다.
      (task.status === "todo" || task.status === "doing") &&
      task.dueDate
    )
    .map(task => {
      const dueDate = new Date(task.dueDate);
      const diff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
      return { ...task, dDay: diff };
    })
    .filter(task => task.dDay <= maxDay) // 마감일이 지났거나 3일 이내인 모든 항목
    .sort((a, b) => a.dDay - b.dDay);
}

/**
 * D-day 및 D+day 문자열 포맷
 */
function formatDDay(dDay) {
  if (dDay > 0) return `D-${dDay}`;
  else if (dDay === 0) return "D-DAY";
  else return `D+${Math.abs(dDay)}`;
}

/**
 * 대시보드 렌더링 함수
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

  const nonDeadlineTasks = tasks.filter(task => task.deadline !== true);
  
  const importanceCount = { '긴급': 0, '중요': 0, '일반': 0 };

  nonDeadlineTasks.forEach(task => {
    const importance = task.type || "일반";
    if (importance in importanceCount) {
      importanceCount[importance]++;
    }
  });

  distributionChart.innerHTML = "";

  if (nonDeadlineTasks.length === 0) {
    distributionChart.innerHTML = "<li>표시할 할 일이 없습니다.</li>";
  } else {
    for (const [level, count] of Object.entries(importanceCount)) {
      if (count > 0) {
        const percent = ((count / nonDeadlineTasks.length) * 100).toFixed(1);
        const barContainer = document.createElement("div");
        barContainer.style.marginBottom = "6px";
        barContainer.style.display = 'flex';
        barContainer.style.alignItems = 'center';
        const label = document.createElement("span");
        label.textContent = `${level} (${count}개)`;
        label.style.fontWeight = "bold";
        label.style.width = '100px';
        const barWrapper = document.createElement('div');
        barWrapper.style.flexGrow = '1';
        barWrapper.style.backgroundColor = '#e0e0e0';
        barWrapper.style.borderRadius = '4px';
        const bar = document.createElement("div");
        bar.style.height = "14px";
        bar.style.width = `${percent}%`;
        bar.style.backgroundColor = "#70a5ff";
        bar.style.borderRadius = "4px";
        bar.style.transition = "width 0.3s ease";
        barWrapper.appendChild(bar);
        barContainer.appendChild(label);
        barContainer.appendChild(barWrapper);
        distributionChart.appendChild(barContainer);
      }
    }
  }

  // 4. 전체 진행률 및 남은 업무 수 계산
  const progressCircle = document.getElementById("overallProgress");
  const remainingCount = document.getElementById("remainingTasksCount");
  const allNonDeadlineTasks = tasks.filter(t => t.deadline !== true);
  const doneTasks = allNonDeadlineTasks.filter(t => t.status === "done").length;
  const totalTasks = allNonDeadlineTasks.length;
  const remainingTasks = totalTasks - doneTasks;
  const percent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  if (progressCircle) {
    progressCircle.style.setProperty("--p", `${percent}%`);
    progressCircle.innerHTML = `<span>${percent}%</span>`;
  }
  if (remainingCount) {
    remainingCount.textContent = `${remainingTasks} / ${totalTasks}`;
  }

  // 하단 바 업데이트 로직
  updateFooterBars(tasks, upcomingTasks, percent);
}

// 하단 바 업데이트 로직을 별도 함수로 분리
function updateFooterBars(tasks, upcomingTasks, overallPercent) {
    const todayStr = formatDate(new Date());
    const tasksForToday = tasks.filter(t => t.deadline !== true && t.date === todayStr);
    const todoCount = tasksForToday.filter(t => t.status === "todo").length;
    const doingCount = tasksForToday.filter(t => t.status === "doing").length;
    const doneCountDay = tasksForToday.filter(t => t.status === "done").length;
    const totalDayTasks = tasksForToday.length;
    const remainingDayTasks = totalDayTasks - doneCountDay;

    const statusCountsEl = document.getElementById("statusCounts");
    if (statusCountsEl) {
        statusCountsEl.innerHTML = `TODO ${todoCount} | DOING ${doingCount} | DONE ${doneCountDay} | <span class="footer-remaining-tasks">남은 업무 ${remainingDayTasks}/${totalDayTasks}</span>`;
    }

    const footerUrgentCountEl = document.getElementById("footerUrgentCount");
    if (footerUrgentCountEl) {
        footerUrgentCountEl.innerHTML = `<span class="footer-urgent-count">${upcomingTasks.length}개</span>`;
    }

    const footerProgressFillEl = document.getElementById("footerProgressFill");
    const footerProgressPercentEl = document.getElementById("footerProgressPercent");
    if (footerProgressFillEl) footerProgressFillEl.style.width = `${overallPercent}%`;
    if (footerProgressPercentEl) footerProgressPercentEl.textContent = `${overallPercent}%`;
}


/**
 * 대시보드 이벤트 설정 함수 (팝업 등)
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
