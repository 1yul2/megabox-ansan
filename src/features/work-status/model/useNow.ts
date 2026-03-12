import { useEffect, useState } from 'react';

/**
 * 현재 시간을 1초 단위로 갱신
 */
export const useNow = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return now;
};
