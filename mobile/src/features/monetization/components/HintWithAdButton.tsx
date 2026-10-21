import React, { useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRewardedAd } from '../hooks/useRewardedAd';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IHintWithAdButtonProps {
  hintTitle: string;
  onHintUnlocked: () => void;
  isUnlocked?: boolean;
  unlockedText?: string;
  coinCost?: number; 
}

export const HintWithAdButton = React.memo<IHintWithAdButtonProps>(
  ({ hintTitle, onHintUnlocked, isUnlocked = false, unlockedText }) => {
    const { showRewardedAd, isLoading } = useRewardedAd();

    const handleUnlockWithAd = useCallback(() => {
      if (isUnlocked) return;
      showRewardedAd(hintTitle, onHintUnlocked);
    }, [isUnlocked, showRewardedAd, hintTitle, onHintUnlocked]);

    if (isUnlocked) {
      return (
        <View style={[styles.container, styles.unlockedContainer]}>
          <Text style={styles.unlockedText}>💡 {unlockedText || hintTitle}</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.adBtn}
          activeOpacity={0.8}
          onPress={handleUnlockWithAd}
          disabled={isLoading}
        >
          <Text style={styles.adBtnText}>
            🎬 Reklam İzle & İpucunu Aç {isLoading ? '...' : ''}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);

HintWithAdButton.displayName = 'HintWithAdButton';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: Spacing.xs,
  },
  adBtn: {
    width: '100%',
    backgroundColor: Colors.surfaceLight,
    borderColor: Colors.primary,
    borderWidth: 1.5,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adBtnText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  unlockedContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
    borderColor: Colors.success,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  unlockedText: {
    ...Typography.bodyBold,
    color: Colors.success,
    fontSize: 13,
    textAlign: 'center',
  },
});
