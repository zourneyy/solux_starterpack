// utils.js
// 달력 기능 등 여러 곳에서 쓰이는 공용 함수 모음

// 날짜 객체를 'YYYY-MM-DD' 형식 문자열로 변환
export function formatDate(dateObj) {
  if (!dateObj) return '';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 'YYYY-MM-DD' 형식 문자열을 날짜 객체로 변환
export function parseDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 전체 할 일 목록 중, 마감일 임박(3일 이내) 및 지난 일정 포함
 * - 상태는 todo 또는 doing 인 것만 포함
 * @param {Array} tasks - 전체 할 일 배열
 * @param {number} maxDay - 최대 임박일 수 (기본 3일)
 * @returns {Array} - 임박 할 일 배열, dDay 프로퍼티 포함 (음수 = 마감일 지난 상태)
 */
export function getUpcomingTasks(tasks, maxDay = 3) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 오늘 0시 기준

  return tasks
    .filter(t => 
      t.dueDate && 
      (t.status === "todo" || t.status === "doing")
    )
    .map(t => {
      const dueDate = new Date(t.dueDate);
      const dDay = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
      return { ...t, dDay };
    })
    .filter(t => t.dDay <= maxDay) // 마감일 초과 일정 제외, 마감 지난 일정 포함
    .sort((a, b) => a.dDay - b.dDay);
}

/**
 * dDay 값을 'D-3', 'D-DAY', 'D+1' 등의 형식 문자열로 변환
 * @param {number} dDay
 * @returns {string}
 */
export function formatDDay(dDay) {
  if (dDay > 0) return `D-${dDay}`;
  if (dDay === 0) return "D-DAY";
  return `D+${Math.abs(dDay)}`;
}

/**
 * 마감일이 지났는지 확인하고, 지났다면 며칠이 지났는지 텍스트로 반환
 * @param {string} dueDate - 'YYYY-MM-DD' 형식의 마감일 문자열
 * @returns {string} - 마감일이 지났으면 '(D+n)' 형태의 문자열, 아니면 빈 문자열
 */
export function getOverdueStatusText(dueDate) {
  if (!dueDate) return '';

  const today = new Date();
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // 오늘 날짜 (시간은 00:00:00)
  const b = new Date(dueDate); // 마감일 날짜
  
  // 마감일이 오늘보다 이전이라면 (마감일이 지났다면)
  if (a > b) {
    const diffTime = Math.abs(a - b);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return ` (D+${diffDays})`;
  }
  
  return '';
}