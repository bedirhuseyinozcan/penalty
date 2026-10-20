import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IHomeGameCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  dailyBtnText?: string;
  careerBtnText?: string;
  onPressDaily: () => void;
  onPressCareer: () => void;
}

export const HomeGameCard: React.FC<IHomeGameCardProps> = React.memo(
  ({
    emoji,
    title,
    subtitle,
    dailyBtnText = '📅 Günün Sorusu',
    careerBtnText = '🗺️ Seviyeler & Kariyer',
    onPressDaily,
    onPressCareer,
  }) => {
    return (
      <View style={styles.gameCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>{emoji}</Text>
          <View style={styles.cardTitleCol}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.gameActionBtn, styles.dailyBtn]}
            activeOpacity={0.8}
            onPress={onPressDaily}
          >
            <Text style={styles.dailyBtnText}>{dailyBtnText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gameActionBtn, styles.careerBtn]}
            activeOpacity={0.8}
            onPress={onPressCareer}
          >
            <Text style={styles.careerBtnText}>{careerBtnText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

HomeGameCard.displayName = 'HomeGameCard';

const styles = StyleSheet.create({
  gameCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardEmoji: {
    fontSize: 34,
    marginRight: Spacing.md,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  gameActionBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyBtn: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  dailyBtnText: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 13,
  },
  careerBtn: {
    backgroundColor: Colors.primary,
  },
  careerBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 13,
  },
});
