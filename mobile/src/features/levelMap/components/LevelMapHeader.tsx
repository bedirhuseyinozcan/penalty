import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';
import { TOTAL_LEVELS } from '../hooks/useLevelMap';

interface ILevelMapHeaderProps {
  gameEmoji: string;
  gameTitle: string;
  leagueLabel: string;
  completedCount: number;
  progressPercent: number;
}

export const LevelMapHeader: React.FC<ILevelMapHeaderProps> = React.memo(
  ({ gameEmoji, gameTitle, leagueLabel, completedCount, progressPercent }) => {
    return (
      <View style={styles.headerCard}>
        <View style={styles.titleRow}>
          <Text style={styles.titleEmoji}>{gameEmoji}</Text>
          <View style={styles.titleCol}>
            <Text style={styles.gameTitle}>{gameTitle}</Text>
            <Text style={styles.leagueText}>{leagueLabel} • Yol Haritası</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>İlerleme Durumu</Text>
            <Text style={styles.progressVal}>
              {completedCount} / {TOTAL_LEVELS} Seviye (%{progressPercent})
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      </View>
    );
  }
);

LevelMapHeader.displayName = 'LevelMapHeader';

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleEmoji: {
    fontSize: 34,
    marginRight: Spacing.sm,
  },
  titleCol: {
    flex: 1,
  },
  gameTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  leagueText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: Spacing.xs,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressVal: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
});
