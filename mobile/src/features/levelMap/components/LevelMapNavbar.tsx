import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface ILevelMapNavbarProps {
  coins: number;
  xp: number;
  onBack: () => void;
}

export const LevelMapNavbar: React.FC<ILevelMapNavbarProps> = React.memo(
  ({ coins, xp, onBack }) => {
    return (
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>‹ Ana Menü</Text>
        </TouchableOpacity>

        <View style={styles.navCurrency}>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>🪙 {coins}</Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>⚡ {xp} XP</Text>
          </View>
        </View>
      </View>
    );
  }
);

LevelMapNavbar.displayName = 'LevelMapNavbar';

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
  navCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  coinBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  coinText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '700',
  },
  xpBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  xpText: {
    ...Typography.caption,
    color: Colors.secondary,
    fontWeight: '700',
  },
});
