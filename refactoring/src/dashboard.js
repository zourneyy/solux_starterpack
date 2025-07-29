// 함수를 외부에서 사용할 수 있도록 export 추가
// tasks는 외부에서 받아오도록 매개변수로 변경
export function renderDashboard(tasks) {
  // 오늘 날짜는 함수가 호출될 때마다 최신으로 계산
  const today = new Date();
  const urgentThreshold = 3;

  // --- 내부 헬퍼 함수들 (외부에서 쓸 필요 없음, export 안 함) ---
  function parseDate(str) {
    if (!str) return null; // 안전장치 (날짜 문자열 없을 경우 대비)
    const [year, month, day] = str.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // 대시보드 '전체' 진행률을 계산
  function calculateOverallProgress(allTasks) {
    // 데드라인이 아닌 일반 업무만 필터링해서 진행률 계산
    const relevantTasks = allTasks.filter(t => !t.deadline);
    const total = relevantTasks.length;
    if (total === 0) return 0;
    const done = relevantTasks.filter(t => t.status === "DONE").length;
    return Math.round((done / total) * 100);
  }

  function getUrgentTasks(allTasks) {
    return allTasks.filter(t => {
      // DONE 상태인 마감 업무는 촉박 일정에서 제외
      if (t.status === "DONE" || !t.dueDate) return false;
      const due = parseDate(t.dueDate);
      if (!due) return false;
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 올림 처리로 D-Day 계산
      return diffDays >= 0 && diffDays <= urgentThreshold;
    });
  }
  // --- 헬퍼 함수 끝 ---

  // 대시보드, 하단 바 모든 UI 업데이트 처리
  const progress = calculateOverallProgress(tasks);
  const totalTasks = tasks.length;
  const urgentTasks = getUrgentTasks(tasks);

  // 메인 대시보드 UI 업데이트
  document.getElementById("progressValue").style.width = `${progress}%`;
  document.getElementById("progressPercent").textContent = `${progress}%`;
  document.getElementById("totalTasks").textContent = totalTasks;

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

  // 하단 고정 바(footer) UI 업데이트
  document.getElementById("fixedProgress").textContent = `진행률: ${progress}%`;
  document.getElementById("fixedTaskCount").textContent = `업무 수: ${totalTasks}`;
  document.getElementById("fixedUrgent").textContent = urgentTasks.length > 0
    ? `촉박 일정: ${urgentTasks.length}건`
    : "촉박 일정: 없음";
  document.getElementById("footerProgress").style.width = `${progress}%`;

  // 촉박 일정 알림 팝업 보이기
  const alertPopup = document.getElementById("alertPopup");
  if (alertPopup) { // ★ 안전장치: 팝업 요소가 존재하는지 확인
    if (urgentTasks.length > 0) {
      alertPopup.style.display = "flex"; // flex로 중앙 정렬
    } else {
      alertPopup.style.display = "none";
    }
  }
}

// 이 파일이 직접 실행하는 코드는 제거
// 알림 닫기 버튼 여기에 or main.js에서
const alertCloseBtn = document.getElementById("alertCloseBtn");
if (alertCloseBtn) {
  alertCloseBtn.addEventListener("click", () => {
    document.getElementById("alertPopup").style.display = "none";
  });
}
