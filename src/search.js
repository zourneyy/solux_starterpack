// search.js
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

    // ▼▼▼ 이전 검색 결과 초기화 ▼▼▼
    searchContainer.innerHTML = "";
    searchResultsSection.style.display = "block";

    // ▼▼▼ 하이라이트 함수 (빨간색으로 표시) ▼▼▼
    const highlighted = (text) =>
      text.replace(new RegExp(`(${query})`, "gi"), '<span class="highlight" style="color:red;">$1</span>');

    // ▼▼▼ 날짜별 그룹핑 ▼▼▼
    const groupedByDate = {};
    result.forEach(task => {
      // date가 있으면 'YYYY-MM-DD' 형식으로, 없으면 '날짜 없음'
      const dateKey = task.date ? task.date : '날짜 없음';
      if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
      groupedByDate[dateKey].push(task);
    });

    // ▼▼▼ 날짜별로 검색 결과 출력 ▼▼▼
    Object.keys(groupedByDate).sort().forEach(date => {
      const dateHeader = document.createElement("h3");
      dateHeader.textContent = `📅 ${date}`;
      dateHeader.style.marginTop = "20px";
      searchContainer.appendChild(dateHeader);

      // 날짜별 카드 묶는 div 생성 (flex container)
      const cardGroup = document.createElement("div");
      cardGroup.style.display = "flex";
      cardGroup.style.gap = "10px";
      cardGroup.style.flexWrap = "wrap";

      groupedByDate[date].forEach(task => {
        const div = document.createElement("div");
        div.classList.add("card");
        div.style.flex = "0 0 auto";

        div.innerHTML = `
          <strong>${highlighted(task.title)}</strong> 
          (${task.deadline ? "마감" : task.status.toUpperCase()})
          <br>
          <span class="detail">${highlighted(task.detail || "")}</span>
        `;
        cardGroup.appendChild(div);
      });

      searchContainer.appendChild(cardGroup);
    });
  });
}
