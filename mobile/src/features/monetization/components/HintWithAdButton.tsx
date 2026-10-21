import React, { useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useRewardedAd } from '../hooks/useRewardedAd';
import { useGameStore } from '../../../stores/useGameStore';
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
  ({ hintTitle, onHintUnlocked, isUnlocked = false, unlockedText, coinCost = 50 }) => {
    const { showRewardedAd, isLoading } = useRewardedAd();
    const coins = useGameStore((s) => s.coins);
    const spendCoins = useGameStore((s) => s.spendCoins);

    const handleUnlockWithCoins = useCallback(() => {
      if (isUnlocked) return;

      const success = spendCoins(coinCost);
      if (success) {
        onHintUnlocked();
      } else {
        Alert.alert(
          '🪙 Yetersiz Altın',
          `Bu ipucunu açmak için ${coinCost} altına ihtiyacınız var (Mevcut: ${coins} 🪙).\n\nİpucunu ücretsiz açmak için kısa bir reklam izleyebilirsiniz.`,
          [
            { text: 'Vazgeç', style: 'cancel' },
            {
              text: '🎬 Reklam İzle & Aç',
              onPress: () => showRewardedAd(hintTitle, onHintUnlocked),
            },
          ]
        );
      }
    }, [isUnlocked, spendCoins, coinCost, onHintUnlocked, coins, showRewardedAd, hintTitle]);

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
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.coinBtn]}
            activeOpacity={0.75}
            onPress={handleUnlockWithCoins}
            disabled={isLoading}
          >
            <Text style={styles.coinBtnText}>🪙 {coinCost} Altın</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.adBtn]}
            activeOpacity={0.75}
            onPress={handleUnlockWithAd}
            disabled={isLoading}
          >
            <Text style={styles.adBtnText}>
              🎬 Reklamla Aç {isLoading ? '...' : ''}
            </Text>
          </TouchableOpacity>
        </View>
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
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  coinBtn: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderColor: Colors.accent,
  },
  coinBtnText: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 12,
  },
  adBtn: {
    backgroundColor: Colors.surfaceLight,
    borderColor: Colors.primary,
  },
  adBtnText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 12,
  },
  unlockedContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
    borderColor: Colors.success,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
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
