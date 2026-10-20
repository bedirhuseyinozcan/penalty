import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

interface IGameNavbarProps {
  title: string;
  isReplay?: boolean;
  attemptsLeft: number;
  maxAttempts: number;
  onBack: () => void;
  onOpenMap?: () => void;
  showMapButton?: boolean;
}

export const GameNavbar: React.FC<IGameNavbarProps> = React.memo(
  ({
    title,
    isReplay = false,
    attemptsLeft,
    maxAttempts,
    onBack,
    onOpenMap,
    showMapButton = false,
  }) => {
    return (
      <View style={styles.navbar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>‹ Geri</Text>
        </TouchableOpacity>

        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle}>{title}</Text>
          {isReplay ? (
            <View style={styles.replayBadge}>
              <Text style={styles.replayBadgeText}>🔁 Tekrar</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.navRightRow}>
          {showMapButton && onOpenMap ? (
            <TouchableOpacity onPress={onOpenMap} style={styles.mapHeaderBtn} activeOpacity={0.8}>
              <Text style={styles.mapHeaderBtnText}>🗺️ Harita</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.attemptsBadge}>
            <Text style={styles.attemptsText}>
              {attemptsLeft}/{maxAttempts}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

GameNavbar.displayName = 'GameNavbar';

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    paddingVertical: Spacing.xs,
  },
  backBtnText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 16,
  },
  navTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  navTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  replayBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  replayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
  },
  navRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mapHeaderBtn: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapHeaderBtnText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  attemptsBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attemptsText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
