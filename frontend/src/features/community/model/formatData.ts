export function formatDateTime(iso: string) {
  const date = new Date(iso);

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime(); // ms 차이

  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diff < hour) {
    const minutesAgo = Math.floor(diff / minute);
    return minutesAgo <= 0 ? '방금' : `${minutesAgo}분 전`;
  } else if (diff < day) {
    const hoursAgo = Math.floor(diff / hour);
    return `${hoursAgo}시간 전`;
  } else {
    return formatDateTime(iso); // 24시간 이상은 날짜 표시
  }
}
