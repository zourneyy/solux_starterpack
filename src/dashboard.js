// 예시 업무 데이터 (실제론 API 또는 저장소에서 로드)
const tasks = [
  { id: 1, title: "과제 제출", dueDate: "2025-07-25", status: "TODO" },
  { id: 2, title: "프로젝트 보고서 작성", dueDate: "2025-07-26", status: "DOING" },
  { id: 3, title: "팀 회의", dueDate: "2025-07-28", status: "DONE" },
  { id: 4, title: "시험 공부", dueDate: "2025-07-23", status: "TODO" }
];

// 오늘 날짜
const today = new Date("2025-07-23");

// 마감 임박 기준: 3일 이내
const urgentThreshold = 3;

function parseDate(str) {
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// 진행률 계산 (완료된 업무 비율)
function calculateProgress(tasks) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "DONE").length;
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

// 촉박한 일정 찾기
function getUrgentTasks(tasks) {
  return tasks.filter(t => {
    if (t.status === "DONE") return false;
    const due = parseDate(t.dueDate);
    const diffTime = due - today;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= urgentThreshold;
  });
}

function renderDashboard() {
  const progress = calculateProgress(tasks);
  const totalTasks = tasks.length;
  const urgentTasks = getUrgentTasks(tasks);

  // 진행률 UI 업데이트
  const progressBar = document.getElementById("progressValue");
  const progressPercent = document.getElementById("progressPercent");
  progressBar.style.width = `${progress}%`;
  progressPercent.textContent = `${progress}%`;

  // 업무 수 UI 업데이트
  document.getElementById("totalTasks").textContent = totalTasks;

  // 촉박 일정 리스트 렌더링
  const urgentList = document.getElementById("urgentList");
  urgentList.innerHTML = "";
  if (urgentTasks.length === 0) {
    urgentList.innerHTML = "<li>없음</li>";
  } else {
    urgentTasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = `${task.title} - 마감일: ${task.dueDate}`;
      urgentList.appendChild(li);
    });
  }

  // 하단 고정 바(footer) 텍스트 업데이트
  document.getElementById("fixedProgress").textContent = `진행률: ${progress}%`;
  document.getElementById("fixedTaskCount").textContent = `업무 수: ${totalTasks}`;
  document.getElementById("fixedUrgent").textContent = urgentTasks.length > 0
    ? `촉박 일정: ${urgentTasks.length}건`
    : "촉박 일정: 없음";

  // 촉박 일정 알림 팝업 보이기
  const alertPopup = document.getElementById("alertPopup");
  if (urgentTasks.length > 0) {
    alertPopup.style.display = "block";
  } else {
    alertPopup.style.display = "none";
  }
}

// 초기에 렌더링
document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();

  // 알림 닫기 버튼 이벤트
  document.getElementById("alertCloseBtn").addEventListener("click", () => {
    document.getElementById("alertPopup").style.display = "none";
  });
});
