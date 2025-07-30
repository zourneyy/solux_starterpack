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
 * 전체 할 일 목록 중 마감일 임박(7일 이내) 업무만 추출
 * @param {Array} tasks - 전체 할 일 배열
 * @returns {Array} - 마감 임박 할 일 배열, dDay 프로퍼티 포함
 */
export function getUpcomingTasks(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tasks
    .filter(t => t.dueDate && t.status !== "done")
    .map(t => ({
      ...t,
      dDay: Math.ceil((new Date(t.dueDate) - today) / (1000 * 60 * 60 * 24))
    }))
    .filter(t => t.dDay >= 0 && t.dDay <= 7)
    .sort((a, b) => a.dDay - b.dDay);
}
