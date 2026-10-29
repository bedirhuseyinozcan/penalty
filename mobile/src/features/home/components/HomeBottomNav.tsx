import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { hapticsService } from '../../../services/hapticsService';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

export type HomeNavTab = 'play' | 'shop' | 'stats' | 'settings';

interface IHomeBottomNavProps {
  primaryColor: string;
  activeTab?: HomeNavTab;
  onPressPlay?: () => void;
  onOpenShop: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export const HomeBottomNav: React.FC<IHomeBottomNavProps> = React.memo(
  ({
    primaryColor,
    activeTab = 'play',
    onPressPlay,
    onOpenShop,
    onOpenStats,
    onOpenSettings,
  }) => {
    return (
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => {
            hapticsService.selection();
            onPressPlay?.();
          }}
        >
          {activeTab === 'play' && (
            <View
              style={[
                styles.activeIndicator,
                { backgroundColor: primaryColor },
              ]}
            />
          )}
          <Text style={styles.navEmoji}>⚽</Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'play' && { color: primaryColor, fontWeight: '800' },
            ]}
          >
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
          {activeTab === 'shop' && (
            <View
              style={[
                styles.activeIndicator,
                { backgroundColor: primaryColor },
              ]}
            />
          )}
          <Text style={styles.navEmoji}>🛍️</Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'shop' && { color: primaryColor, fontWeight: '800' },
            ]}
          >
            Dükkan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.75}
          onPress={() => {
            hapticsService.light();
            onOpenStats();
          }}
        >
          {activeTab === 'stats' && (
            <View
              style={[
                styles.activeIndicator,
                { backgroundColor: primaryColor },
              ]}
            />
          )}
          <Text style={styles.navEmoji}>📊</Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'stats' && { color: primaryColor, fontWeight: '800' },
            ]}
          >
            Kariyerim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.75}
          onPress={() => {
            hapticsService.light();
            onOpenSettings();
          }}
        >
          {activeTab === 'settings' && (
            <View
              style={[
                styles.activeIndicator,
                { backgroundColor: primaryColor },
              ]}
            />
          )}
          <Text style={styles.navEmoji}>⚙️</Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'settings' && { color: primaryColor, fontWeight: '800' },
            ]}
          >
            Ayarlar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);

HomeBottomNav.displayName = 'HomeBottomNav';

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 2,
    paddingBottom: Platform.OS === 'android' ? 24 : Spacing.md,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 50,
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
