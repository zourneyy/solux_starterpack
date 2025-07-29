// formatDate 함수 사용 위해 utils.js에서 가져오기
import { formatDate } from './utils.js';

// currentDate를 매개변수로 받아오기
export function renderDashboard(tasks, currentDate) {
  
  // 날짜 네비게이션 텍스트 업데이트
  const dateLabel = document.getElementById("dashboardDayLabel");
  if (dateLabel) {
    dateLabel.textContent = `${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일 현황`;
  }

  // ---- 1. 마감 임박 일정 계산 ----
  const upcomingList = document.getElementById("upcomingDeadlinesList");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTasks = tasks
    .filter(t => t.dueDate && t.status !== "DONE")
    .map(t => {
      const dueDate = new Date(t.dueDate);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...t, dDay: diffDays };
    })
    .filter(t => t.dDay >= 0 && t.dDay <= 7) // 7일 이내
    .sort((a, b) => a.dDay - b.dDay);

  if (upcomingList) {
    upcomingList.innerHTML = "";
    if (upcomingTasks.length > 0) {
      upcomingTasks.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `<strong style="color: red;">D-${task.dDay}</strong>: ${task.title}`;
        upcomingList.appendChild(li);
      });
    } else {
      upcomingList.innerHTML = "<li>마감 임박 일정이 없습니다.</li>";
    }
  }

  // ---- 2. 업무 유형별 분포 계산 ----
  const distributionChart = document.getElementById("taskDistributionChart");
  const types = tasks
    .filter(t => !t.deadline && t.date === formatDate(currentDate))
    .reduce((acc, t) => {
      const type = t.type || "일반";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  
  if (distributionChart) {
    distributionChart.innerHTML = "";
    for (const [type, count] of Object.entries(types)) {
      const barHtml = `
        <div class="dist-item" style="margin-bottom: 10px;">
          <span>${type} (${count}개)</span>
          <div style="background: #e0e0e0; border-radius: 3px; padding: 2px;">
            <div style="width: ${count * 20}px; height: 10px; background: #3498db; border-radius: 3px;"></div>
          </div>
        </div>
      `;
      distributionChart.innerHTML += barHtml;
    }
  }

  // ---- 3. 전체 진행률 및 남은 업무 수 계산 ----
  const progressCircle = document.getElementById("overallProgress");
  const remainingCount = document.getElementById("remainingTasksCount");
  
  const total = tasks.filter(t => !t.deadline).length;
  const done = tasks.filter(t => !t.deadline && t.status === "DONE").length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  if (progressCircle) {
  // 1. CSS 변수(--p)에 진행률 값 설정해서 그래프를 그리기
  progressCircle.style.setProperty('--p', percent);
  // 2. 숫자 텍스트 표시할 span 태그 만들어서 넣기
  progressCircle.innerHTML = `<span>${percent}%</span>`;
}
  if (remainingCount) remainingCount.textContent = `${total - done} / ${total}`;
  
  // ---- 4. 하단 바 업데이트 ----
  const fixedProgress = document.getElementById("fixedProgress");
  const footerProgress = document.getElementById("footerProgress");
  if (fixedProgress) fixedProgress.textContent = `${percent}%`;
  if (footerProgress) footerProgress.style.width = `${percent}%`;
}
