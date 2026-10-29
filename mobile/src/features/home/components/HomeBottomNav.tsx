import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { hapticsService } from '../../../services/hapticsService';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IHomeBottomNavProps {
  primaryColor: string;
  onOpenShop: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export const HomeBottomNav: React.FC<IHomeBottomNavProps> = React.memo(
  ({ primaryColor, onOpenShop, onOpenStats, onOpenSettings }) => {
    return (
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => hapticsService.selection()}
        >
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: primaryColor },
            ]}
          />
          <Text style={styles.navEmoji}>⚽</Text>
          <Text style={[styles.navLabel, { color: primaryColor, fontWeight: '800' }]}>
            Oyna
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.75}
          onPress={() => {
            hapticsService.light();
            onOpenShop();
          }}
        >
          <Text style={styles.navEmoji}>🛍️</Text>
          <Text style={styles.navLabel}>Dükkan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.75}
          onPress={() => {
            hapticsService.light();
            onOpenStats();
          }}
        >
          <Text style={styles.navEmoji}>📊</Text>
          <Text style={styles.navLabel}>Kariyerim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.75}
          onPress={() => {
            hapticsService.light();
            onOpenSettings();
          }}
        >
          <Text style={styles.navEmoji}>⚙️</Text>
          <Text style={styles.navLabel}>Ayarlar</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

HomeBottomNav.displayName = 'HomeBottomNav';

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 2,
    paddingBottom: Platform.OS === 'android' ? 14 : Spacing.sm,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 28,
    height: 3,
    borderRadius: BorderRadius.full,
  },
  navEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  navLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
