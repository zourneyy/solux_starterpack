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
