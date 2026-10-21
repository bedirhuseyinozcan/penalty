import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { useGameStore } from '../../stores/useGameStore';
import { getCosmeticById } from '../../features/shop/catalog';

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
    const equippedCosmeticId = useGameStore((s) => s.equippedCosmeticId);
    const equippedCosmetic = useMemo(
      () => getCosmeticById(equippedCosmeticId),
      [equippedCosmeticId]
    );
    const theme = equippedCosmetic.themeConfig;

    return (
      <View style={[styles.navbar, { borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 20 }}
        >
          <Text style={[styles.backBtnText, { color: theme.primaryColor }]}>‹ Geri</Text>
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
            <TouchableOpacity
              onPress={onOpenMap}
              style={styles.mapHeaderBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
            >
              <Text style={styles.mapHeaderBtnText}>🗺️ Harita</Text>
            </TouchableOpacity>
          ) : null}

          {/* Theme Avatar Badge */}
          <View
            style={[
              styles.navAvatarBadge,
              {
                borderColor: theme.primaryColor,
                backgroundColor: theme.accentGlow,
              },
            ]}
          >
            <Text style={styles.navAvatarText}>{equippedCosmetic.avatarEmoji}</Text>
          </View>

          <View
            style={[
              styles.attemptsBadge,
              {
                borderColor: theme.primaryColor,
                backgroundColor: theme.accentGlow,
              },
            ]}
          >
            <Text style={[styles.attemptsText, { color: theme.primaryColor }]}>
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
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + Spacing.xs : Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 54 : 54,
  },
  backBtn: {
    minHeight: 44,
    minWidth: 54,
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.sm,
  },
  backBtnText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 17,
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
    gap: Spacing.xs + 2,
  },
  mapHeaderBtn: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapHeaderBtnText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  navAvatarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navAvatarText: {
    fontSize: 14,
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
