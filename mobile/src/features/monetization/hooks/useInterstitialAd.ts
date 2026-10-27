import { useCallback, useRef, useEffect } from 'react';
import { Alert, Platform } from 'react-native';

export const useInterstitialAd = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const showInterstitialIfDue = useCallback(
    (completedLevel: number, onComplete: () => void) => {
      if (completedLevel <= 0 || completedLevel % 3 !== 0) {
        onComplete();
        return;
      }

      try {
        if (Platform.OS === 'web') {
          onComplete();
          return;
        }

        Alert.alert(
          '📺 Kısa Reklam Arası',
          `Tebrikler! ${completedLevel}. seviyeyi tamamladınız. Sonraki seviyeye geçiliyor...`,
          [
            {
              text: 'Devam Et ⏩',
              onPress: () => {
                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => {
                  onComplete();
                  timerRef.current = null;
                }, 250);
              },
            },
          ],
          { cancelable: false }
        );
      } catch {
        onComplete();
      }
    },
    []
  );

  return {
    showInterstitialIfDue,
  };
};
