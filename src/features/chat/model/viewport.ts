import { useEffect, useState, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * 모바일 키보드가 올라올 때 실제로 보이는 영역(visualViewport) 크기
 * - iOS Safari 는 키보드가 떠도 layout viewport 가 줄지 않아 fixed 레이아웃의 입력창이 가려진다.
 *   보이는 영역의 높이/오프셋을 직접 적용해 입력창을 항상 키보드 바로 위에 둔다.
 */
export function useVisualViewport(enabled: boolean) {
  const [rect, setRect] = useState<{ height: number; top: number } | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!enabled || !vv) {
      setRect(null);
      return;
    }
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRect({ height: vv.height, top: vv.offsetTop }));
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [enabled]);

  return rect;
}

/** 모바일 전체화면 대화 중 배경 페이지 스크롤 잠금 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}
