import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';

export const useRewardedAd = () => {
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const showRewardedAd = useCallback(
    async (rewardTitle: string, onRewardGranted: () => void) => {
      setIsLoading(true);

      Alert.alert(
        '🎬 Ödüllü Video Reklam',
        `"${rewardTitle}" ipucunu açmak için 5 saniyelik sponsor videosunu izleyin.`,
        [
          {
            text: 'İptal',
            style: 'cancel',
            onPress: () => setIsLoading(false),
          },
          {
            text: 'İzle & İpucunu Al',
            onPress: () => {
              if (timerRef.current) {
                clearTimeout(timerRef.current);
              }
              timerRef.current = setTimeout(() => {
                setIsLoading(false);
                onRewardGranted();
                timerRef.current = null;
              }, 600);
            },
          },
        ]
      );
    },
    []
  );

  return {
    isLoading,
    showRewardedAd,
  };
};
