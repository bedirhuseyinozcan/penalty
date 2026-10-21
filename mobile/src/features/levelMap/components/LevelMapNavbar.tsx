import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 20 }}
        >
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
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + Spacing.xs : Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 54 : 54,
  },
  backBtn: {
    minHeight: 44,
    minWidth: 80,
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.sm,
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
