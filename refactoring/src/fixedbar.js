// 하단 바 상호작용 설정 함수
export function setupFooterInteraction() {
  const statusBar = document.getElementById("statusBar");
  const alertPopup = document.getElementById("alertPopup");

  if (!statusBar || !alertPopup) {
    console.error("하단 바 또는 알림 팝업 요소를 찾을 수 없습니다.");
    return;
  }

  // 하단 바에 클릭 이벤트 추가
  statusBar.addEventListener("click", () => {
    // 팝업이 현재 보이지 않는 상태이면 보여주고, 보이는 상태이면 숨긴다.
    const isVisible = alertPopup.style.display === "flex";
    alertPopup.style.display = isVisible ? "none" : "flex";
  });
}
