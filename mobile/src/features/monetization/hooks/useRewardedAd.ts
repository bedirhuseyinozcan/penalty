import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export const useRewardedAd = () => {
  const [isLoading, setIsLoading] = useState(false);

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
              setTimeout(() => {
                setIsLoading(false);
                onRewardGranted();
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
