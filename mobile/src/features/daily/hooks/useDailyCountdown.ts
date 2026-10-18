import { useState, useEffect } from 'react';
import { systemApi } from '../../../api/systemApi';

export const useDailyCountdown = () => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isSynced, setIsSynced] = useState<boolean>(false);

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const syncTime = async () => {
      try {
        const data = await systemApi.getSystemTime();
        if (isMounted) {
          setSecondsRemaining(data.secondsUntilDailyReset);
          setIsSynced(true);
        }
      } catch {
        if (isMounted) {
          const now = new Date();
          const tomorrowUtc = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
          );
          const diffSec = Math.max(0, Math.floor((tomorrowUtc.getTime() - now.getTime()) / 1000));
          setSecondsRemaining(diffSec);
        }
      }
    };

    syncTime();

    timerId = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      isMounted = false;
      if (timerId) clearInterval(timerId);
    };
  }, []);

  const formattedCountdown = (() => {
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  })();

  return {
    secondsRemaining,
    formattedCountdown,
    isSynced,
  };
};
