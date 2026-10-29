import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { hapticsService } from '../../../services/hapticsService';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

export type HomeNavTab = 'play' | 'shop' | 'stats' | 'settings';

function getAndroidBottomInset(): number {
  if (Platform.OS !== 'android') return 16;
  const screenHeight = Dimensions.get('screen').height;
  const windowHeight = Dimensions.get('window').height;
  const statusBarHeight = StatusBar.currentHeight || 24;
  const navBarDiff = screenHeight - windowHeight - statusBarHeight;

  return Math.max(48, navBarDiff > 0 ? navBarDiff + 12 : 52);
}

const SAFE_BOTTOM_PADDING = getAndroidBottomInset();

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
      <View style={styles.outerWrapper}>
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
                activeTab === 'play'
                  ? { color: primaryColor, fontWeight: '900' }
                  : { color: Colors.textPrimary },
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
                activeTab === 'shop'
                  ? { color: primaryColor, fontWeight: '900' }
                  : { color: Colors.textPrimary },
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
                activeTab === 'stats'
                  ? { color: primaryColor, fontWeight: '900' }
                  : { color: Colors.textPrimary },
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
                activeTab === 'settings'
                  ? { color: primaryColor, fontWeight: '900' }
                  : { color: Colors.textPrimary },
              ]}
            >
              Ayarlar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

HomeBottomNav.displayName = 'HomeBottomNav';

const styles = StyleSheet.create({
  outerWrapper: {
    width: '100%',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingTop: 6,
    paddingBottom: SAFE_BOTTOM_PADDING,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: Spacing.xs,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 3,
    borderRadius: BorderRadius.full,
  },
  navEmoji: {
    fontSize: 18,
    marginBottom: 3,
  },
  navLabel: {
    ...Typography.captionBold,
    fontSize: 11.5,
  },
});
