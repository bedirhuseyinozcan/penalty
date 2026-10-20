import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useGameStore } from '../stores/useGameStore';
import { useSettingsStore, LeagueMode } from '../stores/useSettingsStore';
import { HomeGameCard } from '../features/home/components/HomeGameCard';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface IHomeScreenProps {
  onNavigate: (
    screen: 'home' | 'whoAreYa' | 'careerPath' | 'levelMap',
    isDaily?: boolean,
    gameMode?: 'whoAreYa' | 'careerPath'
  ) => void;
}

export const HomeScreen: React.FC<IHomeScreenProps> = React.memo(({ onNavigate }) => {
  const coins = useGameStore((s) => s.coins);
  const xp = useGameStore((s) => s.xp);
  const selectedLeagueMode = useSettingsStore((s) => s.selectedLeagueMode);
  const setLeagueMode = useSettingsStore((s) => s.setLeagueMode);

  const isSuperLig = selectedLeagueMode === 'super_lig';

  const handleSelectMode = useCallback(
    (mode: LeagueMode) => {
      setLeagueMode(mode);
    },
    [setLeagueMode]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>PENALTY</Text>
            <Text style={styles.brandSubtitle}>Futbol Oyun Portalı</Text>
          </View>
          <View style={styles.currencyRow}>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>🪙 {coins}</Text>
            </View>
            <View style={[styles.currencyBadge, styles.xpBadge]}>
              <Text style={styles.xpText}>⚡ {xp} XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.modeSwitcherContainer}>
          <Text style={styles.sectionTitle}>Lig Modu Seçimi</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, isSuperLig && styles.activeTabBtn]}
              activeOpacity={0.8}
              onPress={() => handleSelectMode('super_lig')}
            >
              <Text style={[styles.tabText, isSuperLig && styles.activeTabText]}>
                🇹🇷 Süper Lig
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, !isSuperLig && styles.activeTabBtn]}
              activeOpacity={0.8}
              onPress={() => handleSelectMode('global')}
            >
              <Text style={[styles.tabText, !isSuperLig && styles.activeTabText]}>
                🌍 5 Büyük Lig (Global)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <HomeGameCard
          emoji="🕵️‍♂️"
          title="Kim Bu Yıldız?"
          subtitle="Bulanık fotoğraftan ve ipuçlarından futbolcuyu tahmin et"
          onPressDaily={() => onNavigate('whoAreYa', true)}
          onPressCareer={() => onNavigate('levelMap', false, 'whoAreYa')}
        />

        <HomeGameCard
          emoji="🧭"
          title="Transfer Rotası"
          subtitle="Kariyerinde oynadığı kulüpleri takip ederek yıldızı bul"
          onPressDaily={() => onNavigate('careerPath', true)}
          onPressCareer={() => onNavigate('levelMap', false, 'careerPath')}
        />
      </ScrollView>
    </SafeAreaView>
  );
});

HomeScreen.displayName = 'HomeScreen';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  brandTitle: {
    ...Typography.h1,
    color: Colors.primary,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  currencyBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencyText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '700',
  },
  xpBadge: {
    borderColor: Colors.secondary,
  },
  xpText: {
    ...Typography.caption,
    color: Colors.secondary,
    fontWeight: '700',
  },
  modeSwitcherContainer: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  activeTabBtn: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tabText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
