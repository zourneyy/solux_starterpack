//utils.js
// 달력 기능 중 다른 기능에서도 계속 사용될 가능성 높은 공용 함수들 별도로 정리

// 날짜 객체 'YYYY-MM-DD' 형식 문자열로 변환
export function formatDate(dateObj) {
  if (!dateObj) return '';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 'YYYY-MM-DD' 형식 문자열 날짜 객체로 변환
export function parseDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 전체 할 일 목록에서 마감일 임박(7일 이내) 업무 찾아 배열로 반환
 * @param {Array} tasks - 전체 할 일 배열
 * @returns {Array} - 마감일이 임박한 할 일 배열
 */
export function getUpcomingTasks(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tasks
    .filter(t => t.dueDate && t.status !== "done")
    .map(t => ({ ...t, dDay: Math.ceil((new Date(t.dueDate) - today) / (1000 * 60 * 60 * 24)) }))
    .filter(t => t.dDay >= 0 && t.dDay <= 7)
    .sort((a, b) => a.dDay - b.dDay);
}
