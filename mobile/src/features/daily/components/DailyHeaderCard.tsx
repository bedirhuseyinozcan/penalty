import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDailyCountdown } from '../hooks/useDailyCountdown';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IDailyHeaderCardProps {
  title: string;
  leagueLabel: string;
  isCompleted: boolean;
}

export const DailyHeaderCard = React.memo<IDailyHeaderCardProps>(
  ({ title, leagueLabel, isCompleted }) => {
    const { formattedCountdown } = useDailyCountdown();

    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.badge}>{leagueLabel.toUpperCase()}</Text>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>⏳ {formattedCountdown}</Text>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.statusRow}>
          <Text style={[styles.statusText, isCompleted && styles.completedText]}>
            {isCompleted ? '✅ Bugünün Sorusu Çözüldü' : '🔥 Çöz ve Günlük Serini Koru!'}
          </Text>
        </View>
      </View>
    );
  }
);

DailyHeaderCard.displayName = 'DailyHeaderCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badge: {
    ...Typography.statBadge,
    color: Colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  timerBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  timerText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '700',
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  statusRow: {
    marginTop: Spacing.xs,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  completedText: {
    color: Colors.success,
    fontWeight: '700',
  },
});
