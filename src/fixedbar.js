// 하단 고정바는 dashboard.js의 renderDashboard()에서 함께 업데이트하므로
// 추가 동작(예: 클릭 이벤트 등)을 여기에 구현할 수 있음.

// 예: 하단 바 클릭 시 전체 촉박 일정 팝업 열기 같은 부가 기능 가능

const fixedBar = document.getElementById("fixedBar");

fixedBar.addEventListener("click", () => {
  const alertPopup = document.getElementById("alertPopup");
  if(alertPopup.style.display === "none") {
    alertPopup.style.display = "block";
  } else {
    alertPopup.style.display = "none";
  }
});
