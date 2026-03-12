/**
 * ISO 날짜 문자열 포맷팅 함수
 * @param isoDate ex) 2025-12-29T21:22:13
 * @param options 표시 옵션
 */
export const formatDate = (
  isoDate: string,
  options?: {
    withTime?: boolean;
    withSeconds?: boolean;
  },
): string => {
  if (!isoDate) return '';

  const date = new Date(isoDate);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  if (!options?.withTime) {
    return `${yyyy}.${mm}.${dd}`;
  }

  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const sec = String(date.getSeconds()).padStart(2, '0');

  return options.withSeconds ? `${hh}:${min}:${sec}` : `${hh}:${min}`;
};

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * 현재 시간 UI 전용 포맷터
 */
export const formatCurrentDateTime = (date: Date) => {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  const yyyy = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekDay = WEEK_DAYS[date.getDay()];

  return {
    time: `${hh}:${mm}:${ss}`, // 16:24:18
    date: `${yyyy}.${month}.${day}`, // 2026.02.01
    dayOfWeek: `${weekDay}요일`, // 월요일
  };
};
