// Returns ISO week year and week number for a given date
export function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return {
    year: d.getUTCFullYear(),
    week: Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7),
  };
}

// Returns array of 7 Date objects (Mon to Sun) for the given ISO year+week
export function getWeekDates(year: number, week: number): Date[] {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const monday = new Date(simple);
  monday.setDate(simple.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// Navigate by delta weeks from given year+week
export function addWeeks(
  year: number,
  week: number,
  delta: number,
): { year: number; week: number } {
  const dates = getWeekDates(year, week);
  const monday = new Date(dates[0]);
  monday.setDate(monday.getDate() + delta * 7);
  return getISOWeek(monday);
}

// Format week range for display: "2026년 01월 12일 - 01월 18일"
export function formatWeekRange(dates: Date[]): string {
  const first = dates[0];
  const last = dates[6];
  const year = first.getFullYear();
  const m1 = String(first.getMonth() + 1).padStart(2, '0');
  const d1 = String(first.getDate()).padStart(2, '0');
  const m2 = String(last.getMonth() + 1).padStart(2, '0');
  const d2 = String(last.getDate()).padStart(2, '0');
  return `${year}년 ${m1}월 ${d1}일 - ${m2}월 ${d2}일`;
}

// Returns year and date range separately for multi-line display
export function formatWeekRangeParts(dates: Date[]): { year: string; range: string } {
  const first = dates[0];
  const last = dates[6];
  const year = first.getFullYear();
  const m1 = String(first.getMonth() + 1).padStart(2, '0');
  const d1 = String(first.getDate()).padStart(2, '0');
  const m2 = String(last.getMonth() + 1).padStart(2, '0');
  const d2 = String(last.getDate()).padStart(2, '0');
  return { year: `${year}년`, range: `${m1}월 ${d1}일 - ${m2}월 ${d2}일` };
}

// Format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Korean weekday names
export const WEEKDAY_KO = ['월', '화', '수', '목', '금', '토', '일'];
