import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useDailyCountdown } from '../hooks/useDailyCountdown';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IDailyCompletedBannerProps {
  status: 'won' | 'lost';
  attemptsUsed: number;
  maxAttempts: number;
  onOpenResultModal: () => void;
}

export const DailyCompletedBanner: React.FC<IDailyCompletedBannerProps> = React.memo(
  ({ status, attemptsUsed, maxAttempts, onOpenResultModal }) => {
    const { formattedCountdown } = useDailyCountdown();
    const isWon = status === 'won';

    return (
      <View style={styles.container}>
        <View style={styles.contentRow}>
          <Text style={styles.emoji}>{isWon ? '🏆' : '🔒'}</Text>
          <View style={styles.textCol}>
            <Text style={styles.title}>
              {isWon ? 'Bugünün Sorusu Tamamlandı!' : 'Bugünkü Haklarınız Bitti'}
            </Text>
            <Text style={styles.subtitle}>
              {isWon
                ? `${attemptsUsed}/${maxAttempts} denemede bildiniz.`
                : 'Maalesef doğru futbolcuyu bulamadınız.'}
            </Text>
            <Text style={styles.timerText}>⏳ Yeni Soruya Kalan: {formattedCountdown}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.resultBtn}
          activeOpacity={0.8}
          onPress={onOpenResultModal}
        >
          <Text style={styles.resultBtnText}>📊 Sonuç Kartını Gör</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

DailyCompletedBanner.displayName = 'DailyCompletedBanner';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'android' ? 44 : Spacing.md,
    elevation: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emoji: {
    fontSize: 32,
    marginRight: Spacing.sm,
  },
  textCol: {
    flex: 1,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  timerText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '700',
    marginTop: 2,
  },
  resultBtn: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultBtnText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
});
