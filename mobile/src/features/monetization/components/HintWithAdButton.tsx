import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRewardedAd } from '../hooks/useRewardedAd';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IHintWithAdButtonProps {
  hintTitle: string;
  onHintUnlocked: () => void;
  isUnlocked?: boolean;
  unlockedText?: string;
}

export const HintWithAdButton = React.memo<IHintWithAdButtonProps>(
  ({ hintTitle, onHintUnlocked, isUnlocked = false, unlockedText }) => {
    const { showRewardedAd, isLoading } = useRewardedAd();

    const handlePress = () => {
      if (isUnlocked) return;
      showRewardedAd(hintTitle, onHintUnlocked);
    };

    if (isUnlocked) {
      return (
        <TouchableOpacity style={[styles.button, styles.unlockedButton]} disabled>
          <Text style={styles.unlockedText}>💡 {unlockedText || hintTitle}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={handlePress}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          🎬 {hintTitle} Aç {isLoading ? '...' : ''}
        </Text>
      </TouchableOpacity>
    );
  }
);

HintWithAdButton.displayName = 'HintWithAdButton';

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 13,
  },
  unlockedButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: Colors.success,
  },
  unlockedText: {
    ...Typography.bodyBold,
    color: Colors.success,
    fontSize: 13,
  },
});
