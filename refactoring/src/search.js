// 검색 기능 설정 함수
export function setupSearch(tasks) {
  const searchInput = document.getElementById("searchInput");
  const searchResultsSection = document.getElementById("searchResults");
  const searchContainer = document.getElementById("searchContainer");

  if (!searchInput || !searchResultsSection || !searchContainer) {
    console.error("검색 기능에 필요한 HTML 요소를 찾을 수 없습니다.");
    return;
  }

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    
    if (!query) {
      searchResultsSection.style.display = "none";
      return;
    }

    const result = tasks.filter(
      (task) =>
        (task.title && task.title.toLowerCase().includes(query)) ||
        (task.detail || "").toLowerCase().includes(query)
    );
    
    searchContainer.innerHTML = ""; // 이전 검색 결과 초기화
    searchResultsSection.style.display = "block";

    // ▼▼▼ 바로 이 부분입니다 ▼▼▼
    result.forEach((task) => {
      const div = document.createElement("div");
      div.classList.add("card");

      const highlighted = (text) =>
        text.replace(new RegExp(`(${query})`, "gi"), '<span class="highlight">$1</span>');

      div.innerHTML = `
        <strong>${highlighted(task.title)}</strong> 
        (${task.deadline ? "마감" : task.status.toUpperCase()})
        <br>
        <span class="detail">${highlighted(task.detail || "")}</span>
      `;
      searchContainer.appendChild(div);
    });
  });
}
